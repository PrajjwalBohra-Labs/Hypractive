import { getRemainingSeconds } from '../../app/state/timerStore';

describe('getRemainingSeconds', () => {
  test('returns 0 when endsAt is null', () => {
    expect(getRemainingSeconds(null)).toBe(0);
  });

  test('returns 0 when endsAt is in the past', () => {
    expect(getRemainingSeconds(Date.now() - 5000)).toBe(0);
  });

  test('returns approximate remaining seconds when endsAt is in the future', () => {
    const endsAt = Date.now() + 90 * 1000;
    const remaining = getRemainingSeconds(endsAt);
    expect(remaining).toBeGreaterThanOrEqual(89);
    expect(remaining).toBeLessThanOrEqual(90);
  });
});
