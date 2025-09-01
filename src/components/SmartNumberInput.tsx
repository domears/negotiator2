import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, Info, Copy, Check } from 'lucide-react';
import { parseNumberInput, formatForInput, validateKpiTarget, getKpiPlaceholder, logNumberInputTelemetry, KPI_CONFIGS } from '../utils/numberFormatting';

interface SmartNumberInputProps {
  kpi: string;
  value: number;
  onChange: (value: number) => void;
  currencySymbol?: string;
  className?: string;
  disabled?: boolean;
}

export const SmartNumberInput: React.FC<SmartNumberInputProps> = ({
  kpi,
  value,
  onChange,
  currencySymbol = '$',
  className = '',
  disabled = false,
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGhost, setShowGhost] = useState(false);
  const [ghostValue, setGhostValue] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const config = KPI_CONFIGS[kpi as keyof typeof KPI_CONFIGS];
  
  // Initialize display value
  useEffect(() => {
    if (!isFocused && value > 0) {
      setDisplayValue(formatForInput(value, config?.type || 'count', false));
    } else if (value === 0) {
      setDisplayValue('');
    }
  }, [value, isFocused, config?.type]);

  const handleFocus = () => {
    setIsFocused(true);
    setError(null);
    // Show raw value for editing
    if (config?.type === 'percentage') {
      setDisplayValue((value * 100).toString());
    } else {
      setDisplayValue(value > 0 ? value.toString() : '');
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setShowGhost(false);
    
    if (displayValue.trim() === '') {
      onChange(0);
      setDisplayValue('');
      return;
    }

    const parsed = parseNumberInput(displayValue, config?.type || 'count');
    
    if (!parsed.isValid) {
      setError(parsed.error || 'Invalid number format');
      logNumberInputTelemetry('validation_failure', { kpi, input: displayValue, error: parsed.error });
      return;
    }

    // Validate against KPI constraints
    const validation = validateKpiTarget(kpi, parsed.value);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid value');
      logNumberInputTelemetry('validation_failure', { kpi, value: parsed.value, error: validation.error });
      return;
    }

    // Log if we corrected the input format
    if (parsed.rawInput !== displayValue) {
      logNumberInputTelemetry('parse_correction', { 
        kpi, 
        original: displayValue, 
        corrected: parsed.rawInput,
        finalValue: parsed.value 
      });
    }

    onChange(parsed.value);
    setError(null);
    
    // Format for display
    setDisplayValue(formatForInput(parsed.value, config?.type || 'count', false));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
    setError(null);

    // Show ghost hint for large numbers
    if (newValue.length >= 4 && /^\d+$/.test(newValue)) {
      const parsed = parseNumberInput(newValue, config?.type || 'count');
      if (parsed.isValid && parsed.value >= 1000) {
        const compactFormat = formatForInput(parsed.value, config?.type || 'count', false);
        if (compactFormat !== newValue) {
          setGhostValue(compactFormat);
          setShowGhost(true);
        } else {
          setShowGhost(false);
        }
      } else {
        setShowGhost(false);
      }
    } else {
      setShowGhost(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Keyboard shortcuts for suffixes
    if (e.altKey) {
      const suffixMap: Record<string, string> = {
        'k': 'K',
        'm': 'M', 
        'b': 'B',
        't': 'T'
      };
      
      const suffix = suffixMap[e.key.toLowerCase()];
      if (suffix && displayValue && /^\d*\.?\d+$/.test(displayValue)) {
        e.preventDefault();
        setDisplayValue(prev => prev + suffix);
      }
    }

    // Copy shortcuts
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'c') {
      e.preventDefault();
      handleCopy('alternate');
    }
  };

  const handleCopy = async (format: 'current' | 'alternate') => {
    if (value === 0) return;
    
    let textToCopy = '';
    if (format === 'current') {
      textToCopy = displayValue;
    } else {
      // Copy in alternate format
      const isCurrentlyCompact = displayValue.match(/[KMBT]$/);
      textToCopy = isCurrentlyCompact 
        ? formatForInput(value, config?.type || 'count', false)
        : formatForInput(value, config?.type || 'count', false).replace(/,/g, '');
    }
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const inputId = `kpi-input-${kpi.toLowerCase().replace(/\s+/g, '-')}`;
  const helperId = `${inputId}-helper`;

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {kpi} Goal
      </label>
      
      <div className="relative">
        {/* Currency symbol prefix */}
        {config?.type === 'currency' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 text-sm">{currencySymbol}</span>
          </div>
        )}
        
        {/* Main input */}
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={getKpiPlaceholder(kpi)}
          aria-describedby={helperId}
          className={`block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-sm ${
            config?.type === 'currency' ? 'pl-8' : ''
          } ${config?.type === 'ratio' ? 'pr-8' : config?.unit ? 'pr-20' : ''} ${
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
          } ${disabled ? 'bg-gray-100 text-gray-500' : ''}`}
        />
        
        {/* Unit suffix */}
        {config?.unit && config.type !== 'currency' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 text-sm">{config.unit}</span>
          </div>
        )}
        
        {/* Ghost value hint */}
        {showGhost && ghostValue && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-xs">= {ghostValue}</span>
          </div>
        )}
        
        {/* Copy button */}
        {value > 0 && !isFocused && (
          <button
            type="button"
            onClick={() => handleCopy('current')}
            className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
            title="Copy value"
          >
            {copySuccess ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        )}
      </div>
      
      {/* Helper text and validation */}
      <div id={helperId} className="space-y-1">
        {error ? (
          <div className="flex items-center space-x-1 text-red-600">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            <span className="text-xs">{error}</span>
          </div>
        ) : config?.suggestion ? (
          <div className="flex items-center space-x-1 text-gray-500">
            <Info className="h-3 w-3 flex-shrink-0" />
            <span className="text-xs">{config.suggestion}</span>
          </div>
        ) : null}
        
        {/* Format examples */}
        {isFocused && !error && (
          <div className="text-xs text-gray-400">
            <p>Accepts: 1000, 1,000, 1K, 1.5M, 2.5B</p>
            {config?.type === 'percentage' && (
              <p>For percentages: 5, 5%, or 0.05 (all = 5%)</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};