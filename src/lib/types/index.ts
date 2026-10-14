export type MembershipStatus = 'pending' | 'active' | 'suspended' | 'expired';

export type UserRole = 'member' | 'admin' | 'staff';

export type SessionStatus = 'checked_in' | 'completed' | 'corrected';

export type PointTransactionType = 'attendance' | 'streak_bonus' | 'redemption' | 'adjustment';

export type RedemptionStatus = 'pending' | 'fulfilled' | 'cancelled';

export interface MilestoneBonus {
  days: number;
  bonusPoints: number;
  label: string;
}

export interface GymSettings {
  name: string;
  publicGymId: string;
  timezone: string; // e.g. "Asia/Kolkata"

  attendance: {
    locationVerificationEnabled: boolean;
    latitude: number;
    longitude: number;
    allowedRadiusMeters: number; // default 75m
  };

  loyalty: {
    pointsPerQualifyingDay: number; // default 10
    dailyPointsLimit: number; // default 10
    streakInactivityDays: number; // authoritative 30-day window
    milestones: MilestoneBonus[];
  };

  operatingDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  address?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GymMember {
  uid: string;
  gymId: string;
  displayName: string;
  email: string;
  phone?: string;
  role: UserRole;

  membershipStatus: MembershipStatus;
  membershipStartAt?: string;
  membershipExpiresAt?: string;

  // Cached streak & stats
  currentStreak: number;
  longestStreak: number;
  lastQualifyingVisitAt?: string; // ISO string / timestamp
  totalQualifyingDays: number;
  totalVisits: number;
  pointsBalance: number;

  avatarUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSession {
  id: string;
  gymId: string;
  memberId: string;
  memberName?: string;
  memberEmail?: string;

  checkInAt: string; // ISO string
  checkOutAt: string | null;

  localDate: string; // YYYY-MM-DD in gym timezone

  status: SessionStatus;

  qualifyingVisit: boolean;
  pointsAwarded: number;

  locationVerified: boolean;
  reportedDistanceMeters?: number;
  reportedLatitude?: number;
  reportedLongitude?: number;

  // Audit info if corrected
  correctionReason?: string;
  correctedBy?: string;
  correctedAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface DailyAttendance {
  id: string; // memberId_YYYYMMDD
  memberId: string;
  gymId: string;
  localDate: string; // YYYY-MM-DD

  qualifyingVisit: boolean;
  pointsAwarded: number;
  ruleVersion: number;

  createdAt: string;
}

export interface PointTransaction {
  id: string;
  gymId: string;
  memberId: string;

  type: PointTransactionType;
  points: number; // positive for earn, negative for spend
  balanceAfter: number;
  reason: string;

  relatedAttendanceId?: string;
  relatedRedemptionId?: string;

  idempotencyKey: string;
  ruleVersion?: number;

  createdAt: string;
}

export interface Reward {
  id: string;
  gymId: string;

  name: string;
  description: string;
  category: 'merch' | 'beverage' | 'training' | 'pass' | 'other';

  pointsCost: number;
  active: boolean;

  stockLimit?: number;
  redeemedCount: number;
  imageUrl?: string;

  createdAt: string;
  updatedAt: string;
}

export interface RewardRedemption {
  id: string;
  gymId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;

  rewardId: string;
  rewardName: string;

  pointsSpent: number;
  status: RedemptionStatus;

  notes?: string;
  fulfilledAt?: string;
  fulfilledBy?: string;

  createdAt: string;
}

export interface AuditLog {
  id: string;
  gymId: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;

  action: string;
  targetType: 'member' | 'attendance' | 'settings' | 'reward' | 'redemption';
  targetId: string;

  details: Record<string, unknown>;
  timestamp: string;
}

export interface CheckInRequestPayload {
  gymId: string;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
}

export interface CheckOutRequestPayload {
  gymId: string;
  sessionId?: string;
}
