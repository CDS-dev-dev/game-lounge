// ゲーム共通ヘッダー（固定表示）

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, LayoutGrid } from 'lucide-react';
import { Z_INDEX } from '@/lib/constants/z-index';

interface GameHeaderProps {
  title?: string;
  showBackToGames?: boolean;
  showBackToHome?: boolean;
  backUrl?: string;
  backLabel?: string;
  icon?: React.ReactNode; // アイコンをオプションで追加
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  title,
  showBackToGames = true,
  showBackToHome = false,
  backUrl,
  backLabel,
  icon,
}) => {
  const router = useRouter();
  const actionClasses =
    'inline-flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-neutral-950 sm:h-11 sm:px-4 sm:text-sm';

  return (
    <header className="fixed top-0 left-0 right-0 bg-neutral-950/95 backdrop-blur-md border-b border-white/10" style={{ zIndex: Z_INDEX.HEADER }}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* 左側：タイトル */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/"
              className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-neutral-950 sm:h-11 sm:w-11"
              aria-label="ホームに戻る"
            >
              <Home className="h-5 w-5" aria-hidden="true" />
            </Link>
            {title && (
              <div className="flex min-w-0 items-center gap-2 font-bold text-white">
                {icon && <span className="flex-shrink-0">{icon}</span>}
                <span className="truncate text-sm leading-tight sm:text-lg">{title}</span>
              </div>
            )}
          </div>

          {/* 右側：ナビゲーションボタン */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {backUrl && backLabel && (
              <button
                type="button"
                onClick={() => router.push(backUrl)}
                aria-label={`${backLabel}に戻る`}
                className={actionClasses}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{backLabel}</span>
              </button>
            )}
            {showBackToGames && (
              <button
                type="button"
                onClick={() => router.push('/games')}
                aria-label="ゲーム選択に戻る"
                className={actionClasses}
              >
                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">ゲーム選択</span>
              </button>
            )}
            {showBackToHome && (
              <button
                type="button"
                onClick={() => router.push('/')}
                aria-label="ホームに戻る"
                className={actionClasses}
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">ホーム</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
