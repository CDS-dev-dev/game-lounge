// 立体四目並べのルールページ

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function Connect4RulesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-4 sm:py-8 md:py-12 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/95">
          <CardHeader>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">立体四目並べルール</h1>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold mt-6 mb-4 text-slate-900">ゲーム概要</h2>
            <p className="text-slate-700 font-medium leading-relaxed">
              立体四目並べは、4×4×4の立体空間で行う戦略ゲームです。
              通常の2次元四目並べに高さの概念が加わることで、戦略性が大きく増します。
              縦・横・斜め（3次元含む）のいずれかで4つ揃えれば勝利です。
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">プレイヤー</h2>
            <ul className="list-disc pl-6 text-slate-700 font-medium leading-relaxed">
              <li>
                <strong>Player 1（青）🔵</strong>: 青い駒を使用
              </li>
              <li>
                <strong>Player 2（赤）🔴</strong>: 赤い駒を使用
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">勝利条件</h2>

            {/* 勝利条件の図解 */}
            <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-6 my-6">
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">🎯</div>
                <h3 className="font-bold text-xl text-indigo-900 mb-3">4つ揃えたら勝ち！</h3>
                <p className="text-indigo-800 font-medium">
                  縦・横・斜め（3次元含む）のいずれかで<br />
                  自分の駒を<span className="font-bold text-lg">4つ連続</span>で揃える
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">揃え方の種類</h2>
            <p className="text-slate-700 font-medium leading-relaxed mb-4">
              立体四目並べでは、<strong>13種類</strong>の方向で4つ揃えることができます：
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              {/* 水平方向 */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <h3 className="font-bold text-lg text-blue-900 mb-2">🔹 水平方向（2種類）</h3>
                <p className="text-sm text-blue-800 font-medium">
                  • X軸方向（横）<br />
                  • Y軸方向（奥行き）
                </p>
              </div>

              {/* 垂直方向 */}
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <h3 className="font-bold text-lg text-green-900 mb-2">🔹 垂直方向（1種類）</h3>
                <p className="text-sm text-green-800 font-medium">
                  • Z軸方向（高さ）
                </p>
              </div>

              {/* 平面の斜め */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                <h3 className="font-bold text-lg text-yellow-900 mb-2">🔹 平面の斜め（6種類）</h3>
                <p className="text-sm text-yellow-800 font-medium">
                  • XY平面の斜め（2種類）<br />
                  • XZ平面の斜め（2種類）<br />
                  • YZ平面の斜め（2種類）
                </p>
              </div>

              {/* 3次元の斜め */}
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <h3 className="font-bold text-lg text-red-900 mb-2">🔹 3次元の斜め（4種類）</h3>
                <p className="text-sm text-red-800 font-medium">
                  • 立体空間を貫く大斜め線<br />
                  （最も見落としやすい！）
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">盤面構成</h2>

            {/* 盤面の図解 */}
            <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-6 my-6">
              <div className="text-center mb-4">
                <p className="font-bold text-slate-900 text-lg">4×4×4の立体空間（64マス）</p>
                <p className="text-sm text-slate-600 mt-2 font-medium">レベル4（最上層）から順に表示</p>
              </div>

              {/* 4層を縦に並べる */}
              <div className="space-y-3">
                {[4, 3, 2, 1].map((level) => (
                  <div key={level}>
                    <div className="text-center mb-1">
                      <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2 py-1 rounded">
                        レベル {level}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 max-w-xs mx-auto">
                      {[...Array(16)].map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square bg-slate-700 border border-slate-500 rounded"
                        ></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-sm text-center text-slate-700 font-medium">
                駒は下から積み上がっていきます（重力あり）
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">ゲームの流れ</h2>
            <ol className="list-decimal pl-6 text-slate-700 font-medium leading-relaxed space-y-2">
              <li>Player 1（青🔵）から開始します</li>
              <li>交互に駒を配置していきます</li>
              <li>駒は<strong>下から積み上がる</strong>ように配置されます（重力の法則）</li>
              <li>空いているマスの中で、<strong>真下に駒があるか、最下層（レベル1）</strong>にのみ配置できます</li>
              <li>いずれかの方向で4つ揃えたプレイヤーが勝利です</li>
              <li>全64マスが埋まって揃わなければ<strong>引き分け</strong>です</li>
            </ol>

            {/* 配置ルールの図解 */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6 my-6">
              <h3 className="font-bold text-lg text-center mb-4 text-amber-900">配置ルール（重力）</h3>
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-sm font-bold text-green-700">配置可能</p>
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    • レベル1<br />
                    • 真下に駒がある
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">❌</div>
                  <p className="text-sm font-bold text-red-700">配置不可</p>
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    • 空中に浮いている<br />
                    • 既に駒がある
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">戦略のヒント</h2>
            <ul className="list-disc pl-6 text-slate-700 font-medium leading-relaxed space-y-2">
              <li>
                <strong>複数方向を同時に狙う</strong>：1つの駒が複数のラインに関わるように配置する
              </li>
              <li>
                <strong>3次元の斜めを活用</strong>：相手が見落としやすい大斜め線を狙う
              </li>
              <li>
                <strong>相手のリーチを妨害</strong>：相手が3つ揃えたらすぐにブロックする
              </li>
              <li>
                <strong>高さを意識</strong>：上の層ほど選択肢が減るため、下層での基盤作りが重要
              </li>
              <li>
                <strong>フォークを作る</strong>：2箇所同時にリーチをかけて相手を詰ませる
              </li>
            </ul>

            <div className="mt-12 flex justify-center gap-4">
              <Link
                href="/games/connect4"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
              >
                対戦開始
              </Link>
              <Link
                href="/games"
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
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
