import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TEXT_SIZE, MIN_TAP_AREA } from '@/lib/constants/ui-scale';
import { Box, Ghost, Palmtree, Swords } from 'lucide-react';

export default function Home() {
  const featuredGames = [
    {
      href: '/games/geister',
      title: 'ガイスター',
      label: '心理戦',
      Icon: Ghost,
      color: 'text-indigo-500',
    },
    {
      href: '/games/connect4',
      title: '立体四目並べ',
      label: '3D戦略',
      Icon: Box,
      color: 'text-sky-500',
    },
    {
      href: '/games/island-settlers',
      title: 'アイランドセトラーズ',
      label: '開拓戦略',
      Icon: Palmtree,
      color: 'text-emerald-500',
    },
  ];

  return (
    <div className="app-bg board-pattern min-h-[calc(100vh-64px)] px-4 py-8 sm:py-12">
      <div className="mx-auto grid min-h-[calc(100vh-128px)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="text-left">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1 text-sm font-semibold text-teal-100">
            <Swords className="h-4 w-4" aria-hidden="true" />
            すぐ遊べるボードゲーム
          </div>
          <h1 className={`${TEXT_SIZE.hero} max-w-2xl font-bold text-white`}>
            ゲームラウンジ
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-100 sm:text-xl">
            友人とも、一人でも。短い待ち時間で遊び始められるオンラインボードゲーム集です。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/games">
              <Button
                variant="primary"
                size="lg"
                aria-label="ゲーム一覧を見る"
                className={`${MIN_TAP_AREA} w-full bg-teal-500 hover:bg-teal-600 sm:w-auto`}
              >
                ゲームを選ぶ
              </Button>
            </Link>
            <Link
              href="/games/connect4/cpu"
              className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-white/15 bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-white/15"
            >
              CPU対戦へ
            </Link>
          </div>
          <p className="mt-8 text-sm text-gray-300">v0.2.1</p>
        </section>

        <section aria-label="おすすめゲーム" className="grid gap-3">
          {featuredGames.map(({ href, title, label, Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="group flex min-h-[112px] items-center gap-4 rounded-lg border border-white/10 bg-white/95 p-4 text-left shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-white"
            >
              <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                <Icon className={`h-8 w-8 ${color}`} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-teal-700">{label}</span>
                <span className="mt-1 block text-xl font-bold text-neutral-950">{title}</span>
                <span className="mt-1 block text-sm text-neutral-600 group-hover:text-neutral-800">モードを選んで開始</span>
              </span>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
