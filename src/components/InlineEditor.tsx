import React, { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';

interface InlineEditorProps {
  value: string | number;
  type: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
  onSave: (value: string | number) => void;
  onCancel: () => void;
  placeholder?: string;
  className?: string;
}

export const InlineEditor: React.FC<InlineEditorProps> = ({
  value,
  type,
  options = [],
  onSave,
  onCancel,
  placeholder,
  className = '',
}) => {
  const [editValue, setEditValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, []);

  const handleSave = () => {
    const finalValue = type === 'number' ? parseFloat(editValue) : editValue;
    onSave(finalValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {type === 'select' ? (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="block w-full rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
        />
      )}
      
      <div className="flex space-x-1">
        <button
          onClick={handleSave}
          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors duration-200"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={onCancel}
          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};