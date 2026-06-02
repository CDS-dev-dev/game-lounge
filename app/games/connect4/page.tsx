// 立体四目並べ モード選択ページ

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';
import { GameModeSelector } from '@/components/game/GameModeSelector';
import { TEXT_SIZE, CARD_BG, PADDING } from '@/lib/constants/ui-scale';
import { Box } from 'lucide-react';

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
      <GameHeader
        title="立体四目並べ"
        icon={<Box className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 sm:pt-24 pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className={`${TEXT_SIZE.heading1} font-bold text-white mb-1 sm:mb-2`}>立体四目並べ</h1>
            <p className={`${TEXT_SIZE.label} text-gray-200`}>プレイモードを選択</p>
          </div>

        {/* モード選択 */}
        <GameModeSelector
          gameName="立体四目並べ"
          modes={[
            {
              type: 'online',
              title: 'オンライン',
              emoji: '🌐',
              description: '世界中と対戦',
              href: '/games/connect4/online',
            },
            {
              type: 'local',
              title: 'ローカル',
              emoji: '👥',
              description: '同じ端末で',
              href: '/games/connect4/local',
            },
            {
              type: 'cpu',
              title: 'CPU',
              emoji: '🤖',
              description: '一人で練習',
              href: '/games/connect4/cpu',
            },
          ]}
        />

        {/* ゲーム説明（コンパクト） */}
        <Card className={CARD_BG}>
          <CardContent className={PADDING.card}>
            <p className={`${TEXT_SIZE.label} text-slate-700 mb-2`}>
              🎯 3D空間で4つ揃える戦略ゲーム。縦・横・斜めの全方向で勝利を狙えます。
            </p>
            <Link
              href="/games/connect4/rules"
              className={`${TEXT_SIZE.label} text-indigo-600 hover:text-indigo-500 underline font-semibold`}
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
