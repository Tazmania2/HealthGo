/**
 * Validation Module
 * Handles credential and input validation
 * Requirements: 1.3
 */

/**
 * Validate login credentials before API call
 * Property 3: Empty credentials are rejected before API call
 * @param {string} email - Email or employee ID
 * @param {string} password - Password
 * @returns {Object} - { isValid: boolean, errors: { email?: string, password?: string } }
 */
export function validateCredentials(email, password) {
  const errors = {};
  
  // Check if email is empty or whitespace-only
  if (!email || email.trim() === '') {
    errors.email = 'Email or Employee ID is required';
  }
  
  // Check if password is empty or whitespace-only
  if (!password || password.trim() === '') {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
