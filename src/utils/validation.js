/**
 * Validation utilities for OrbitX authentication.
 */

// Gmail address validation regex: accepts only @gmail.com addresses
export const GMAIL_REGEX = /^[A-Za-z0-9._%+-]+@gmail\.com$/i;

/**
 * Validates an email address.
 * Requirements:
 * - Email is mandatory.
 * - Only Gmail addresses allowed.
 * - Accept only emails matching: ^[A-Za-z0-9._%+-]+@gmail\.com$
 * - Reject any other domains.
 *
 * @param {string} email
 * @returns {string} Error message or empty string if valid.
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email is required.';
  }
  const trimmed = email.trim();
  if (!GMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid Gmail address.';
  }
  return '';
};

/**
 * Validates a password against complexity requirements.
 * Requirements:
 * - Password is mandatory.
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 *
 * @param {string} password
 * @returns {string} Error message or empty string if valid.
 */
export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required.';
  }

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    return 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.';
  }
  return '';
};

/**
 * Checks whether both email and password are valid.
 *
 * @param {string} email
 * @param {string} password
 * @returns {boolean} True if both email and password pass validation.
 */
export const isLoginFormValid = (email, password) => {
  return validateEmail(email) === '' && validatePassword(password) === '';
};
