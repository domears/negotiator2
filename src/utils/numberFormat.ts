export type DisplayStyle = 'compact' | 'full';

const PERCENT_KPIS = new Set([
  'Brand Lift', 'Purchase Intent'
]);

export function formatCountFull(n: number, locale = 'en-US') {
  return new Intl.NumberFormat(locale, { useGrouping: true }).format(n);
}

export function formatCountCompact(n: number, locale = 'en-US') {
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function formatPercentFromBps(bps: number, locale = 'en-US') {
  // bps: 1% = 100
  const fraction = (bps / 100) / 100;
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(fraction);
}

/**
 * Accepts either counts or percent KPIs. For percent KPIs we expect bps (0..10000),
 * but if a legacy value in 0..100 sneaks in, convert to bps.
 */
export function getKpiDisplayValue(
  kpi: string,
  value: number,
  style: DisplayStyle = 'compact',
  locale = 'en-US'
): string {
  const isPercent = PERCENT_KPIS.has(kpi);
  if (isPercent) {
    let bps = Number.isFinite(value) ? Math.round(value) : 0;
    if (bps <= 100) bps = Math.round(value * 100); // tolerate percent units
    if (bps < 0) bps = 0;
    if (bps > 10000) bps = 10000;
    return formatPercentFromBps(bps, locale);
  }
  // counts
  return style === 'compact'
    ? formatCountCompact(value, locale)
    : formatCountFull(value, locale);
}