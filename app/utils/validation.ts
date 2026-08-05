/**
 * Structural validators only: required fields present, numbers non-negative,
 * dates well-formed. No content-based rules (e.g. no rep/weight caps) —
 * that would be an invented fitness rule, which this app does not add.
 */

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

function ok(): ValidationResult {
  return { valid: true, errors: {} };
}

function fail(errors: Record<string, string>): ValidationResult {
  return { valid: false, errors };
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export function isNonNegativeNumber(v: unknown): v is number {
  return typeof v === 'number' && !Number.isNaN(v) && v >= 0;
}

export function isPositiveInteger(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v > 0;
}

export function isValidIsoDate(v: unknown): v is string {
  return typeof v === 'string' && ISO_DATE_RE.test(v);
}

export interface RunEntryInput {
  date: string;
  distanceM: number;
  durationS: number;
}

export function validateRunEntry(input: RunEntryInput): ValidationResult {
  const errors: Record<string, string> = {};
  if (!isValidIsoDate(input.date)) errors.date = 'Enter a valid date.';
  if (!isNonNegativeNumber(input.distanceM) || input.distanceM === 0) errors.distanceM = 'Enter a distance greater than 0.';
  if (!isNonNegativeNumber(input.durationS) || input.durationS === 0) errors.durationS = 'Enter a duration greater than 0.';
  return Object.keys(errors).length ? fail(errors) : ok();
}

export interface ExerciseInput {
  name: string;
}

export function validateExercise(input: ExerciseInput): ValidationResult {
  const errors: Record<string, string> = {};
  if (!isNonEmptyString(input.name)) errors.name = 'Exercise name is required.';
  return Object.keys(errors).length ? fail(errors) : ok();
}

export interface LoggedSetInput {
  reps: number;
  weightKg?: number | null;
}

export function validateLoggedSet(input: LoggedSetInput): ValidationResult {
  const errors: Record<string, string> = {};
  if (!isPositiveInteger(input.reps)) errors.reps = 'Enter reps greater than 0.';
  if (input.weightKg != null && !isNonNegativeNumber(input.weightKg)) {
    errors.weightKg = 'Weight cannot be negative.';
  }
  return Object.keys(errors).length ? fail(errors) : ok();
}

export interface PaceSplitInput {
  distanceM: number;
  durationS: number;
}

export function validatePaceSplit(input: PaceSplitInput): ValidationResult {
  const errors: Record<string, string> = {};
  if (!isNonNegativeNumber(input.distanceM) || input.distanceM === 0) errors.distanceM = 'Split distance must be greater than 0.';
  if (!isNonNegativeNumber(input.durationS) || input.durationS === 0) errors.durationS = 'Split duration must be greater than 0.';
  return Object.keys(errors).length ? fail(errors) : ok();
}

export interface TemplateInput {
  name: string;
}

export function validateTemplate(input: TemplateInput): ValidationResult {
  const errors: Record<string, string> = {};
  if (!isNonEmptyString(input.name)) errors.name = 'Template name is required.';
  return Object.keys(errors).length ? fail(errors) : ok();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(v: unknown): v is string {
  return typeof v === 'string' && EMAIL_RE.test(v.trim());
}

export interface SignUpInput {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

export function validateSignUp(input: SignUpInput): ValidationResult {
  const errors: Record<string, string> = {};
  if (!isValidEmail(input.email)) errors.email = 'Enter a valid email address.';
  if (!isNonEmptyString(input.displayName)) errors.displayName = 'Enter your name.';
  if (!isNonEmptyString(input.password) || input.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }
  if (input.password !== input.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  return Object.keys(errors).length ? fail(errors) : ok();
}

export interface LogInInput {
  email: string;
  password: string;
}

export function validateLogIn(input: LogInInput): ValidationResult {
  const errors: Record<string, string> = {};
  if (!isValidEmail(input.email)) errors.email = 'Enter a valid email address.';
  if (!isNonEmptyString(input.password)) errors.password = 'Enter your password.';
  return Object.keys(errors).length ? fail(errors) : ok();
}
