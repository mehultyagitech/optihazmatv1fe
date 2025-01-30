/**
 * Validates an email address.
 * @param {string} email - The email to validate.
 * @returns {boolean} True if valid, otherwise false.
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Checks if a password meets the required criteria.
   * @param {string} password - The password to check.
   * @returns {boolean} True if valid, otherwise false.
   */
  export const isValidPassword = (password) => {
    return password.length >= 8; // Example: Minimum length of 8 characters
  };
  
  /**
   * Checks if a field is empty.
   * @param {string} value - The value to check.
   * @returns {boolean} True if empty, otherwise false.
   */
  export const isEmpty = (value) => {
    return value.trim().length === 0;
  };
  