/**
 * Universal Movers CRM - Intake Reference Data
 * Provides reliable, standard reference catalogues for Countries and Property Types
 * with automatic fallback guarantees for the Intake & Valuation processes.
 */

export const DEFAULT_COUNTRIES: string[] = [
  'Netherlands',
  'Germany',
  'Belgium',
  'France',
  'United Kingdom',
  'Spain',
  'Italy',
  'Switzerland',
  'Austria',
  'Poland',
  'Portugal',
  'Denmark',
  'Sweden',
  'Norway',
  'United States',
  'Canada',
  'India',
  'Australia',
  'Other',
];

export const DEFAULT_PROPERTY_TYPES: string[] = [
  'Apartment',
  'House',
  'Villa',
  'Studio',
  'Office',
  'Warehouse',
  'Commercial Space',
  'Penthouses',
  '2-onder-1-kap',
  'Bovenwoning',
  'Bungalow',
  'Dijkwoning',
  'Drive in',
  'Dubbel appartement',
  'Flat',
  'Herenhuis',
  'Hoekwoning',
  'Maisonnette',
  'Opslag',
  'Rijtjeswoning',
  'Souterrain',
  'Tussenwoning',
  'Vrijstaande woning',
  'Woonboot',
  'Other',
];

/**
 * Returns a normalized, non-empty array of countries.
 */
export function getEffectiveCountries(catalogue?: any[]): string[] {
  if (Array.isArray(catalogue) && catalogue.length > 0) {
    const list = catalogue
      .map((item) => (typeof item === 'string' ? item : item?.name))
      .filter((name): name is string => typeof name === 'string' && name.trim().length > 0);
    if (list.length > 0) {
      // Ensure Netherlands is present and at the top if available
      const hasNetherlands = list.includes('Netherlands');
      if (hasNetherlands) {
        return ['Netherlands', ...list.filter((c) => c !== 'Netherlands')];
      }
      return list;
    }
  }
  return DEFAULT_COUNTRIES;
}

/**
 * Returns a normalized, non-empty array of property types.
 */
export function getEffectivePropertyTypes(catalogue?: any[]): string[] {
  if (Array.isArray(catalogue) && catalogue.length > 0) {
    const list = catalogue
      .map((item) => (typeof item === 'string' ? item : item?.name))
      .filter((name): name is string => typeof name === 'string' && name.trim().length > 0);
    if (list.length > 0) {
      return list;
    }
  }
  return DEFAULT_PROPERTY_TYPES;
}
