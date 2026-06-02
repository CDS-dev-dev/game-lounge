// モーダルダイアログコンポーネント

'use client';

import React, { useEffect, useCallback } from 'react';
import { TEXT_SIZE, PADDING } from '@/lib/constants/ui-scale';
import { Z_INDEX } from '@/lib/constants/z-index';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  showCloseButton = true,
}) => {
  // ESCキーで閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // モーダル表示中はスクロール禁止
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // 背景クリックで閉じる
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      style={{ zIndex: Z_INDEX.MODAL }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`
          bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[calc(100vh-8rem)] overflow-auto
          animate-scale-in
          ${className}
        `}
        style={{
          animation: 'scaleIn 0.2s ease-out',
        }}
      >
        {/* ヘッダー */}
        {(title || showCloseButton) && (
          <div className={`flex items-center justify-between ${PADDING.card} border-b border-slate-200`}>
            {title && (
              <h2 id="modal-title" className={`${TEXT_SIZE.heading3} font-bold text-slate-900`}>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label="閉じる"
                className="
                  w-8 h-8 flex items-center justify-center rounded-full
                  text-slate-500 hover:text-slate-900 hover:bg-slate-100
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-indigo-500
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* コンテンツ */}
        <div className={PADDING.card}>{children}</div>
      </div>
    </div>
  );
};

// 確認ダイアログ用のプリセット
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = '確認',
  message,
  confirmText = '実行',
  cancelText = 'キャンセル',
  variant = 'info',
}) => {
  const variantColors = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    info: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
  };

  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} showCloseButton={false}>
      <p className={`${TEXT_SIZE.body} text-slate-700 mb-6`}>{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className={`
            ${PADDING.button} ${TEXT_SIZE.body}
            bg-slate-200 hover:bg-slate-300 text-slate-900
            rounded-lg font-semibold
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
          `}
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          className={`
            ${PADDING.button} ${TEXT_SIZE.body}
            ${variantColors[variant]} text-white
            rounded-lg font-semibold
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2
          `}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};
