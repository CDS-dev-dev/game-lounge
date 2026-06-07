// インディアンポーカー - モード選択ページ

'use client';

import Link from 'next/link';
import Script from 'next/script';
import { Card, CardContent } from '@/components/ui/Card';
import { GameHeader } from '@/components/layout/GameHeader';
import { GameModeSelector } from '@/components/game/GameModeSelector';
import { TEXT_SIZE, CARD_BG, PADDING } from '@/lib/constants/ui-scale';
import { Gamepad2 } from 'lucide-react';

export default function IndianPokerModePage() {
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
      <GameHeader
        title="インディアンポーカー"
        icon={<Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />}
      />
      <div className="min-h-screen app-bg board-pattern pt-16 sm:pt-20 pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className={`${TEXT_SIZE.heading1} font-bold text-white mb-1 sm:mb-2`}>
              インディアンポーカー
            </h1>
            <p className={`${TEXT_SIZE.label} text-gray-200`}>プレイモードを選択</p>
          </div>

          {/* モード選択 */}
          <GameModeSelector
            gameName="インディアンポーカー"
            modes={[
              {
                type: 'online',
                title: 'オンライン',
                emoji: '🌐',
                description: '準備中',
                href: '/games/indian-poker/online',
                disabled: true,
              },
              {
                type: 'local',
                title: 'ローカル',
                emoji: '👥',
                description: '同じ端末で',
                href: '/games/indian-poker/local',
              },
              {
                type: 'cpu',
                title: 'CPU',
                emoji: '🤖',
                description: '一人で練習',
                href: '/games/indian-poker/cpu',
              },
            ]}
          />

          {/* ゲーム説明（コンパクト） */}
          <Card className={CARD_BG}>
            <CardContent className={PADDING.card}>
              <p className={`${TEXT_SIZE.label} text-slate-700 mb-2`}>
                🃏 自分のカードは見えない！他のプレイヤーのカードから自分の強さを推測してベット。
              </p>
              <Link
                href="/games/indian-poker/rules"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800"
              >
                ルールを見る
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
