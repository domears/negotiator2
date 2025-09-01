import { useMemo } from 'react';

export interface Formatters {
  full: Intl.NumberFormat;
  compact: Intl.NumberFormat;
  percent: Intl.NumberFormat;
  currency: Intl.NumberFormat;
}

export function useFormatters(locale = 'en-US', currency = 'USD'): Formatters {
  return useMemo(() => ({
    full: new Intl.NumberFormat(locale, { useGrouping: true }),
    compact: new Intl.NumberFormat(locale, { 
      notation: 'compact', 
      maximumFractionDigits: 1 
    }),
    percent: new Intl.NumberFormat(locale, { 
      style: 'percent', 
      minimumFractionDigits: 1, 
      maximumFractionDigits: 1 
    }),
    currency: new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
  }), [locale, currency]);
}

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