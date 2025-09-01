// /src/utils/formatters.ts
// Single source for number/currency/percent formatters (locale-ready).

export type Formatters = {
  full: Intl.NumberFormat;                         // 1,234,567
  compact: Intl.NumberFormat;                      // 1.2M
  percent: Intl.NumberFormat;                      // 7.0%
  currency: (code?: string) => Intl.NumberFormat;  // USD compact; e.g., currency('USD')
};

/**
 * Compatibility export expected by multiple components.
 * Returns memo-friendly formatter instances; callers should not create their own per render.
 */
export function useFormatters(locale = 'en-US'): Formatters {
  // Module-level caching by locale to avoid rebuilding in hot paths.
  // Lightweight map; avoids React dependency.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.__FMT_CACHE ||= new Map<string, Formatters>();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const cache: Map<string, Formatters> = globalThis.__FMT_CACHE;

  const cached = cache.get(locale);
  if (cached) return cached;

  const full = new Intl.NumberFormat(locale, { useGrouping: true });
  const compact = new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 });
  const percent = new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const currency = (code = 'USD') =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: code, notation: 'compact', maximumFractionDigits: 1 });

  const f = { full, compact, percent, currency };
  cache.set(locale, f);
  return f;
}

// Optional helpers used elsewhere:
export const countFull = (n: number | null | undefined, f = useFormatters()) =>
  f.full.format(Math.max(0, Number(n ?? 0)));

export const countCompact = (n: number | null | undefined, f = useFormatters()) =>
  f.compact.format(Math.max(0, Number(n ?? 0)));

export const usdCompact = (cents: number | null | undefined, f = useFormatters()) =>
  f.currency('USD').format(Math.max(0, Number(cents ?? 0) / 100));

export const percentFromBps = (bps: number | null | undefined, f = useFormatters()) =>
  f.percent.format(Math.max(0, Math.min(10000, Number(bps ?? 0))) / 100 / 100);

// Utility function for parsing smart number inputs
export function parseSmartNumber(input: string): number {
  if (!input || input.trim() === '') return 0;
  
  const sanitized = input
    .trim()
    .replace(/[,_\s]/g, '') // Remove commas, underscores, spaces
    .toLowerCase();
  
  // Handle suffix notation (K, M, B, T)
  const suffixMatch = sanitized.match(/^(\d*\.?\d+)([kmbt])$/);
  if (suffixMatch) {
    const baseValue = parseFloat(suffixMatch[1]);
    const suffix = suffixMatch[2];
    const multipliers = { k: 1_000, m: 1_000_000, b: 1_000_000_000, t: 1_000_000_000_000 };
    return baseValue * multipliers[suffix as keyof typeof multipliers];
  }
  
  // Handle plain numbers
  const numValue = parseFloat(sanitized);
  return isNaN(numValue) ? 0 : numValue;
}