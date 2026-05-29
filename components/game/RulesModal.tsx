'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface RulesModalProps {
  gameName: string;
  children: React.ReactNode;
}

export const RulesModal: React.FC<RulesModalProps> = ({ gameName, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setIsOpen(true)}
        className="text-xs sm:text-sm"
      >
        📖 ルールを見る
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-4 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">{gameName} - ルール</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-600 hover:text-slate-900 text-2xl sm:text-3xl leading-none"
                aria-label="閉じる"
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
