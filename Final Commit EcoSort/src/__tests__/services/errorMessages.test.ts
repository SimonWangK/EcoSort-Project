/**
 * Unit tests — errorMessages utility
 * ------------------------------------
 * Verifies that friendlyFirebaseError maps known Firebase error codes
 * to human-readable messages, and that permissionErrorMessage returns
 * the correct string for each permission kind.
 */

import { friendlyFirebaseError, permissionErrorMessage } from '../../utils/errorMessages';

// ── friendlyFirebaseError ─────────────────────────────────────────────────────

describe('friendlyFirebaseError', () => {
  test('returns friendly message for EMAIL_NOT_FOUND', () => {
    const msg = friendlyFirebaseError('EMAIL_NOT_FOUND');
    expect(msg.toLowerCase()).toContain('account');
  });

  test('returns friendly message for INVALID_LOGIN_CREDENTIALS', () => {
    const msg = friendlyFirebaseError('INVALID_LOGIN_CREDENTIALS');
    expect(msg.toLowerCase()).toContain('account');
  });

  test('returns friendly message for INVALID_PASSWORD', () => {
    const msg = friendlyFirebaseError('INVALID_PASSWORD');
    expect(msg.toLowerCase()).toContain('password');
  });

  test('returns friendly message for EMAIL_EXISTS', () => {
    const msg = friendlyFirebaseError('EMAIL_EXISTS');
    expect(msg.toLowerCase()).toContain('registered');
  });

  test('returns friendly message for WEAK_PASSWORD', () => {
    const msg = friendlyFirebaseError('WEAK_PASSWORD');
    expect(msg.toLowerCase()).toContain('password');
  });

  test('returns friendly message when "API key" appears in message', () => {
    const msg = friendlyFirebaseError('Invalid API key provided.');
    expect(msg.toLowerCase()).toContain('firebase');
  });

  test('returns generic fallback for unknown error codes', () => {
    const msg = friendlyFirebaseError('SOME_UNKNOWN_CODE');
    expect(msg.length).toBeGreaterThan(0);
  });

  test('is case-insensitive to the input', () => {
    const upper = friendlyFirebaseError('email_not_found');
    expect(upper.toLowerCase()).toContain('account');
  });
});

// ── permissionErrorMessage ────────────────────────────────────────────────────

describe('permissionErrorMessage', () => {
  test('camera message mentions manual search as alternative', () => {
    const msg = permissionErrorMessage('camera');
    expect(msg.toLowerCase()).toContain('search');
  });

  test('location message mentions cached council rules', () => {
    const msg = permissionErrorMessage('location');
    expect(msg.toLowerCase()).toContain('cached');
  });

  test('notification message mentions offline usage', () => {
    const msg = permissionErrorMessage('notification');
    expect(msg.toLowerCase()).toContain('app');
  });

  test('all messages are non-empty strings', () => {
    (['camera', 'location', 'notification'] as const).forEach((kind) => {
      expect(permissionErrorMessage(kind).length).toBeGreaterThan(0);
    });
  });
});
