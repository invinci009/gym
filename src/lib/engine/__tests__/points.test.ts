import { describe, it, expect } from 'vitest';
import {
  evaluateAttendancePoints,
  createLedgerEntry,
  getDailyAttendanceAwardKey,
  getMilestoneBonusAwardKey,
} from '../points';

describe('Points Engine & Ledger', () => {
  it('awards points for the first qualifying visit of the day', () => {
    const result = evaluateAttendancePoints(true, 10, 10);
    expect(result.pointsToAward).toBe(10);
    expect(result.isDailyAwardEligible).toBe(true);
  });

  it('awards 0 additional points for second visit on same day', () => {
    const result = evaluateAttendancePoints(false, 10, 10);
    expect(result.pointsToAward).toBe(0);
    expect(result.isDailyAwardEligible).toBe(false);
    expect(result.reason).toContain('Additional visit on same calendar day');
  });

  it('respects daily points limit configuration', () => {
    const result = evaluateAttendancePoints(true, 50, 25);
    expect(result.pointsToAward).toBe(25);
  });

  it('creates an auditable ledger entry with correct balanceAfter', () => {
    const entry = createLedgerEntry({
      gymId: 'gym-1',
      memberId: 'mem-123',
      type: 'attendance',
      points: 10,
      currentBalance: 50,
      reason: 'Daily attendance reward (10 points)',
      idempotencyKey: 'award_gym-1_mem-123_2026-10-14',
    });

    expect(entry.newBalance).toBe(60);
    expect(entry.transaction.points).toBe(10);
    expect(entry.transaction.balanceAfter).toBe(60);
    expect(entry.transaction.idempotencyKey).toBe('award_gym-1_mem-123_2026-10-14');
  });

  it('supports redemption deductions and prevents overdrawing balance', () => {
    const entry = createLedgerEntry({
      gymId: 'gym-1',
      memberId: 'mem-123',
      type: 'redemption',
      points: -150,
      currentBalance: 200,
      reason: 'Redeemed: Whey Protein Shaker Bottle',
      idempotencyKey: 'redemption_123',
    });

    expect(entry.newBalance).toBe(50);
    expect(entry.transaction.balanceAfter).toBe(50);

    // Should throw if balance is insufficient
    expect(() => {
      createLedgerEntry({
        gymId: 'gym-1',
        memberId: 'mem-123',
        type: 'redemption',
        points: -100,
        currentBalance: 50,
        reason: 'Overdrawn redemption',
        idempotencyKey: 'redemption_failed',
      });
    }).toThrow('Insufficient points balance');
  });

  it('generates consistent deterministic idempotency keys', () => {
    const key1 = getDailyAttendanceAwardKey('gym-1', 'user-1', '2026-10-14');
    const key2 = getDailyAttendanceAwardKey('gym-1', 'user-1', '2026-10-14');
    expect(key1).toBe('award_gym-1_user-1_2026-10-14');
    expect(key1).toBe(key2);

    const milestoneKey = getMilestoneBonusAwardKey('gym-1', 'user-1', 30);
    expect(milestoneKey).toBe('milestone_gym-1_user-1_30');
  });
});
