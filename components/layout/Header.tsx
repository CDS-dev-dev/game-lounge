// グローバルヘッダーコンポーネント

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Header: React.FC = () => {
  const pathname = usePathname();

  return (
    <header className="bg-slate-900 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* ロゴ・タイトル */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl font-bold text-white">🎮</span>
            <span className="text-xl font-bold text-white">ゲームラウンジ</span>
          </Link>

          {/* ナビゲーション */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/games"
              className={`font-semibold transition-colors ${
                pathname?.startsWith('/games')
                  ? 'text-indigo-400'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              ゲーム選択
            </Link>
            <Link
              href="/"
              className={`font-semibold transition-colors ${
                pathname === '/'
                  ? 'text-indigo-400'
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
              className="text-gray-300 hover:text-white font-semibold"
            >
              ゲーム
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
