import { pickRandom, NO_WORKOUTS_LINES, NO_RUNS_LINES, ACHIEVEMENT_LINES } from '../../app/content/roastCopy';

describe('pickRandom', () => {
  test('always returns a member of the given array', () => {
    for (let i = 0; i < 50; i++) {
      const result = pickRandom(NO_WORKOUTS_LINES);
      expect(NO_WORKOUTS_LINES).toContain(result);
    }
  });

  test('works across all three copy pools without throwing', () => {
    expect(NO_WORKOUTS_LINES).toContain(pickRandom(NO_WORKOUTS_LINES));
    expect(NO_RUNS_LINES).toContain(pickRandom(NO_RUNS_LINES));
    expect(ACHIEVEMENT_LINES).toContain(pickRandom(ACHIEVEMENT_LINES));
  });

  test('a single-item array always returns that item', () => {
    expect(pickRandom(['only option'])).toBe('only option');
  });
});
