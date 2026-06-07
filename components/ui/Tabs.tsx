// タブコンポーネント

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { TEXT_SIZE, MIN_TAP_AREA } from '@/lib/constants/ui-scale';

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
};

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className = '',
  children,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue ?? internalValue;

  const handleValueChange = useCallback(
    (newValue: string) => {
      if (!controlledValue) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [controlledValue, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export const TabsList: React.FC<TabsListProps> = ({ className = '', children }) => {
  return (
    <div
      role="tablist"
      className={`flex border-b border-slate-300 bg-white ${className}`}
    >
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  disabled = false,
  className = '',
  children,
}) => {
  const { value: selectedValue, onValueChange } = useTabsContext();
  const isSelected = selectedValue === value;

  const handleClick = useCallback(() => {
    if (!disabled) {
      onValueChange(value);
    }
  }, [value, disabled, onValueChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
      // 矢印キーでタブ移動をサポート
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const tablist = e.currentTarget.parentElement;
        if (!tablist) return;

        const tabs = Array.from(tablist.querySelectorAll('[role="tab"]')) as HTMLElement[];
        const currentIndex = tabs.indexOf(e.currentTarget as HTMLElement);

        let nextIndex: number;
        if (e.key === 'ArrowLeft') {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        } else {
          nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        }

        tabs[nextIndex]?.focus();
        tabs[nextIndex]?.click();
      }
    },
    [handleClick]
  );

  return (
    <button
      id={`tab-${value}`}
      role="tab"
      aria-selected={isSelected}
      aria-controls={`tabpanel-${value}`}
      aria-disabled={disabled}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        ${MIN_TAP_AREA} inline-flex items-center justify-center gap-2 whitespace-nowrap px-4 sm:px-6 ${TEXT_SIZE.body} font-semibold
        transition-all duration-200
        ${
          isSelected
            ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
        ${className}
      `}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  className = '',
  children,
}) => {
  const { value: selectedValue } = useTabsContext();
  const isSelected = selectedValue === value;

  if (!isSelected) return null;

  return (
    <div
      id={`tabpanel-${value}`}
      role="tabpanel"
      aria-labelledby={`tab-${value}`}
      tabIndex={0}
      className={`py-2 sm:py-4 animate-fade-in focus:outline-none ${className}`}
      style={{
        animation: 'fadeIn 0.2s ease-in',
      }}
    >
      {children}
    </div>
  );
};
