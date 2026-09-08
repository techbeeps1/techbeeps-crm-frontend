/**
 * Global System Timezone Utility
 * Ensures that the system-configured timezone from Settings is respected
 * throughout all date/time calculations, displays, and table rows in the CRM.
 */

export interface TimezoneOption {
  label: string;
  value: string;
  iana: string;
  offset: string;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { label: 'UTC +05:30 (Asia/Kolkata - IST)', value: 'UTC +05:30 (Asia/Kolkata)', iana: 'Asia/Kolkata', offset: '+05:30' },
  { label: 'UTC +00:00 (Europe/London - GMT)', value: 'UTC +00:00 (Europe/London)', iana: 'Europe/London', offset: '+00:00' },
  { label: 'UTC +00:00 (GMT / UTC)', value: 'UTC +00:00 (UTC)', iana: 'UTC', offset: '+00:00' },
  { label: 'UTC +01:00 (Europe/Amsterdam - CET)', value: 'UTC +01:00 (Europe/Amsterdam)', iana: 'Europe/Amsterdam', offset: '+01:00' },
  { label: 'UTC +01:00 (Europe/Berlin - CET)', value: 'UTC +01:00 (Europe/Berlin)', iana: 'Europe/Berlin', offset: '+01:00' },
  { label: 'UTC +01:00 (Europe/Paris - CET)', value: 'UTC +01:00 (Europe/Paris)', iana: 'Europe/Paris', offset: '+01:00' },
  { label: 'UTC +02:00 (Europe/Athens - EET)', value: 'UTC +02:00 (Europe/Athens)', iana: 'Europe/Athens', offset: '+02:00' },
  { label: 'UTC +03:00 (Europe/Moscow - MSK)', value: 'UTC +03:00 (Europe/Moscow)', iana: 'Europe/Moscow', offset: '+03:00' },
  { label: 'UTC +03:00 (Asia/Riyadh - AST)', value: 'UTC +03:00 (Asia/Riyadh)', iana: 'Asia/Riyadh', offset: '+03:00' },
  { label: 'UTC +04:00 (Asia/Dubai - GST)', value: 'UTC +04:00 (Asia/Dubai)', iana: 'Asia/Dubai', offset: '+04:00' },
  { label: 'UTC +05:00 (Asia/Karachi - PKT)', value: 'UTC +05:00 (Asia/Karachi)', iana: 'Asia/Karachi', offset: '+05:00' },
  { label: 'UTC +05:45 (Asia/Kathmandu - NPT)', value: 'UTC +05:45 (Asia/Kathmandu)', iana: 'Asia/Kathmandu', offset: '+05:45' },
  { label: 'UTC +06:00 (Asia/Dhaka - BST)', value: 'UTC +06:00 (Asia/Dhaka)', iana: 'Asia/Dhaka', offset: '+06:00' },
  { label: 'UTC +07:00 (Asia/Bangkok - ICT)', value: 'UTC +07:00 (Asia/Bangkok)', iana: 'Asia/Bangkok', offset: '+07:00' },
  { label: 'UTC +08:00 (Asia/Singapore - SGT)', value: 'UTC +08:00 (Asia/Singapore)', iana: 'Asia/Singapore', offset: '+08:00' },
  { label: 'UTC +08:00 (Asia/Hong_Kong - HKT)', value: 'UTC +08:00 (Asia/Hong_Kong)', iana: 'Asia/Hong_Kong', offset: '+08:00' },
  { label: 'UTC +09:00 (Asia/Tokyo - JST)', value: 'UTC +09:00 (Asia/Tokyo)', iana: 'Asia/Tokyo', offset: '+09:00' },
  { label: 'UTC +10:00 (Australia/Sydney - AEST)', value: 'UTC +10:00 (Australia/Sydney)', iana: 'Australia/Sydney', offset: '+10:00' },
  { label: 'UTC +12:00 (Pacific/Auckland - NZST)', value: 'UTC +12:00 (Pacific/Auckland)', iana: 'Pacific/Auckland', offset: '+12:00' },
  { label: 'UTC -05:00 (America/New_York - EST)', value: 'UTC -05:00 (America/New_York)', iana: 'America/New_York', offset: '-05:00' },
  { label: 'UTC -06:00 (America/Chicago - CST)', value: 'UTC -06:00 (America/Chicago)', iana: 'America/Chicago', offset: '-06:00' },
  { label: 'UTC -07:00 (America/Denver - MST)', value: 'UTC -07:00 (America/Denver)', iana: 'America/Denver', offset: '-07:00' },
  { label: 'UTC -08:00 (America/Los_Angeles - PST)', value: 'UTC -08:00 (America/Los_Angeles)', iana: 'America/Los_Angeles', offset: '-08:00' },
  { label: 'UTC -03:00 (America/Sao_Paulo - BRT)', value: 'UTC -03:00 (America/Sao_Paulo)', iana: 'America/Sao_Paulo', offset: '-03:00' },
];

