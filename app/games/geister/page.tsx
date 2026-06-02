'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';
import { GameModeSelector } from '@/components/game/GameModeSelector';
import { TEXT_SIZE, CARD_BG, PADDING } from '@/lib/constants/ui-scale';

export default function GeisterModePage() {
  const router = useRouter();

  // 構造化データ（Game）
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name: 'ガイスター',
    alternateName: 'Geister',
    description: 'ドイツ生まれの心理戦ボードゲーム。青いお化けと赤い悪魔を使った頭脳戦。',
    url: 'https://game-lounge-pi.vercel.app/games/geister',
    gamePlatform: 'Web Browser',
    numberOfPlayers: 2,
    gameItem: {
      '@type': 'Thing',
      name: '青いお化けと赤い悪魔',
    },
  };

  return (
    <>
      <Script
        id="geister-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <GameHeader title="ガイスター" />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 sm:pt-24 pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h1 className={`${TEXT_SIZE.heading1} font-bold text-white mb-2`}>ガイスター</h1>
            <p className={`${TEXT_SIZE.label} text-gray-200`}>プレイモードを選択</p>
          </div>

          {/* モード選択（共通コンポーネント使用） */}
          <div className="mb-6">
            <GameModeSelector
              gameName="ガイスター"
              modes={[
                {
                  type: 'online',
                  title: 'オンライン',
                  emoji: '🌐',
                  description: '世界中と対戦',
                  href: '/games/geister/online',
                },
                {
                  type: 'local',
                  title: 'ローカル',
                  emoji: '👥',
                  description: '同じ端末で',
                  href: '/games/geister/local',
                },
                {
                  type: 'cpu',
                  title: 'CPU対戦',
                  emoji: '🤖',
                  description: '一人で練習',
                  href: '/games/geister/cpu',
                },
              ]}
            />
          </div>

          {/* ゲーム説明 */}
          <Card className={CARD_BG}>
            <CardContent className={PADDING.card}>
              <p className={`${TEXT_SIZE.label} text-slate-700 mb-3`}>
                👻と😈を使った心理戦ゲーム。相手の駒の種類は見えません。
              </p>
              <Link
                href="/games/geister/rules"
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
