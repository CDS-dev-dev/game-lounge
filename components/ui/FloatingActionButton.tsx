// フローティングアクションボタン（FAB）コンポーネント

'use client';

import React, { useState } from 'react';
import { MIN_TAP_AREA } from '@/lib/constants/ui-scale';

interface FABProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

export const FloatingActionButton: React.FC<FABProps> = ({
  icon,
  label,
  onClick,
  variant = 'primary',
  position = 'bottom-right',
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-slate-600 hover:bg-slate-700 text-white',
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-40`}>
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label={label}
        className={`
          ${MIN_TAP_AREA} w-14 h-14 sm:w-16 sm:h-16
          rounded-full shadow-lg
          flex items-center justify-center
          ${variantClasses[variant]}
          transition-all duration-200
          active:scale-95
          focus:outline-none focus:ring-4 focus:ring-offset-2
          ${variant === 'primary' ? 'focus:ring-indigo-500' : 'focus:ring-slate-500'}
          ${className}
        `}
      >
        <span className="text-2xl">{icon}</span>
      </button>

      {/* ツールチップ */}
      {showTooltip && (
        <div
          className={`
            absolute ${position.includes('right') ? 'right-full mr-3' : 'left-full ml-3'}
            ${position.includes('bottom') ? 'bottom-2' : 'top-2'}
            px-3 py-2 bg-slate-900 text-white text-sm font-semibold
            rounded-lg shadow-lg whitespace-nowrap
            animate-fade-in pointer-events-none
          `}
        >
          {label}
          <div
            className={`
              absolute ${position.includes('right') ? 'left-full' : 'right-full'}
              top-1/2 -translate-y-1/2
              w-0 h-0 border-4
              ${
                position.includes('right')
                  ? 'border-l-slate-900 border-y-transparent border-r-transparent'
                  : 'border-r-slate-900 border-y-transparent border-l-transparent'
              }
            `}
          />
        </div>
      )}
    </div>
  );
};

// よく使うFABのプリセット
export const RulesFAB: React.FC<Omit<FABProps, 'icon' | 'label'>> = (props) => (
  <FloatingActionButton icon="📖" label="ルールを見る" {...props} />
);

export const SettingsFAB: React.FC<Omit<FABProps, 'icon' | 'label'>> = (props) => (
  <FloatingActionButton icon="⚙️" label="設定" variant="secondary" {...props} />
);

export const HelpFAB: React.FC<Omit<FABProps, 'icon' | 'label'>> = (props) => (
  <FloatingActionButton icon="❓" label="ヘルプ" variant="secondary" {...props} />
);
