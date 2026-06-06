// ゲームモード選択コンポーネント（共通化）

'use client';

import { useRouter } from 'next/navigation';
import { Bot, ChevronRight, Globe2, Users } from 'lucide-react';

export interface GameMode {
  type: 'cpu' | 'local' | 'online';
  title: string;
  emoji?: string;
  description: string;
  href: string;
  disabled?: boolean;
  recommended?: boolean;
}

interface GameModeSelectorProps {
  gameName: string;
  modes: GameMode[];
}

export function GameModeSelector({ gameName, modes }: GameModeSelectorProps) {
  const router = useRouter();
  const modePriority = {
    cpu: 0,
    local: 1,
    online: 2,
  };
  const sortedModes = [...modes].sort((a, b) => {
    if (a.disabled !== b.disabled) return a.disabled ? 1 : -1;
    if (a.recommended !== b.recommended) return a.recommended ? -1 : 1;
    return modePriority[a.type] - modePriority[b.type];
  });

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

  const getModeIcon = (type: string) => {
    switch (type) {
      case 'cpu':
        return <Bot className="h-6 w-6 text-violet-600" aria-hidden="true" />;
      case 'local':
        return <Users className="h-6 w-6 text-emerald-600" aria-hidden="true" />;
      case 'online':
        return <Globe2 className="h-6 w-6 text-sky-600" aria-hidden="true" />;
      default:
        return null;
    }
  };

  return (
    <div className="mb-4 grid gap-3 sm:mb-5 sm:grid-cols-3">
      {sortedModes.map((mode) => {
        const recommended = mode.recommended || (!mode.disabled && mode.type === 'cpu');

        return (
        <button
          key={mode.type}
          type="button"
          onClick={() => !mode.disabled && router.push(mode.href)}
          disabled={mode.disabled}
          aria-label={`${gameName}の${getModeLabel(mode.type)}を開始`}
          aria-disabled={mode.disabled}
          className={`group relative flex min-h-[96px] w-full items-center gap-3 rounded-lg border p-4 text-left shadow-lg transition-transform focus:outline-none focus:ring-4 focus:ring-teal-300 sm:min-h-[164px] sm:flex-col sm:items-start sm:justify-between ${
            recommended
              ? 'border-teal-300 bg-white'
              : 'border-white/10 bg-white/95'
          } ${
            mode.disabled ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-0.5 hover:bg-white'
          }`}
        >
          {recommended && (
            <span className="absolute right-3 top-3 rounded-md bg-teal-600 px-2 py-0.5 text-[11px] font-bold text-white">
              おすすめ
            </span>
          )}
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100">
            {getModeIcon(mode.type)}
          </span>
          <span className="min-w-0 flex-1 sm:flex-none">
            <span className="flex items-center gap-2 text-xs font-semibold text-teal-700">
              {getModeLabel(mode.type)}
              {mode.disabled && (
                <span className="rounded-md bg-neutral-200 px-1.5 py-0.5 text-[11px] font-bold text-neutral-600">
                  準備中
                </span>
              )}
            </span>
            <span className="mt-0.5 block break-keep text-lg font-bold leading-tight text-neutral-950 sm:text-xl">
              {mode.title}
            </span>
            <span className="mt-1 block text-sm leading-5 text-neutral-600">{mode.description}</span>
          </span>
          {!mode.disabled && (
            <ChevronRight className="h-5 w-5 flex-shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5 sm:self-end" aria-hidden="true" />
          )}
        </button>
      )})}
    </div>
  );
}
