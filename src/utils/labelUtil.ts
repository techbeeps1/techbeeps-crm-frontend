/**
 * Central Label and Key Formatter Utility
 * Maps internal database keys, status enums, and service types to user-friendly display labels.
 * Fixes UM-038.
 */

export const KEY_LABELS: Record<string, string> = {
  // Price agreements
  onhourly_basis: 'Hourly Rate',
  hourly: 'Hourly Rate',
  hourly_rate: 'Hourly Rate',
  fixed_price: 'Fixed Price',
  fixed: 'Fixed Price',

  // Services & Resources
  movingLift: 'Moving Lift',
  moving_lift: 'Moving Lift',
  relocation: 'Relocation',
  packing: 'Packing Service',
  unpacking: 'Unpacking Service',
  assembling: 'Assembly Service',
  disassembling: 'Disassembly Service',
  storage: 'Storage Service',
  insurance: 'Insurance',
  certificate: 'Permits & Certificates',
  Required_handymen: 'Required Movers',
  required_handymen: 'Required Movers',
  handyman: 'Movers / Handymen',
  packers: 'Packers',
  unpackers: 'Unpackers',
  truck: 'Freight Truck',
  van: 'Passenger / Van',

  // Statuses
  Draft: 'Draft',
  draft: 'Draft',
  execution: 'In Execution',
  Execution: 'In Execution',
  in_progress: 'In Progress',
  'in progress': 'In Progress',
  processing: 'Processing',
  Processing: 'Processing',
  completed: 'Completed',
  Completed: 'Completed',
  cancelled: 'Cancelled',
  Cancelled: 'Cancelled',
  first_contact: 'First Contact',
  'First Contact': 'First Contact',
};

/**
 * Converts raw database keys into human-friendly labels.
 * Fallbacks cleanly without throwing errors if the key is unknown.
 */
export const formatLabel = (key: string | undefined | null): string => {
  if (!key || typeof key !== 'string') return '';
  if (KEY_LABELS[key]) return KEY_LABELS[key];

  // If already contains spaced words and starts capitalized, return as is
  if (key.includes(' ') && /^[A-Z]/.test(key)) return key;

  // Replace underscores and camelCase
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};
