export function friendlyFirebaseError(message: string): string {
  const value = message.toUpperCase();
  if (value.includes('EMAIL_NOT_FOUND') || value.includes('INVALID_LOGIN_CREDENTIALS')) return 'We could not find an account with those details. Check your email and password.';
  if (value.includes('INVALID_PASSWORD')) return 'The password does not match this account.';
  if (value.includes('EMAIL_EXISTS')) return 'This email is already registered. Try signing in instead.';
  if (value.includes('WEAK_PASSWORD')) return 'Use a stronger password with at least six characters.';
  if (value.includes('API key')) return 'Firebase is not configured yet. Add your project values to .env.';
  return 'Something went wrong. Please try again or continue offline.';
}

export function permissionErrorMessage(kind: 'camera' | 'location' | 'notification'): string {
  if (kind === 'camera') return 'Camera access is unavailable. You can still use manual search to check recycling rules.';
  if (kind === 'location') return 'Location access is unavailable. EcoSort will use the cached council rules instead.';
  return 'Notifications are disabled. You can still use the app without reminders.';
}
