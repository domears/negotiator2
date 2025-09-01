// Module-level formatters to prevent recreation on each render
const countFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const countFullFormatter = new Intl.NumberFormat('en-US', {
  useGrouping: true,
});

const currencyCompactFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const currencyFullFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/**
 * Format count in compact notation (1.2K, 2.5M)
 * Safely handles null/undefined by returning "0"
 */
export function countCompact(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '0';
  return countFormatter.format(n);
}

/**
 * Format count with full comma grouping (1,234,567)
 * Safely handles null/undefined by returning "0"
 */
export function countFull(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '0';
  return countFullFormatter.format(n);
}

/**
 * Format currency in compact USD notation ($1.2M)
 * Input is in cents, converts to dollars for display
 * Safely handles null/undefined by returning "$0"
 */
export function usdCompact(cents: number | null | undefined): string {
  if (cents == null || !Number.isFinite(cents)) return '$0';
  const dollars = cents / 100;
  return currencyCompactFormatter.format(dollars);
}

/**
 * Format currency in full USD notation with commas ($1,234,567)
 * Input is in cents, converts to dollars for display
 * Safely handles null/undefined by returning "$0"
 */
export function usdFull(cents: number | null | undefined): string {
  if (cents == null || !Number.isFinite(cents)) return '$0';
  const dollars = cents / 100;
  return currencyFullFormatter.format(dollars);
}

/**
 * Format percentage from basis points (0-10000) to "x.x%" display
 * 700 bps → 7.0%, 50 bps → 0.5%
 * Safely handles null/undefined by returning "0.0%"
 */
export function percentFromBps(bps: number | null | undefined): string {
  if (bps == null || !Number.isFinite(bps)) return '0.0%';
  const decimal = bps / 10000; // Convert bps to decimal (700 bps = 0.07 = 7%)
  return percentFormatter.format(decimal);
}

/**
 * Helper to convert dollars to cents for storage
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Helper to convert cents to dollars for calculations
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}