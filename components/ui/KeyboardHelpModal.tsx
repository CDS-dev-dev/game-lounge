// キーボードショートカットヘルプモーダル

'use client';

import { useState } from 'react';
import { Button } from './Button';
import { Card, CardContent, CardHeader } from './Card';

interface KeyboardShortcut {
  keys: string[];
  description: string;
}

interface KeyboardHelpModalProps {
  shortcuts: KeyboardShortcut[];
  gameName?: string;
}

export const KeyboardHelpModal: React.FC<KeyboardHelpModalProps> = ({
  shortcuts,
  gameName = 'このゲーム',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40"
        aria-label="キーボード操作ヘルプを開く"
      >
        ⌨️ ヘルプ
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="keyboard-help-title"
        >
          <Card
            className="max-w-md w-full bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <h2 id="keyboard-help-title" className="text-2xl font-bold text-slate-900">
                キーボード操作
              </h2>
              <p className="text-sm text-slate-600 mt-1">{gameName}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {shortcut.keys.map((key, idx) => (
                        <kbd
                          key={idx}
                          className="px-2 py-1 bg-slate-200 border border-slate-300 rounded text-sm font-mono"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                    <span className="text-sm text-slate-700">{shortcut.description}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <Button variant="primary" onClick={() => setIsOpen(false)} className="w-full">
                  閉じる
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
