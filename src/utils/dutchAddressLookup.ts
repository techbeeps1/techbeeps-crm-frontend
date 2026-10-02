/**
 * UM-035: Dutch Address Lookup (PDOK Locatieserver) & Country Defaults
 * 
 * Features:
 * - Free, public Dutch Government Locatieserver API
 * - Query by Postcode + House Number + optional addition
 * - Never overwrites an explicit foreign country (only runs if country is Netherlands or empty)
 * - Safe fallback if service is unavailable or no match is found (allows manual entry)
 * - Preserves user input and editable fields
 */

export interface DutchAddressResult {
  success: boolean;
  street?: string;
  city?: string;
  postcode?: string;
  houseNumber?: string;
  country?: string;
  message?: string;
}

export const lookupDutchAddress = async (
  rawPostcode: string,
  rawHouseNumber: string,
  currentCountry?: string,
  rawAddition?: string
): Promise<DutchAddressResult> => {
  const cleanPostcode = String(rawPostcode || '').replace(/\s+/g, '').toUpperCase();
  const houseNumber = String(rawHouseNumber || '').trim();
  const addition = String(rawAddition || '').trim();

  if (!cleanPostcode || !houseNumber) {
    return { success: false, message: 'Postcode and house number are required for lookup.' };
  }

  // Dutch postcode format: 4 digits + 2 letters (e.g. 1012JS, 3011AD)
  const isDutchFormat = /^[1-9][0-9]{3}[A-Z]{2}$/.test(cleanPostcode);
  if (!isDutchFormat) {
    return { success: false, message: 'Not a standard Dutch postcode format (e.g. 3011AD).' };
  }

  // Respect deliberate foreign country selections (never overwrite)
  if (currentCountry && currentCountry.trim().toLowerCase() !== 'netherlands') {
    return { success: false, message: 'Foreign country selected; skipping Dutch lookup.' };
  }

  try {
    const query = addition ? `${cleanPostcode} ${houseNumber} ${addition}` : `${cleanPostcode} ${houseNumber}`;
    const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(query)}`;
    
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      return { success: false, message: 'Lookup service temporarily unavailable. Please enter details manually.' };
    }

    const data = await response.json();
    const docs = data?.response?.docs || [];

    if (docs.length === 0) {
      // Fallback: retry without addition if addition was provided
      if (addition) {
        const fallbackUrl = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(`${cleanPostcode} ${houseNumber}`)}`;
        const fallbackRes = await fetch(fallbackUrl);
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          const fallbackDoc = fallbackData?.response?.docs?.[0];
          if (fallbackDoc && fallbackDoc.straatnaam && fallbackDoc.woonplaatsnaam) {
            return {
              success: true,
              street: fallbackDoc.straatnaam,
              city: fallbackDoc.woonplaatsnaam,
              postcode: cleanPostcode,
              houseNumber,
              country: 'Netherlands',
              message: `✓ Address found: ${fallbackDoc.straatnaam}, ${fallbackDoc.woonplaatsnaam}`,
            };
          }
        }
      }
      return { success: false, message: 'No matching address found. Please enter details manually.' };
    }

    const doc = docs[0];
    if (doc.straatnaam && doc.woonplaatsnaam) {
      return {
        success: true,
        street: doc.straatnaam,
        city: doc.woonplaatsnaam,
        postcode: cleanPostcode,
        houseNumber,
        country: 'Netherlands',
        message: `✓ Address found: ${doc.straatnaam}, ${doc.woonplaatsnaam}`,
      };
    }

    return { success: false, message: 'Address details incomplete in registry. Please enter manually.' };
  } catch (error) {
    console.warn('[UM-035] PDOK Lookup error:', error);
    return { success: false, message: 'Lookup service unavailable. Please enter details manually.' };
  }
};
