'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';
import { TEXT_SIZE, CARD_BG, HOVER_SCALE, MIN_TAP_AREA, PADDING, RESPONSIVE_SPACING } from '@/lib/constants/ui-scale';
import { Ghost, Box, Crown, Palmtree, Spade, Flame, Gamepad2 } from 'lucide-react';

export default function GamesPage() {
  const router = useRouter();

  return (
    <>
      <GameHeader title="ゲーム選択" showBackToHome />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 sm:pt-24 pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h1 className={`${TEXT_SIZE.heading1} font-bold text-white mb-2`}>ゲーム選択</h1>
            <p className={`${TEXT_SIZE.label} text-gray-200`}>遊びたいゲームをタップ</p>
          </div>

          {/* ゲームカード：2列配置 */}
          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 ${RESPONSIVE_SPACING.sm} max-w-4xl mx-auto`}>
          {/* ガイスター */}
          <button
            onClick={() => router.push('/games/geister')}
            className={`${CARD_BG} rounded-lg ${PADDING.sm} ${HOVER_SCALE} ${MIN_TAP_AREA} flex flex-col items-center justify-center`}
            aria-label="ガイスターを選択"
          >
            <Ghost className="w-12 h-12 sm:w-16 sm:h-16 mb-2 text-indigo-600" aria-hidden="true" />
            <h2 className={`${TEXT_SIZE.title} font-bold text-slate-900 mb-1`}>ガイスター</h2>
            <p className={`${TEXT_SIZE.caption} text-slate-600`}>心理戦ゲーム</p>
          </button>

          {/* 立体四目並べ */}
          <button
            onClick={() => router.push('/games/connect4')}
            aria-label="立体四目並べを選択"
            className={`${CARD_BG} rounded-lg ${PADDING.sm} ${HOVER_SCALE} ${MIN_TAP_AREA} flex flex-col items-center justify-center`}
          >
            <Box className="w-12 h-12 sm:w-16 sm:h-16 mb-2 text-blue-600" aria-hidden="true" />
            <h2 className={`${TEXT_SIZE.title} font-bold text-slate-900 mb-1`}>立体四目並べ</h2>
            <p className={`${TEXT_SIZE.caption} text-slate-600`}>3D戦略ゲーム</p>
          </button>

          {/* 中国象棋 */}
          <button
            onClick={() => router.push('/games/xiangqi')}
            aria-label="中国象棋を選択"
            className={`${CARD_BG} rounded-lg ${PADDING.sm} ${HOVER_SCALE} ${MIN_TAP_AREA} flex flex-col items-center justify-center`}
          >
            <div className="text-3xl sm:text-5xl mb-2" role="img" aria-hidden="true">♟️</div>
            <h2 className={`${TEXT_SIZE.title} font-bold text-slate-900 mb-1`}>中国象棋</h2>
            <p className={`${TEXT_SIZE.caption} text-slate-600`}>伝統将棋</p>
          </button>

          {/* エンペラーゲーム */}
          <button
            onClick={() => router.push('/games/emperor')}
            aria-label="エンペラーゲームを選択"
            className={`${CARD_BG} rounded-lg ${PADDING.sm} ${HOVER_SCALE} ${MIN_TAP_AREA} flex flex-col items-center justify-center`}
          >
            <Crown className="w-12 h-12 sm:w-16 sm:h-16 mb-2 text-yellow-600" aria-hidden="true" />
            <h2 className={`${TEXT_SIZE.title} font-bold text-slate-900 mb-1`}>エンペラー</h2>
            <p className={`${TEXT_SIZE.caption} text-slate-600`}>カイジ心理戦</p>
          </button>

          {/* アイランドセトラーズ */}
          <button
            onClick={() => router.push('/games/island-settlers')}
            aria-label="アイランドセトラーズを選択"
            className={`${CARD_BG} rounded-lg ${PADDING.sm} ${HOVER_SCALE} ${MIN_TAP_AREA} flex flex-col items-center justify-center`}
          >
            <Palmtree className="w-12 h-12 sm:w-16 sm:h-16 mb-2 text-green-600" aria-hidden="true" />
            <h2 className={`${TEXT_SIZE.title} font-bold text-slate-900 mb-1`}>アイランドセトラーズ</h2>
            <p className={`${TEXT_SIZE.caption} text-slate-600`}>開拓戦略ゲーム</p>
          </button>

          {/* テキサスホールデム */}
          <button
            onClick={() => router.push('/games/texas-holdem')}
            aria-label="テキサスホールデムを選択"
            className={`${CARD_BG} rounded-lg ${PADDING.sm} ${HOVER_SCALE} ${MIN_TAP_AREA} flex flex-col items-center justify-center`}
          >
            <Spade className="w-12 h-12 sm:w-16 sm:h-16 mb-2 text-slate-900" aria-hidden="true" />
            <h2 className={`${TEXT_SIZE.title} font-bold text-slate-900 mb-1`}>テキサスホールデム</h2>
            <p className={`${TEXT_SIZE.caption} text-slate-600`}>ポーカー</p>
          </button>

          {/* タイガー&ドラゴン */}
          <button
            onClick={() => router.push('/games/tiger-dragon')}
            aria-label="タイガー&ドラゴンを選択"
            className={`${CARD_BG} rounded-lg ${PADDING.sm} ${HOVER_SCALE} ${MIN_TAP_AREA} flex flex-col items-center justify-center`}
          >
            <Flame className="w-12 h-12 sm:w-16 sm:h-16 mb-2 text-orange-600" aria-hidden="true" />
            <h2 className={`${TEXT_SIZE.title} font-bold text-slate-900 mb-1`}>タイガー&ドラゴン</h2>
            <p className={`${TEXT_SIZE.caption} text-slate-600`}>攻めと受けの牌ゲーム</p>
          </button>

          {/* インディアンポーカー */}
          <button
            onClick={() => router.push('/games/indian-poker')}
            aria-label="インディアンポーカーを選択"
            className={`${CARD_BG} rounded-lg ${PADDING.sm} ${HOVER_SCALE} ${MIN_TAP_AREA} flex flex-col items-center justify-center`}
          >
            <Gamepad2 className="w-12 h-12 sm:w-16 sm:h-16 mb-2 text-purple-600" aria-hidden="true" />
            <h2 className={`${TEXT_SIZE.title} font-bold text-slate-900 mb-1`}>インディアンポーカー</h2>
            <p className={`${TEXT_SIZE.caption} text-slate-600`}>自分のカードが見えない心理戦</p>
          </button>
        </div>

      </div>
    </div>
    </>
  );
}
