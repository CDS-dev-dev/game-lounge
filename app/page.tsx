import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-12 min-h-[calc(100vh-64px)]">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-6xl font-bold text-white mb-6">
          ゲームラウンジ
        </h1>
        <p className="text-xl text-gray-100 mb-12">
          大人のためのオンラインボードゲームプラットフォーム
        </p>
        <Link
          href="/games"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors duration-200"
        >
          ゲームを始める
        </Link>
        <div className="mt-16 text-gray-200 text-sm">
          <p>リアルタイムオンライン対戦でボードゲームを楽しもう</p>
          <p className="mt-2 text-xs text-gray-300">v0.2.1</p>
        </div>
      </div>
    </div>
  );
}
