// ゲーム共通ヘッダー（固定表示）

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { TEXT_SIZE, MIN_TAP_AREA } from '@/lib/constants/ui-scale';
import { Z_INDEX } from '@/lib/constants/z-index';

interface GameHeaderProps {
  title?: string;
  showBackToGames?: boolean;
  showBackToHome?: boolean;
  backUrl?: string;
  backLabel?: string;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  title,
  showBackToGames = true,
  showBackToHome = false,
  backUrl,
  backLabel,
}) => {
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700" style={{ zIndex: Z_INDEX.HEADER }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          {/* 左側：タイトル */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/"
              className="text-white hover:text-gray-300 transition-colors flex-shrink-0"
              aria-label="ホームに戻る"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </Link>
            {title && (
              <h1 className={`${TEXT_SIZE.body} sm:${TEXT_SIZE.heading3} font-bold text-white line-clamp-1`}>
                {title}
              </h1>
            )}
          </div>

          {/* 右側：ナビゲーションボタン */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {backUrl && backLabel && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(backUrl)}
                aria-label={`${backLabel}に戻る`}
                className={`${TEXT_SIZE.label} whitespace-nowrap ${MIN_TAP_AREA}`}
              >
                {backLabel}
              </Button>
            )}
            {showBackToGames && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/games')}
                aria-label="ゲーム選択に戻る"
                className={`${TEXT_SIZE.label} whitespace-nowrap ${MIN_TAP_AREA}`}
              >
                ゲーム選択
              </Button>
            )}
            {showBackToHome && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/')}
                aria-label="ホームに戻る"
                className={`${TEXT_SIZE.label} whitespace-nowrap ${MIN_TAP_AREA}`}
              >
                ホーム
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
