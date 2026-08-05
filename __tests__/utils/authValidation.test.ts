import { validateSignUp, validateLogIn, isValidEmail } from '../../app/utils/validation';

describe('isValidEmail', () => {
  test('accepts a well-formed email', () => {
    expect(isValidEmail('alex@example.com')).toBe(true);
  });

  test('rejects a string with no @', () => {
    expect(isValidEmail('alexexample.com')).toBe(false);
  });

  test('rejects a string with no domain', () => {
    expect(isValidEmail('alex@')).toBe(false);
  });
});

describe('validateSignUp', () => {
  const base = { email: 'alex@example.com', password: 'secret1', confirmPassword: 'secret1', displayName: 'Alex' };

  test('passes with valid input', () => {
    expect(validateSignUp(base).valid).toBe(true);
  });

  test('fails with an invalid email', () => {
    const result = validateSignUp({ ...base, email: 'not-an-email' });
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  test('fails when password is under 6 characters', () => {
    const result = validateSignUp({ ...base, password: '123', confirmPassword: '123' });
    expect(result.valid).toBe(false);
    expect(result.errors.password).toBeDefined();
  });

  test('fails when passwords do not match', () => {
    const result = validateSignUp({ ...base, confirmPassword: 'different' });
    expect(result.valid).toBe(false);
    expect(result.errors.confirmPassword).toBeDefined();
  });

  test('fails when display name is empty', () => {
    const result = validateSignUp({ ...base, displayName: '' });
    expect(result.valid).toBe(false);
    expect(result.errors.displayName).toBeDefined();
  });
});

describe('validateLogIn', () => {
  test('passes with valid input', () => {
    expect(validateLogIn({ email: 'alex@example.com', password: 'anything' }).valid).toBe(true);
  });

  test('fails with an invalid email', () => {
    expect(validateLogIn({ email: 'bad', password: 'anything' }).valid).toBe(false);
  });

  test('fails with an empty password', () => {
    expect(validateLogIn({ email: 'alex@example.com', password: '' }).valid).toBe(false);
  });
});
