import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { currencyOptions, getActiveCurrency, normalizeCurrency, setActiveCurrency, type CurrencyCode } from '../lib/currency';

interface CurrencyContextValue {
  currency: CurrencyCode;
  options: typeof currencyOptions;
  setCurrency: (currency: CurrencyCode) => void;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(getActiveCurrency());

  useEffect(() => {
    setActiveCurrency(currency);
  }, [currency]);

  const setCurrency = useCallback((nextCurrency: CurrencyCode) => {
    setCurrencyState(normalizeCurrency(nextCurrency));
  }, []);

  const value = useMemo(
    () => ({ currency, options: currencyOptions, setCurrency }),
    [currency, setCurrency],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}