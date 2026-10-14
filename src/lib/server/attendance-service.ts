import {
  AttendanceSession,
  DailyAttendance,
  GymMember,
  GymSettings,
  MilestoneBonus,
  PointTransaction,
  RewardRedemption,
} from '../types';
import { verifyGymLocation, Coordinates } from '../engine/location';
import { processAttendanceStreak, evaluateStreakStatus, getLocalDateString } from '../engine/streak';
import {
  evaluateAttendancePoints,
  createLedgerEntry,
  getDailyAttendanceAwardKey,
  getMilestoneBonusAwardKey,
} from '../engine/points';
import { gymStore } from '../mock/store';

export interface CheckInResult {
  success: boolean;
  message: string;
  session?: AttendanceSession;
  pointsAwarded?: number;
  bonusPointsAwarded?: number;
  currentStreak?: number;
  longestStreak?: number;
  milestoneUnlocked?: MilestoneBonus | null;
  newBalance?: number;
  distanceMeters?: number;
  errorCode?: string;
}

export interface CheckOutResult {
  success: boolean;
  message: string;
  session?: AttendanceSession;
  durationMinutes?: number;
  errorCode?: string;
}

export class AttendanceService {
  /**
   * Get Gym Settings (FIT FIBER GYM)
   */
  static async getSettings(gymId: string): Promise<GymSettings | null> {
    if (gymStore.settings.publicGymId === gymId) {
      return gymStore.settings;
    }
    return null;
  }

  /**
   * Validate Gym & Member eligibility
   */
  static async validateMemberEligibility(
    gymId: string,
    memberId: string
  ): Promise<{ eligible: boolean; member?: GymMember; reason?: string; errorCode?: string }> {
    const member = gymStore.getMember(memberId);
    if (!member) {
      return { eligible: false, reason: 'Member profile not found.', errorCode: 'MEMBER_NOT_FOUND' };
    }

    if (member.gymId !== gymId) {
      return { eligible: false, reason: 'Member is not enrolled in this gym.', errorCode: 'GYM_MISMATCH' };
    }

    if (member.membershipStatus === 'suspended') {
      return {
        eligible: false,
        reason: 'Your membership is currently suspended. Please contact gym administration.',
        errorCode: 'MEMBERSHIP_SUSPENDED',
      };
    }

    if (member.membershipStatus === 'expired') {
      return {
        eligible: false,
        reason: 'Your membership has expired. Please renew at the front desk to continue.',
        errorCode: 'MEMBERSHIP_EXPIRED',
      };
    }

    if (member.membershipStatus === 'pending') {
      return {
        eligible: false,
        reason: 'Your membership registration is pending approval by gym staff.',
        errorCode: 'MEMBERSHIP_PENDING',
      };
    }

    return { eligible: true, member };
  }

