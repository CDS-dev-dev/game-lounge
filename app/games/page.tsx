'use client';

import { useRouter } from 'next/navigation';
import { GameHeader } from '@/components/layout/GameHeader';
import { GameVisualIcon } from '@/components/game/GameVisualIcon';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { Bot, Globe2, Users } from 'lucide-react';

const games = [
  {
    href: '/games/geister',
    title: 'ガイスター',
    genre: '心理戦',
    description: '見えない駒の正体を読み合う、短時間で濃い駆け引き。',
    modes: ['オンライン', 'ローカル', 'CPU'],
    primaryMode: 'CPU',
    visual: 'geister' as const,
  },
  {
    href: '/games/connect4',
    title: '立体四目並べ',
    genre: '3D戦略',
    description: '4×4×4の空間でラインを作る、立体的な四目並べ。',
    modes: ['ローカル', 'CPU'],
    primaryMode: 'CPU',
    visual: 'connect4' as const,
  },
  {
    href: '/games/xiangqi',
    title: '中国象棋',
    genre: '伝統将棋',
    description: '中国伝統の将棋。広い盤面で相手の将を追い詰めます。',
    modes: ['ローカル', 'CPU'],
    primaryMode: 'CPU',
    visual: 'xiangqi' as const,
  },
  {
    href: '/games/emperor',
    title: 'エンペラー',
    genre: '心理戦',
    description: '皇帝・市民・奴隷の読み合いで勝負するカードゲーム。',
    modes: ['CPU'],
    primaryMode: 'CPU',
    visual: 'emperor' as const,
  },
  {
    href: '/games/island-settlers',
    title: 'アイランドセトラーズ',
    genre: '開拓戦略',
    description: '資源を集め、道と町を広げて島の支配を競います。',
    modes: ['ローカル', 'CPU'],
    primaryMode: 'CPU',
    visual: 'island' as const,
  },
  {
    href: '/games/texas-holdem',
    title: 'テキサスホールデム',
    genre: 'ポーカー',
    description: '共通カードを使って手役とベットで勝負します。',
    modes: ['CPU'],
    primaryMode: 'CPU',
    visual: 'texas' as const,
  },
  {
    href: '/games/tiger-dragon',
    title: 'タイガー&ドラゴン',
    genre: '牌ゲーム',
    description: '攻めと受けを切り替えながら手牌を読み合います。',
    modes: ['ローカル', 'CPU'],
    primaryMode: 'CPU',
    visual: 'tiger' as const,
  },
  {
    href: '/games/indian-poker',
    title: 'インディアンポーカー',
    genre: '心理戦',
    description: '自分だけカードが見えない状態で相手の反応を読みます。',
    modes: ['ローカル', 'CPU'],
    primaryMode: 'CPU',
    visual: 'indian' as const,
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
      <div className="app-bg board-pattern min-h-screen px-3 pb-4 pt-14 sm:px-4 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <section className="mb-3 sm:mb-6">
            <p className="text-sm font-semibold text-teal-200">Game Lounge</p>
            <h1 className="mt-1 text-xl font-bold text-white sm:text-3xl">ゲームを選ぶ</h1>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-gray-200 sm:mt-2 sm:text-base sm:leading-6">
              CPUで軽く始めるか、同じ端末で対戦するか。遊び方から直接入れます。
            </p>
          </section>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            {visibleGames.map(({ href, title, genre, description, modes, primaryMode, visual }) => (
              <article
                key={href}
                className="group flex min-h-[146px] flex-col rounded-lg border border-white/10 bg-white/95 p-2.5 text-left shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-white sm:min-h-[190px] sm:p-4"
              >
                <button
                  type="button"
                  onClick={() => router.push(href)}
                  aria-label={`${title}のモード選択を開く`}
                  className="flex min-h-11 items-start gap-2 text-left focus:outline-none focus:ring-4 focus:ring-teal-300 sm:gap-3"
                >
                  <GameVisualIcon game={visual} label={`${title}のアイコン`} className="h-10 w-10 sm:h-14 sm:w-14" />
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-teal-700">{genre}</span>
                    <span className="mt-0.5 block text-sm font-bold leading-tight text-neutral-950 sm:mt-1 sm:text-xl">{title}</span>
                  </span>
                </button>
                <p className="mt-1.5 line-clamp-2 flex-1 text-[11px] leading-4 text-neutral-600 sm:mt-3 sm:text-sm sm:leading-6">{description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-4">
                  {modes.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => router.push(modeHref(href, mode))}
                      aria-label={`${title}の${mode}を開始`}
                      className={`inline-flex min-h-10 items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-teal-300 ${
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
