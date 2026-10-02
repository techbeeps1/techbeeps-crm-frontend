/**
 * Shared Phone & Mobile Validation and Formatting Utilities
 * UM-009: Reconcile telephone and mobile validation across forms
 *
 * Supported formats:
 * - Dutch national numbers: 06 12345678, 06-12345678, 0612345678, 010 1234567, 020-1234567
 * - International numbers with country code: +31 6 12345678, +31612345678, 0031 6 12345678, +1 (555) 123-4567
 * - Optional telephone (contact) does not block when empty.
 * - Required mobile validates non-empty and format.
 * - Non-phone strings (e.g. "abc-test", short digits < 7) are rejected with field-specific errors.
 * - Preserves country codes without stripping.
 */

export const isValidPhoneNumber = (value: unknown): boolean => {
  if (!value || typeof value !== 'string') return false;
  const s = value.trim();
  if (!s) return false;
  if (!/^(?:\+|00)?[0-9\s\-().]{7,25}$/.test(s)) return false;
  const digits = s.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
};

export const normalizePhoneNumber = (value: unknown): string => {
  if (!value || typeof value !== 'string') return '';
  return value.trim();
};
