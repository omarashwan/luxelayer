const CURRENCY_RATES = {
  USD: 1,
  EGP: 49.2,
  EUR: 0.92,
};

export function normalizeCurrency(value) {
  return value === 'EGP' || value === 'EUR' ? value : 'USD';
}

export function convertAmount(value, currency = 'USD') {
  const code = normalizeCurrency(currency);
  return Number((value * CURRENCY_RATES[code]).toFixed(2));
}