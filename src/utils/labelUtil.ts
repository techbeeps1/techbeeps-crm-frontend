/**
 * Universal Movers CRM - Central Label and Enum Formatter
 * EXEC-27: Truthful Dutch Locale & Multi-Language Support.
 * Maps internal database keys, status enums, and service types to user-friendly labels.
 */

export interface TranslationEntry {
  nl: string;
  en: string;
}

export const ENUM_TRANSLATIONS: Record<string, TranslationEntry> = {
  // Price agreements
  onhourly_basis: { nl: 'Uurtarief', en: 'Hourly Rate' },
  hourly: { nl: 'Uurtarief', en: 'Hourly Rate' },
  hourly_rate: { nl: 'Uurtarief', en: 'Hourly Rate' },
  fixed_price: { nl: 'Vaste prijs', en: 'Fixed Price' },
  fixed: { nl: 'Vaste prijs', en: 'Fixed Price' },
  custom: { nl: 'Aangepast tarief', en: 'Custom Rate' },

  // Payment Methods
  bank_transfer: { nl: 'Bankoverschrijving', en: 'Bank Transfer' },
  ideal: { nl: 'iDEAL', en: 'iDEAL' },
  credit_card: { nl: 'Creditcard', en: 'Credit Card' },
  cash: { nl: 'Contant', en: 'Cash' },
  pin: { nl: 'PIN / Betaalpas', en: 'Debit Card (PIN)' },

  // Services & Resources
  movingLift: { nl: 'Verhuislift', en: 'Moving Lift' },
  moving_lift: { nl: 'Verhuislift', en: 'Moving Lift' },
  relocation: { nl: 'Verhuizing', en: 'Relocation' },
  packing: { nl: 'Inpakservice', en: 'Packing Service' },
  unpacking: { nl: 'Uitpakservice', en: 'Unpacking Service' },
  assembling: { nl: 'Montageservice', en: 'Assembly Service' },
  disassembling: { nl: 'Demontageservice', en: 'Disassembly Service' },
  storage: { nl: 'Opslagservice', en: 'Storage Service' },
  insurance: { nl: 'Transportverzekering', en: 'Transit Insurance' },
  certificate: { nl: 'Vergunningen & Ontheffingen', en: 'Permits & Certificates' },
  Required_handymen: { nl: 'Vereiste verhuizers', en: 'Required Movers' },
  required_handymen: { nl: 'Vereiste verhuizers', en: 'Required Movers' },
  handyman: { nl: 'Verhuizers / Klusjesmannen', en: 'Movers / Handymen' },
  packers: { nl: 'Inpakkers', en: 'Packers' },
  unpackers: { nl: 'Uitpakkers', en: 'Unpackers' },
  truck: { nl: 'Verhuiswagen', en: 'Freight Truck' },
  van: { nl: 'Bestelbus', en: 'Passenger / Van' },

  // Quotation Lifecycle States
  draft: { nl: 'Concept', en: 'Draft' },
  Draft: { nl: 'Concept', en: 'Draft' },
  sent: { nl: 'Verzonden', en: 'Sent' },
  Sent: { nl: 'Verzonden', en: 'Sent' },
  accepted: { nl: 'Geaccepteerd', en: 'Accepted' },
  Accepted: { nl: 'Geaccepteerd', en: 'Accepted' },
  rejected: { nl: 'Afgewezen', en: 'Rejected' },
  Rejected: { nl: 'Afgewezen', en: 'Rejected' },
  superseded: { nl: 'Vervangen', en: 'Superseded' },
  Superseded: { nl: 'Vervangen', en: 'Superseded' },
  expired: { nl: 'Verlopen', en: 'Expired' },
  Expired: { nl: 'Verlopen', en: 'Expired' },
  revoked: { nl: 'Ingetrokken', en: 'Revoked' },
  Revoked: { nl: 'Ingetrokken', en: 'Revoked' },

  // Operational & Job States
  pending: { nl: 'In afwachting', en: 'Pending' },
  Pending: { nl: 'In afwachting', en: 'Pending' },
  in_progress: { nl: 'In behandeling', en: 'In Progress' },
  'in progress': { nl: 'In behandeling', en: 'In Progress' },
  processing: { nl: 'In behandeling', en: 'Processing' },
  Processing: { nl: 'In behandeling', en: 'Processing' },
  execution: { nl: 'In uitvoering', en: 'In Execution' },
  Execution: { nl: 'In uitvoering', en: 'In Execution' },
  completed: { nl: 'Voltooid', en: 'Completed' },
  Completed: { nl: 'Voltooid', en: 'Completed' },
  cancelled: { nl: 'Geannuleerd', en: 'Cancelled' },
  Cancelled: { nl: 'Geannuleerd', en: 'Cancelled' },
  first_contact: { nl: 'Eerste contact', en: 'First Contact' },
  'First Contact': { nl: 'Eerste contact', en: 'First Contact' },
};

// Backward-compatible KEY_LABELS dictionary (English fallback)
export const KEY_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(ENUM_TRANSLATIONS).map(([key, trans]) => [key, trans.en])
);

/**
 * Converts raw database keys into human-friendly labels according to active locale.
 * Fallbacks cleanly without throwing errors if the key is unknown.
 */
export const formatLabel = (
  key: string | undefined | null,
  locale: string = 'en'
): string => {
  if (!key || typeof key !== 'string') return '';
  const lang = (locale || 'en').toLowerCase().startsWith('en') ? 'en' : 'nl';

  const hit = ENUM_TRANSLATIONS[key];
  if (hit && hit[lang]) {
    return hit[lang];
  }

  // If already contains spaced words and starts capitalized, return as is
  if (key.includes(' ') && /^[A-Z]/.test(key)) return key;

  // Replace underscores and camelCase
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const formatEnum = formatLabel;
