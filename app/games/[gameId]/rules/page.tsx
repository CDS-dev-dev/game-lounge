import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default async function RulesPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <h1 className="text-3xl font-bold text-gray-800">ガイスタールール</h1>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold mt-6 mb-4">ゲーム概要</h2>
            <p>
              ガイスターは、青いオバケと赤いオバケを使った2人用ボードゲームです。
              相手には自分の駒の色が見えないため、心理戦が重要になります。
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">駒の種類</h2>
            <ul className="list-disc pl-6">
              <li>
                <strong>青オバケ（4個）</strong>: 良いオバケ。これを守りながら相手の青オバケを取ります。
              </li>
              <li>
                <strong>赤オバケ（4個）</strong>: 悪いオバケ。相手に取らせることで勝利を目指します。
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">勝利条件（3種類）</h2>
            <ol className="list-decimal pl-6">
              <li>
                <strong>脱出勝ち</strong>: 自分の青オバケを盤面の四隅（ゴール）に到達させる
              </li>
              <li>
                <strong>駒取り勝ち</strong>: 相手の青オバケを4個すべて取る
              </li>
              <li>
                <strong>押し付け勝ち</strong>: 自分の赤オバケを4個すべて相手に取らせる
              </li>
            </ol>

            <h2 className="text-2xl font-bold mt-8 mb-4">ゲームの流れ</h2>
            <ol className="list-decimal pl-6">
              <li>各プレイヤーは8個の駒（青4個、赤4個）を自陣2行に配置します</li>
              <li>先攻から交互に1マスずつ駒を動かします</li>
              <li>駒は上下左右に1マス移動できます</li>
              <li>相手の駒があるマスに移動すると、その駒を取ります</li>
              <li>勝利条件のいずれかを満たしたら勝利です</li>
            </ol>

            <h2 className="text-2xl font-bold mt-8 mb-4">戦略のヒント</h2>
            <ul className="list-disc pl-6">
              <li>青オバケを赤オバケに見せかける動きをする</li>
              <li>相手の駒の色を推理する</li>
              <li>ゴールへの道を作りつつ、相手の動きを妨害する</li>
              <li>わざと赤オバケを取らせて押し付け勝ちを狙う</li>
            </ul>

            <div className="mt-12 flex justify-center gap-4">
              <Link
                href={`/games/${gameId}/matching`}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
              >
                対戦開始
              </Link>
              <Link
                href="/games"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
              >
                ゲーム選択に戻る
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
