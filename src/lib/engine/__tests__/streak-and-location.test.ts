import { describe, it, expect } from 'vitest';
import {
  processAttendanceStreak,
  evaluateStreakStatus,
  getLocalDateString,
  DEFAULT_MILESTONES,
} from '../streak';
import {
  calculateHaversineDistance,
  verifyGymLocation,
} from '../location';

describe('Location Engine (Haversine)', () => {
  const gymCoords = { latitude: 28.6139, longitude: 77.2090 }; // New Delhi

  it('calculates 0 distance for exact coordinates', () => {
    const dist = calculateHaversineDistance(gymCoords, gymCoords);
    expect(dist).toBe(0);
  });

  it('accepts coordinates within allowed 75m radius', () => {
    // Offset by ~30 meters north (approx 0.00027 degrees lat)
    const memberCoords = { latitude: 28.61417, longitude: 77.2090 };
    const result = verifyGymLocation(memberCoords, gymCoords, 75);
    expect(result.isInside).toBe(true);
    expect(result.distanceMeters).toBeLessThanOrEqual(75);
  });

  it('rejects coordinates outside 75m radius', () => {
    // Offset by ~500 meters
    const memberCoords = { latitude: 28.6184, longitude: 77.2090 };
    const result = verifyGymLocation(memberCoords, gymCoords, 75);
    expect(result.isInside).toBe(false);
    expect(result.distanceMeters).toBeGreaterThan(75);
    expect(result.reason).toContain('Reported location is');
  });

  it('rejects missing or invalid coordinates', () => {
    const resultNull = verifyGymLocation(null, gymCoords, 75);
    expect(resultNull.isInside).toBe(false);
    expect(resultNull.reason).toContain('unavailable');

    const resultNaN = verifyGymLocation({ latitude: NaN, longitude: 77.2 }, gymCoords, 75);
    expect(resultNaN.isInside).toBe(false);
  });
});

describe('Streak Engine — 30-Day Inactivity Window Policy', () => {
  it('initializes first qualifying attendance with streak = 1', () => {
    const result = processAttendanceStreak({
      currentStreak: 0,
      longestStreak: 0,
      nowTimestamp: '2026-10-01T10:00:00.000Z',
    });

    expect(result.newStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
    expect(result.streakIncremented).toBe(true);
    expect(result.streakResetDueToInactivity).toBe(false);
  });

  it('Example A: Oct 1 -> Oct 30 (29 days elapsed) continues streak', () => {
    const oct1 = '2026-10-01T10:00:00.000Z';
    const oct30 = '2026-10-30T10:00:00.000Z'; // 29 days exactly

    const result = processAttendanceStreak({
      currentStreak: 5,
      longestStreak: 12,
      lastQualifyingVisitAt: oct1,
      lastQualifyingLocalDate: '2026-10-01',
      nowTimestamp: oct30,
    });

    expect(result.newStreak).toBe(6);
    expect(result.longestStreak).toBe(12);
    expect(result.streakIncremented).toBe(true);
    expect(result.streakResetDueToInactivity).toBe(false);
  });

  it('Example B: Oct 1 -> Oct 31 (30 complete days elapsed) resets streak to 1', () => {
    const oct1 = '2026-10-01T10:00:00.000Z';
    const oct31 = '2026-10-31T10:00:00.000Z'; // 30 complete days

    const result = processAttendanceStreak({
      currentStreak: 5,
      longestStreak: 12,
      lastQualifyingVisitAt: oct1,
      lastQualifyingLocalDate: '2026-10-01',
      nowTimestamp: oct31,
    });

    expect(result.newStreak).toBe(1);
    expect(result.longestStreak).toBe(12); // Longest streak preserved!
    expect(result.streakIncremented).toBe(true);
    expect(result.streakResetDueToInactivity).toBe(true);
  });

  it('Example C: Multiple visits on same calendar day count as 1 qualifying day and do not increment streak', () => {
    const oct1_morning = '2026-10-01T07:00:00.000Z';
    const oct1_evening = '2026-10-01T18:00:00.000Z';

    const result = processAttendanceStreak({
      currentStreak: 4,
      longestStreak: 4,
      lastQualifyingVisitAt: oct1_morning,
      lastQualifyingLocalDate: '2026-10-01',
      nowTimestamp: oct1_evening,
      timezone: 'UTC',
    });

    expect(result.newStreak).toBe(4);
    expect(result.longestStreak).toBe(4);
    expect(result.isNewQualifyingDay).toBe(false);
    expect(result.streakIncremented).toBe(false);
  });

  it('preserves longest streak and increments it when current streak exceeds it', () => {
    const result = processAttendanceStreak({
      currentStreak: 10,
      longestStreak: 10,
      lastQualifyingVisitAt: '2026-10-01T10:00:00.000Z',
      lastQualifyingLocalDate: '2026-10-01',
      nowTimestamp: '2026-10-02T10:00:00.000Z',
    });

    expect(result.newStreak).toBe(11);
    expect(result.longestStreak).toBe(11);
  });

  it('detects milestone unlocks on milestone days', () => {
    const result = processAttendanceStreak({
      currentStreak: 6,
      longestStreak: 6,
      lastQualifyingVisitAt: '2026-10-06T10:00:00.000Z',
      lastQualifyingLocalDate: '2026-10-06',
      nowTimestamp: '2026-10-07T10:00:00.000Z',
      milestones: DEFAULT_MILESTONES,
    });

    expect(result.newStreak).toBe(7);
    expect(result.milestoneUnlocked).toBeDefined();
    expect(result.milestoneUnlocked?.days).toBe(7);
    expect(result.milestoneUnlocked?.bonusPoints).toBe(50);
  });

  it('evaluates streak status on read: shows active or expired', () => {
    const active = evaluateStreakStatus(5, '2026-10-01T00:00:00.000Z', '2026-10-15T00:00:00.000Z', 30);
    expect(active.isExpired).toBe(false);
    expect(active.activeStreak).toBe(5);
    expect(active.daysRemaining).toBe(16);

    const expired = evaluateStreakStatus(5, '2026-10-01T00:00:00.000Z', '2026-11-05T00:00:00.000Z', 30);
    expect(expired.isExpired).toBe(true);
    expect(expired.activeStreak).toBe(0);
    expect(expired.daysRemaining).toBe(0);
  });
});
