import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { GameHeader } from '@/components/layout/GameHeader';
import { GameModeSelector } from '@/components/game/GameModeSelector';
import { Spade } from 'lucide-react';

export const metadata = {
  title: 'テキサスホールデム | Game Lounge',
  description: 'テキサスホールデムポーカーをプレイ。CPU対戦で練習できます。',
};

export default function TexasHoldemPage() {
  return (
    <div className="min-h-screen app-bg board-pattern px-3 pb-4 pt-14 sm:px-4 sm:pt-20">
      <GameHeader
        title="テキサスホールデム"
        showBackToGames
        icon={<Spade className="h-5 w-5 text-slate-200 sm:h-6 sm:w-6" />}
      />

      <main className="mx-auto max-w-3xl">
        <div className="mb-3 text-center sm:mb-5">
          <h1 className="text-xl font-bold text-white sm:text-3xl">テキサスホールデム</h1>
          <p className="mt-1 text-xs font-semibold text-gray-200 sm:text-sm">手札、ポット、必要コール額を見ながら次の一手を選びます。</p>
        </div>

        <GameModeSelector
          gameName="テキサスホールデム"
          modes={[
            {
              type: 'cpu',
              title: 'CPU対戦',
              description: 'まずはここから',
              href: '/games/texas-holdem/cpu',
            },
            {
              type: 'local',
              title: 'ローカル対戦',
              description: '準備中',
              href: '/games/texas-holdem/local',
              disabled: true,
            },
            {
              type: 'online',
              title: 'オンライン対戦',
              description: '準備中',
              href: '/games/texas-holdem/online',
              disabled: true,
            },
          ]}
        />

        <Card className="border-white/10 bg-white/95">
          <CardContent className="p-3 sm:p-4">
            <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <div className="rounded-md bg-slate-50 p-2">
                <div className="font-bold text-slate-950">見る情報</div>
                <p className="mt-1 text-xs leading-5">ポット、必要コール額、自分のチップ。</p>
              </div>
              <div className="rounded-md bg-slate-50 p-2">
                <div className="font-bold text-slate-950">主操作</div>
                <p className="mt-1 text-xs leading-5">Fold / Call / Raise / All-in。</p>
              </div>
              <Link
                href="/games/texas-holdem/rules"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800"
              >
                ルールを見る
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
