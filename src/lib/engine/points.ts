import { PointTransaction, PointTransactionType } from '../types';

export interface PointsCalculationResult {
  pointsToAward: number;
  reason: string;
  isDailyAwardEligible: boolean;
}

/**
 * Generates a deterministic idempotency key for daily attendance awards.
 */
export function getDailyAttendanceAwardKey(gymId: string, memberId: string, localDate: string): string {
  return `award_${gymId}_${memberId}_${localDate}`;
}

/**
 * Generates a deterministic idempotency key for streak milestone bonuses.
 */
export function getMilestoneBonusAwardKey(gymId: string, memberId: string, milestoneDays: number): string {
  return `milestone_${gymId}_${memberId}_${milestoneDays}`;
}

/**
 * Generates a deterministic transaction ID.
 */
export function generateTransactionId(prefix: string = 'tx'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Determines point award eligibility for an attendance session.
 */
export function evaluateAttendancePoints(
  isFirstQualifyingVisitToday: boolean,
  pointsPerDay: number = 10,
  dailyPointsLimit: number = 10
): PointsCalculationResult {
  if (!isFirstQualifyingVisitToday) {
    return {
      pointsToAward: 0,
      reason: 'Additional visit on same calendar day (daily points already awarded).',
      isDailyAwardEligible: false,
    };
  }

  const points = Math.min(pointsPerDay, dailyPointsLimit);
  return {
    pointsToAward: points,
    reason: `Daily attendance reward (${points} points)`,
    isDailyAwardEligible: true,
  };
}

/**
 * Creates a structured PointTransaction ledger entry.
 */
export function createLedgerEntry(params: {
  gymId: string;
  memberId: string;
  type: PointTransactionType;
  points: number;
  currentBalance: number;
  reason: string;
  idempotencyKey: string;
  relatedAttendanceId?: string;
  relatedRedemptionId?: string;
  ruleVersion?: number;
}): { transaction: PointTransaction; newBalance: number } {
  const {
    gymId,
    memberId,
    type,
    points,
    currentBalance,
    reason,
    idempotencyKey,
    relatedAttendanceId,
    relatedRedemptionId,
    ruleVersion = 1,
  } = params;

  const newBalance = currentBalance + points;
  if (newBalance < 0) {
    throw new Error('Insufficient points balance for this transaction.');
  }

  const transaction: PointTransaction = {
    id: generateTransactionId('ptx'),
    gymId,
    memberId,
    type,
    points,
    balanceAfter: newBalance,
    reason,
    relatedAttendanceId,
    relatedRedemptionId,
    idempotencyKey,
    ruleVersion,
    createdAt: new Date().toISOString(),
  };

  return { transaction, newBalance };
}