/**
 * Parses any timezone label, value, or IANA string to a valid IANA name
 */
export function parseIanaTimezone(input?: string | null): string {
  if (!input) return 'Asia/Kolkata';

  const trimmed = input.trim();
  const matched = TIMEZONE_OPTIONS.find(
    (o) => o.value === trimmed || o.label === trimmed || o.iana.toLowerCase() === trimmed.toLowerCase()
  );
  if (matched) return matched.iana;

  // Extract from parentheses e.g. "UTC +05:30 (Asia/Kolkata - IST)" -> "Asia/Kolkata"
  const parenMatch = trimmed.match(/\(([^)]+)\)/);
  const candidate = parenMatch ? parenMatch[1].split(/[-–]/)[0].trim() : trimmed;

  try {
    new Intl.DateTimeFormat(undefined, { timeZone: candidate });
    return candidate;
  } catch {
    // fallback
    return 'Asia/Kolkata';
  }
}

let activeIanaTz = (() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('systemTimezone');
    if (saved) return parseIanaTimezone(saved);
  }
  return 'Asia/Kolkata';
})();

export function getSystemTimezone(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('systemTimezone');
    if (saved) activeIanaTz = parseIanaTimezone(saved);
  }
  return activeIanaTz;
}

export function getSystemTimezoneLabel(): string {
  if (typeof window !== 'undefined') {
    const label = localStorage.getItem('systemTimezoneLabel');
    if (label) return label;
  }
  const currentIana = getSystemTimezone();
  const matched = TIMEZONE_OPTIONS.find((o) => o.iana === currentIana);
  return matched ? matched.value : currentIana;
}

export function setSystemTimezone(tzVal: string) {
  const iana = parseIanaTimezone(tzVal);
  activeIanaTz = iana;
  if (typeof window !== 'undefined') {
    localStorage.setItem('systemTimezone', iana);
    localStorage.setItem('systemTimezoneLabel', tzVal);
    window.dispatchEvent(
      new CustomEvent('systemTimezoneChange', {
        detail: { timeZone: iana, label: tzVal },
      })
    );
  }
}

/**
 * Format a Date object or timestamp string using system timezone
 */
export function formatSystemDate(
  dateInput: string | number | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  locale: string = 'en-GB'
): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const tz = getSystemTimezone();
    return d.toLocaleDateString(locale, {
      ...options,
      timeZone: options?.timeZone || tz,
    });
  } catch {
    return String(dateInput);
  }
}

export function formatSystemTime(
  dateInput: string | number | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  locale: string = 'en-GB'
): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const tz = getSystemTimezone();
    return d.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      ...options,
      timeZone: options?.timeZone || tz,
    });
  } catch {
    return String(dateInput);
  }
}

export function formatSystemDateTime(
  dateInput: string | number | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  locale: string = 'en-GB'
): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const tz = getSystemTimezone();
    return d.toLocaleString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options,
      timeZone: options?.timeZone || tz,
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Monkey-patch Date.prototype to inject systemTimezone by default across the entire CRM app.
 * This ensures ANY call to toLocaleDateString, toLocaleTimeString, or toLocaleString automatically
 * uses the configured system timezone without needing to rewrite hundreds of components.
 */
export function initGlobalTimezonePatch() {
  if (typeof window === 'undefined') return;
  if ((window as any).__systemTimezonePatched) return;
  (window as any).__systemTimezonePatched = true;

  const origToLocaleDateString = Date.prototype.toLocaleDateString;
  const origToLocaleTimeString = Date.prototype.toLocaleTimeString;
  const origToLocaleString = Date.prototype.toLocaleString;

  Date.prototype.toLocaleDateString = function (locales?: any, options?: any) {
    const tz = getSystemTimezone();
    const opts = tz && (!options || !options.timeZone) ? { ...options, timeZone: tz } : options;
    try {
      return origToLocaleDateString.call(this, locales, opts);
    } catch {
      return origToLocaleDateString.call(this, locales, options);
    }
  };

  Date.prototype.toLocaleTimeString = function (locales?: any, options?: any) {
    const tz = getSystemTimezone();
    const opts = tz && (!options || !options.timeZone) ? { ...options, timeZone: tz } : options;
    try {
      return origToLocaleTimeString.call(this, locales, opts);
    } catch {
      return origToLocaleTimeString.call(this, locales, options);
    }
  };

  Date.prototype.toLocaleString = function (locales?: any, options?: any) {
    const tz = getSystemTimezone();
    const opts = tz && (!options || !options.timeZone) ? { ...options, timeZone: tz } : options;
    try {
      return origToLocaleString.call(this, locales, opts);
    } catch {
      return origToLocaleString.call(this, locales, options);
    }
  };
}

// Automatically patch on script load
initGlobalTimezonePatch();
