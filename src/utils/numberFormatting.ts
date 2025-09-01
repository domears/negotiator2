export interface ParsedNumber {
  value: number;
  rawInput: string;
  isValid: boolean;
  error?: string;
}

export interface NumberDisplayOptions {
  style: 'compact' | 'full';
  locale?: string;
  maxDecimals?: number;
}

// Suffix multipliers for abbreviations
const SUFFIX_MULTIPLIERS = {
  k: 1_000,
  m: 1_000_000,
  b: 1_000_000_000,
  t: 1_000_000_000_000,
} as const;

// KPI-specific configuration
export const KPI_CONFIGS = {
  'Reach': { 
    type: 'count' as const, 
    unit: 'people', 
    placeholder: '1,000,000', 
    suggestion: 'Consider your target market size',
    maxValue: 1_000_000_000,
    minValue: 1000
  },
  'Impressions': { 
    type: 'count' as const, 
    unit: 'impressions', 
    placeholder: '5,000,000', 
    suggestion: 'Typically 3-5x your reach goal',
    maxValue: 1_000_000_000_000,
    minValue: 1000
  },
  'Views': { 
    type: 'count' as const, 
    unit: 'views', 
    placeholder: '500,000', 
    suggestion: 'Video completion views or page views',
    maxValue: 1_000_000_000,
    minValue: 100
  },
  'Engagements': { 
    type: 'count' as const, 
    unit: 'interactions', 
    placeholder: '50,000', 
    suggestion: 'Likes, shares, comments combined',
    maxValue: 100_000_000,
    minValue: 100
  },
  'Clicks': { 
    type: 'count' as const, 
    unit: 'clicks', 
    placeholder: '25,000', 
    suggestion: 'Link clicks or CTA interactions',
    maxValue: 100_000_000,
    minValue: 10
  },
  'Conversions': { 
    type: 'count' as const, 
    unit: 'conversions', 
    placeholder: '1,000', 
    suggestion: 'Completed desired actions',
    maxValue: 10_000_000,
    minValue: 1
  },
  'Brand Lift': { 
    type: 'percentage' as const, 
    unit: '% lift', 
    placeholder: '5.0', 
    suggestion: 'Typical lift ranges 2-10%',
    maxValue: 100,
    minValue: 0.1
  },
  'Purchase Intent': { 
    type: 'percentage' as const, 
    unit: '% increase', 
    placeholder: '15.0', 
    suggestion: 'Intent increase among exposed audience',
    maxValue: 100,
    minValue: 0.1
  },
  'Website Traffic': { 
    type: 'count' as const, 
    unit: 'sessions', 
    placeholder: '100,000', 
    suggestion: 'New sessions from campaign',
    maxValue: 100_000_000,
    minValue: 100
  },
  'Lead Generation': { 
    type: 'count' as const, 
    unit: 'leads', 
    placeholder: '500', 
    suggestion: 'Qualified leads captured',
    maxValue: 1_000_000,
    minValue: 1
  },
  'Sales Revenue': { 
    type: 'currency' as const, 
    unit: '', 
    placeholder: '50,000', 
    suggestion: 'Direct revenue attribution',
    maxValue: 100_000_000,
    minValue: 100
  },
  'Cost Per Acquisition': { 
    type: 'currency' as const, 
    unit: '', 
    placeholder: '25', 
    suggestion: 'Target cost per conversion',
    maxValue: 10_000,
    minValue: 0.01
  },
  'Return on Ad Spend': { 
    type: 'ratio' as const, 
    unit: ':1', 
    placeholder: '4.0', 
    suggestion: 'Revenue return per dollar spent',
    maxValue: 100,
    minValue: 0.1
  }
} as const;

/**
 * Sanitizes input string by removing unwanted characters and normalizing
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[\u00A0\u2000-\u200B\u2028\u2029]/g, ' ') // Normalize unicode spaces
    .replace(/[,_\s]/g, '') // Remove commas, underscores, spaces
    .replace(/[\u2212\u2013\u2014]/g, '-') // Normalize minus signs
    .toLowerCase();
}

/**
 * Parses a string input into a numeric value, handling suffixes and various formats
 */
