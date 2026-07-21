export type CurrencyCode = 'USD' | 'EGP' | 'EUR';

type CurrencyMeta = {
  label: string;
  locale: string;
  rate: number;
};

const STORAGE_KEY = 'luxelayer.currency.v1';

const CURRENCY_META: Record<CurrencyCode, CurrencyMeta> = {
  USD: { label: 'US Dollar', locale: 'en-US', rate: 1 },
  EGP: { label: 'Egyptian Pound', locale: 'en-US', rate: 49.2 },
  EUR: { label: 'Euro', locale: 'en-US', rate: 0.92 },
};

function readStoredCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'EGP';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'EGP') return stored;
  } catch {
    // ignore storage failures
  }
  return 'EGP';
}

let activeCurrency: CurrencyCode = readStoredCurrency();

export const currencyOptions: { value: CurrencyCode; label: string }[] = [
  { value: 'USD', label: 'USD' },
  { value: 'EGP', label: 'EGP' },
  { value: 'EUR', label: 'EUR' },
];

export function normalizeCurrency(value: unknown): CurrencyCode {
  return value === 'USD' || value === 'EGP' || value === 'EUR' ? value : 'EGP';
}

export function getActiveCurrency(): CurrencyCode {
  return activeCurrency;
}

export function setActiveCurrency(currency: CurrencyCode) {
  activeCurrency = normalizeCurrency(currency);
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, activeCurrency);
    window.dispatchEvent(new CustomEvent('luxelayer:currencychange', { detail: { currency: activeCurrency } }));
  } catch {
    // ignore storage failures
  }
}

export function getCurrencyRate(currency: CurrencyCode): number {
  return CURRENCY_META[normalizeCurrency(currency)].rate;
}

export function getCurrencyLabel(currency: CurrencyCode): string {
  return CURRENCY_META[normalizeCurrency(currency)].label;
}

export function convertAmount(value: number, currency: CurrencyCode = activeCurrency): number {
  const rate = getCurrencyRate(currency);
  return Number((value * rate).toFixed(2));
}

export function formatPrice(value: number, currency: CurrencyCode = activeCurrency): string {
  const code = normalizeCurrency(currency);
  return new Intl.NumberFormat(CURRENCY_META[code].locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertAmount(value, code));
}