/**
 * Shared Phone & Mobile Validation, Normalization, and Dutch Name Parsing (Frontend)
 * EXEC-12: Phone Number Normalization & Leading Zero Preservation (06... & Dutch Names)
 *
 * Supported formats:
 * - Dutch national numbers: 06 12345678, 06-12345678, 0612345678, 010 1234567, 020-1234567
 * - International numbers with country code: +31 6 12345678, +31612345678, 0031 6 12345678, +1 (555) 123-4567
 * - Optional telephone (contact) does not block when empty.
 * - Required mobile validates non-empty and format.
 * - Preserves leading '0' on domestic numbers (e.g. 06..., 020...).
 * - Parses Dutch tussenvoegsels (van, de, der, den, van der, in 't, etc.).
 */

export const DUTCH_TUSSENVOEGSELS: readonly string[] = [
  'van der', 'van den', 'van de', 'van het', "van 't",
  'in het', "in 't", 'op het', "op 't", 'aan het', 'aan de',
  'bij de', 'bij het', "bij 't",
  'van', 'de', 'der', 'den', 'ter', 'ten', 'te', 'ver', "d'", "’s-"
];

export interface ParsedDutchName {
  firstName: string;
  lastName: string;
  prefix: string;
  surname: string;
  fullName: string;
}

export const isValidPhoneNumber = (value: unknown): boolean => {
  if (value === undefined || value === null) return true;
  const s = String(value).trim();
  if (!s) return true;
  if (!/^(?:\+|00)?[0-9\s\-().]{7,25}$/.test(s)) return false;
  const digits = s.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
};

/**
 * Normalizes phone numbers while strictly preserving the leading zero.
 * Examples:
 * - "06 12345678" -> "0612345678"
 * - "020-1234567" -> "0201234567"
 * - "+31 6 1234 5678" -> "+31612345678"
 * - "0031 6 12345678" -> "+31612345678"
 * - 612345678 (9 digits, missing 0) -> "0612345678"
 */
export const normalizePhoneNumber = (value: unknown): string => {
  if (value === undefined || value === null) return '';
  const raw = String(value).trim();
  if (!raw) return '';

  const isPlus = raw.startsWith('+');
  const is00 = raw.startsWith('00');

  const clean = raw.replace(/[\s\-\(\)\.]+/g, '');

  if (isPlus) {
    return clean;
  }

  if (is00) {
    return '+' + clean.slice(2);
  }

  // Preserve leading zero on domestic Dutch numbers (06..., 020..., etc.)
  if (clean.startsWith('0')) {
    return clean;
  }

  // Restore leading zero if previously stripped by numeric casting (9 digits)
  if (/^[1-9]\d{8}$/.test(clean)) {
    return '0' + clean;
  }

  return clean;
};

/**
 * Formats normalized phone number for human-readable display.
 */
export const formatPhoneNumber = (value: unknown): string => {
  const norm = normalizePhoneNumber(value);
  if (!norm) return '';

  if (/^06\d{8}$/.test(norm)) {
    return `${norm.slice(0, 2)} ${norm.slice(2)}`;
  }
  if (/^\+316\d{8}$/.test(norm)) {
    return `+31 6 ${norm.slice(4)}`;
  }
  if (/^0(10|13|15|20|23|24|26|30|33|35|36|38|40|43|45|46|50|53|55|58|70|71|72|73|74|75|76|77|78|79)\d{7}$/.test(norm)) {
    return `${norm.slice(0, 3)} ${norm.slice(3)}`;
  }
  return norm;
};

/**
 * Dutch Name Parser (tussenvoegsel-aware).
 * Correctly splits full names into first name, tussenvoegsel prefix, and last name.
 */
export const parseDutchName = (fullName: unknown): ParsedDutchName => {
  if (!fullName || typeof fullName !== 'string') {
    return { firstName: '', lastName: '', prefix: '', surname: '', fullName: '' };
  }

  const trimmed = fullName.trim();
  if (!trimmed) {
    return { firstName: '', lastName: '', prefix: '', surname: '', fullName: '' };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: '',
      prefix: '',
      surname: '',
      fullName: parts[0]
    };
  }

  const firstName = parts[0];
  const rest = parts.slice(1).join(' ');

  let prefix = '';
  let lastName = rest;

  const restLower = rest.toLowerCase();
  for (const tv of DUTCH_TUSSENVOEGSELS) {
    if (restLower === tv || restLower.startsWith(tv + ' ')) {
      prefix = rest.slice(0, tv.length);
      lastName = rest.slice(tv.length).trim();
      break;
    }
  }

  return {
    firstName,
    prefix,
    lastName,
    surname: rest,
    fullName: trimmed
  };
};

/**
 * Combines Dutch name components into a single clean string.
 */
export const formatDutchName = (firstName: string, lastName: string, prefix = ''): string => {
  const parts: string[] = [];
  if (firstName && firstName.trim()) parts.push(firstName.trim());
  if (prefix && prefix.trim()) parts.push(prefix.trim());
  if (lastName && lastName.trim()) parts.push(lastName.trim());
  return parts.join(' ');
};
