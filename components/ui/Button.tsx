// ボタンコンポーネント

import React from 'react';
import { FOCUS_RING, MIN_TAP_AREA } from '@/lib/constants/ui-scale';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
  asChild?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
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
    const child = children as React.ReactElement<{ className?: string }>;
    return React.cloneElement(child, {
      className: `${child.props.className || ''} ${classes}`.trim(),
    });
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      className={classes}
    >
      {loading ? (
        <span className="flex items-center justify-center space-x-2">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
