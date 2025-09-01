import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, Info, Copy, Check } from 'lucide-react';
import { parseNumberInput, formatForInput, validateKpiTarget, getKpiPlaceholder, logNumberInputTelemetry, KPI_CONFIGS, parsePercentToBps } from '../utils/numberFormatting';
import { parseSmartNumber } from '../utils/formatters';
import { useFormatters } from '../hooks/useFormatters';

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
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGhost, setShowGhost] = useState(false);
  const [ghostValue, setGhostValue] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);
  const config = KPI_CONFIGS[kpi as keyof typeof KPI_CONFIGS];
  const formatters = useFormatters();
  
  // Initialize display value
  useEffect(() => {
    if (!isFocused && editing === null && value > 0) {
      setDisplayValue(formatForInput(value, config?.type || 'count', false));
    } else if (value === 0) {
      setDisplayValue('');
    }
  }, [value, isFocused, editing, config?.type]);

  const handleFocus = () => {
    setIsFocused(true);
    setError(null);
    setShowGhost(false);
    // Show raw value for editing
    if (config?.type === 'percent') {
      // Convert from bps to percentage for editing
      const rawValue = value > 0 ? (value / 100).toString() : '';
      setEditing(rawValue);
      setDisplayValue(rawValue);
    } else {
      const rawValue = value > 0 ? value.toString() : '';
      setEditing(rawValue);
      setDisplayValue(rawValue);
    }
  };

  const handleCommit = () => {
    const inputValue = editing || displayValue;
    setIsFocused(false);
    setEditing(null);
    setShowGhost(false);
    
    if (inputValue.trim() === '') {
      onChange(0);
      setDisplayValue('');
      return;
    }

    let parsed;
    if (config?.type === 'percent') {
      const percentResult = parsePercentToBps(inputValue);
      parsed = {
        value: percentResult.bps,
        rawInput: percentResult.rawInput,
        isValid: percentResult.isValid,
        error: percentResult.error
      };
    } else {
      parsed = parseNumberInput(inputValue, config?.type || 'count');
    }
    
    if (!parsed.isValid) {
      setError(parsed.error || 'Invalid number format');
      logNumberInputTelemetry('validation_failure', { kpi, input: inputValue, error: parsed.error });
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
    if (parsed.rawInput !== inputValue) {
      logNumberInputTelemetry('parse_correction', { 
        kpi, 
        original: inputValue, 
        corrected: parsed.rawInput,
        finalValue: parsed.value 
      });
    }

    onChange(parsed.value);
    setError(null);
    
    // Format for display
    setDisplayValue(formatForInput(parsed.value, config?.type || 'count', false));
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false;
    setEditing(e.currentTarget.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEditing(newValue);
    setDisplayValue(newValue);
    setError(null);

    // Show ghost hint for large numbers (not for percentages)
    if (config?.type !== 'percent' && !isComposingRef.current) {
      if (newValue.length >= 4 && /^\d+$/.test(newValue)) {
        const parsedValue = parseSmartNumber(newValue);
        if (parsedValue >= 1000) {
          const compactFormat = formatters.compact(parsedValue);
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
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter key to commit
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommit();
      inputRef.current?.blur();
      return;
    }

    // Keyboard shortcuts for suffixes (not applicable to percentages)
    if (e.altKey) {
      const suffixMap: Record<string, string> = {
        'k': 'K',
        'm': 'M', 
        'b': 'B',
        't': 'T'
      };
      
      const suffix = suffixMap[e.key.toLowerCase()];
      if (suffix && editing && /^\d*\.?\d+$/.test(editing) && config?.type !== 'percent') {
        e.preventDefault();
        const newValue = editing + suffix;
        setEditing(newValue);
        setDisplayValue(newValue);
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
          value={editing ?? displayValue}
          onChange={handleChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onFocus={handleFocus}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={getKpiPlaceholder(kpi)}
          inputMode="decimal"
          aria-describedby={helperId}
          className={`block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-sm ${
            config?.type === 'currency' ? 'pl-8' : ''
          } ${config?.type === 'ratio' ? 'pr-8' : config?.unit ? 'pr-20' : ''} ${
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
          } ${disabled ? 'bg-gray-100 text-gray-500' : ''} tabular-nums`}
        />
        
        {/* Unit suffix */}
        {config?.unit && config.type !== 'currency' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 text-sm">{config.unit}</span>
          </div>
        )}
        
        {/* Ghost value hint */}
        {showGhost && ghostValue && config?.type !== 'percent' && !editing && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-xs">= {ghostValue}</span>
          </div>
        )}
        
        {/* Copy button */}
        {value > 0 && !isFocused && !editing && (
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
        {isFocused && !error && editing !== null && (
          <div className="text-xs text-gray-400">
            {config?.type === 'percent' ? (
              <p>Accepts: 5, 5%, 0.07 (interpreted as 5%, 5%, 0.07%)</p>
            ) : (
              <p>Accepts: 1000, 1,000, 1K, 1.5M, 2.5B</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


export default SmartNumberInput