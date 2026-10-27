/**
 * EXEC-17: Time & Labour Formatting Utilities
 * 
 * Implements division and remainder rounding to eliminate the 01:60 artifact.
 * e.g., 1.999 hours correctly formats as '02:00'.
 */

/**
 * Converts decimal hours (e.g. 1.5, 1.999) into standard 'HH:MM' string.
 * Rounds total minutes first, then applies division and remainder:
 * hours = Math.floor(totalMinutes / 60)
 * minutes = totalMinutes % 60
 */
export function convertToTimeFormat(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '00:00';
  const totalMinutes = Math.round(value * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Parses time string 'HH:MM' or numeric hours into decimal hours.
 */
export function handleTimeToQuantity(timeInput: any): number {
  if (!timeInput) return 0;
  if (typeof timeInput === 'number') return isNaN(timeInput) ? 0 : timeInput;
  if (typeof timeInput === 'string') {
    if (timeInput.includes(':')) {
      const parts = timeInput.split(':').map((v) => parseInt(v, 10));
      const hours = parts[0] || 0;
      const minutes = parts[1] || 0;
      return hours + (minutes / 60);
    }
    const parsed = parseFloat(timeInput);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}
