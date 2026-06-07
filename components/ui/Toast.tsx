// トースト通知コンポーネント

'use client';

import { useEffect, useState } from 'react';
import { Z_INDEX } from '@/lib/constants/z-index';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300); // アニメーション後にクリーンアップ
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const baseClasses = 'px-3 sm:px-5 py-2 rounded-lg shadow-lg transition-all duration-300 max-w-md text-sm sm:text-base';

  const typeClasses = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-yellow-600 text-white',
    info: 'bg-blue-600 text-white',
  };

  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`${baseClasses} ${typeClasses[type]} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-xl font-bold sm:text-2xl" aria-hidden="true">{icons[type]}</span>
        <p className="font-semibold">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose?.(), 300);
          }}
          aria-label="通知を閉じる"
          className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-xl font-bold text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-current"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// トースト管理用のコンテキストプロバイダー
import { createContext, useContext, ReactNode } from 'react';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: ToastType; duration: number }>>([]);

  const showToast = (message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-3 right-3 flex flex-col items-end space-y-2 sm:bottom-4 sm:right-4" style={{ zIndex: Z_INDEX.TOAST }}>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
