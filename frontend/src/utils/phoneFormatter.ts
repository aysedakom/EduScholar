/**
 * Philippine Mobile Number Formatter & Validator Utility
 * Standard: E.164 (+63) followed by 10 digits starting with 9 (e.g. +63 917 123 4567)
 * Local standard: 11 digits starting with 09 (e.g. 09171234567)
 */

/**
 * Extracts raw 10-digit core mobile number (without leading 0 or +63).
 * Example:
 *  "09171234567" -> "9171234567"
 *  "+639171234567" -> "9171234567"
 *  "9171234567" -> "9171234567"
 */
export function extractPHMobileDigits(raw: string | undefined | null): string {
  if (!raw) return '';
  // Strip everything except digits
  let digits = raw.replace(/\D/g, '');

  // If starts with 63, strip 63
  if (digits.startsWith('63')) {
    digits = digits.slice(2);
  }

  // If starts with 0, strip leading 0
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Cap at 10 digits (Philippine mobile numbers have 10 digits after +63 / 0)
  return digits.slice(0, 10);
}

/**
 * Formats a mobile number into international Philippine format:
 * Pattern: "+63 9XX XXX XXXX"
 * Automatically converts "09..." or "9..." into international "+63 9..."
 */
export function formatPHMobile(raw: string | undefined | null): string {
  if (!raw) return '';
  const digits = extractPHMobileDigits(raw);
  if (!digits) return '';

  // Format as +63 9XX XXX XXXX
  if (digits.length <= 3) {
    return `+63 ${digits}`;
  } else if (digits.length <= 6) {
    return `+63 ${digits.slice(0, 3)} ${digits.slice(3)}`;
  } else {
    return `+63 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  }
}

/**
 * Returns clean E.164 formatted number without spaces (e.g. "+639171234567")
 */
export function cleanPHMobile(raw: string | undefined | null): string {
  if (!raw) return '';
  const digits = extractPHMobileDigits(raw);
  if (!digits) return '';
  return `+63${digits}`;
}

/**
 * Validates whether the given string is a complete and valid Philippine mobile number.
 * Must have exactly 10 digits and start with '9' (or valid PH mobile prefixes).
 */
export function isValidPHMobile(raw: string | undefined | null): boolean {
  if (!raw) return false;
  const digits = extractPHMobileDigits(raw);
  // Must be exactly 10 digits and start with 9
  return digits.length === 10 && digits.startsWith('9');
}
