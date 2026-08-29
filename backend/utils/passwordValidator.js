// backend/utils/passwordValidator.js

const COMMON_DICTIONARY_PHRASES = [
  'password',
  '123456',
  '12345678',
  'qwerty',
  'admin123',
  'administrator',
  'eduscholar',
  'quezoncity',
  'iloveyou',
  'letmein',
  'welcome',
  'monkey',
  'dragon',
  'sunshine',
  'master',
  'secret',
  'student123',
  'scholar123',
];

function validateStandardPassword(password, userContext = {}) {
  const p = (password || '').trim();

  if (p.length < 12) {
    return {
      isValid: false,
      message: 'Password must be at least 12 characters long (12–16 characters recommended for maximum security).',
    };
  }

  if (!/[A-Z]/.test(p)) {
    return {
      isValid: false,
      message: 'Password must include at least one uppercase letter (A–Z).',
    };
  }

  if (!/[a-z]/.test(p)) {
    return {
      isValid: false,
      message: 'Password must include at least one lowercase letter (a–z).',
    };
  }

  if (!/[0-9]/.test(p)) {
    return {
      isValid: false,
      message: 'Password must include at least one numeric digit (0–9).',
    };
  }

  if (!/[!@#$%^&*()_+\-=[\]{}|;:,.<>?/~`]/.test(p)) {
    return {
      isValid: false,
      message: 'Password must include at least one special symbol (e.g., !, @, #, $, %, &).',
    };
  }

  const lower = p.toLowerCase();
  const isCommon = COMMON_DICTIONARY_PHRASES.some((phrase) => lower.includes(phrase));
  if (isCommon) {
    return {
      isValid: false,
      message: 'Password contains common dictionary words or predictable patterns. Please use a unique, strong password.',
    };
  }

  if (userContext.name && userContext.name.length >= 3) {
    const parts = userContext.name.toLowerCase().split(/\s+/);
    for (const part of parts) {
      if (part.length >= 3 && lower.includes(part)) {
        return {
          isValid: false,
          message: 'Password cannot contain parts of your name for security purposes.',
        };
      }
    }
  }

  if (userContext.email && userContext.email.includes('@')) {
    const emailUser = userContext.email.split('@')[0].toLowerCase();
    if (emailUser.length >= 3 && lower.includes(emailUser)) {
      return {
        isValid: false,
        message: 'Password cannot contain your email username for security purposes.',
      };
    }
  }

  return { isValid: true };
}

module.exports = { validateStandardPassword };
