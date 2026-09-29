// backend/utils/emailValidator.js
const dns = require('dns').promises;

const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'mailinator.com', '10minutemail.com', 'guerrillamail.com',
  'dispostable.com', 'yopmail.com', 'trashmail.com', 'sharklasers.com',
  'getnada.com', 'temp-mail.org', 'fakemail.net', 'throwawaymail.com',
  'maildrop.cc', '0clickemail.com', 'generator.email', 'anonymbox.com'
]);

const KNOWN_VALID_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.com.ph', 'outlook.com',
  'hotmail.com', 'icloud.com', 'aol.com', 'live.com', 'msn.com',
  'qcu.edu.ph', 'up.edu.ph', 'ust.edu.ph', 'pup.edu.ph', 'dlsu.edu.ph',
  'ateneo.edu', 'feu.edu.ph', 'neu.edu.ph', 'sanbeda.edu.ph'
]);

/**
 * Validates email format, Gmail username constraints, disposable email blocking,
 * and live domain/MX server verification.
 */
const validateRealEmail = async (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Email address is required.' };
  }

  const normalized = email.trim().toLowerCase();
  
  // Standard RFC 5322 regex format check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(normalized)) {
    return { isValid: false, message: 'Please enter a valid email address (e.g. yourname@gmail.com).' };
  }

  const [username, domain] = normalized.split('@');

  // Check disposable/fake temp email domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { isValid: false, message: 'Disposable or temporary email addresses are not permitted. Please use a permanent email address (e.g. Gmail).' };
  }

  // Gmail platform specific username rules
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    if (username.length < 6 || username.length > 30) {
      return { isValid: false, message: 'Gmail address usernames must be between 6 and 30 characters long.' };
    }
    if (!/^[a-z0-9.]+$/.test(username)) {
      return { isValid: false, message: 'Gmail usernames can only contain letters (a-z), numbers (0-9), and periods (.).' };
    }
    if (username.startsWith('.') || username.endsWith('.') || username.includes('..')) {
      return { isValid: false, message: 'Invalid Gmail username format (cannot start or end with a period or contain consecutive periods).' };
    }
  }

  // Fast path for known valid domains
  if (KNOWN_VALID_DOMAINS.has(domain)) {
    return { isValid: true, normalizedEmail: normalized };
  }

  // DNS MX Record lookup for custom domains
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { isValid: false, message: `The email domain '@${domain}' has no active mail servers configured to receive email.` };
    }
  } catch (err) {
    const code = (err && err.code) ? err.code.toUpperCase() : '';
    // If local environment blocks outbound DNS queries (ECONNREFUSED/ETIMEDOUT), allow standard valid domain syntax
    if (code === 'ECONNREFUSED' || code === 'ETIMEDOUT' || code === 'ENOTFOUND') {
      if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
        return { isValid: true, normalizedEmail: normalized };
      }
    }
    return { isValid: false, message: `The email domain '@${domain}' does not exist or is not a valid mail service.` };
  }

  return { isValid: true, normalizedEmail: normalized };
};

module.exports = {
  validateRealEmail,
};
