import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TEXT_SIZE, MIN_TAP_AREA } from '@/lib/constants/ui-scale';
import { Bot, Box, ChevronRight, Ghost, Palmtree, Swords } from 'lucide-react';

export default function Home() {
  const featuredGames = [
    {
      href: '/games/geister',
      title: 'ガイスター',
      label: '心理戦',
      Icon: Ghost,
      color: 'text-indigo-500',
      primaryHref: '/games/geister/cpu',
      cta: 'CPUで遊ぶ',
    },
    {
      href: '/games/connect4',
      title: '立体四目並べ',
      label: '3D戦略',
      Icon: Box,
      color: 'text-sky-500',
      primaryHref: '/games/connect4/cpu',
      cta: 'CPUで遊ぶ',
    },
    {
      href: '/games/island-settlers',
      title: 'アイランドセトラーズ',
      label: '開拓戦略',
      Icon: Palmtree,
      color: 'text-emerald-500',
      primaryHref: '/games/island-settlers/cpu',
      cta: 'CPUで遊ぶ',
    },
  ];

  return (
    <div className="app-bg board-pattern min-h-[calc(100vh-64px)] px-4 py-6 sm:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-112px)] max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="text-left">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1 text-sm font-semibold text-teal-100">
            <Swords className="h-4 w-4" aria-hidden="true" />
            すぐ遊べるボードゲーム
          </div>
          <h1 className={`${TEXT_SIZE.hero} max-w-2xl font-bold text-white`}>
            ゲームラウンジ
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-100 sm:text-xl">
            一人でも、同じ端末でも。今すぐ1局を始められるオンラインボードゲーム集です。
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
              href="/games/geister/cpu"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-white/15"
            >
              <Bot className="h-5 w-5" aria-hidden="true" />
              ガイスターCPU
            </Link>
          </div>
          <p className="mt-8 text-sm text-gray-300">v0.2.1</p>
        </section>

        <section aria-label="おすすめゲーム" className="grid gap-3">
          {featuredGames.map(({ href, primaryHref, title, label, cta, Icon, color }) => (
            <div
              key={href}
              className="grid min-h-[124px] gap-3 rounded-lg border border-white/10 bg-white/95 p-4 shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-white sm:grid-cols-[1fr_auto]"
            >
              <Link href={href} className="group flex min-w-0 items-center gap-4 text-left">
                <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <Icon className={`h-8 w-8 ${color}`} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-teal-700">{label}</span>
                  <span className="mt-1 block text-xl font-bold text-neutral-950">{title}</span>
                  <span className="mt-1 block text-sm text-neutral-600 group-hover:text-neutral-800">モード選択</span>
                </span>
              </Link>
              <Link
                href={primaryHref}
                className="inline-flex min-h-[44px] items-center justify-center gap-1 rounded-md bg-neutral-950 px-4 text-sm font-bold text-white transition-colors hover:bg-neutral-800"
              >
                {cta}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
