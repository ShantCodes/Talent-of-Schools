const iranMobile = /^(?:\+98|0098|98|0)?(9\d{9})$/;

/**
 * Normalizes an Iranian mobile number to the `09xxxxxxxxx` form, or returns null when it isn't one.
 * Accepts Persian/Arabic digits, separators and the +98 / 0098 / 98 country prefixes.
 */
export function normalizeIranMobile(value: string): string | null {
  const latin = value
    .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\s\-()]/g, '');
  const match = iranMobile.exec(latin);
  return match ? `0${match[1]}` : null;
}

export const phoneInputProps = {
  type: 'tel',
  inputMode: 'tel',
  autoComplete: 'tel',
  placeholder: '09123456789',
  maxLength: 20,
} as const;
