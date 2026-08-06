/**
 * Hypractive's voice, centralized. Empty states and completion moments
 * pick a random line from these pools each time they render, rather than
 * always showing the same one. Kept in one file so the tone stays
 * consistent and easy to extend without hunting through every screen.
 */

export const NO_WORKOUTS_LINES = [
  'Your muscles are still theoretical.',
  'Even your couch misses you.',
  'Nothing here. Like your motivation.',
];

export const NO_RUNS_LINES = [
  "You've successfully avoided cardio.",
  'Your legs remain unemployed.',
  'Zero escapes recorded.',
];

export const ACHIEVEMENT_LINES = [
  'Congratulations. Gravity almost lost.',
  'You disappointed your couch today.',
  'Your excuses burned fewer calories than you did.',
  'Your future self is mildly less disappointed.',
  'Even your knees are questioning your decisions.',
];

/** General-purpose dark humor for the RoastCard — evergreen lines that
 * make sense regardless of what's happening on screen, unlike the
 * empty-state and achievement lines above which are tied to a specific
 * moment. */
export const ROAST_LINES = [
  "Statistically, you're one workout closer to not being one.",
  'The gym called. It\u2019s still waiting.',
  'Discipline: the thing standing between you and your excuses.',
  'Somewhere, a treadmill is gathering dust. Probably yours.',
  'Your future self is watching. They look unimpressed.',
  'Motivation is temporary. This app is not.',
  'Nobody is coming to do your reps for you.',
  'Progress is boring. So is skipping it, apparently.',
];

export function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
