/**
 * Rate Precedence & Resolution Utility (UM-013)
 * 
 * Hierarchy:
 * 1. Level 1 (Highest): Custom / User Override (explicit edit)
 * 2. Level 2: Selected Package Rate (explicit non-zero or intentional zero)
 * 3. Level 3 (Fallback): Features / Standard Price Global Settings
 * 
 * Accidental Zero Prevention:
 * Distinguishes missing/null/undefined from intentional zero (included services).
 * Blocks quote when an active component (volume > 0, travelTime > 0, distance > 0) has an unknown/missing rate.
 */

export interface RateResolution {
  rate: number;
  source: 'custom' | 'package' | 'global' | 'intentional_zero' | 'missing';
  label: string;
  unit: string;
  isIntentionalZero: boolean;
  isMissing: boolean;
}

export interface ResolveRateParams {
  currentValue?: any;
  packageValue?: any;
  globalDefaultValue?: any;
  unit: string;
  isUserEdited?: boolean;
}

export function resolveRatePrecedence({
  currentValue,
  packageValue,
  globalDefaultValue,
  unit,
  isUserEdited = false,
}: ResolveRateParams): RateResolution {
  const pkgNum =
    packageValue !== undefined &&
      packageValue !== null &&
      packageValue !== '' &&
      !isNaN(Number(packageValue))
      ? Number(packageValue)
      : undefined;

  const globalNum =
    globalDefaultValue !== undefined &&
      globalDefaultValue !== null &&
      globalDefaultValue !== '' &&
      !isNaN(Number(globalDefaultValue))
      ? Number(globalDefaultValue)
      : undefined;

  // Natural default from package (Level 2) or global features (Level 3)
  const naturalDefaultNum = pkgNum !== undefined ? pkgNum : globalNum;
  const naturalSource = pkgNum !== undefined ? 'package' : 'global';

  const currentNum =
    currentValue !== undefined && currentValue !== null && currentValue !== ''
      ? Number(currentValue)
      : undefined;

  // 1. If user EXPLICITLY edited this field
  if (isUserEdited && currentNum !== undefined && !isNaN(currentNum)) {
    if (naturalDefaultNum !== undefined && currentNum === naturalDefaultNum) {
      return {
        rate: naturalDefaultNum,
        source: naturalSource,
        label: naturalSource === 'package' ? 'Package Rate' : 'Standard Default',
        unit,
        isIntentionalZero: naturalDefaultNum === 0,
        isMissing: false,
      };
    }
    if (currentNum === 0) {
      return {
        rate: 0,
        source: 'intentional_zero',
        label: 'Custom (€0.00 / Included)',
        unit,
        isIntentionalZero: true,
        isMissing: false,
      };
    }
    return {
      rate: currentNum,
      source: 'custom',
      label: 'Custom Override',
      unit,
      isIntentionalZero: false,
      isMissing: false,
    };
  }

  // 2. If not explicitly user edited, always fall back to the natural default:
  if (naturalDefaultNum !== undefined) {
    if (naturalDefaultNum === 0) {
      return {
        rate: 0,
        source: 'intentional_zero',
        label: naturalSource === 'package' ? 'Package Included (€0.00)' : 'Features Default (€0.00)',
        unit,
        isIntentionalZero: true,
        isMissing: false,
      };
    }
    return {
      rate: naturalDefaultNum,
      source: naturalSource,
      label: naturalSource === 'package' ? 'Package Rate' : 'Standard Default',
      unit,
      isIntentionalZero: false,
      isMissing: false,
    };
  }

  // 3. Fallback if current value is present and positive
  if (currentNum !== undefined && !isNaN(currentNum) && currentNum > 0) {
    return {
      rate: currentNum,
      source: 'custom',
      label: 'Custom Override',
      unit,
      isIntentionalZero: false,
      isMissing: false,
    };
  }

  // 4. Missing / Unknown rate
  return {
    rate: 0,
    source: 'missing',
    label: 'Missing / Unconfigured Rate',
    unit,
    isIntentionalZero: false,
    isMissing: true,
  };
}

/**
 * Returns Tailwind badge styling & icon based on resolution
 */
export function getRateBadgeProps(resolution: RateResolution) {
  switch (resolution.source) {
    case 'package':
      return {
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        text: ` ${resolution.label} (${resolution.rate} ${resolution.unit})`,
      };
    case 'global':
      return {
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        text: ` ${resolution.label} (${resolution.rate} ${resolution.unit})`,
      };
    case 'custom':
      return {
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        text: ` ${resolution.label}`,
      };
    case 'intentional_zero':
      return {
        badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
        text: ` ${resolution.label}`,
      };
    case 'missing':
    default:
      return {
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse',
        text: `⚠️ ${resolution.label}`,
      };
  }
}

/**
 * Validation check for Step 11 before generating quotation lines
 * Ensures no active component has a missing price
 */
export function validateRequiredMoveRates(params: {
  volume?: number;
  travelHours?: number;
  distance?: number;
  cubicRate?: any;
  hourlyRate?: any;
  kmRate?: any;
}): string | null {
  const { volume = 0, travelHours = 0, distance = 0, cubicRate, hourlyRate, kmRate } = params;

  if (volume > 0) {
    if (cubicRate === undefined || cubicRate === null || String(cubicRate).trim() === '' || isNaN(Number(cubicRate))) {
      return 'Required price for Moving Volume (m³) is missing. Please enter a rate or configure standard price in Features.';
    }
  }

  if (travelHours > 0) {
    if (hourlyRate === undefined || hourlyRate === null || String(hourlyRate).trim() === '' || isNaN(Number(hourlyRate))) {
      return 'Required price for Travel Time is missing. Please enter a rate or configure standard price in Features.';
    }
  }

  if (distance > 0) {
    if (kmRate === undefined || kmRate === null || String(kmRate).trim() === '' || isNaN(Number(kmRate))) {
      return 'Required price for Travel Distance (km) is missing. Please enter a rate or configure standard price in Features.';
    }
  }

  return null;
}
