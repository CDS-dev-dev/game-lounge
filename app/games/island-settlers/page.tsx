'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { GameHeader } from '@/components/layout/GameHeader';
import { GameModeSelector } from '@/components/game/GameModeSelector';
import { Palmtree } from 'lucide-react';

export default function IslandSettlersPage() {
  return (
    <div className="min-h-screen app-bg board-pattern px-3 pb-4 pt-14 sm:px-4 sm:pt-20">
      <GameHeader
        title="アイランドセトラーズ"
        icon={<Palmtree className="h-5 w-5 text-green-400 sm:h-6 sm:w-6" />}
      />

      <main className="mx-auto max-w-3xl">
        <div className="mb-3 text-center sm:mb-5">
          <h1 className="text-xl font-bold text-white sm:text-3xl">アイランドセトラーズ</h1>
          <p className="mt-1 text-xs font-semibold text-gray-200 sm:text-sm">資源、建設、得点を見ながら島を広げます。</p>
        </div>

        <GameModeSelector
          gameName="アイランドセトラーズ"
          modes={[
            {
              type: 'cpu',
              title: 'CPU対戦',
              description: 'AIと対戦',
              href: '/games/island-settlers/cpu',
            },
            {
              type: 'local',
              title: 'ローカル対戦',
              description: '同じ端末で',
              href: '/games/island-settlers/local',
            },
            {
              type: 'online',
              title: 'オンライン対戦',
              description: '準備中',
              href: '/games/island-settlers/online',
              disabled: true,
            },
          ]}
        />

        <Card className="border-white/10 bg-white/95">
          <CardContent className="grid gap-2 p-3 text-sm sm:grid-cols-[1fr_auto] sm:p-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ['森林', '木材'],
                ['山岳', '石材'],
                ['平原', '食料'],
                ['水域', '金'],
              ].map(([land, resource]) => (
                <div key={land} className="rounded-md border border-slate-200 bg-slate-50 p-2 text-center">
                  <div className="font-bold text-slate-950">{land}</div>
                  <div className="mt-1 text-xs text-slate-600">{resource}</div>
                </div>
              ))}
            </div>
            <Link
              href="/games/island-settlers/rules"
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
