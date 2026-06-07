import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { GameVisualIcon } from '@/components/game/GameVisualIcon';
import { TEXT_SIZE, MIN_TAP_AREA } from '@/lib/constants/ui-scale';
import { Bot, ChevronRight, Swords } from 'lucide-react';

export default function Home() {
  const featuredGames = [
    {
      href: '/games/geister',
      title: 'ガイスター',
      label: '心理戦',
      visual: 'geister' as const,
      primaryHref: '/games/geister/cpu',
      cta: 'CPUで遊ぶ',
    },
    {
      href: '/games/connect4',
      title: '立体四目並べ',
      label: '3D戦略',
      visual: 'connect4' as const,
      primaryHref: '/games/connect4/cpu',
      cta: 'CPUで遊ぶ',
    },
    {
      href: '/games/island-settlers',
      title: 'アイランドセトラーズ',
      label: '開拓戦略',
      visual: 'island' as const,
      primaryHref: '/games/island-settlers/cpu',
      cta: 'CPUで遊ぶ',
    },
  ];

  return (
    <div className="app-bg board-pattern min-h-[calc(100vh-64px)] px-3 py-3 sm:px-4 sm:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-88px)] max-w-6xl items-center gap-3 lg:grid-cols-[0.9fr_1.1fr] lg:gap-6">
        <section className="text-left">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1 text-xs font-semibold text-teal-100 sm:mb-4 sm:text-sm">
            <Swords className="h-4 w-4" aria-hidden="true" />
            すぐ遊べるボードゲーム
          </div>
          <h1 className={`${TEXT_SIZE.hero} max-w-2xl font-bold text-white`}>
            ゲームラウンジ
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-100 sm:mt-4 sm:text-xl sm:leading-8">
            一人でも、同じ端末でも。今すぐ1局を始められるオンラインボードゲーム集です。
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:gap-3">
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
          <p className="mt-2 text-xs text-gray-300 sm:mt-4 sm:text-sm">v0.2.1</p>
        </section>

        <section aria-label="おすすめゲーム" className="grid gap-2 sm:gap-3">
          {featuredGames.map(({ href, primaryHref, title, label, cta, visual }) => (
            <div
              key={href}
              className="grid min-h-[82px] gap-1.5 rounded-lg border border-white/10 bg-white/95 p-2.5 shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-white sm:min-h-[108px] sm:grid-cols-[1fr_auto] sm:gap-3 sm:p-3"
            >
              <Link href={href} className="group flex min-w-0 items-center gap-4 text-left">
                <GameVisualIcon game={visual} label={`${title}のアイコン`} className="h-11 w-11 sm:h-14 sm:w-14" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-teal-700">{label}</span>
                  <span className="mt-0.5 block text-lg font-bold text-neutral-950 sm:mt-1 sm:text-xl">{title}</span>
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
