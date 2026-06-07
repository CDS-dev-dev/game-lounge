// 中国象棋 モード選択ページ

'use client';

import Link from 'next/link';
import Script from 'next/script';
import { Card, CardContent } from '@/components/ui/Card';
import { GameHeader } from '@/components/layout/GameHeader';
import { GameModeSelector } from '@/components/game/GameModeSelector';
import { TEXT_SIZE, CARD_BG, PADDING } from '@/lib/constants/ui-scale';
import { Shield } from 'lucide-react';

export default function XiangqiModePage() {
  // 構造化データ（Game）
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name: '中国象棋',
    alternateName: 'Xiangqi',
    description: '中国伝統の将棋ゲーム。将棋とチェスの要素を併せ持つ奥深い戦略ゲーム。',
    url: 'https://game-lounge-pi.vercel.app/games/xiangqi',
    gamePlatform: 'Web Browser',
    numberOfPlayers: 2,
    gameItem: {
      '@type': 'Thing',
      name: '将・車・馬・炮・象・士・兵',
    },
  };

  return (
    <>
      <Script
        id="xiangqi-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <GameHeader
        title="中国象棋"
        icon={<Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />}
      />
      <div className="min-h-screen app-bg board-pattern pt-16 sm:pt-20 pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className={`${TEXT_SIZE.heading1} font-bold text-white mb-1 sm:mb-2`}>中国象棋</h1>
            <p className={`${TEXT_SIZE.label} text-gray-200`}>プレイモードを選択</p>
          </div>

        {/* モード選択 */}
        <GameModeSelector
          gameName="中国象棋"
          modes={[
            {
              type: 'online',
              title: 'オンライン',
              emoji: '🌐',
              description: '準備中',
              href: '/games/xiangqi/online',
              disabled: true,
            },
            {
              type: 'local',
              title: 'ローカル',
              emoji: '👥',
              description: '同じ端末で',
              href: '/games/xiangqi/local',
            },
            {
              type: 'cpu',
              title: 'CPU',
              emoji: '🤖',
              description: '一人で練習',
              href: '/games/xiangqi/cpu',
            },
          ]}
        />

        {/* ゲーム説明（コンパクト） */}
        <Card className={CARD_BG}>
          <CardContent className={PADDING.card}>
            <p className={`${TEXT_SIZE.label} text-slate-700 mb-2`}>
              ♟️ 中国伝統の将棋ゲーム。楚河漢界の「川」が特徴的な戦略ゲームです。
            </p>
            <Link
              href="/games/xiangqi/rules"
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
