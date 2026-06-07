// グローバルヘッダーコンポーネント

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const isGameExperience = pathname?.startsWith('/games') || pathname?.startsWith('/play') || pathname?.startsWith('/setup');

  if (isGameExperience) {
    return null;
  }

  return (
    <header className="bg-neutral-950 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* ロゴ・タイトル */}
          <Link href="/" className="flex min-h-11 items-center gap-2 rounded-lg hover:opacity-85 transition-opacity focus:outline-none focus:ring-4 focus:ring-teal-300">
            <span className="text-2xl font-bold text-white" aria-hidden="true">🎮</span>
            <span className="text-lg sm:text-xl font-bold text-white tracking-normal">ゲームラウンジ</span>
          </Link>

          {/* ナビゲーション */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/games"
              className={`inline-flex min-h-11 items-center rounded-lg px-3 font-semibold transition-colors ${
                pathname?.startsWith('/games')
                  ? 'text-teal-300'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              ゲーム選択
            </Link>
            <Link
              href="/"
              className={`inline-flex min-h-11 items-center rounded-lg px-3 font-semibold transition-colors ${
                pathname === '/'
                  ? 'text-teal-300'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              ホーム
            </Link>
          </nav>

          {/* モバイルメニュー（シンプル版） */}
          <div className="md:hidden">
            <Link
              href="/games"
              className="min-h-11 inline-flex items-center rounded-lg border border-white/15 px-3 text-sm font-semibold text-gray-100 hover:bg-white/10"
            >
              ゲーム
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
