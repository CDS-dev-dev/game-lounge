import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TEXT_SIZE, MIN_TAP_AREA } from '@/lib/constants/ui-scale';

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-8 sm:py-12 min-h-[calc(100vh-64px)]">
      <div className="max-w-4xl w-full text-center">
        <h1 className={`${TEXT_SIZE.hero} font-bold text-white mb-4 sm:mb-6`}>
          ゲームラウンジ
        </h1>
        <p className={`${TEXT_SIZE.heading3} text-gray-100 mb-8 sm:mb-12 px-2`}>
          大人のためのオンラインボードゲームプラットフォーム
        </p>
        <Link href="/games">
          <Button
            variant="primary"
            size="lg"
            aria-label="ゲーム一覧を見る"
            className={MIN_TAP_AREA}
          >
            ゲームを始める
          </Button>
        </Link>
        <div className={`mt-12 sm:mt-16 text-gray-200 ${TEXT_SIZE.label} px-2`}>
          <p>リアルタイムオンライン対戦でボードゲームを楽しもう</p>
          <p className={`mt-2 ${TEXT_SIZE.caption} text-gray-300`}>v0.2.1</p>
        </div>
      </div>
    </div>
  );
}
