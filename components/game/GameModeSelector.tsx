// ゲームモード選択コンポーネント（共通化）

'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CARD_BG, HOVER_SCALE, MIN_TAP_AREA, TEXT_SIZE } from '@/lib/constants/ui-scale';

export interface GameMode {
  type: 'cpu' | 'local' | 'online';
  title: string;
  emoji: string;
  description: string;
  href: string;
  disabled?: boolean;
}

interface GameModeSelectorProps {
  gameName: string;
  modes: GameMode[];
}

export function GameModeSelector({ gameName, modes }: GameModeSelectorProps) {
  const router = useRouter();

  const getModeLabel = (type: string) => {
    switch (type) {
      case 'cpu':
        return 'CPU対戦';
      case 'local':
        return 'ローカル対戦';
      case 'online':
        return 'オンライン対戦';
      default:
        return '';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {modes.map((mode) => (
        <Card
          key={mode.type}
          className={`${CARD_BG} ${mode.disabled ? 'opacity-60' : HOVER_SCALE}`}
        >
          <button
            onClick={() => !mode.disabled && router.push(mode.href)}
            disabled={mode.disabled}
            aria-label={`${gameName}の${getModeLabel(mode.type)}を開始`}
            aria-disabled={mode.disabled}
            className={`w-full text-center ${MIN_TAP_AREA} flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${mode.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="text-2xl sm:text-4xl mb-2" role="img" aria-hidden="true">
              {mode.emoji}
            </div>
            <h2 className={`${TEXT_SIZE.title} font-bold text-slate-900 mb-1`}>
              {mode.title}
            </h2>
            <p className={`${TEXT_SIZE.caption} text-slate-600`}>
              {mode.description}
            </p>
          </button>
        </Card>
      ))}
    </div>
  );
}
