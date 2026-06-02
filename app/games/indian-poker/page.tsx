// インディアンポーカー - モード選択ページ

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { Card, CardContent } from '@/components/ui/Card';
import { GameHeader } from '@/components/layout/GameHeader';

export default function IndianPokerModePage() {
  const router = useRouter();

  // 構造化データ（Game）
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name: 'インディアンポーカー',
    alternateName: 'Indian Poker',
    description: '自分のカードが見えない心理戦カードゲーム。他のプレイヤーのカードから自分のカードを推測してベット。',
    url: 'https://game-lounge-pi.vercel.app/games/indian-poker',
    gamePlatform: 'Web Browser',
    numberOfPlayers: {
      '@type': 'QuantitativeValue',
      minValue: 2,
      maxValue: 10,
    },
    gameItem: {
      '@type': 'Thing',
      name: 'トランプカード',
    },
  };

  return (
    <>
      <Script
        id="indian-poker-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <GameHeader title="インディアンポーカー" />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 sm:pt-20 pb-4 px-3 sm:px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
              インディアンポーカー
            </h1>
            <p className="text-xs sm:text-sm text-gray-200">プレイモードを選択</p>
          </div>

          {/* コンパクトなモード選択：3列配置 */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
            {/* オンライン対戦 */}
            <button
              onClick={() => router.push('/games/indian-poker/online')}
              className="bg-white/95 rounded-lg p-3 sm:p-4 hover:bg-white transition-all hover:scale-105 active:scale-95 border-2 border-indigo-500"
            >
              <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">🌐</div>
              <h2 className="text-xs sm:text-base font-bold text-slate-900 mb-0.5 sm:mb-1">
                オンライン
              </h2>
              <p className="text-[9px] sm:text-xs text-slate-600">世界中と対戦</p>
            </button>

            {/* ローカル対戦 */}
            <button
              onClick={() => router.push('/games/indian-poker/local')}
              className="bg-white/95 rounded-lg p-3 sm:p-4 hover:bg-white transition-all hover:scale-105 active:scale-95"
            >
              <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">👥</div>
              <h2 className="text-xs sm:text-base font-bold text-slate-900 mb-0.5 sm:mb-1">
                ローカル
              </h2>
              <p className="text-[9px] sm:text-xs text-slate-600">同じ端末で</p>
            </button>

            {/* CPU対戦 */}
            <button
              onClick={() => router.push('/games/indian-poker/cpu')}
              className="bg-white/95 rounded-lg p-3 sm:p-4 hover:bg-white transition-all hover:scale-105 active:scale-95"
            >
              <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">🤖</div>
              <h2 className="text-xs sm:text-base font-bold text-slate-900 mb-0.5 sm:mb-1">
                CPU
              </h2>
              <p className="text-[9px] sm:text-xs text-slate-600">一人で練習</p>
            </button>
          </div>

          {/* ゲーム説明（コンパクト） */}
          <Card className="bg-white/95">
            <CardContent className="py-2 sm:py-3 px-3 sm:px-4">
              <p className="text-xs sm:text-sm text-slate-700 mb-2">
                🃏 自分のカードは見えない！他のプレイヤーのカードから自分の強さを推測してベット。
              </p>
              <Link
                href="/games/indian-poker/rules"
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
