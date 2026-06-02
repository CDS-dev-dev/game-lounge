// エンペラーゲーム（カイジのEカード）ルール説明ページ

'use client';

import Link from 'next/link';
import { GameHeader } from '@/components/layout/GameHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { POINTS } from '@/lib/games/emperor/constants';

export default function EmperorRulesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 sm:pt-20 pb-4 sm:pb-8 px-2 sm:px-4">
      <GameHeader title="エンペラーゲーム - ルール説明" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ゲーム概要 */}
          <Card className="bg-white/95">
            <CardHeader>
              <h2 className="text-2xl font-bold text-slate-900">ゲーム概要</h2>
            </CardHeader>
            <CardContent className="text-slate-700 space-y-3">
              <p>
                エンペラーゲーム（Eカード）は、カイジに登場する心理戦カードゲームです。
              </p>
              <p>
                プレイヤーとCPUが1対1で対戦し、各セットで「皇帝側」と「奴隷側」に分かれて戦います。
              </p>
              <p>
                双方が手札から1枚を選び、同時に公開して勝敗を判定します。
              </p>
            </CardContent>
          </Card>

          {/* カードの強弱 */}
          <Card className="bg-white/95">
            <CardHeader>
              <h2 className="text-2xl font-bold text-slate-900">カードの強弱</h2>
            </CardHeader>
            <CardContent className="text-slate-700 space-y-2">
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="font-bold text-blue-900">👑 皇帝 → 🧑 市民に勝つ</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <div className="font-bold text-green-900">🧑 市民 → ⛓️ 奴隷に勝つ</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded p-3">
                <div className="font-bold text-purple-900">⛓️ 奴隷 → 👑 皇帝に勝つ</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <div className="font-bold text-gray-900">🧑 市民 vs 🧑 市民 = 引き分け</div>
              </div>
            </CardContent>
          </Card>

          {/* 初期手札 */}
          <Card className="bg-white/95">
            <CardHeader>
              <h2 className="text-2xl font-bold text-slate-900">初期手札</h2>
            </CardHeader>
            <CardContent className="text-slate-700">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4">
                  <div className="font-bold text-yellow-900 mb-2">皇帝側（5枚）</div>
                  <ul className="space-y-1">
                    <li>👑 皇帝カード × 1枚</li>
                    <li>🧑 市民カード × 4枚</li>
                  </ul>
                </div>
                <div className="bg-gray-50 border-2 border-gray-500 rounded-lg p-4">
                  <div className="font-bold text-gray-900 mb-2">奴隷側（5枚）</div>
                  <ul className="space-y-1">
                    <li>⛓️ 奴隷カード × 1枚</li>
                    <li>🧑 市民カード × 4枚</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 1セットの流れ */}
          <Card className="bg-white/95">
            <CardHeader>
              <h2 className="text-2xl font-bold text-slate-900">1セットの流れ</h2>
            </CardHeader>
            <CardContent className="text-slate-700">
              <ol className="list-decimal list-inside space-y-3">
                <li>セット開始時に、皇帝側と奴隷側を決める</li>
                <li>各プレイヤーは初期手札5枚を持つ</li>
                <li>プレイヤーとCPUは、それぞれ手札から1枚を選ぶ</li>
                <li>選んだカードを同時に公開する</li>
                <li>勝敗を判定する</li>
                <li>
                  <strong>引き分けなら</strong>、使用したカードは戻さず、残り手札で次の勝負を行う
                </li>
                <li>どちらかが勝ったら、そのセットは終了する</li>
                <li>次のセットでは手札を初期状態に戻す</li>
              </ol>

              <div className="mt-4 bg-red-50 border border-red-200 rounded p-3">
                <div className="font-bold text-red-900 mb-1">重要なルール</div>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>使用したカードは、そのセット中は再使用できない</li>
                  <li>引き分けでも使用したカードは捨てる</li>
                  <li>最大5回勝負する</li>
                  <li>5回すべて引き分けた場合、そのセットは引き分けにする</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 得点ルール */}
          <Card className="bg-white/95">
            <CardHeader>
              <h2 className="text-2xl font-bold text-slate-900">得点ルール</h2>
            </CardHeader>
            <CardContent className="text-slate-700">
              <div className="space-y-3">
                <div className="bg-yellow-50 border-2 border-yellow-500 rounded p-3">
                  <div className="font-bold text-yellow-900">
                    👑 皇帝側が勝った場合: +{POINTS.emperorWin}点
                  </div>
                </div>
                <div className="bg-purple-50 border-2 border-purple-500 rounded p-3">
                  <div className="font-bold text-purple-900">
                    ⛓️ 奴隷側が勝った場合: +{POINTS.slaveWin}点
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-300 rounded p-3">
                  <div className="font-bold text-gray-900">引き分けの場合: {POINTS.draw}点</div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <p>• 全6セット行う</p>
                <p>• プレイヤーとCPUは、皇帝側と奴隷側を3セットずつ交代で担当する</p>
                <p>• 6セット終了時点で合計点が高い方の勝ち</p>
              </div>
            </CardContent>
          </Card>

          {/* 戦略のヒント */}
          <Card className="bg-white/95">
            <CardHeader>
              <h2 className="text-2xl font-bold text-slate-900">戦略のヒント</h2>
            </CardHeader>
            <CardContent className="text-slate-700">
              <div className="space-y-3">
                <div>
                  <div className="font-bold text-slate-900 mb-1">皇帝側のとき</div>
                  <ul className="list-disc list-inside text-sm ml-4 space-y-1">
                    <li>奴隷カードを温存させるために市民を先に出す</li>
                    <li>相手が奴隷を使ったら、皇帝を出して勝つ</li>
                    <li>1点しか取れないので、確実に勝つことが重要</li>
                  </ul>
                </div>
                <div>
                  <div className="font-bold text-slate-900 mb-1">奴隷側のとき</div>
                  <ul className="list-disc list-inside text-sm ml-4 space-y-1">
                    <li>相手が皇帝を出すタイミングを読む</li>
                    <li>奴隷で皇帝を倒せば5点獲得！</li>
                    <li>市民を使って相手の手札を減らすのも有効</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* アクションボタン */}
          <div className="flex gap-4 justify-center">
            <Link href="/games/emperor/cpu">
              <Button variant="primary" size="lg">
                CPU対戦を始める
              </Button>
            </Link>
            <Link href="/games/emperor">
              <Button variant="secondary" size="lg">
                メニューに戻る
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
