import { checkPr } from '../../app/services/prService';

describe('checkPr', () => {
  test('first ever set for an exercise is a PR for both metrics', () => {
    const result = checkPr(100, 800, null, null);
    expect(result.isPrWeight).toBe(true);
    expect(result.isPrVolume).toBe(true);
  });

  test('equal weight is NOT a weight PR', () => {
    const result = checkPr(100, 900, 100, 800);
    expect(result.isPrWeight).toBe(false);
  });

  test('strictly greater weight is a PR', () => {
    const result = checkPr(102.5, 820, 100, 800);
    expect(result.isPrWeight).toBe(true);
    expect(result.isPrVolume).toBe(true);
  });

  test('bodyweight set (null weight) never sets a weight PR', () => {
    const result = checkPr(null, 0, 100, 800);
    expect(result.isPrWeight).toBe(false);
  });

  test('lower value than best is not a PR for either metric', () => {
    const result = checkPr(90, 720, 100, 800);
    expect(result.isPrWeight).toBe(false);
    expect(result.isPrVolume).toBe(false);
  });
});
