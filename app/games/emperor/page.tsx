'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { GameHeader } from '@/components/layout/GameHeader';
import { GameModeSelector } from '@/components/game/GameModeSelector';
import { Crown } from 'lucide-react';

export default function EmperorPage() {
  return (
    <div className="min-h-screen app-bg board-pattern px-3 pb-4 pt-14 sm:px-4 sm:pt-20">
      <GameHeader
        title="エンペラー"
        icon={<Crown className="h-5 w-5 text-yellow-400 sm:h-6 sm:w-6" />}
      />
      <main className="mx-auto max-w-3xl">
        <div className="mb-3 text-center sm:mb-5">
          <h1 className="text-xl font-bold text-white sm:text-3xl">エンペラー</h1>
          <p className="mt-1 text-xs font-semibold text-gray-200 sm:text-sm">皇帝、市民、奴隷の三すくみを読み切る短期心理戦。</p>
        </div>

        <GameModeSelector
          gameName="エンペラー"
          modes={[
            {
              type: 'cpu',
              title: 'CPU対戦',
              description: '1対1ですぐ開始',
              href: '/games/emperor/cpu',
            },
            {
              type: 'local',
              title: 'ローカル対戦',
              description: '準備中',
              href: '/games/emperor/local',
              disabled: true,
            },
            {
              type: 'online',
              title: 'オンライン対戦',
              description: '準備中',
              href: '/games/emperor/online',
              disabled: true,
            },
          ]}
        />

        <Card className="border-white/10 bg-white/95">
          <CardContent className="grid gap-2 p-3 text-sm sm:grid-cols-[1fr_auto] sm:p-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                ['皇帝', '市民に勝つ'],
                ['市民', '奴隷に勝つ'],
                ['奴隷', '皇帝に勝つ'],
              ].map(([name, note]) => (
                <div key={name} className="rounded-md border border-slate-200 bg-slate-50 p-2 text-center">
                  <div className="font-bold text-slate-950">{name}</div>
                  <div className="mt-1 text-xs text-slate-600">{note}</div>
                </div>
              ))}
            </div>
            <Link
              href="/games/emperor/rules"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800"
            >
              詳細ルールを見る
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
