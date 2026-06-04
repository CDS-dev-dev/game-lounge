// ガイスターのルールページ

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { GameHeader } from '@/components/layout/GameHeader';

export default function GeisterRulesPage() {
  return (
    <>
      <GameHeader
        title="ガイスタールール"
        backUrl="/games/geister"
        backLabel="モード選択"
      />
      <div className="min-h-screen app-bg board-pattern pt-16 sm:pt-20 pb-4 sm:pb-8 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
        <Card className="bg-white/95">
          <CardHeader>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">ガイスター（Geister）ルール</h1>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold mt-6 mb-4 text-slate-900">ゲーム概要</h2>
            <p className="text-slate-700 font-medium leading-relaxed">
              ガイスター（Geister）はドイツ生まれの2人対戦ボードゲームです。
              各プレイヤーは青いオバケ👻4体・赤いオバケ😈4体の計8体を持ちます。
              <strong className="text-indigo-700">青/赤の種類は自分だけが見えるようにし、相手には見えません。</strong>
              この秘匿情報を活かした心理戦が勝利の鍵です。
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">盤面構成</h2>
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6 my-6">
              <ul className="list-disc pl-6 text-slate-700 font-medium space-y-2">
                <li><strong>サイズ</strong>: 6列 × 6行（合計36マス）</li>
                <li><strong>脱出口🚪</strong>: 各プレイヤーの陣地側の左右端（相手側の出口から脱出）</li>
                <li><strong>初期配置エリア</strong>: 自陣側の中央4列×2行（8マス）に8個の駒を自由に配置</li>
                <li><strong>移動</strong>: 上下左右に1マスずつ（斜め移動は不可）</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">駒の種類</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              {/* Good駒 */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <h3 className="font-bold text-2xl text-blue-900 mb-4 text-center">👻 Good駒（青いお化け）</h3>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-3 gap-1">
                    <div className="w-12 h-12 border-2 border-gray-300 rounded"></div>
                    <div className="w-12 h-12 border-2 border-blue-400 bg-blue-100 rounded flex items-center justify-center text-xs font-bold">↑</div>
                    <div className="w-12 h-12 border-2 border-gray-300 rounded"></div>
                    <div className="w-12 h-12 border-2 border-blue-400 bg-blue-100 rounded flex items-center justify-center text-xs font-bold">←</div>
                    <div className="w-12 h-12 border-2 border-blue-600 bg-blue-200 rounded flex items-center justify-center text-3xl">👻</div>
                    <div className="w-12 h-12 border-2 border-blue-400 bg-blue-100 rounded flex items-center justify-center text-xs font-bold">→</div>
                    <div className="w-12 h-12 border-2 border-gray-300 rounded"></div>
                    <div className="w-12 h-12 border-2 border-blue-400 bg-blue-100 rounded flex items-center justify-center text-xs font-bold">↓</div>
                    <div className="w-12 h-12 border-2 border-gray-300 rounded"></div>
                  </div>
                </div>
                <ul className="list-disc pl-6 text-blue-800 font-medium space-y-2">
                  <li>各プレイヤー4体ずつ保有</li>
                  <li>上下左右1マス移動可能（斜め不可）</li>
                  <li><strong>1体でも脱出させると即座に勝利</strong></li>
                  <li>4体全て取られると敗北</li>
                  <li>自分だけが色を知っている</li>
                </ul>
              </div>

              {/* Bad駒 */}
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                <h3 className="font-bold text-2xl text-red-900 mb-4 text-center">😈 Bad駒（赤い悪魔）</h3>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-3 gap-1">
                    <div className="w-12 h-12 border-2 border-gray-300 rounded"></div>
                    <div className="w-12 h-12 border-2 border-red-400 bg-red-100 rounded flex items-center justify-center text-xs font-bold">↑</div>
                    <div className="w-12 h-12 border-2 border-gray-300 rounded"></div>
                    <div className="w-12 h-12 border-2 border-red-400 bg-red-100 rounded flex items-center justify-center text-xs font-bold">←</div>
                    <div className="w-12 h-12 border-2 border-red-600 bg-red-200 rounded flex items-center justify-center text-3xl">😈</div>
                    <div className="w-12 h-12 border-2 border-red-400 bg-red-100 rounded flex items-center justify-center text-xs font-bold">→</div>
                    <div className="w-12 h-12 border-2 border-gray-300 rounded"></div>
                    <div className="w-12 h-12 border-2 border-red-400 bg-red-100 rounded flex items-center justify-center text-xs font-bold">↓</div>
                    <div className="w-12 h-12 border-2 border-gray-300 rounded"></div>
                  </div>
                </div>
                <ul className="list-disc pl-6 text-red-800 font-medium space-y-2">
                  <li>各プレイヤー4体ずつ保有</li>
                  <li>上下左右1マス移動可能（斜め不可）</li>
                  <li><strong>4体全て相手に取らせると勝利</strong></li>
                  <li>脱出させても勝利にならない（脱出不可扱い）</li>
                  <li>自分だけが色を知っている</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">勝利条件</h2>
            <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-6 my-6">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-bold text-lg text-indigo-900 mb-2">🎯 勝利条件1: 青いオバケを脱出させる</h3>
                  <p className="text-indigo-800 font-medium">
                    自分の👻（青いオバケ）1体を<strong>相手陣地側の左右端にある出口🚪から盤外へ移動</strong>させる
                  </p>
                  <p className="text-xs text-indigo-600 mt-2">
                    ※出口マスから、さらに盤外方向へ1マス移動することで脱出
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-bold text-lg text-indigo-900 mb-2">🎯 勝利条件2: 相手の青いオバケを4体すべて取る</h3>
                  <p className="text-indigo-800 font-medium">
                    相手の👻（青いオバケ）を4体全て捕獲する
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-bold text-lg text-indigo-900 mb-2">🎯 勝利条件3: 自分の赤いオバケを4体すべて取らせる</h3>
                  <p className="text-indigo-800 font-medium">
                    相手に自分の😈（赤いオバケ）を4体全て取らせる（逆転戦術）
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">ゲームの流れ</h2>
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 my-6">
              <ol className="list-decimal pl-6 text-green-900 font-medium space-y-3">
                <li>
                  <strong>初期配置フェーズ</strong>: 各プレイヤーは自陣側の指定8マスに👻4体と😈4体を自由に配置
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                    <li>相手には各コマの色が分からない</li>
                    <li>配置戦略が勝敗を左右する</li>
                  </ul>
                </li>
                <li>
                  <strong>手番</strong>: プレイヤーは交互に1手ずつ行う
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                    <li>自分のオバケ1体を上下左右のいずれかに1マス移動（斜め不可）</li>
                    <li>自分のコマがあるマスには移動できない</li>
                    <li>他の駒を飛び越えられない</li>
                  </ul>
                </li>
                <li>
                  <strong>駒の捕獲</strong>: 相手のコマがあるマスに移動すると、その相手コマを取る
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                    <li><strong>取ったコマの色は公開される</strong>（初めて見える）</li>
                    <li>取った駒の色から相手の配置を推理する</li>
                  </ul>
                </li>
                <li>
                  <strong>脱出</strong>: 自分の👻を相手側の出口から盤外へ移動させると即座に勝利
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                    <li>脱出できるのは青いオバケ👻のみ</li>
                    <li>😈は脱出しても勝利にならないため脱出できない扱い</li>
                  </ul>
                </li>
              </ol>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">戦略のヒント</h2>
            <ul className="list-disc pl-6 text-slate-700 font-medium space-y-2">
              <li>👻を端に配置して脱出を狙う</li>
              <li>😈を囮にして相手を惑わせる</li>
              <li>相手の動きから駒の色を推理する</li>
              <li>積極的に取りに来る駒は👻の可能性が高い</li>
              <li>逃げる駒も👻の可能性がある</li>
              <li>😈を全て取らせる勝ち方も意識する</li>
            </ul>

          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
