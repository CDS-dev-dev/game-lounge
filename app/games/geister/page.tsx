'use client';

import Script from 'next/script';
import { GameHeader } from '@/components/layout/GameHeader';
import { GameModeSelector } from '@/components/game/GameModeSelector';
import { TEXT_SIZE } from '@/lib/constants/ui-scale';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { Ghost, ShieldQuestion, Sparkles, Trophy } from 'lucide-react';

export default function GeisterModePage() {
  const onlineReady = isSupabaseConfigured();

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
      <GameHeader
        title="ガイスター"
        icon={<Ghost className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />}
      />
      <div className="min-h-screen app-bg board-pattern px-3 pb-4 pt-14 sm:px-4 sm:pt-20">
        <div className="mx-auto max-w-4xl">
          <section className="mb-3 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end sm:mb-5">
            <div>
              <p className="text-sm font-semibold text-indigo-200">Geister</p>
              <h1 className={`${TEXT_SIZE.heading1} mt-1 font-bold text-white`}>ガイスター</h1>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-gray-200 sm:mt-3 sm:text-base sm:leading-6">
                見えているのは自分の駒だけ。相手の青と赤を読み切る心理戦です。
              </p>
            </div>
            <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-white/10 bg-white/10 p-1.5 text-center text-[11px] font-semibold text-white sm:gap-2 sm:p-2 sm:text-xs">
              <span className="rounded-md bg-white/10 px-1.5 py-1.5 sm:px-2 sm:py-2"><ShieldQuestion className="mx-auto mb-0.5 h-4 w-4" />読み合い</span>
              <span className="rounded-md bg-white/10 px-1.5 py-1.5 sm:px-2 sm:py-2"><Sparkles className="mx-auto mb-0.5 h-4 w-4" />短期決着</span>
              <span className="rounded-md bg-white/10 px-1.5 py-1.5 sm:px-2 sm:py-2"><Trophy className="mx-auto mb-0.5 h-4 w-4" />脱出勝利</span>
            </div>
          </section>

          <div className="mb-3 sm:mb-5">
            <GameModeSelector
              gameName="ガイスター"
              modes={[
                {
                  type: 'cpu',
                  title: 'CPU対戦',
                  description: '一人で練習',
                  href: '/games/geister/cpu',
                  recommended: true,
                },
                {
                  type: 'online',
                  title: 'オンライン',
                  description: onlineReady ? '世界中と対戦' : '準備中',
                  href: '/games/geister/online',
                  disabled: !onlineReady,
                },
                {
                  type: 'local',
                  title: 'ローカル',
                  description: '同じ端末で',
                  href: '/games/geister/local',
                },
              ]}
            />
          </div>

          <section className="grid gap-2 text-xs text-slate-700 sm:grid-cols-3 sm:text-sm">
            <div className="rounded-lg bg-white/95 p-3 sm:p-4">
              <p className="font-bold text-slate-950">青いお化け</p>
              <p className="mt-1 leading-5 sm:leading-6">脱出させると勝ち。全部取られると負け。</p>
            </div>
            <div className="rounded-lg bg-white/95 p-3 sm:p-4">
              <p className="font-bold text-slate-950">赤い悪魔</p>
              <p className="mt-1 leading-5 sm:leading-6">相手に全部取らせると勝ち。</p>
            </div>
            <a href="/games/geister/rules" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white/95 p-3 font-bold text-indigo-700 hover:bg-white sm:p-4">
              ルールを見る
            </a>
          </section>
        </div>
      </div>
    </>
  );
}
