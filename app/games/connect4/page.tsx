// 立体四目並べ モード選択ページ

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';

export default function Connect4ModePage() {
  const router = useRouter();

  // 構造化データ（Game）
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name: '立体四目並べ',
    alternateName: '3D Connect Four',
    description: '3次元空間で展開される四目並べ。縦・横・斜め全てのラインで4つ揃えを目指す立体パズルゲーム。',
    url: 'https://game-lounge-pi.vercel.app/games/connect4',
    gamePlatform: 'Web Browser',
    numberOfPlayers: 2,
    gameItem: {
      '@type': 'Thing',
      name: '4x4x4の立体グリッド',
    },
  };

  return (
    <>
      <Script
        id="connect4-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <GameHeader title="立体四目並べ" />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 sm:pt-20 pb-4 px-3 sm:px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">立体四目並べ</h1>
            <p className="text-xs sm:text-sm text-gray-200">プレイモードを選択</p>
          </div>

        {/* コンパクトなモード選択：3列配置 */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
          {/* オンライン対戦 */}
          <button
            onClick={() => router.push('/games/connect4/online')}
            className="bg-white/95 rounded-lg p-3 sm:p-4 hover:bg-white transition-all hover:scale-105 active:scale-95 border-2 border-indigo-500"
          >
            <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">🌐</div>
            <h2 className="text-xs sm:text-base font-bold text-slate-900 mb-0.5 sm:mb-1">オンライン</h2>
            <p className="text-[9px] sm:text-xs text-slate-600">世界中と対戦</p>
          </button>

          {/* ローカル対戦 */}
          <button
            onClick={() => router.push('/games/connect4/local')}
            className="bg-white/95 rounded-lg p-3 sm:p-4 hover:bg-white transition-all hover:scale-105 active:scale-95"
          >
            <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">👥</div>
            <h2 className="text-xs sm:text-base font-bold text-slate-900 mb-0.5 sm:mb-1">ローカル</h2>
            <p className="text-[9px] sm:text-xs text-slate-600">同じ端末で</p>
          </button>

          {/* CPU対戦 */}
          <button
            onClick={() => router.push('/games/connect4/cpu')}
            className="bg-white/95 rounded-lg p-3 sm:p-4 hover:bg-white transition-all hover:scale-105 active:scale-95"
          >
            <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">🤖</div>
            <h2 className="text-xs sm:text-base font-bold text-slate-900 mb-0.5 sm:mb-1">CPU</h2>
            <p className="text-[9px] sm:text-xs text-slate-600">一人で練習</p>
          </button>
        </div>

        {/* ゲーム説明（コンパクト） */}
        <Card className="bg-white/95">
          <CardContent className="py-2 sm:py-3 px-3 sm:px-4">
            <p className="text-xs sm:text-sm text-slate-700 mb-2">
              🎯 3D空間で4つ揃える戦略ゲーム。縦・横・斜めの全方向で勝利を狙えます。
            </p>
            <Link
              href="/games/connect4/rules"
              className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-500 underline font-semibold"
            >
              ルールを見る →
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
    </>
  );
}