export function parseNumberInput(input: string, type: 'count' | 'percentage' | 'currency' | 'ratio'): ParsedNumber {
  if (!input || input.trim() === '') {
    return { value: 0, rawInput: input, isValid: true };
  }

  const sanitized = sanitizeInput(input);
  
  // Handle percentage inputs
  if (type === 'percentage') {
    const percentMatch = sanitized.match(/^(\d*\.?\d+)%?$/);
    if (percentMatch) {
      const numValue = parseFloat(percentMatch[1]);
      if (isNaN(numValue) || numValue < 0 || numValue > 100) {
        return {
          value: 0,
          rawInput: input,
          isValid: false,
          error: 'Percentage must be between 0 and 100'
        };
      }
      // Store as decimal (0-1 range)
      return { value: numValue / 100, rawInput: input, isValid: true };
    }
  }

  // Handle scientific notation
  const scientificMatch = sanitized.match(/^(\d*\.?\d+)e([+-]?\d+)$/);
  if (scientificMatch) {
    const base = parseFloat(scientificMatch[1]);
    const exponent = parseInt(scientificMatch[2]);
    const value = base * Math.pow(10, exponent);
    
    if (isNaN(value) || !isFinite(value) || value < 0) {
      return {
        value: 0,
        rawInput: input,
        isValid: false,
        error: 'Invalid scientific notation'
      };
    }
    
    const finalValue = type === 'count' ? Math.round(value) : value;
    return { value: finalValue, rawInput: input, isValid: true };
  }

  // Handle suffix notation (K, M, B, T)
  const suffixMatch = sanitized.match(/^(\d*\.?\d+)([kmbt])$/);
  if (suffixMatch) {
    const baseValue = parseFloat(suffixMatch[1]);
    const suffix = suffixMatch[2] as keyof typeof SUFFIX_MULTIPLIERS;
    
    if (isNaN(baseValue) || baseValue < 0) {
      return {
        value: 0,
        rawInput: input,
        isValid: false,
        error: 'Invalid number format'
      };
    }
    
    const multiplier = SUFFIX_MULTIPLIERS[suffix];
    const expandedValue = baseValue * multiplier;
    const finalValue = type === 'count' ? Math.round(expandedValue) : expandedValue;
    
    return { value: finalValue, rawInput: input, isValid: true };
  }

  // Handle plain numbers
  const plainMatch = sanitized.match(/^(\d*\.?\d+)$/);
  if (plainMatch) {
    const numValue = parseFloat(plainMatch[1]);
    
    if (isNaN(numValue) || numValue < 0) {
      return {
        value: 0,
        rawInput: input,
        isValid: false,
        error: 'Must be a positive number'
      };
    }
    
    const finalValue = type === 'count' ? Math.round(numValue) : numValue;
    return { value: finalValue, rawInput: input, isValid: true };
  }

  return {
    value: 0,
    rawInput: input,
    isValid: false,
    error: 'Invalid number format'
  };
}

/**
 * Validates a parsed number against KPI-specific constraints
 */
export function validateKpiTarget(kpi: string, value: number): { isValid: boolean; error?: string } {
  const config = KPI_CONFIGS[kpi as keyof typeof KPI_CONFIGS];
  if (!config) {
    return { isValid: true }; // Unknown KPI, allow any value
  }

  if (value < config.minValue) {
    return {
      isValid: false,
      error: `${kpi} must be at least ${formatNumber(config.minValue, { style: 'full' })}`
    };
  }

  if (value > config.maxValue) {
    return {
      isValid: false,
      error: `${kpi} cannot exceed ${formatNumber(config.maxValue, { style: 'compact' })}`
    };
  }

  return { isValid: true };
}

/**
 * Formats a number for display based on type and style preferences
 */
