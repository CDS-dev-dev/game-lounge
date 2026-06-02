'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';

export default function GamesPage() {
  const router = useRouter();

  return (
    <>
      <GameHeader title="ゲーム選択" showBackToHome />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 sm:pt-20 pb-4 px-3 sm:px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">ゲーム選択</h1>
            <p className="text-xs sm:text-sm text-gray-200">遊びたいゲームをタップ</p>
          </div>

        {/* コンパクトなゲームカード：2列配置 */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
          {/* ガイスター */}
          <button
            onClick={() => router.push('/games/geister')}
            className="bg-white/95 rounded-lg p-3 sm:p-4 hover:bg-white transition-all hover:scale-105 active:scale-95"
          >
            <div className="text-3xl sm:text-5xl mb-2">👻</div>
            <h2 className="text-sm sm:text-lg font-bold text-slate-900 mb-1">ガイスター</h2>
            <p className="text-[10px] sm:text-xs text-slate-600">心理戦ゲーム</p>
          </button>

          {/* 立体四目並べ */}
          <button
            onClick={() => router.push('/games/connect4')}
            className="bg-white/95 rounded-lg p-3 sm:p-4 hover:bg-white transition-all hover:scale-105 active:scale-95"
          >
            <div className="text-3xl sm:text-5xl mb-2">🎯</div>
            <h2 className="text-sm sm:text-lg font-bold text-slate-900 mb-1">立体四目並べ</h2>
            <p className="text-[10px] sm:text-xs text-slate-600">3D戦略ゲーム</p>
          </button>

          {/* 中国象棋 */}
          <button
            onClick={() => router.push('/games/xiangqi')}
            className="bg-white/95 rounded-lg p-3 sm:p-4 hover:bg-white transition-all hover:scale-105 active:scale-95"
          >
            <div className="text-3xl sm:text-5xl mb-2">♟️</div>
            <h2 className="text-sm sm:text-lg font-bold text-slate-900 mb-1">中国象棋</h2>
            <p className="text-[10px] sm:text-xs text-slate-600">伝統将棋</p>
          </button>
        </div>

      </div>
    </div>
    </>
  );
}
