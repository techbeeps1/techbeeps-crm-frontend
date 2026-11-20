/**
 * Global System Timezone Utility
 * EXEC-29: Authoritative Europe/Amsterdam Timezone Standard & Date-Only Disambiguation
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
  { label: 'UTC +01:00 (Europe/Amsterdam - CET)', value: 'UTC +01:00 (Europe/Amsterdam)', iana: 'Europe/Amsterdam', offset: '+01:00' },
  { label: 'UTC +00:00 (Europe/London - GMT)', value: 'UTC +00:00 (Europe/London)', iana: 'Europe/London', offset: '+00:00' },
  { label: 'UTC +00:00 (GMT / UTC)', value: 'UTC +00:00 (UTC)', iana: 'UTC', offset: '+00:00' },
  { label: 'UTC +01:00 (Europe/Berlin - CET)', value: 'UTC +01:00 (Europe/Berlin)', iana: 'Europe/Berlin', offset: '+01:00' },
  { label: 'UTC +01:00 (Europe/Paris - CET)', value: 'UTC +01:00 (Europe/Paris)', iana: 'Europe/Paris', offset: '+01:00' },
  { label: 'UTC +02:00 (Europe/Athens - EET)', value: 'UTC +02:00 (Europe/Athens)', iana: 'Europe/Athens', offset: '+02:00' },
  { label: 'UTC +03:00 (Europe/Moscow - MSK)', value: 'UTC +03:00 (Europe/Moscow)', iana: 'Europe/Moscow', offset: '+03:00' },
  { label: 'UTC +05:30 (Asia/Kolkata - IST)', value: 'UTC +05:30 (Asia/Kolkata)', iana: 'Asia/Kolkata', offset: '+05:30' },
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
  if (!input) return 'Europe/Amsterdam';

  const trimmed = input.trim();
  const matched = TIMEZONE_OPTIONS.find(
    (o) => o.value === trimmed || o.label === trimmed || o.iana.toLowerCase() === trimmed.toLowerCase()
  );
  if (matched) return matched.iana;

  // Extract from parentheses e.g. "UTC +01:00 (Europe/Amsterdam - CET)" -> "Europe/Amsterdam"
  const parenMatch = trimmed.match(/\(([^)]+)\)/);
  const candidate = parenMatch ? parenMatch[1].split(/[-–—]/)[0].trim() : trimmed;

  try {
    new Intl.DateTimeFormat(undefined, { timeZone: candidate });
    return candidate;
  } catch {
    return 'Europe/Amsterdam';
  }
}

let activeIanaTz = (() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('systemTimezone');
    if (saved) return parseIanaTimezone(saved);
  }
  return 'Europe/Amsterdam';
})();

export function getSystemTimezone(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('systemTimezone');
    if (saved) activeIanaTz = parseIanaTimezone(saved);
  }
  return activeIanaTz || 'Europe/Amsterdam';
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
 * EXEC-29: Format a pure calendar date (Date-Only) without timezone shifting or midnight rollback.
 * Works uniformly for "YYYY-MM-DD", "DD-MM-YYYY", ISO midnight UTC, or Date objects.
 */