export function formatNumber(
  value: number, 
  options: NumberDisplayOptions & { type?: 'count' | 'percentage' | 'currency' | 'ratio'; currencyCode?: string } = {}
): string {
  const { style = 'full', locale = 'en-US', maxDecimals = 1, type = 'count', currencyCode = 'USD' } = options;

  if (type === 'percentage') {
    // Convert from decimal storage (0-1) to percentage display (0-100)
    const percentValue = value * 100;
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);
  }

  if (type === 'currency') {
    if (style === 'compact' && value >= 1000) {
      return formatCompactCurrency(value, currencyCode, locale);
    }
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: value >= 100 ? 0 : 2,
      maximumFractionDigits: value >= 100 ? 0 : 2,
    }).format(value);
  }

  if (type === 'ratio') {
    return `${value.toFixed(1)}:1`;
  }

  // Count formatting
  if (style === 'compact' && value >= 1000) {
    return formatCompactNumber(value, locale, maxDecimals);
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats large numbers in compact notation (1.2M, 5.5K, etc.)
 */
function formatCompactNumber(value: number, locale: string = 'en-US', maxDecimals: number = 1): string {
  const absValue = Math.abs(value);
  
  if (absValue >= 1_000_000_000_000) {
    const formatted = (value / 1_000_000_000_000).toFixed(maxDecimals);
    return `${removeTrailingZeros(formatted)}T`;
  } else if (absValue >= 1_000_000_000) {
    const formatted = (value / 1_000_000_000).toFixed(maxDecimals);
    return `${removeTrailingZeros(formatted)}B`;
  } else if (absValue >= 1_000_000) {
    const formatted = (value / 1_000_000).toFixed(maxDecimals);
    return `${removeTrailingZeros(formatted)}M`;
  } else if (absValue >= 1_000) {
    const formatted = (value / 1_000).toFixed(maxDecimals);
    return `${removeTrailingZeros(formatted)}K`;
  }
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats currency in compact notation
 */
function formatCompactCurrency(value: number, currencyCode: string = 'USD', locale: string = 'en-US'): string {
  const currencySymbol = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).formatToParts(1).find(part => part.type === 'currency')?.value || '$';

  const absValue = Math.abs(value);
  
  if (absValue >= 1_000_000_000) {
    const formatted = (value / 1_000_000_000).toFixed(1);
    return `${currencySymbol}${removeTrailingZeros(formatted)}B`;
  } else if (absValue >= 1_000_000) {
    const formatted = (value / 1_000_000).toFixed(1);
    return `${currencySymbol}${removeTrailingZeros(formatted)}M`;
  } else if (absValue >= 1_000) {
    const formatted = (value / 1_000).toFixed(1);
    return `${currencySymbol}${removeTrailingZeros(formatted)}K`;
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Removes trailing zeros from decimal strings
 */
function removeTrailingZeros(str: string): string {
  return str.replace(/\.?0+$/, '');
}

/**
 * Formats number for input field display (with commas when not focused)
 */
export function formatForInput(value: number, type: 'count' | 'percentage' | 'currency' | 'ratio', isFocused: boolean = false): string {
  if (isFocused) {
    // Show raw value while typing to avoid caret jumps
    if (type === 'percentage') {
      return (value * 100).toString();
    }
    return value.toString();
  }

  // Format with appropriate separators when not focused
  if (type === 'percentage') {
    return `${(value * 100).toFixed(1)}%`;
  }

  if (type === 'ratio') {
    return `${value.toFixed(1)}:1`;
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: type === 'currency' ? 2 : 0,
  }).format(value);
}

/**
 * Gets the display value for a KPI goal with proper formatting
 */
export function getKpiDisplayValue(kpi: string, value: number, style: 'compact' | 'full' = 'full'): string {
  const config = KPI_CONFIGS[kpi as keyof typeof KPI_CONFIGS];
  if (!config) return value.toString();

  return formatNumber(value, { 
    style, 
    type: config.type,
    currencyCode: 'USD' // This could be made dynamic based on campaign currency
  });
}

/**
 * Generates helpful placeholder text for KPI inputs
 */
export function getKpiPlaceholder(kpi: string): string {
  const config = KPI_CONFIGS[kpi as keyof typeof KPI_CONFIGS];
  if (!config) return 'Enter target value';

  if (config.type === 'count') {
    return `e.g., ${config.placeholder} or ${formatNumber(parseNumberInput(config.placeholder.replace(/,/g, ''), 'count').value, { style: 'compact' })}`;
  }

  return `e.g., ${config.placeholder}`;
}

/**
 * Logs telemetry data for UX improvements
 */
export function logNumberInputTelemetry(event: 'parse_correction' | 'validation_failure' | 'format_toggle', data: any): void {
  // In production, this would send to analytics service
  console.log(`[NumberInput Telemetry] ${event}:`, data);
}