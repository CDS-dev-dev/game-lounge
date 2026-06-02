// アイコンボタンコンポーネント

'use client';

import React from 'react';
import { MIN_TAP_AREA } from '@/lib/constants/ui-scale';

export type IconButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
export type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps {
  icon: React.ReactNode;
  label: string; // アクセシビリティ用（aria-label）
  onClick?: () => void;
  disabled?: boolean;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  className?: string;
  showTooltip?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  showTooltip = true,
}) => {
  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-slate-600 hover:bg-slate-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  };

  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-14 h-14 text-lg',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={showTooltip ? label : undefined}
      className={`
        ${MIN_TAP_AREA} ${sizeClasses[size]}
        rounded-lg shadow-md
        flex items-center justify-center
        transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : `${variantClasses[variant]} active:scale-95`}
        focus:outline-none focus:ring-4 focus:ring-offset-2
        ${variant === 'primary' ? 'focus:ring-indigo-500' : ''}
        ${variant === 'secondary' ? 'focus:ring-slate-500' : ''}
        ${variant === 'success' ? 'focus:ring-green-500' : ''}
        ${variant === 'danger' ? 'focus:ring-red-500' : ''}
        ${variant === 'warning' ? 'focus:ring-yellow-500' : ''}
        ${className}
      `}
    >
      {icon}
    </button>
  );
};

// よく使うアイコン付きボタンのプリセット
export const FoldButton: React.FC<Omit<IconButtonProps, 'icon' | 'label'>> = (props) => (
  <IconButton
    icon={<span className="text-xl">❌</span>}
    label="フォールド"
    variant="danger"
    {...props}
  />
);

export const CheckButton: React.FC<Omit<IconButtonProps, 'icon' | 'label'>> = (props) => (
  <IconButton
    icon={<span className="text-xl">✓</span>}
    label="チェック"
    variant="secondary"
    {...props}
  />
);

export const CallButton: React.FC<Omit<IconButtonProps, 'icon' | 'label'>> = (props) => (
  <IconButton
    icon={<span className="text-xl">📞</span>}
    label="コール"
    variant="primary"
    {...props}
  />
);

export const RaiseButton: React.FC<Omit<IconButtonProps, 'icon' | 'label'>> = (props) => (
  <IconButton
    icon={<span className="text-xl">⬆️</span>}
    label="レイズ"
    variant="warning"
    {...props}
  />
);

export const AllInButton: React.FC<Omit<IconButtonProps, 'icon' | 'label'>> = (props) => (
  <IconButton
    icon={<span className="text-xl">🎯</span>}
    label="オールイン"
    variant="danger"
    {...props}
  />
);
