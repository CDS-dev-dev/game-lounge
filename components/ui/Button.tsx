// ボタンコンポーネント

import React from 'react';
import { FOCUS_RING, MIN_TAP_AREA } from '@/lib/constants/ui-scale';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
  asChild?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
  asChild = false,
}) => {
  const baseClasses = `font-semibold rounded-lg transition-colors duration-200 ${FOCUS_RING} disabled:cursor-not-allowed ${MIN_TAP_AREA}`;

  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400 disabled:hover:bg-gray-400',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100 disabled:hover:bg-gray-100 disabled:text-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 disabled:hover:bg-gray-400',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',      // 最小タップ領域確保
    md: 'px-6 py-3 text-base',    // 標準
    lg: 'px-8 py-4 text-lg',      // 大きめ
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  // asChildの場合、childrenが単一のReact要素であることを期待し、そのpropsにclassNameを追加
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: `${(children as any).props.className || ''} ${classes}`.trim(),
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
};
