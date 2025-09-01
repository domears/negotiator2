import { useMemo } from "react";

/**
 * Formatter API aligned with our UI rules:
 * - Counts: compact for cards; full with commas for tooltips
 * - Currency: USD compact for cards; full for tooltips (via currency('USD'))
 * - Percent: input/output is in BASIS POINTS (0..10000) -> display with 1 decimal (e.g., 7.0%)
 */
export type FormatterAPI = {
  // Raw Intl instances (default locale/currency), for compatibility if some code expects .format(...)
  full: Intl.NumberFormat;                 // 1,234,567
  compact: Intl.NumberFormat;              // 1.2M
  percent: Intl.NumberFormat;              // 7.0% (expects fraction 0..1)

  // Factory for custom currency formatters when needed (e.g., for full with commas)
  currency: (code?: string, options?: Intl.NumberFormatOptions) => Intl.NumberFormat;

  // Convenience helpers (safe for null/undefined)
  countFull: (n: number | null | undefined) => string;
  countCompact: (n: number | null | undefined) => string;
  usdCompact: (cents: number | null | undefined) => string;
  percentFromBps: (bps: number | null | undefined) => string;
};

export function useFormatters(defaults?: { locale?: string; currency?: string }): FormatterAPI {
  const locale = defaults?.locale ?? "en-US";
  const defaultCurrency = defaults?.currency ?? "USD";

  const full = useMemo(
    () => new Intl.NumberFormat(locale, { useGrouping: true }),
    [locale]
  );

  const compact = useMemo(
    () => new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }),
    [locale]
  );

  // Percent formatter expects FRACTION (0..1). We'll convert bps in helper.
  const percent = useMemo(
    () => new Intl.NumberFormat(locale, { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    [locale]
  );

  const currencyCompactDefault = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: defaultCurrency,
        notation: "compact",
        maximumFractionDigits: 1,
      }),
    [locale, defaultCurrency]
  );

  const currency = (code = defaultCurrency, options?: Intl.NumberFormatOptions) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: code, ...(options ?? {}) });

  const coerce = (v: number | null | undefined) => (Number.isFinite(Number(v)) ? Number(v) : 0);

  return {
    full,
    compact,
    percent,
    currency,

    countFull: (n) => full.format(Math.max(0, coerce(n))),
    countCompact: (n) => compact.format(Math.max(0, coerce(n))),
    usdCompact: (cents) => currencyCompactDefault.format(Math.max(0, coerce(cents)) / 100),
    percentFromBps: (bps) => {
      const clamped = Math.max(0, Math.min(10000, coerce(bps)));
      // bps -> percent units -> fraction
      const fraction = (clamped / 100) / 100;
      return percent.format(fraction);
    },
  };
}