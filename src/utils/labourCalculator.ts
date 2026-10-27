/**
 * EXEC-17: Labour Service & Catalogue Unit Calculations (Frontend)
 * 
 * Verifies:
 * 1. F-08: 1.7 elapsed hours x 2 workers x €40/hr = €136.00 net.
 * 2. Does NOT multiply an aggregate 3.4 worker-hour input by crew again.
 * 3. Lift selection & direct workflow (selected lift appears once, unselected = €0.00).
 * 4. Property Surcharge resolution via stable canonical IDs.
 * 5. Box dimension validation (positive numbers required; invalid dimensions rejected).
 * 6. Division & remainder time formatting (1.999h -> 02:00, no 01:60).
 */

import { convertToTimeFormat, handleTimeToQuantity } from './timeUtil';

export { convertToTimeFormat, handleTimeToQuantity };

export function roundToCents(num: number): number {
  return Math.round((Number(num || 0) + Number.EPSILON) * 100) / 100;
}

export interface LabourCostResult {
  elapsedHours: number;
  workerHours: number;
  crewCount: number;
  ratePerHour: number;
  netCharge: number;
  formattedElapsed: string;
  formattedWorkerHours: string;
}

export function calculateLabourCost(options: {
  elapsedHours?: number;
  workerHours?: number;
  crewCount?: number;
  ratePerHour?: number;
  isAggregateWorkerHours?: boolean;
}): LabourCostResult {
  const {
    elapsedHours = 0,
    workerHours = 0,
    crewCount = 1,
    ratePerHour = 40,
    isAggregateWorkerHours = false,
  } = options;

  const crew = Math.max(1, Number(crewCount) || 1);
  const rate = Number(ratePerHour) || 0;

  let totalWorkerHours = 0;
  let elapsed = 0;

  if (isAggregateWorkerHours || (workerHours > 0 && elapsedHours === 0)) {
    // Explicit aggregate worker-hours: DO NOT multiply by crew again!
    totalWorkerHours = Number(workerHours) || 0;
    elapsed = crew > 0 ? (totalWorkerHours / crew) : totalWorkerHours;
  } else {
    // Elapsed job time: multiply by crew to get total worker-hours
    elapsed = Number(elapsedHours) || 0;
    totalWorkerHours = elapsed * crew;
  }

  const netCharge = roundToCents(totalWorkerHours * rate);

  return {
    elapsedHours: roundToCents(elapsed),
    workerHours: roundToCents(totalWorkerHours),
    crewCount: crew,
    ratePerHour: rate,
    netCharge,
    formattedElapsed: convertToTimeFormat(elapsed),
    formattedWorkerHours: convertToTimeFormat(totalWorkerHours),
  };
}

export interface LiftServiceResult {
  isSelected: boolean;
  quantity: number;
  price: number;
  charge: number;
}

export function calculateLiftService(options: {
  isSelected?: boolean;
  quantity?: number;
  unitPrice?: number;
}): LiftServiceResult {
  const { isSelected = false, quantity = 0, unitPrice = 0 } = options;

  if (!isSelected || Number(quantity) <= 0 || Number(unitPrice) <= 0) {
    return {
      isSelected: false,
      quantity: 0,
      price: 0,
      charge: 0.00,
    };
  }

  const qty = Number(quantity);
  const price = Number(unitPrice);
  const charge = roundToCents(qty * price);

  return {
    isSelected: true,
    quantity: qty,
    price,
    charge,
  };
}

export function resolvePropertySurcharge(
  propertyInput: string,
  surchargeTable: Record<string, any> = {}
): number {
  if (!propertyInput || typeof propertyInput !== 'string') return 0;
  const clean = propertyInput.trim().toLowerCase();

  for (const [key, val] of Object.entries(surchargeTable)) {
    if (key.toLowerCase() === clean) return Number(val) || 0;
  }

  const canonicalAliases: Record<string, string> = {
    apartment: 'Appartement',
    flat: 'Appartement',
    appratment: 'Appartement',
    appartmant: 'Appartement',
    penthouse: 'Appartement',
    penthouses: 'Appartement',
    studio: 'Studio',
    prop_apartment: 'Appartement',
    prop_flat: 'Appartement',
    house: 'Huis',
    home: 'Huis',
    woonhuis: 'Huis',
    'single family home': 'Huis',
    prop_house: 'Huis',
    farm: 'Boerderij',
    farmhouse: 'Boerderij',
    boerderij: 'Boerderij',
    'semi-detached': '2-onder-1-kap',
    'semi detached': '2-onder-1-kap',
    '2-onder-1-kap': '2-onder-1-kap',
    prop_semidetached: '2-onder-1-kap',
    mansion: 'Herenhuis',
    herenhuis: 'Herenhuis',
    detached: 'Vrijstaande woning',
    'detached house': 'Vrijstaande woning',
    'vrijstaande woning': 'Vrijstaande woning',
    villa: 'Villa',
    prop_detached: 'Vrijstaande woning',
    terraced: 'Rijtjeswoning',
    'terraced house': 'Rijtjeswoning',
    townhouse: 'Rijtjeswoning',
    rijtjeswoning: 'Rijtjeswoning',
    corner: 'Hoekwoning',
    'corner house': 'Hoekwoning',
    hoekwoning: 'Hoekwoning',
    prop_terraced: 'Rijtjeswoning',
    office: 'Kantoor',
    kantoor: 'Kantoor',
    commercial: 'Bedrijfspand',
    'commercial space': 'Bedrijfspand',
    'commercial property': 'Bedrijfspand',
    bedrijfspand: 'Bedrijfspand',
    prop_commercial: 'Bedrijfspand',
    storage: 'Opslag',
    'storage unit': 'Opslag',
    opslag: 'Opslag',
    warehouse: 'Opslag',
    prop_storage: 'Opslag',
  };

  const canonicalKey = canonicalAliases[clean];
  if (canonicalKey) {
    for (const [key, val] of Object.entries(surchargeTable)) {
      if (key.toLowerCase() === canonicalKey.toLowerCase()) {
        return Number(val) || 0;
      }
    }
  }

  return 0;
}

export function validateBoxDimensions(box: {
  length?: number;
  width?: number;
  height?: number;
}): { valid: boolean; error?: string; length?: number; width?: number; height?: number; cubicMeter?: number } {
  const length = Number(box.length);
  const width = Number(box.width);
  const height = Number(box.height);

  if (
    !Number.isFinite(length) || length <= 0 ||
    !Number.isFinite(width) || width <= 0 ||
    !Number.isFinite(height) || height <= 0
  ) {
    return {
      valid: false,
      error: 'Invalid box dimensions: length, width, and height must be positive numbers greater than 0',
      cubicMeter: 0,
    };
  }

  const cubicMeter = roundToCents((length * width * height) / 10000) / 100;

  return {
    valid: true,
    length,
    width,
    height,
    cubicMeter,
  };
}
