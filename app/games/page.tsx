'use client';

import { useRouter } from 'next/navigation';
import { GameHeader } from '@/components/layout/GameHeader';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { Bot, Box, Crown, Flame, Gamepad2, Ghost, Globe2, Palmtree, Spade, Users } from 'lucide-react';

const games = [
  {
    href: '/games/geister',
    title: 'ガイスター',
    genre: '心理戦',
    description: '見えない駒の正体を読み合う、短時間で濃い駆け引き。',
    modes: ['オンライン', 'ローカル', 'CPU'],
    primaryMode: 'CPU',
    Icon: Ghost,
    accent: 'text-indigo-500',
  },
  {
    href: '/games/connect4',
    title: '立体四目並べ',
    genre: '3D戦略',
    description: '4×4×4の空間でラインを作る、立体的な四目並べ。',
    modes: ['ローカル', 'CPU'],
    primaryMode: 'CPU',
    Icon: Box,
    accent: 'text-sky-500',
  },
  {
    href: '/games/xiangqi',
    title: '中国象棋',
    genre: '伝統将棋',
    description: '中国伝統の将棋。広い盤面で相手の将を追い詰めます。',
    modes: ['ローカル', 'CPU'],
    primaryMode: 'CPU',
    Icon: Crown,
    accent: 'text-rose-500',
  },
  {
    href: '/games/emperor',
    title: 'エンペラー',
    genre: '心理戦',
    description: '皇帝・市民・奴隷の読み合いで勝負するカードゲーム。',
    modes: ['CPU'],
    primaryMode: 'CPU',
    Icon: Crown,
    accent: 'text-amber-500',
  },
  {
    href: '/games/island-settlers',
    title: 'アイランドセトラーズ',
    genre: '開拓戦略',
    description: '資源を集め、道と町を広げて島の支配を競います。',
    modes: ['ローカル', 'CPU'],
    primaryMode: 'CPU',
    Icon: Palmtree,
    accent: 'text-emerald-500',
  },
  {
    href: '/games/texas-holdem',
    title: 'テキサスホールデム',
    genre: 'ポーカー',
    description: '共通カードを使って手役とベットで勝負します。',
    modes: ['CPU'],
    primaryMode: 'CPU',
    Icon: Spade,
    accent: 'text-neutral-800',
  },
  {
    href: '/games/tiger-dragon',
    title: 'タイガー&ドラゴン',
    genre: '牌ゲーム',
    description: '攻めと受けを切り替えながら手牌を読み合います。',
    modes: ['ローカル', 'CPU'],
    primaryMode: 'CPU',
    Icon: Flame,
    accent: 'text-orange-500',
  },
  {
    href: '/games/indian-poker',
    title: 'インディアンポーカー',
    genre: '心理戦',
    description: '自分だけカードが見えない状態で相手の反応を読みます。',
    modes: ['ローカル', 'CPU'],
    primaryMode: 'CPU',
    Icon: Gamepad2,
    accent: 'text-purple-500',
  },
];

export default function GamesPage() {
  const router = useRouter();
  const onlineReady = isSupabaseConfigured();
  const visibleGames = games.map((game) =>
    game.href === '/games/geister' && !onlineReady
      ? { ...game, modes: ['ローカル', 'CPU'] }
      : game
  );

  const modeHref = (href: string, mode: string) => {
    if (mode === 'オンライン') return `${href}/online`;
    if (mode === 'ローカル') return `${href}/local`;
    return `${href}/cpu`;
  };

  return (
    <>
      <GameHeader title="ゲーム選択" showBackToGames={false} />
      <div className="app-bg board-pattern min-h-screen px-4 pb-8 pt-16 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <section className="mb-6 sm:mb-8">
            <p className="text-sm font-semibold text-teal-200">Game Lounge</p>
            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">ゲームを選ぶ</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-200 sm:text-base">
              CPUで軽く始めるか、同じ端末で対戦するか。遊び方から直接入れます。
            </p>
          </section>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {visibleGames.map(({ href, title, genre, description, modes, primaryMode, Icon, accent }) => (
              <article
                key={href}
                className="group flex min-h-[210px] flex-col rounded-lg border border-white/10 bg-white/95 p-4 text-left shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-white"
              >
                <button
                  type="button"
                  onClick={() => router.push(href)}
                  aria-label={`${title}のモード選択を開く`}
                  className="flex items-start gap-3 text-left focus:outline-none focus:ring-4 focus:ring-teal-300"
                >
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                    <Icon className={`h-7 w-7 ${accent}`} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-teal-700">{genre}</span>
                    <span className="mt-1 block break-keep text-xl font-bold leading-tight text-neutral-950">{title}</span>
                  </span>
                </button>
                <p className="mt-3 flex-1 text-sm leading-6 text-neutral-600">{description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {modes.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => router.push(modeHref(href, mode))}
                      aria-label={`${title}の${mode}を開始`}
                      className={`inline-flex min-h-[34px] items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-teal-300 ${
                        mode === primaryMode
                          ? 'bg-neutral-950 text-white hover:bg-neutral-800'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {mode === 'オンライン' && <Globe2 className="h-3 w-3" aria-hidden="true" />}
                      {mode === 'ローカル' && <Users className="h-3 w-3" aria-hidden="true" />}
                      {mode === 'CPU' && <Bot className="h-3 w-3" aria-hidden="true" />}
                      {mode}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
