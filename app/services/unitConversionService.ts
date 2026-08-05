import type { UnitPreference } from '@/types/entities';

const KM_PER_MILE = 1.609344;
const KG_PER_LB = 0.45359237;

export function metersToDisplayDistance(meters: number, unit: UnitPreference): number {
  const km = meters / 1000;
  return unit === 'imperial' ? km / KM_PER_MILE : km;
}

export function displayDistanceToMeters(value: number, unit: UnitPreference): number {
  const km = unit === 'imperial' ? value * KM_PER_MILE : value;
  return km * 1000;
}

export function distanceUnitLabel(unit: UnitPreference): string {
  return unit === 'imperial' ? 'mi' : 'km';
}

export function kgToDisplayWeight(kg: number, unit: UnitPreference): number {
  return unit === 'imperial' ? kg / KG_PER_LB : kg;
}

export function displayWeightToKg(value: number, unit: UnitPreference): number {
  return unit === 'imperial' ? value * KG_PER_LB : value;
}

export function weightUnitLabel(unit: UnitPreference): string {
  return unit === 'imperial' ? 'lb' : 'kg';
}

/** Formats seconds-per-km pace as m:ss, converting to per-mile if needed. */
export function formatPace(secPerKm: number, unit: UnitPreference): string {
  const secPerUnit = unit === 'imperial' ? secPerKm * KM_PER_MILE : secPerKm;
  const mins = Math.floor(secPerUnit / 60);
  const secs = Math.round(secPerUnit % 60);
  return `${mins}:${secs.toString().padStart(2, '0')} /${distanceUnitLabel(unit)}`;
}

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