  /**
   * Server-side Check-In Operation
   */
  static async checkIn(params: {
    gymId: string;
    memberId: string;
    coordinates?: Coordinates | null;
  }): Promise<CheckInResult> {
    const { gymId, memberId, coordinates } = params;
    const settings = await this.getSettings(gymId);
    if (!settings) {
      return { success: false, message: 'Invalid or unknown gym identifier.', errorCode: 'INVALID_GYM' };
    }

    // 1. Membership Validation
    const eligibility = await this.validateMemberEligibility(gymId, memberId);
    if (!eligibility.eligible || !eligibility.member) {
      return {
        success: false,
        message: eligibility.reason || 'Membership is not active.',
        errorCode: eligibility.errorCode,
      };
    }
    const member = eligibility.member;

    // 2. Duplicate Session Validation
    const activeSession = gymStore.getActiveSession(member.uid);
    if (activeSession) {
      return {
        success: false,
        message: 'You already have an open attendance session. Please check out first.',
        session: activeSession,
        errorCode: 'ALREADY_CHECKED_IN',
      };
    }

    // 3. Mandatory Location Verification
    let locationVerified = false;
    let distanceMeters = 0;
    if (settings.attendance.locationVerificationEnabled) {
      const gymCoords: Coordinates = {
        latitude: settings.attendance.latitude,
        longitude: settings.attendance.longitude,
      };
      const locResult = verifyGymLocation(
        coordinates,
        gymCoords,
        settings.attendance.allowedRadiusMeters || 75
      );

      if (!locResult.isInside) {
        return {
          success: false,
          message: locResult.reason || 'Location verification failed. Please ask gym staff for assistance.',
          distanceMeters: locResult.distanceMeters,
          errorCode: 'LOCATION_VERIFICATION_FAILED',
        };
      }
      locationVerified = true;
      distanceMeters = locResult.distanceMeters;
    }

    // 4. Authoritative Streak Engine (30-day inactivity window & local date)
    const nowIso = new Date().toISOString();
    const streakResult = processAttendanceStreak({
      currentStreak: member.currentStreak,
      longestStreak: member.longestStreak,
      lastQualifyingVisitAt: member.lastQualifyingVisitAt,
      lastQualifyingLocalDate: member.lastQualifyingVisitAt
        ? getLocalDateString(member.lastQualifyingVisitAt, settings.timezone)
        : null,
      nowTimestamp: nowIso,
      timezone: settings.timezone,
      inactivityThresholdDays: settings.loyalty.streakInactivityDays || 30,
      milestones: settings.loyalty.milestones,
    });

    // 5. Points Ledger & Idempotent Daily Award
    const dailyPointsAward = evaluateAttendancePoints(
      streakResult.isNewQualifyingDay,
      settings.loyalty.pointsPerQualifyingDay,
      settings.loyalty.dailyPointsLimit
    );

    let totalPointsAwarded = dailyPointsAward.pointsToAward;
    let bonusPointsAwarded = 0;
    if (streakResult.milestoneUnlocked) {
      bonusPointsAwarded = streakResult.milestoneUnlocked.bonusPoints;
      totalPointsAwarded += bonusPointsAwarded;
    }

    // 6. Record Session
    const newSessionId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newSession: AttendanceSession = {
      id: newSessionId,
      gymId,
      memberId: member.uid,
      memberName: member.displayName,
      memberEmail: member.email,
      checkInAt: nowIso,
      checkOutAt: null,
      localDate: streakResult.localDate,
      status: 'checked_in',
      qualifyingVisit: true,
      pointsAwarded: totalPointsAwarded,
      locationVerified,
      reportedDistanceMeters: distanceMeters,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    gymStore.attendance.unshift(newSession);

    // 7. Atomic Points Transactions & Balance Update
    let currentBalance = member.pointsBalance;

    if (dailyPointsAward.pointsToAward > 0) {
      const dailyAwardKey = getDailyAttendanceAwardKey(gymId, member.uid, streakResult.localDate);
      const ledger = createLedgerEntry({
        gymId,
        memberId: member.uid,
        type: 'attendance',
        points: dailyPointsAward.pointsToAward,
        currentBalance,
        reason: dailyPointsAward.reason,
        idempotencyKey: dailyAwardKey,
        relatedAttendanceId: newSessionId,
      });
      gymStore.transactions.unshift(ledger.transaction);
      currentBalance = ledger.newBalance;
    }

    if (streakResult.milestoneUnlocked) {
      const milestoneKey = getMilestoneBonusAwardKey(
        gymId,
        member.uid,
        streakResult.milestoneUnlocked.days
      );
      const bonusLedger = createLedgerEntry({
        gymId,
        memberId: member.uid,
        type: 'streak_bonus',
        points: streakResult.milestoneUnlocked.bonusPoints,
        currentBalance,
        reason: `Streak Milestone Bonus: ${streakResult.milestoneUnlocked.label} (+${streakResult.milestoneUnlocked.bonusPoints} pts)`,
        idempotencyKey: milestoneKey,
        relatedAttendanceId: newSessionId,
      });
      gymStore.transactions.unshift(bonusLedger.transaction);
      currentBalance = bonusLedger.newBalance;
    }

    // 8. Update Member Profile
    member.currentStreak = streakResult.newStreak;
    member.longestStreak = streakResult.longestStreak;
    member.lastQualifyingVisitAt = nowIso;
    member.totalVisits += 1;
    if (streakResult.isNewQualifyingDay) {
      member.totalQualifyingDays += 1;
    }
    member.pointsBalance = currentBalance;
    member.updatedAt = nowIso;

    let successMessage = `Welcome to FIT FIBER GYM! You are checked in.`;
    if (dailyPointsAward.pointsToAward > 0) {
      successMessage += ` Earned +${dailyPointsAward.pointsToAward} daily points!`;
    }
    if (streakResult.milestoneUnlocked) {
      successMessage += ` 🎉 Milestone unlocked: ${streakResult.milestoneUnlocked.label} (+${streakResult.milestoneUnlocked.bonusPoints} bonus points)!`;
    }

    return {
      success: true,
      message: successMessage,
      session: newSession,
      pointsAwarded: dailyPointsAward.pointsToAward,
      bonusPointsAwarded,
      currentStreak: member.currentStreak,
      longestStreak: member.longestStreak,
      milestoneUnlocked: streakResult.milestoneUnlocked,
      newBalance: member.pointsBalance,
      distanceMeters,
    };
  }

  /**
   * Server-side Check-Out Operation
   */
  static async checkOut(params: { gymId: string; memberId: string }): Promise<CheckOutResult> {
    const { gymId, memberId } = params;
    const activeSession = gymStore.getActiveSession(memberId);
    if (!activeSession) {
      return {
        success: false,
        message: 'No active check-in session found to check out.',
        errorCode: 'NO_ACTIVE_SESSION',
      };
    }

    const checkOutAt = new Date().toISOString();
    activeSession.checkOutAt = checkOutAt;
    activeSession.status = 'completed';
    activeSession.updatedAt = checkOutAt;

    const durationMs = new Date(checkOutAt).getTime() - new Date(activeSession.checkInAt).getTime();
    const durationMinutes = Math.max(1, Math.round(durationMs / (60 * 1000)));

    return {
      success: true,
      message: `Checked out successfully! Workout duration: ${durationMinutes} minutes. Great job today!`,
      session: activeSession,
      durationMinutes,
    };
  }

  /**
   * Reward Redemption Operation (Atomic deduction)
   */
  static async redeemReward(params: {
    gymId: string;
    memberId: string;
    rewardId: string;
    notes?: string;
  }): Promise<{ success: boolean; message: string; redemption?: RewardRedemption; newBalance?: number }> {
    const { gymId, memberId, rewardId, notes } = params;
    const member = gymStore.getMember(memberId);
    if (!member) {
      return { success: false, message: 'Member profile not found.' };
    }

    const reward = gymStore.rewards.find((r) => r.id === rewardId && r.gymId === gymId);
    if (!reward || !reward.active) {
      return { success: false, message: 'Reward is inactive or unavailable.' };
    }

    if (reward.stockLimit !== undefined && reward.redeemedCount >= reward.stockLimit) {
      return { success: false, message: 'This reward is currently out of stock.' };
    }

    if (member.pointsBalance < reward.pointsCost) {
      return {
        success: false,
        message: `Insufficient points. You need ${reward.pointsCost} points, but have ${member.pointsBalance}.`,
      };
    }

    const newRedemptionId = `red_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const idempotencyKey = `redemption_${newRedemptionId}`;

    // Create ledger entry
    const ledger = createLedgerEntry({
      gymId,
      memberId: member.uid,
      type: 'redemption',
      points: -reward.pointsCost,
      currentBalance: member.pointsBalance,
      reason: `Redeemed: ${reward.name} (-${reward.pointsCost} pts)`,
      idempotencyKey,
      relatedRedemptionId: newRedemptionId,
    });

    member.pointsBalance = ledger.newBalance;
    member.updatedAt = new Date().toISOString();

    reward.redeemedCount += 1;
    reward.updatedAt = new Date().toISOString();

    gymStore.transactions.unshift(ledger.transaction);

    const redemption: RewardRedemption = {
      id: newRedemptionId,
      gymId,
      memberId: member.uid,
      memberName: member.displayName,
      memberEmail: member.email,
      rewardId: reward.id,
      rewardName: reward.name,
      pointsSpent: reward.pointsCost,
      status: 'pending',
      notes,
      createdAt: new Date().toISOString(),
    };

    gymStore.redemptions.unshift(redemption);

    return {
      success: true,
      message: `Reward "${reward.name}" redeemed successfully! Please show this confirmation to front desk staff to collect.`,
      redemption,
      newBalance: member.pointsBalance,
    };
  }
}
