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
              ガイスターは、青いお化け👻と赤い悪魔😈を使った2人用ボードゲームです。
              相手には自分の駒の種類が見えないため、心理戦が重要になります。
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">駒の種類</h2>
            <ul className="list-disc pl-6">
              <li>
                <strong>青いお化け👻（4個）</strong>: 良い駒。これを守りながら相手の青いお化けを取ります。
              </li>
              <li>
                <strong>赤い悪魔😈（4個）</strong>: 悪い駒。相手に取らせることで勝利を目指します。
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">勝利条件（3種類）</h2>

            {/* 勝利条件の図解 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              {/* 脱出勝ち */}
              <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-4 text-center">
                <div className="text-4xl mb-2">🚪👻</div>
                <h3 className="font-bold text-lg text-indigo-900 mb-2">脱出勝ち</h3>
                <p className="text-sm text-indigo-800">
                  青いお化け👻を<br />四隅の脱出口🚪へ
                </p>
              </div>

              {/* 駒取り勝ち */}
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 text-center">
                <div className="text-4xl mb-2">👻❌</div>
                <h3 className="font-bold text-lg text-green-900 mb-2">駒取り勝ち</h3>
                <p className="text-sm text-green-800">
                  相手の青いお化け👻<br />4個すべて捕獲
                </p>
              </div>

              {/* 押し付け勝ち */}
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 text-center">
                <div className="text-4xl mb-2">😈✓</div>
                <h3 className="font-bold text-lg text-red-900 mb-2">押し付け勝ち</h3>
                <p className="text-sm text-red-800">
                  自分の赤い悪魔😈<br />4個すべて取らせる
                </p>
              </div>
            </div>

            <ol className="list-decimal pl-6">
              <li>
                <strong>脱出勝ち</strong>: 自分の青いお化け👻を盤面の四隅（ゴール）に到達させる
              </li>
              <li>
                <strong>駒取り勝ち</strong>: 相手の青いお化け👻を4個すべて取る
              </li>
              <li>
                <strong>押し付け勝ち</strong>: 自分の赤い悪魔😈を4個すべて相手に取らせる
              </li>
            </ol>

            <h2 className="text-2xl font-bold mt-8 mb-4">盤面構成</h2>

            {/* 盤面の図解 */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6 my-6">
              <div className="text-center mb-4">
                <p className="font-bold text-amber-900">6×6マスの盤面</p>
              </div>
              <div className="grid grid-cols-6 gap-1 max-w-md mx-auto">
                {/* 脱出口 */}
                <div className="aspect-square bg-yellow-200 border-2 border-yellow-400 flex items-center justify-center text-2xl">🚪</div>
                <div className="aspect-square bg-amber-100 border border-amber-300"></div>
                <div className="aspect-square bg-amber-100 border border-amber-300"></div>
                <div className="aspect-square bg-amber-100 border border-amber-300"></div>
                <div className="aspect-square bg-amber-100 border border-amber-300"></div>
                <div className="aspect-square bg-yellow-200 border-2 border-yellow-400 flex items-center justify-center text-2xl">🚪</div>

                {/* Player2エリア（上2行） */}
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="aspect-square bg-blue-100 border border-blue-300"></div>
                ))}

                {/* 中央エリア */}
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="aspect-square bg-amber-100 border border-amber-300"></div>
                ))}

                {/* Player1エリア（下2行） */}
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="aspect-square bg-green-100 border border-green-300"></div>
                ))}

                {/* 脱出口 */}
                <div className="aspect-square bg-yellow-200 border-2 border-yellow-400 flex items-center justify-center text-2xl">🚪</div>
                <div className="aspect-square bg-amber-100 border border-amber-300"></div>
                <div className="aspect-square bg-amber-100 border border-amber-300"></div>
                <div className="aspect-square bg-amber-100 border border-amber-300"></div>
                <div className="aspect-square bg-amber-100 border border-amber-300"></div>
                <div className="aspect-square bg-yellow-200 border-2 border-yellow-400 flex items-center justify-center text-2xl">🚪</div>
              </div>
              <div className="mt-4 text-sm text-center space-y-1">
                <p className="text-green-800">🟩 Player 1 配置エリア（下2行）</p>
                <p className="text-blue-800">🟦 Player 2 配置エリア（上2行）</p>
                <p className="text-yellow-800">🟨 脱出口（四隅）</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4">ゲームの流れ</h2>
            <ol className="list-decimal pl-6">
              <li>各プレイヤーは8個の駒（青いお化け👻×4、赤い悪魔😈×4）を自陣2行に配置します</li>
              <li>先攻から交互に1マスずつ駒を動かします</li>
              <li>駒は上下左右に1マス移動できます</li>
              <li>相手の駒があるマスに移動すると、その駒を取ります</li>
              <li>勝利条件のいずれかを満たしたら勝利です</li>
            </ol>

            {/* 移動の図解 */}
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 my-6">
              <h3 className="font-bold text-lg text-center mb-4">駒の移動方向</h3>
              <div className="flex justify-center">
                <div className="grid grid-cols-3 gap-2">
                  <div className="w-12 h-12"></div>
                  <div className="w-12 h-12 bg-green-200 border-2 border-green-400 flex items-center justify-center text-xl">↑</div>
                  <div className="w-12 h-12"></div>

                  <div className="w-12 h-12 bg-green-200 border-2 border-green-400 flex items-center justify-center text-xl">←</div>
                  <div className="w-12 h-12 bg-blue-300 border-2 border-blue-500 flex items-center justify-center text-2xl">👻</div>
                  <div className="w-12 h-12 bg-green-200 border-2 border-green-400 flex items-center justify-center text-xl">→</div>

                  <div className="w-12 h-12"></div>
                  <div className="w-12 h-12 bg-green-200 border-2 border-green-400 flex items-center justify-center text-xl">↓</div>
                  <div className="w-12 h-12"></div>
                </div>
              </div>
              <p className="text-center mt-4 text-sm text-gray-700">上下左右に1マス移動可能</p>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4">戦略のヒント</h2>
            <ul className="list-disc pl-6">
              <li>青いお化け👻を赤い悪魔😈に見せかける動きをする</li>
              <li>相手の駒の種類を推理する</li>
              <li>ゴールへの道を作りつつ、相手の動きを妨害する</li>
              <li>わざと赤い悪魔😈を取らせて押し付け勝ちを狙う</li>
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