export function formatDateOnly(
  dateInput: string | number | Date | null | undefined,
  format: 'DD-MM-YYYY' | 'YYYY-MM-DD' = 'DD-MM-YYYY'
): string {
  if (!dateInput) return '-';
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
      if (format === 'DD-MM-YYYY') return trimmed;
      const [dd, mm, yyyy] = trimmed.split('-');
      return `${yyyy}-${mm}-${dd}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed) || /^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
      const [yyyy, mm, dd] = trimmed.split('T')[0].split('-');
      if (format === 'DD-MM-YYYY') return `${dd}-${mm}-${yyyy}`;
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  try {
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const tz = getSystemTimezone() || 'Europe/Amsterdam';
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(d);

    const day = parts.find((p) => p.type === 'day')?.value || '01';
    const month = parts.find((p) => p.type === 'month')?.value || '01';
    const year = parts.find((p) => p.type === 'year')?.value || '1970';

    if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
    return `${day}-${month}-${year}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * EXEC-29: Extracts year, month, day, hour, minute in Europe/Amsterdam timezone.
 */
export function getAmsterdamWallClockParts(dateInput: string | Date | number | null | undefined) {
  if (!dateInput) return null;
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return null;

  const tz = getSystemTimezone() || 'Europe/Amsterdam';
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(d);

  const year = Number(parts.find((p) => p.type === 'year')?.value);
  const month = Number(parts.find((p) => p.type === 'month')?.value);
  const day = Number(parts.find((p) => p.type === 'day')?.value);
  const hour = Number(parts.find((p) => p.type === 'hour')?.value);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value);

  return { year, month, day, hour, minute };
}

/**
 * EXEC-29: Converts any UTC instant to a local Date representing Amsterdam wall-clock time
 * for calendar layout engines (react-big-calendar).
 */
export function parseAmsterdamWallClockDate(val: any): Date {
  if (!val) return new Date();
  const parts = getAmsterdamWallClockParts(val);
  if (parts) {
    return new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0);
  }
  return new Date(val);
}

/**
 * Format a Date object or timestamp string using system timezone
 */
export function formatSystemDate(
  dateInput: string | number | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  locale: string = 'en-GB'
): string {
  if (!dateInput) return '-';
  // If it's a date-only string without time, format directly to prevent timezone rollback
  if (typeof dateInput === 'string' && (/^\d{4}-\d{2}-\d{2}$/.test(dateInput) || /^\d{2}-\d{2}-\d{4}$/.test(dateInput))) {
    return formatDateOnly(dateInput, 'DD-MM-YYYY');
  }
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
  if (!dateInput) return '-';
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
  if (!dateInput) return '-';
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
 * EXEC-29 / UM3-014: Formats time (HH:mm) in Europe/Amsterdam timezone.
 * If already a clean HH:mm string (no date/T), returns as HH:mm.
 * If an ISO timestamp or Date instant, formats strictly in Europe/Amsterdam.
 */
export function formatAmsterdamTime(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
      return trimmed.length === 4 ? `0${trimmed}` : trimmed;
    }
  }
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return String(val);

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Amsterdam',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

/**
 * EXEC-29 / UM3-014: Converts local Europe/Amsterdam wall-clock date (YYYY-MM-DD) and time (HH:mm)
 * into a true UTC Date instant, applying Winter (+01:00 CET) vs Summer (+02:00 CEST) DST offsets.
 * Eliminates 1-hour timezone drift caused by naive .000Z appending.
 */
export function toAmsterdamUtcInstant(dateStr: string, timeStr: string = '00:00'): Date {
  const normDate = formatDateOnly(dateStr, 'YYYY-MM-DD');
  const [yyyy, mm, dd] = normDate.split('-').map(Number);
  const cleanTime = timeStr.length === 5 ? timeStr : (timeStr.length === 4 ? `0${timeStr}` : timeStr.slice(0, 5));
  const [hh, min] = cleanTime.split(':').map(Number);

  let target = new Date(Date.UTC(yyyy, mm - 1, dd, hh, min, 0));

  const getAmsterdamHour = (date: Date) => {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Amsterdam',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date);
    const h = Number(parts.find((p) => p.type === 'hour')?.value);
    const d = Number(parts.find((p) => p.type === 'day')?.value);
    return { hour: h, day: d };
  };

  for (let i = 0; i < 3; i++) {
    const ams = getAmsterdamHour(target);
    const hourDiff = (ams.day === dd ? ams.hour : ams.hour + (ams.day > dd ? 24 : -24)) - hh;
    if (hourDiff === 0) break;
    target = new Date(target.getTime() - hourDiff * 3600 * 1000);
  }

  return target;
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
