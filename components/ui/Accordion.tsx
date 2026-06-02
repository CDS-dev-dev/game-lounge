// アコーディオン（折りたたみ）コンポーネント

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { TEXT_SIZE, MIN_TAP_AREA } from '@/lib/constants/ui-scale';

interface AccordionContextType {
  type: 'single' | 'multiple';
  value: string | string[];
  onValueChange: (value: string | string[]) => void;
  collapsible: boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion provider');
  }
  return context;
};

interface AccordionProps {
  type: 'single' | 'multiple';
  collapsible?: boolean;
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  className?: string;
  children: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({
  type,
  collapsible = false,
  defaultValue,
  value: controlledValue,
  onValueChange,
  className = '',
  children,
}) => {
  const [internalValue, setInternalValue] = useState<string | string[]>(
    defaultValue ?? (type === 'multiple' ? [] : '')
  );
  const value = controlledValue ?? internalValue;

  const handleValueChange = useCallback(
    (newValue: string | string[]) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [controlledValue, onValueChange]
  );

  return (
    <AccordionContext.Provider value={{ type, value, onValueChange: handleValueChange, collapsible }}>
      <div className={`space-y-2 ${className}`}>{children}</div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  value,
  disabled = false,
  className = '',
  children,
}) => {
  const { type, value: selectedValue, onValueChange, collapsible } = useAccordionContext();

  const isOpen =
    type === 'single'
      ? selectedValue === value
      : Array.isArray(selectedValue) && selectedValue.includes(value);

  const handleToggle = useCallback(() => {
    if (disabled) return;

    if (type === 'single') {
      // 単一展開モード
      if (isOpen && collapsible) {
        onValueChange('');
      } else if (!isOpen) {
        onValueChange(value);
      }
    } else {
      // 複数展開モード
      const currentValues = selectedValue as string[];
      if (isOpen) {
        onValueChange(currentValues.filter((v) => v !== value));
      } else {
        onValueChange([...currentValues, value]);
      }
    }
  }, [type, value, isOpen, disabled, selectedValue, onValueChange, collapsible]);

  return (
    <AccordionItemContext.Provider value={{ value, isOpen, disabled, onToggle: handleToggle }}>
      <div
        className={`border border-slate-300 rounded-lg bg-white ${className}`}
        role="region"
        aria-labelledby={`accordion-trigger-${value}`}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
};

interface AccordionItemContextType {
  value: string;
  isOpen: boolean;
  disabled: boolean;
  onToggle: () => void;
}

const AccordionItemContext = createContext<AccordionItemContextType | undefined>(undefined);

const useAccordionItemContext = () => {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error('AccordionTrigger and AccordionContent must be used within AccordionItem');
  }
  return context;
};

interface AccordionTriggerProps {
  className?: string;
  children: React.ReactNode;
}

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  className = '',
  children,
}) => {
  const { value, isOpen, disabled, onToggle } = useAccordionItemContext();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle();
      }
    },
    [onToggle]
  );

  return (
    <button
      id={`accordion-trigger-${value}`}
      type="button"
      aria-expanded={isOpen}
      aria-controls={`accordion-content-${value}`}
      disabled={disabled}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      className={`
        w-full ${MIN_TAP_AREA} px-4 sm:px-6 py-3 sm:py-4
        flex items-center justify-between
        ${TEXT_SIZE.body} font-semibold text-left
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50'}
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        transition-all duration-200
        ${className}
      `}
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={`h-5 w-5 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};

interface AccordionContentProps {
  className?: string;
  children: React.ReactNode;
}

export const AccordionContent: React.FC<AccordionContentProps> = ({
  className = '',
  children,
}) => {
  const { value, isOpen } = useAccordionItemContext();

  return (
    <div
      id={`accordion-content-${value}`}
      role="region"
      aria-labelledby={`accordion-trigger-${value}`}
      className={`overflow-hidden transition-all duration-300 ${
        isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className={`px-4 sm:px-6 pb-4 sm:pb-6 pt-2 ${className}`}>{children}</div>
    </div>
  );
};
