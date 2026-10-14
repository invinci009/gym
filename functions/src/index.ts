import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const app = getApps().length === 0 ? initializeApp() : getApps()[0];
const db = getFirestore(app);

// Haversine formula on server
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Callable Function: scanGymQr
 */
export const scanGymQr = onCall(async (request: CallableRequest<{ gymId: string }>) => {
  const { gymId } = request.data || {};
  if (!gymId) {
    throw new HttpsError('invalid-argument', 'Gym identifier is required.');
  }

  const gymDoc = await db.collection('gyms').doc(gymId).get();
  if (!gymDoc.exists) {
    throw new HttpsError('not-found', 'Gym not found.');
  }

  const gymData = gymDoc.data()!;
  return {
    gymId,
    name: gymData.name || 'FIT FIBER GYM',
    locationVerificationEnabled: gymData.attendance?.locationVerificationEnabled ?? true,
    allowedRadiusMeters: gymData.attendance?.allowedRadiusMeters ?? 75,
  };
});

/**
 * Callable Function: checkIn
 * Enforces location verification, active membership, 30-day inactivity streak window,
 * and idempotent points award inside a Firestore Transaction.
 */
export const checkIn = onCall(
  async (
    request: CallableRequest<{ gymId: string; latitude?: number; longitude?: number }>
  ) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const uid = request.auth.uid;
    const { gymId, latitude, longitude } = request.data || {};

    if (!gymId) {
      throw new HttpsError('invalid-argument', 'Gym ID is required.');
    }

    return await db.runTransaction(async (transaction) => {
      const gymRef = db.collection('gyms').doc(gymId);
      const memberRef = gymRef.collection('members').doc(uid);

      const [gymDoc, memberDoc] = await Promise.all([
        transaction.get(gymRef),
        transaction.get(memberRef),
      ]);

      if (!gymDoc.exists) {
        throw new HttpsError('not-found', 'Gym not found.');
      }
      if (!memberDoc.exists) {
        throw new HttpsError('permission-denied', 'Member profile not found.');
      }

      const memberData = memberDoc.data()!;
      if (memberData.membershipStatus !== 'active') {
        throw new HttpsError(
          'failed-precondition',
          `Membership status is ${memberData.membershipStatus}. Please contact gym staff.`
        );
      }

      // Check duplicate open session
      const openSessions = await gymRef
        .collection('attendance')
        .where('memberId', '==', uid)
        .where('status', '==', 'checked_in')
        .limit(1)
        .get();

      if (!openSessions.empty) {
        throw new HttpsError('already-exists', 'You already have an open attendance session.');
      }

      // Server-side Geolocation Verification
      const gymSettings = gymDoc.data()!;
      let locationVerified = false;
      let distanceMeters = 0;

      if (gymSettings.attendance?.locationVerificationEnabled) {
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
          throw new HttpsError(
            'permission-denied',
            'Location coordinates are required for self-service check-in.'
          );
        }

        const gymLat = gymSettings.attendance.latitude;
        const gymLon = gymSettings.attendance.longitude;
        const radius = gymSettings.attendance.allowedRadiusMeters || 75;

        distanceMeters = calculateHaversineDistance(latitude, longitude, gymLat, gymLon);
        if (distanceMeters > radius) {
          throw new HttpsError(
            'permission-denied',
            `You are ${distanceMeters}m away from the gym (maximum permitted: ${radius}m). Please contact staff.`
          );
        }
        locationVerified = true;
      }

      // Timezone and local date
      const now = new Date();
      const nowIso = now.toISOString();
      const timezone = gymSettings.timezone || 'Asia/Kolkata';
      const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(now);

      // 30-Day Inactivity Window Streak Engine
      const lastVisit = memberData.lastQualifyingVisitAt
        ? new Date(memberData.lastQualifyingVisitAt).getTime()
        : null;
      const thresholdMs = 30 * 24 * 60 * 60 * 1000;
      let newStreak = memberData.currentStreak || 0;
      const isSameDay = memberData.lastQualifyingLocalDate === localDate;

      if (!lastVisit || newStreak <= 0) {
        newStreak = 1;
      } else if (now.getTime() - lastVisit >= thresholdMs) {
        // 30 complete days elapsed -> Reset streak to 1
        newStreak = 1;
      } else if (!isSameDay) {
        newStreak += 1;
      }

      const updatedLongest = Math.max(memberData.longestStreak || 0, newStreak);

      // Idempotent Daily Points Award
      const pointsAwarded = isSameDay ? 0 : (gymSettings.loyalty?.pointsPerQualifyingDay || 10);
      const newBalance = (memberData.pointsBalance || 0) + pointsAwarded;

      // Record session
      const sessionRef = gymRef.collection('attendance').doc();
      transaction.set(sessionRef, {
        id: sessionRef.id,
        gymId,
        memberId: uid,
        checkInAt: FieldValue.serverTimestamp(),
        checkOutAt: null,
        localDate,
        status: 'checked_in',
        qualifyingVisit: true,
        pointsAwarded,
        locationVerified,
        reportedDistanceMeters: distanceMeters,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Update member profile
      transaction.update(memberRef, {
        currentStreak: newStreak,
        longestStreak: updatedLongest,
        lastQualifyingVisitAt: nowIso,
        lastQualifyingLocalDate: localDate,
        totalVisits: FieldValue.increment(1),
        totalQualifyingDays: isSameDay
          ? (memberData.totalQualifyingDays || 0)
          : FieldValue.increment(1),
        pointsBalance: newBalance,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: 'Checked in successfully!',
        currentStreak: newStreak,
        pointsAwarded,
        newBalance,
      };
    });
  }
);

/**
 * Callable Function: checkOut
 */
export const checkOut = onCall(async (request: CallableRequest<{ gymId: string }>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const uid = request.auth.uid;
  const { gymId } = request.data || {};

  const gymRef = db.collection('gyms').doc(gymId);
  const openSessions = await gymRef
    .collection('attendance')
    .where('memberId', '==', uid)
    .where('status', '==', 'checked_in')
    .limit(1)
    .get();

  if (openSessions.empty) {
    throw new HttpsError('not-found', 'No open attendance session found.');
  }

  const sessionDoc = openSessions.docs[0];
  await sessionDoc.ref.update({
    checkOutAt: FieldValue.serverTimestamp(),
    status: 'completed',
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { success: true, message: 'Checked out successfully!' };
});

/**
 * Callable Function: redeemReward
 */
export const redeemReward = onCall(
  async (request: CallableRequest<{ gymId: string; rewardId: string }>) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const uid = request.auth.uid;
    const { gymId, rewardId } = request.data || {};

    return await db.runTransaction(async (transaction) => {
      const gymRef = db.collection('gyms').doc(gymId);
      const memberRef = gymRef.collection('members').doc(uid);
      const rewardRef = gymRef.collection('rewards').doc(rewardId);

      const [memberDoc, rewardDoc] = await Promise.all([
        transaction.get(memberRef),
        transaction.get(rewardRef),
      ]);

      if (!memberDoc.exists || !rewardDoc.exists) {
        throw new HttpsError('not-found', 'Member or Reward not found.');
      }

      const member = memberDoc.data()!;
      const reward = rewardDoc.data()!;

      if (!reward.active) {
        throw new HttpsError('failed-precondition', 'Reward is not currently active.');
      }
      if (member.pointsBalance < reward.pointsCost) {
        throw new HttpsError(
          'failed-precondition',
          `Insufficient points (${member.pointsBalance} < ${reward.pointsCost}).`
        );
      }

      const newBalance = member.pointsBalance - reward.pointsCost;
      transaction.update(memberRef, { pointsBalance: newBalance });

      const redemptionRef = gymRef.collection('redemptions').doc();
      transaction.set(redemptionRef, {
        id: redemptionRef.id,
        gymId,
        memberId: uid,
        rewardId,
        rewardName: reward.name,
        pointsSpent: reward.pointsCost,
        status: 'pending',
        createdAt: FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: `Redeemed ${reward.name}! Show claim to staff to collect.`,
        newBalance,
      };
    });
  }
);
