/**
 * Entity types — one-to-one with ARCHITECTURE.md section 5.
 * These are the shapes returned by the repository layer (app/db/repositories/*).
 * Booleans are represented as `boolean` here even though SQLite stores them as 0/1;
 * repositories are responsible for the conversion at the boundary.
 */

export type UnitPreference = 'metric' | 'imperial';

export interface User {
  id: string;
  displayName: string;
  email: string | null; // null only for accounts created before login existed
  passwordHash: string | null;
  isLoggedIn: boolean;
  unitPreference: UnitPreference;
  createdAt: string; // ISO date
  appLockEnabled: boolean;
}

export interface FriendGroupMember {
  id: string;
  ownerUserId: string;
  displayName: string;
  createdAt: string;
}

export interface RunningPlan {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  startDate: string | null;
  createdAt: string;
  archived: boolean;
}

export interface PlannedRunSession {
  id: string;
  planId: string;
  plannedDate: string;
  targetDistanceM: number | null;
  targetDurationS: number | null;
  targetPaceSPerKm: number | null;
  notes: string | null;
  linkedRunSessionId: string | null;
  sortOrder: number;
}

export interface RunSession {
  id: string;
  userId: string;
  date: string;
  distanceM: number;
  durationS: number;
  avgPaceSPerKm: number;
  notes: string | null;
  plannedSessionId: string | null;
  createdAt: string;
}

export interface PaceSplit {
  id: string;
  runSessionId: string;
  splitIndex: number;
  distanceM: number;
  durationS: number;
  paceSPerKm: number;
}

export interface WorkoutProgram {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  archived: boolean;
}

export interface ProgramTemplateEntry {
  id: string;
  programId: string;
  templateId: string;
  sortOrder: number;
}

export interface CustomWorkoutTemplate {
  id: string;
  userId: string;
  name: string;
  notes: string | null;
  createdAt: string;
  archived: boolean;
}

export interface TemplateExerciseEntry {
  id: string;
  templateId: string;
  exerciseId: string;
  targetSets: number | null;
  targetReps: number | null;
  sortOrder: number;
}

export interface Exercise {
  id: string;
  userId: string;
  name: string;
  category: string | null;
  equipment: string | null;
  notes: string | null;
  createdAt: string;
  archived: boolean;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  date: string;
  sourceTemplateId: string | null;
  startedAt: string;
  finishedAt: string | null;
  notes: string | null;
}

export interface LoggedSet {
  id: string;
  workoutSessionId: string;
  exerciseId: string;
  setIndex: number;
  weightKg: number | null;
  reps: number;
  rpe: number | null;
  completedAt: string;
}

export type ProgressMetric = 'max_weight' | 'max_volume_single_set' | 'max_reps_at_bodyweight';

export interface ExerciseHistoryEntry {
  id: string;
  userId: string;
  exerciseId: string;
  loggedSetId: string;
  date: string;
  weightKg: number | null;
  reps: number;
  volumeKg: number;
  isPrWeight: boolean;
  isPrVolume: boolean;
}

export interface ProgressRecord {
  id: string;
  userId: string;
  exerciseId: string;
  metric: ProgressMetric;
  value: number;
  achievedDate: string;
  sourceHistoryEntryId: string;
}

export interface RestTimerPreset {
  id: string;
  userId: string;
  label: string;
  durationS: number;
  sortOrder: number;
}

/** Not persisted — a query-config shape, see ARCHITECTURE.md 5.17 */
export type ChartDataSource =
  | { kind: 'pace_over_time'; userId: string; dateFrom: string; dateTo: string }
  | { kind: 'distance_over_time'; userId: string; dateFrom: string; dateTo: string; granularity: 'day' | 'week' | 'month' }
  | { kind: 'exercise_weight_over_time'; userId: string; exerciseId: string }
  | { kind: 'exercise_volume_over_time'; userId: string; exerciseId: string }
  | { kind: 'workout_frequency'; userId: string; dateFrom: string; dateTo: string; granularity: 'week' | 'month' };

export interface ChartPoint {
  x: string; // ISO date or bucket label
  y: number;
}
