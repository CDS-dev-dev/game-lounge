'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { GameHeader } from '@/components/layout/GameHeader';
import { GameModeSelector } from '@/components/game/GameModeSelector';
import { TEXT_SIZE, CARD_BG, PADDING } from '@/lib/constants/ui-scale';
import { Flame } from 'lucide-react';

export default function TigerDragonGamePage() {
  const router = useRouter();

  return (
    <>
      <GameHeader
        title="タイガー&ドラゴン"
        icon={<Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 sm:pt-24 pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className={`${TEXT_SIZE.heading1} font-bold text-white mb-1 sm:mb-2`}>タイガー&ドラゴン 🐯🐉</h1>
            <p className={`${TEXT_SIZE.label} text-gray-200`}>プレイモードを選択</p>
          </div>

          {/* モード選択 */}
          <GameModeSelector
            gameName="タイガー&ドラゴン"
            modes={[
              {
                type: 'online',
                title: 'オンライン',
                emoji: '🌐',
                description: '準備中',
                href: '/games/tiger-dragon/online',
                disabled: true,
              },
              {
                type: 'local',
                title: 'ローカル',
                emoji: '👥',
                description: '同じ端末で',
                href: '/games/tiger-dragon/local',
              },
              {
                type: 'cpu',
                title: 'CPU',
                emoji: '🤖',
                description: '一人で練習',
                href: '/games/tiger-dragon/cpu',
              },
            ]}
          />

          {/* ゲーム説明（コンパクト） */}
          <Card className={CARD_BG}>
            <CardContent className={PADDING.card}>
              <p className={`${TEXT_SIZE.label} text-slate-700 mb-2`}>
                <strong>攻めと受けの牌ゲーム</strong> - ごいた系ゲームで手牌を出し切って勝利を目指す
              </p>
              <div className={`grid grid-cols-2 gap-2 ${TEXT_SIZE.caption}`}>
                <div className="bg-blue-50 p-2 rounded">
                  <div className="font-bold text-blue-700">⚔️ 攻め</div>
                  <div className={`${TEXT_SIZE.caption} text-gray-600`}>1枚出して攻撃</div>
                </div>
                <div className="bg-red-50 p-2 rounded">
                  <div className="font-bold text-red-700">🛡️ 受け</div>
                  <div className={`${TEXT_SIZE.caption} text-gray-600`}>同じ数字で受ける</div>
                </div>
                <div className="bg-orange-50 p-2 rounded">
                  <div className="font-bold text-orange-700">🐯 タイガー奥義</div>
                  <div className={`${TEXT_SIZE.caption} text-gray-600`}>偶数全対応</div>
                </div>
                <div className="bg-purple-50 p-2 rounded">
                  <div className="font-bold text-purple-700">🐉 ドラゴン奥義</div>
                  <div className={`${TEXT_SIZE.caption} text-gray-600`}>奇数全対応</div>
                </div>
              </div>
              <div className="mt-2 text-center">
                <Link
                  href="/games/tiger-dragon/rules"
                  className={`${TEXT_SIZE.label} text-indigo-600 hover:text-indigo-800 underline`}
                >
                  詳しいルールを見る
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 戻るボタン */}
          <div className="mt-3 sm:mt-4 text-center">
            <Link
              href="/games"
              className="text-xs sm:text-sm text-gray-300 hover:text-white underline"
            >
              ← ゲーム選択に戻る
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
