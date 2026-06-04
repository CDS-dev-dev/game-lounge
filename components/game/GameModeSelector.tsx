// ゲームモード選択コンポーネント（共通化）

'use client';

import { useRouter } from 'next/navigation';
import { Bot, ChevronRight, Globe2, Users } from 'lucide-react';

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
      {modes.map((mode) => (
        <button
          key={mode.type}
          type="button"
          onClick={() => !mode.disabled && router.push(mode.href)}
          disabled={mode.disabled}
          aria-label={`${gameName}の${getModeLabel(mode.type)}を開始`}
          aria-disabled={mode.disabled}
          className={`group flex min-h-[92px] w-full items-center gap-3 rounded-lg border border-white/10 bg-white/95 p-4 text-left shadow-lg transition-transform focus:outline-none focus:ring-4 focus:ring-teal-300 sm:min-h-[156px] sm:flex-col sm:items-start sm:justify-between ${
            mode.disabled ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-0.5 hover:bg-white'
          }`}
        >
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
      ))}
    </div>
  );
}
