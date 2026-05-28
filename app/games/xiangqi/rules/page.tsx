// 中国象棋のルールページ

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function XiangqiRulesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-4 sm:py-8 md:py-12 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/95">
          <CardHeader>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">中国象棋（シャンチー）ルール</h1>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold mt-6 mb-4 text-slate-900">ゲーム概要</h2>
            <p className="text-slate-700 font-medium leading-relaxed">
              中国象棋（シャンチー、Xiangqi）は中国の伝統的な将棋ゲームです。
              2人対戦で、紅（赤）が先手、黒が後手となります。
              楚河漢界と呼ばれる「川」が盤面を二分し、各駒に固有の動き方があります。
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">盤面構成</h2>
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6 my-6">
              <ul className="list-disc pl-6 text-slate-700 font-medium space-y-2">
                <li><strong>サイズ</strong>: 9列（a-i）× 10行（1-10）</li>
                <li><strong>楚河漢界</strong>: 4行目と5行目の間にある「川」</li>
                <li><strong>九宮</strong>: 各陣地の中央3×3エリア（将/帥と士/仕の移動範囲）</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">駒の種類と動き</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              {/* 帥/将 */}
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <h3 className="font-bold text-lg text-red-900 mb-2">帥/将（King）</h3>
                <p className="text-sm text-red-800 font-medium">
                  • 九宮内で縦横1マス<br />
                  • 九宮から出られない<br />
                  • 対面禁止：相手の将と向き合えない
                </p>
              </div>

              {/* 仕/士 */}
              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                <h3 className="font-bold text-lg text-orange-900 mb-2">仕/士（Advisor）</h3>
                <p className="text-sm text-orange-800 font-medium">
                  • 九宮内で斜め1マス<br />
                  • 九宮から出られない<br />
                  • 各陣営2個
                </p>
              </div>

              {/* 相/象 */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                <h3 className="font-bold text-lg text-yellow-900 mb-2">相/象（Elephant）</h3>
                <p className="text-sm text-yellow-800 font-medium">
                  • 斜め2マス（田の字型）<br />
                  • 川を渡れない（自陣のみ）<br />
                  • 塞象眼：中間に駒があると移動不可
                </p>
              </div>

              {/* 馬 */}
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <h3 className="font-bold text-lg text-green-900 mb-2">馬（Horse）</h3>
                <p className="text-sm text-green-800 font-medium">
                  • 縦横1マス→斜め1マス（日の字型）<br />
                  • 蹩馬腿：最初の1マスに駒があると移動不可<br />
                  • チェスのナイトと異なり飛び越えられない
                </p>
              </div>

              {/* 車 */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <h3 className="font-bold text-lg text-blue-900 mb-2">車（Chariot）</h3>
                <p className="text-sm text-blue-800 font-medium">
                  • 縦横に何マスでも<br />
                  • 間に駒があると移動不可<br />
                  • 最強の駒
                </p>
              </div>

              {/* 炮/砲 */}
              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                <h3 className="font-bold text-lg text-purple-900 mb-2">炮/砲（Cannon）</h3>
                <p className="text-sm text-purple-800 font-medium">
                  • 縦横に何マスでも<br />
                  • 移動：間に駒なし<br />
                  • 攻撃：必ず1つの駒を飛び越える
                </p>
              </div>

              {/* 兵/卒 */}
              <div className="bg-pink-50 border-2 border-pink-300 rounded-lg p-4">
                <h3 className="font-bold text-lg text-pink-900 mb-2">兵/卒（Soldier）</h3>
                <p className="text-sm text-pink-800 font-medium">
                  • 川を渡る前：前に1マスのみ<br />
                  • 川を渡った後：前・左・右に1マス<br />
                  • 後退不可、成りなし
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">勝利条件</h2>
            <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-6 my-6">
              <ul className="list-disc pl-6 text-indigo-800 font-medium space-y-2">
                <li><strong>将死（チェックメイト）</strong>: 相手の将/帥を取る</li>
                <li><strong>困毙（ステイルメイト）</strong>: 相手が合法手を持たない＝負け（チェスと異なる）</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">特殊ルール</h2>
            <div className="bg-rose-50 border-2 border-rose-300 rounded-lg p-6 my-6">
              <ul className="list-disc pl-6 text-rose-800 font-medium space-y-2">
                <li><strong>王の対面禁止</strong>: 将と帥が同じ列で向き合う（間に駒なし）のは禁止</li>
                <li><strong>長将（連続王手）</strong>: 同じ王手を連続すると反則負け</li>
                <li><strong>塞象眼</strong>: 象の移動経路の中間マスに駒があると移動不可</li>
                <li><strong>蹩馬腿</strong>: 馬の最初の1マス目に駒があると移動不可</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">引き分け条件</h2>
            <ul className="list-disc pl-6 text-slate-700 font-medium space-y-2">
              <li>千日手：同じ局面が3回繰り返される</li>
              <li>双方合意：両者が引き分けに合意</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">戦略のヒント</h2>
            <ul className="list-disc pl-6 text-slate-700 font-medium space-y-2">
              <li>車（車）は最強駒。早期に活用する</li>
              <li>馬は中央に配置すると機動力が上がる</li>
              <li>炮（砲）は味方駒を台にして攻撃できる</li>
              <li>兵（兵/卒）は川を渡ると価値が倍増</li>
              <li>相（相/象）で自陣を守る</li>
              <li>将（帥/将）を九宮の中央に保つ</li>
            </ul>

            <div className="mt-12 flex justify-center gap-4">
              <Link
                href="/games/xiangqi"
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
