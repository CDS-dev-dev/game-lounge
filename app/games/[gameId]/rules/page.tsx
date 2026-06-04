import Link from 'next/link';
import { BookOpen, LayoutGrid } from 'lucide-react';

export default async function RulesPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;

  return (
    <div className="min-h-screen app-bg board-pattern px-3 py-8 sm:px-4 sm:py-12">
      <main className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-2xl items-center">
        <section className="w-full rounded-lg border border-white/10 bg-white/95 p-5 text-neutral-950 shadow-xl sm:p-7">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-teal-700">
              <BookOpen className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-teal-700">{gameId}</p>
              <h1 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">
                ルールページは準備中です
              </h1>
              <p className="mt-3 text-sm leading-6 text-neutral-600 sm:text-base">
                このゲームIDに対応する個別ルールがまだ用意されていません。ゲーム一覧から遊びたいゲームを選び直してください。
              </p>
            </div>
          </div>

          <Link
            href="/games"
            className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-300"
          >
            <LayoutGrid className="h-5 w-5" aria-hidden="true" />
            ゲーム一覧へ戻る
          </Link>
        </section>
      </main>
    </div>
  );
}
