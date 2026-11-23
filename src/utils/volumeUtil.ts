/**
 * Universal Movers CRM - Volume Formatting Utility
 * 
 * Prevents negative zero ("-0.000", "-0.00") and NaN glitches
 * resulting from IEEE 754 floating-point arithmetic in valuation and box volume calculations.
 */

export const formatVolume = (
  vol: number | string | null | undefined,
  decimals: number = 3,
  suffix: string = ' m³'
): string => {
  const num = Number(vol) || 0;
  // If negligible or negative, clamp cleanly to absolute zero (prevents -0.000)
  if (Math.abs(num) < 0.00001 || num <= 0) {
    return `${(0).toFixed(decimals)}${suffix}`;
  }
  return `${num.toFixed(decimals)}${suffix}`;
};

export const sanitizeVolumeNumber = (vol: number | string | null | undefined): number => {
  const num = Number(vol) || 0;
  if (Math.abs(num) < 0.00001 || num <= 0) {
    return 0;
  }
  return num;
};
