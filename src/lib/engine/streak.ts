import { MilestoneBonus } from '../types';

export interface StreakCalculationInput {
  currentStreak: number;
  longestStreak: number;
  lastQualifyingVisitAt?: string | null; // ISO timestamp
  lastQualifyingLocalDate?: string | null; // YYYY-MM-DD
  nowTimestamp?: string; // Current ISO timestamp
  timezone?: string; // Gym timezone, defaults to Asia/Kolkata
  inactivityThresholdDays?: number; // Defaults to 30 days
  milestones?: MilestoneBonus[];
}

export interface StreakCalculationResult {
  newStreak: number;
  longestStreak: number;
  isNewQualifyingDay: boolean;
  streakIncremented: boolean;
  streakResetDueToInactivity: boolean;
  localDate: string; // YYYY-MM-DD in gym timezone
  milestoneUnlocked?: MilestoneBonus | null;
  daysRemainingBeforeExpiry: number;
  inactivityThresholdDate: string; // ISO string when streak will expire if not visited
}

export const DEFAULT_MILESTONES: MilestoneBonus[] = [
  { days: 7, bonusPoints: 50, label: '7-Day Warrior' },
  { days: 14, bonusPoints: 100, label: '2-Week Dedication' },
  { days: 30, bonusPoints: 250, label: 'Iron Month' },
  { days: 60, bonusPoints: 500, label: '60-Day Titan' },
  { days: 100, bonusPoints: 1000, label: 'Century Champion' },
];

/**
 * Returns formatted YYYY-MM-DD for a given Date/timestamp in the gym's specific timezone.
 */
export function getLocalDateString(dateInput: Date | string | number, timezone: string = 'Asia/Kolkata'): string {
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date); // format returns YYYY-MM-DD in 'en-CA'
  } catch {
    // Fallback if timezone string is invalid
    return date.toISOString().split('T')[0];
  }
}

/**
 * Calculates current streak status on read (e.g. for dashboard viewing),
 * checking if 30 complete days of inactivity have elapsed since last visit.
 */
export function evaluateStreakStatus(
  currentStreak: number,
  lastQualifyingVisitAt?: string | null,
  nowInput: string | Date = new Date(),
  inactivityThresholdDays: number = 30
): { activeStreak: number; isExpired: boolean; daysRemaining: number } {
  if (!lastQualifyingVisitAt || currentStreak <= 0) {
    return { activeStreak: 0, isExpired: false, daysRemaining: 0 };
  }

  const lastVisit = new Date(lastQualifyingVisitAt).getTime();
  const now = (typeof nowInput === 'string' ? new Date(nowInput) : nowInput).getTime();
  const thresholdMs = inactivityThresholdDays * 24 * 60 * 60 * 1000;
  const elapsedMs = now - lastVisit;

  if (elapsedMs >= thresholdMs) {
    return { activeStreak: 0, isExpired: true, daysRemaining: 0 };
  }

  const remainingMs = thresholdMs - elapsedMs;
  const daysRemaining = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));

  return { activeStreak: currentStreak, isExpired: false, daysRemaining };
}

/**
 * Authoritative streak calculation upon a new qualifying attendance visit.
 * Enforces:
 * 1. 30-day inactivity threshold (elapsed time >= 30 days resets streak to 1)
 * 2. At most once per local calendar day in the gym timezone
 * 3. Longest streak is preserved and monotonically increases
 * 4. Milestone bonuses unlocked on exact milestone days
 */
export function processAttendanceStreak(input: StreakCalculationInput): StreakCalculationResult {
  const {
    currentStreak = 0,
    longestStreak = 0,
    lastQualifyingVisitAt,
    lastQualifyingLocalDate,
    nowTimestamp = new Date().toISOString(),
    timezone = 'Asia/Kolkata',
    inactivityThresholdDays = 30,
    milestones = DEFAULT_MILESTONES,
  } = input;

  const now = new Date(nowTimestamp);
  const nowMs = now.getTime();
  const currentLocalDate = getLocalDateString(now, timezone);

  // Check if this attendance is on the same local calendar day
  const isSameLocalDay = lastQualifyingLocalDate === currentLocalDate;

  // Calculate inactivity window threshold
  const thresholdMs = inactivityThresholdDays * 24 * 60 * 60 * 1000;
  let streakResetDueToInactivity = false;
  let newStreak = currentStreak;
  let streakIncremented = false;

  if (!lastQualifyingVisitAt || currentStreak <= 0) {
    // First ever qualifying attendance
    newStreak = 1;
    streakIncremented = true;
  } else {
    const lastVisitMs = new Date(lastQualifyingVisitAt).getTime();
    const elapsedMs = nowMs - lastVisitMs;

    if (elapsedMs >= thresholdMs) {
      // 30 complete days of inactivity passed -> Streak resets to 1
      streakResetDueToInactivity = true;
      newStreak = 1;
      streakIncremented = true;
    } else if (isSameLocalDay) {
      // Same local calendar day: Keep streak unchanged! (Multiple visits count once)
      newStreak = currentStreak;
      streakIncremented = false;
    } else {
      // Returned within 30 days on a new local calendar day -> Streak increments!
      newStreak = currentStreak + 1;
      streakIncremented = true;
    }
  }

  const updatedLongestStreak = Math.max(longestStreak, newStreak);

  // Check if a milestone was reached on this increment
  let milestoneUnlocked: MilestoneBonus | null = null;
  if (streakIncremented) {
    const matched = milestones.find((m) => m.days === newStreak);
    if (matched) {
      milestoneUnlocked = matched;
    }
  }

  // Calculate next inactivity expiration timestamp
  const nextExpiryDate = new Date(nowMs + thresholdMs).toISOString();

  return {
    newStreak,
    longestStreak: updatedLongestStreak,
    isNewQualifyingDay: !isSameLocalDay,
    streakIncremented,
    streakResetDueToInactivity,
    localDate: currentLocalDate,
    milestoneUnlocked,
    daysRemainingBeforeExpiry: inactivityThresholdDays,
    inactivityThresholdDate: nextExpiryDate,
  };
}
