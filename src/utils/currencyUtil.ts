import { useState, useEffect } from 'react';

export interface CurrencyItem {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  defaultPosition: 'before' | 'after';
}

export const SUPPORTED_CURRENCIES: CurrencyItem[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US', defaultPosition: 'before' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE', defaultPosition: 'before' },
  { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB', defaultPosition: 'before' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN', defaultPosition: 'before' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', locale: 'en-CA', defaultPosition: 'before' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU', defaultPosition: 'before' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', locale: 'ar-AE', defaultPosition: 'before' },
];

export interface CurrencySettings {
  code: string;
  symbol: string;
  position: 'before' | 'after';
  decimals: number;
}

export function getCurrencySettings(): CurrencySettings {
  if (typeof window === 'undefined') {
    return { code: 'USD', symbol: '$', position: 'before', decimals: 2 };
  }

  const code = localStorage.getItem('defaultCurrency') || localStorage.getItem('currencyCode') || 'USD';
  const matched = SUPPORTED_CURRENCIES.find((c) => c.code === code) || SUPPORTED_CURRENCIES[0];

  const symbol = localStorage.getItem('currencySymbol') || matched.symbol;
  const position = (localStorage.getItem('currencyPosition') as 'before' | 'after') || matched.defaultPosition || 'before';
  const savedDecimals = localStorage.getItem('currencyDecimals');
  const decimals = savedDecimals !== null ? Number(savedDecimals) : 2;

  return { code, symbol, position, decimals };
}

export function getCurrencySymbol(): string {
  return getCurrencySettings().symbol;
}

export function getCurrencyCode(): string {
  return getCurrencySettings().code;
}

export function setCurrencySettings(settings: Partial<CurrencySettings>) {
  if (typeof window === 'undefined') return;

  const current = getCurrencySettings();
  const nextCode = settings.code || current.code;
  const matched = SUPPORTED_CURRENCIES.find((c) => c.code === nextCode);
  const nextSymbol = settings.symbol || matched?.symbol || current.symbol;
  const nextPosition = settings.position || current.position;
  const nextDecimals = settings.decimals !== undefined ? settings.decimals : current.decimals;

  localStorage.setItem('defaultCurrency', nextCode);
  localStorage.setItem('currencyCode', nextCode);
  localStorage.setItem('currencySymbol', nextSymbol);
  localStorage.setItem('currencyPosition', nextPosition);
  localStorage.setItem('currencyDecimals', String(nextDecimals));

  window.dispatchEvent(
    new CustomEvent('currencyChange', {
      detail: {
        code: nextCode,
        symbol: nextSymbol,
        position: nextPosition,
        decimals: nextDecimals,
      },
    })
  );
}

export interface FormatCurrencyOptions {
  decimals?: number;
  position?: 'before' | 'after';
  symbol?: string;
  showCode?: boolean;
}

/**
 * Global Currency Formatter
 * Formats any number according to system currency settings (e.g. "$ 2,450.50" or "2,450.50 €")
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  options?: FormatCurrencyOptions
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    amount = 0;
  }

  const settings = getCurrencySettings();
  const decimals = options?.decimals !== undefined ? options.decimals : settings.decimals;
  const position = options?.position || settings.position;
  const symbol = options?.symbol || settings.symbol;

  const num = Number(amount);
  const formattedNumber = num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  let result =
    position === 'after'
      ? `${formattedNumber} ${symbol}`
      : `${symbol} ${formattedNumber}`;

  if (options?.showCode) {
    result += ` (${settings.code})`;
  }

  return result;
}

export const formatPrice = formatCurrency;
export const formatMoney = formatCurrency;

/**
 * React Hook for reactive currency formatting across any UI component
 */
export function useCurrency() {
  const [currency, setCurrency] = useState<CurrencySettings>(getCurrencySettings);

  useEffect(() => {
    const handleCurrencyChange = (e: any) => {
      if (e.detail) {
        setCurrency(e.detail);
      } else {
        setCurrency(getCurrencySettings());
      }
    };

    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => {
      window.removeEventListener('currencyChange', handleCurrencyChange);
    };
  }, []);

  return {
    ...currency,
    formatCurrency: (amt: number | string | null | undefined, opts?: FormatCurrencyOptions) =>
      formatCurrency(amt, { ...opts, symbol: opts?.symbol || currency.symbol, position: opts?.position || currency.position, decimals: opts?.decimals !== undefined ? opts.decimals : currency.decimals }),
    formatPrice: (amt: number | string | null | undefined, opts?: FormatCurrencyOptions) =>
      formatCurrency(amt, { ...opts, symbol: opts?.symbol || currency.symbol, position: opts?.position || currency.position, decimals: opts?.decimals !== undefined ? opts.decimals : currency.decimals }),
  };
}
