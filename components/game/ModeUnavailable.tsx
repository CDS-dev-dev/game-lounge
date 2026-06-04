import Link from 'next/link';
import { Bot, Clock3, LayoutGrid, Users } from 'lucide-react';

type AlternativeMode = {
  href: string;
  label: string;
  type: 'cpu' | 'local' | 'menu';
};

interface ModeUnavailableProps {
  gameName: string;
  modeLabel: string;
  backHref: string;
  alternatives: AlternativeMode[];
}

export function ModeUnavailable({
  gameName,
  modeLabel,
  backHref,
  alternatives,
}: ModeUnavailableProps) {
  const getIcon = (type: AlternativeMode['type']) => {
    if (type === 'cpu') return <Bot className="h-5 w-5" aria-hidden="true" />;
    if (type === 'menu') return <LayoutGrid className="h-5 w-5" aria-hidden="true" />;
    return <Users className="h-5 w-5" aria-hidden="true" />;
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl items-start px-3 py-8 sm:items-center sm:px-4">
      <section className="w-full rounded-lg border border-white/10 bg-white/95 p-5 text-neutral-950 shadow-xl sm:p-7">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-teal-700">
            <Clock3 className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-teal-700">{gameName}</p>
            <h1 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">
              {modeLabel}は準備中です
            </h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600 sm:text-base">
              いま遊べるモードを下に並べています。ここから選ぶと、そのまま対戦画面へ進めます。
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {alternatives.map((alternative) => (
            <Link
              key={alternative.href}
              href={alternative.href}
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-300"
            >
              {getIcon(alternative.type)}
              {alternative.label}
            </Link>
          ))}
        </div>

        <Link
          href={backHref}
          className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-800 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-4 focus:ring-teal-300"
        >
          <LayoutGrid className="h-5 w-5" aria-hidden="true" />
          モード選択に戻る
        </Link>
      </section>
    </main>
  );
}
