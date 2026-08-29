// frontend/src/utils/passwordValidation.ts

export interface PasswordRuleResult {
  hasMinLength: boolean;
  hasRecommendedLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  isNotCommonPhrase: boolean;
  doesNotContainUserInfo: boolean;
  isValid: boolean;
  score: number; // 0 to 4
  strengthLabel: 'Too Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
}

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

export function validateStandardPassword(
  password: string,
  userContext?: { name?: string; email?: string }
): PasswordRuleResult {
  const p = password || '';
  const trimmed = p.trim();

  const hasMinLength = trimmed.length >= 12;
  const hasRecommendedLength = trimmed.length >= 12 && trimmed.length <= 32;
  const hasUppercase = /[A-Z]/.test(trimmed);
  const hasLowercase = /[a-z]/.test(trimmed);
  const hasNumber = /[0-9]/.test(trimmed);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{}|;:,.<>?/~`]/.test(trimmed);

  // Check common phrases
  const lower = trimmed.toLowerCase();
  const isCommon = COMMON_DICTIONARY_PHRASES.some((phrase) => lower.includes(phrase));
  const isNotCommonPhrase = !isCommon;

  // Check user info containment
  let doesNotContainUserInfo = true;
  if (userContext) {
    if (userContext.name && userContext.name.length >= 3) {
      const nameParts = userContext.name.toLowerCase().split(/\s+/);
      for (const part of nameParts) {
        if (part.length >= 3 && lower.includes(part)) {
          doesNotContainUserInfo = false;
          break;
        }
      }
    }
    if (userContext.email && userContext.email.includes('@')) {
      const emailUser = userContext.email.split('@')[0].toLowerCase();
      if (emailUser.length >= 3 && lower.includes(emailUser)) {
        doesNotContainUserInfo = false;
      }
    }
  }

  // Calculate score (0 to 4)
  let score = 0;
  if (hasMinLength) score++;
  if (hasUppercase && hasLowercase) score++;
  if (hasNumber && hasSpecialChar) score++;
  if (isNotCommonPhrase && doesNotContainUserInfo && trimmed.length >= 12) score++;

  let strengthLabel: PasswordRuleResult['strengthLabel'] = 'Too Weak';
  if (score === 1) strengthLabel = 'Weak';
  else if (score === 2) strengthLabel = 'Fair';
  else if (score === 3) strengthLabel = 'Strong';
  else if (score >= 4) strengthLabel = 'Very Strong';

  const isValid =
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar &&
    isNotCommonPhrase &&
    doesNotContainUserInfo;

  return {
    hasMinLength,
    hasRecommendedLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    isNotCommonPhrase,
    doesNotContainUserInfo,
    isValid,
    score,
    strengthLabel,
  };
}
