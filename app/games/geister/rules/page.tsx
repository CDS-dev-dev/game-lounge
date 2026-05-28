// ガイスターのルールページ

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function GeisterRulesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-4 sm:py-8 md:py-12 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/95">
          <CardHeader>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">ガイスター（Geister）ルール</h1>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold mt-6 mb-4 text-slate-900">ゲーム概要</h2>
            <p className="text-slate-700 font-medium leading-relaxed">
              ガイスター（Geister）はドイツ生まれの2人対戦ボードゲームです。
              青いお化け👻（Good駒）と赤い悪魔😈（Bad駒）を使い、相手の駒を取ったり脱出させたりして勝利を目指します。
              相手には自分の駒の色が見えないため、心理戦が重要です。
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">盤面構成</h2>
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6 my-6">
              <ul className="list-disc pl-6 text-slate-700 font-medium space-y-2">
                <li><strong>サイズ</strong>: 6列 × 6行</li>
                <li><strong>脱出口</strong>: 盤面の四隅（各プレイヤーの陣地側の角）</li>
                <li><strong>初期配置</strong>: 各プレイヤーは中央4列×2行に8個の駒を配置</li>
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
                  <li>各プレイヤー4個ずつ</li>
                  <li>縦横1マス移動可能</li>
                  <li>脱出させると勝利</li>
                  <li>全て取られると敗北</li>
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
                  <li>各プレイヤー4個ずつ</li>
                  <li>縦横1マス移動可能</li>
                  <li>相手に全て取らせると勝利</li>
                  <li>これを脱出させても勝利にならない</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">勝利条件</h2>
            <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-6 my-6">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-bold text-lg text-indigo-900 mb-2">🎯 勝利パターン1: 青いお化けの脱出</h3>
                  <p className="text-indigo-800 font-medium">
                    自分の👻（Good駒）を相手側の脱出口（盤面の角）から脱出させる
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-bold text-lg text-indigo-900 mb-2">🎯 勝利パターン2: 相手の青いお化けを全て捕獲</h3>
                  <p className="text-indigo-800 font-medium">
                    相手の👻（Good駒）を4個全て取る
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-bold text-lg text-indigo-900 mb-2">🎯 勝利パターン3: 自分の赤い悪魔を全て取らせる</h3>
                  <p className="text-indigo-800 font-medium">
                    相手に自分の😈（Bad駒）を4個全て取らせる
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">ゲームの流れ</h2>
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 my-6">
              <ol className="list-decimal pl-6 text-green-900 font-medium space-y-3">
                <li>
                  <strong>初期配置</strong>: 各プレイヤーは中央4列×2行に👻4個と😈4個を配置
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                    <li>相手には駒の色が見えない</li>
                    <li>配置戦略が重要</li>
                  </ul>
                </li>
                <li>
                  <strong>交互に移動</strong>: 先手から順番に1マスずつ駒を移動
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                    <li>縦横1マス（斜め不可）</li>
                    <li>他の駒を飛び越えられない</li>
                  </ul>
                </li>
                <li>
                  <strong>駒の捕獲</strong>: 相手の駒がいるマスに移動すると捕獲
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                    <li>取った駒の色が初めて見える</li>
                    <li>相手の駒の配置を推理する</li>
                  </ul>
                </li>
                <li>
                  <strong>脱出</strong>: 自分の👻を相手側の角（脱出口）に移動させると即座に勝利
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

            <div className="mt-12 flex justify-center gap-4">
              <Link
                href="/games/geister"
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
