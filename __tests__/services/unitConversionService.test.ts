import {
  metersToDisplayDistance,
  displayDistanceToMeters,
  kgToDisplayWeight,
  displayWeightToKg,
  formatPace,
  formatDuration,
} from '../../app/services/unitConversionService';

describe('unitConversionService', () => {
  test('metersToDisplayDistance returns km for metric', () => {
    expect(metersToDisplayDistance(5000, 'metric')).toBeCloseTo(5);
  });

  test('metersToDisplayDistance returns miles for imperial', () => {
    expect(metersToDisplayDistance(1609.344, 'imperial')).toBeCloseTo(1, 3);
  });

  test('displayDistanceToMeters round-trips with metersToDisplayDistance', () => {
    const meters = 10000;
    const displayed = metersToDisplayDistance(meters, 'imperial');
    const backToMeters = displayDistanceToMeters(displayed, 'imperial');
    expect(backToMeters).toBeCloseTo(meters, 0);
  });

  test('kgToDisplayWeight converts to lb for imperial', () => {
    expect(kgToDisplayWeight(100, 'imperial')).toBeCloseTo(220.46, 1);
  });

  test('displayWeightToKg converts lb back to kg', () => {
    expect(displayWeightToKg(220.46, 'imperial')).toBeCloseTo(100, 0);
  });

  test('formatPace formats seconds-per-km as m:ss for metric', () => {
    expect(formatPace(330, 'metric')).toBe('5:30 /km');
  });

  test('formatDuration formats under an hour as m:ss', () => {
    expect(formatDuration(125)).toBe('2:05');
  });

  test('formatDuration formats over an hour as h:mm:ss', () => {
    expect(formatDuration(3661)).toBe('1:01:01');
  });
});
