import { describe, expect, it } from 'vitest';
import { validateLogin } from '../validation';

describe('login validation', () => {
  it('requires both fields', () => {
    expect(validateLogin({ email: ' ', password: '' })).toEqual({
      email: 'Enter your email address.',
      password: 'Enter your password.',
    });
  });

  it('rejects malformed email addresses', () => {
    expect(validateLogin({ email: 'invalid', password: 'secret' }).email).toBe('Enter a valid email address.');
  });

  it('accepts the demo credentials', () => {
    expect(validateLogin({ email: ' demo@bugbazaar.dev ', password: 'demo123' })).toEqual({});
  });
});
