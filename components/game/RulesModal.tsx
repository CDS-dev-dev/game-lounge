'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface RulesModalProps {
  gameName: string;
  children: React.ReactNode;
}

export const RulesModal: React.FC<RulesModalProps> = ({ gameName, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  // ESCキーで閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
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
  }, [isOpen]);

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setIsOpen(true)}
        aria-label={`${gameName}のルールを見る`}
        className="text-xs sm:text-sm"
      >
        📖 ルールを見る
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="rules-modal-title"
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-4 flex justify-between items-center">
              <h2 id="rules-modal-title" className="text-lg sm:text-xl font-bold text-slate-900">
                {gameName} - ルール
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-600 hover:text-slate-900 text-2xl sm:text-3xl leading-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
                aria-label="ルールモーダルを閉じる"
              >
                ×
              </button>
            </div>
            <div className="p-3 sm:p-6">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
