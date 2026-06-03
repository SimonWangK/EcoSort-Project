export function friendlyFirebaseError(message: string): string {
  // Normalise to uppercase once so all subsequent checks are case-insensitive.
  const value = message.toUpperCase();

  if (value.includes('EMAIL_NOT_FOUND') || value.includes('INVALID_LOGIN_CREDENTIALS')) {
    return 'We could not find an account with those details. Check your email and password.';
  }
  if (value.includes('INVALID_PASSWORD')) {
    return 'The password does not match this account.';
  }
  if (value.includes('EMAIL_EXISTS')) {
    return 'This email is already registered. Try signing in instead.';
  }
  if (value.includes('WEAK_PASSWORD')) {
    return 'Use a stronger password with at least six characters.';
  }
  // FIX: compare uppercase 'API KEY' against the already-uppercased `value`
  if (value.includes('API KEY')) {
    return 'Online account setup is unavailable right now. You can still continue without sign-in.';
  }
  if (value.includes('LOCAL-ONLY') || value.includes('LOCAL_ONLY_SESSION')) {
    return 'This guest profile is saved on this device only. Sign in to keep your data available on another device.';
  }
  return 'Something went wrong. Please try again or use the app without sign-in.';
}

export function permissionErrorMessage(kind: 'camera' | 'location' | 'notification'): string {
  if (kind === 'camera') {
    return 'Camera access is unavailable. You can still use manual search to check recycling rules.';
  }
  if (kind === 'location') {
    return 'Location access is unavailable. Choose your council manually to keep guidance local.';
  }
  return 'Notifications are disabled. You can still use the app without reminders.';
}
