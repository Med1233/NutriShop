/**
 * Maps backend error strings to i18n translation keys.
 * The backend returns English error messages; this utility
 * translates them on the frontend so we don't change the API contract.
 */

const errorMap: Record<string, string> = {
  'Invalid email or password': 'error.invalidCredentials',
  'Email and password are required': 'error.emailPasswordRequired',
  'Email, password, and name are required': 'error.allFieldsRequired',
  'Password must be at least 8 characters': 'error.passwordTooShort',
  'Unable to create account. Please try again or use a different email.':
    'error.emailTaken',
  'Too many attempts, please try again later': 'error.tooManyAttempts',
  'Internal server error': 'error.internalError',
  'Authentication required': 'error.authRequired',
  'Token expired': 'error.tokenExpired',
  'Invalid token': 'error.invalidToken',
  'Admin access required': 'error.adminRequired',
  'Staff access required': 'error.staffRequired',
  'Email verification required': 'error.emailVerificationRequired',
  'Shipping address is required': 'error.shippingRequired',
  'Cart is empty': 'error.cartEmpty',
  'Order not found': 'error.orderNotFound',
  'User not found': 'error.userNotFound',
  'Name cannot be empty': 'error.nameRequired',
  'Google OAuth is not configured': 'error.googleNotConfigured',
  'Cannot change status of a cancelled order': 'error.cancelledOrder',
  'Database error': 'error.databaseError',
};

export function translateError(
  backendError: string,
  t: (key: string) => string,
): string {
  const key = errorMap[backendError];
  if (key) return t(key);
  return backendError;
}
