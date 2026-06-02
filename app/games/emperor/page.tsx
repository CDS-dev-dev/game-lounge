'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { GameHeader } from '@/components/layout/GameHeader';

export default function EmperorGamePage() {
  const router = useRouter();

  return (
    <>
      <GameHeader title="エンペラーゲーム" />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 sm:pt-20 pb-4 px-3 sm:px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">エンペラーゲーム</h1>
            <p className="text-xs sm:text-sm text-gray-200">プレイモードを選択</p>
          </div>

          {/* コンパクトなモード選択：3列配置 */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
            {/* オンライン対戦 */}
            <button
              onClick={() => router.push('/games/emperor/online')}
              className="bg-white/95 rounded-lg p-3 sm:p-4 hover:bg-white transition-all hover:scale-105 active:scale-95 border-2 border-indigo-500"
            >
              <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">🌐</div>
              <h2 className="text-xs sm:text-base font-bold text-slate-900 mb-0.5 sm:mb-1">オンライン</h2>
              <p className="text-[9px] sm:text-xs text-slate-600">マッチング対戦</p>
            </button>

            {/* ローカル対戦 */}
            <button
              onClick={() => router.push('/games/emperor/local')}
              className="bg-white/95 rounded-lg p-3 sm:p-4 hover:bg-white transition-all hover:scale-105 active:scale-95"
            >
              <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">👥</div>
              <h2 className="text-xs sm:text-base font-bold text-slate-900 mb-0.5 sm:mb-1">ローカル</h2>
              <p className="text-[9px] sm:text-xs text-slate-600">同じ端末で</p>
            </button>

            {/* CPU対戦 */}
            <button
              onClick={() => router.push('/games/emperor/cpu')}
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
                <strong>階級制心理戦ゲーム</strong> - 皇帝・市民・奴隷の3階級でコインを奪い合う運と心理戦のゲーム
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-yellow-50 p-2 rounded">
                  <div className="text-lg">👑</div>
                  <div className="font-bold text-yellow-700">皇帝（K）</div>
                  <div className="text-[10px] text-gray-600">+3コイン</div>
                </div>
                <div className="bg-blue-50 p-2 rounded">
                  <div className="text-lg">🧑</div>
                  <div className="font-bold text-blue-700">市民（Q）</div>
                  <div className="text-[10px] text-gray-600">±0コイン</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-lg">⛓️</div>
                  <div className="font-bold text-gray-700">奴隷（J）</div>
                  <div className="text-[10px] text-gray-600">-3コイン</div>
                </div>
              </div>
              <div className="mt-2 text-center">
                <Link
                  href="/games/emperor/rules"
                  className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 underline"
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
