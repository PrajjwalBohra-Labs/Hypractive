import { todayIsoDate, addDays } from '@/utils/dateUtils';

/**
 * Current streak: consecutive days with at least one logged run or
 * finished workout, counting backward from today. If today has no
 * activity yet, the streak still counts as active through yesterday
 * (you haven't broken it, you just haven't trained today yet) -- it
 * only reaches zero once a full day is skipped entirely.
 */
export function computeStreak(activeDates: string[]): number {
  const dateSet = new Set(activeDates);
  const today = todayIsoDate();

  let cursor = dateSet.has(today) ? today : addDays(today, -1);
  if (!dateSet.has(cursor)) return 0;

  let streak = 0;
  while (dateSet.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Oldest-to-newest activity flags for the last 7 calendar days, for a small dot-sequence display. */
export function getLast7DaysActivity(activeDates: string[]): boolean[] {
  const dateSet = new Set(activeDates);
  const today = todayIsoDate();
  const days: boolean[] = [];
  for (let i = 6; i >= 0; i--) {
    days.push(dateSet.has(addDays(today, -i)));
  }
  return days;
}
