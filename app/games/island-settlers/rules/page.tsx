// アイランドセトラーズ ルールページ

'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';

export default function IslandSettlersRulesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 sm:pt-24 pb-4 sm:pb-8 px-3 sm:px-4">
      <GameHeader title="アイランドセトラーズ - ルール説明" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ゲーム概要 */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">ゲーム概要</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                アイランドセトラーズは、資源を集めて島を開拓する戦略ゲームです。
                道・村・町を建設して領土を拡大し、最初に8点を獲得したプレイヤーが勝利します。
              </p>
            </CardContent>
          </Card>

          {/* 基本ルール */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">基本ルール</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-bold text-lg mb-2">1. ターンの流れ</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>サイコロを振る（1-6）</li>
                  <li>出た目に対応するタイルから資源を獲得</li>
                  <li>建設・交易を自由に行う</li>
                  <li>ターンを終了</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">2. 資源獲得</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>🌲 森林 → 🪵 木材</li>
                  <li>⛰️ 山岳 → 🪨 石材</li>
                  <li>🌾 平原 → 🌾 食料</li>
                  <li>🌊 水域 → 💰 金</li>
                  <li>🏜️ 砂漠 → 資源なし</li>
                </ul>
                <p className="mt-2 text-sm text-gray-400">
                  村があるタイルは1資源、町があるタイルは2資源を獲得します。
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">3. 勝利条件</h3>
                <p>最初に8点を獲得したプレイヤーの勝利</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                  <li>村: 1点</li>
                  <li>町: 2点</li>
                  <li>道: 0点（建設の足がかり）</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 建設 */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">建設</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">🛤️ 道（コスト: 🪵1 + 🌾1）</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>自分の村・町・道に隣接した位置に建設可能</li>
                  <li>隣接するタイル同士を接続</li>
                  <li>新しい建設地への足がかりとなる</li>
                  <li>最大15本まで建設可能</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">🏘️ 村（コスト: 🪵1 + 🪨1 + 🌾1 + 💰1）</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>自分の道に接続された位置に建設可能</li>
                  <li>砂漠には建設不可</li>
                  <li>サイコロの目が出ると1資源獲得</li>
                  <li>1点の勝利点を獲得</li>
                  <li>最大5個まで建設可能</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">🏛️ 町（コスト: 🪨2 + 💰3）</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>自分の村を町にアップグレード</li>
                  <li>サイコロの目が出ると2資源獲得</li>
                  <li>2点の勝利点を獲得（合計）</li>
                  <li>最大4個まで建設可能</li>
                  <li>町にすると村を回収できる</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 交易 */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">交易</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>自分のターン中、いつでも交易できます。</p>
              <div>
                <h3 className="font-bold text-lg mb-2">固定レート交易（4:1）</h3>
                <p className="text-sm text-gray-400">
                  同じ資源4つを、任意の資源1つと交換できます。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 戦略のヒント */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">戦略のヒント</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  <strong>多様な資源タイルに接する</strong>
                  <br />
                  <span className="text-sm text-gray-400">
                    複数の資源タイプから安定して資源を得られる位置に建設しましょう
                  </span>
                </li>
                <li>
                  <strong>出やすいサイコロの目を狙う</strong>
                  <br />
                  <span className="text-sm text-gray-400">
                    中央の目（3-4-5）が出る確率が高いです
                  </span>
                </li>
                <li>
                  <strong>町への早期アップグレード</strong>
                  <br />
                  <span className="text-sm text-gray-400">
                    資源獲得量が2倍になり、勝利点も増えます
                  </span>
                </li>
                <li>
                  <strong>交易のタイミング</strong>
                  <br />
                  <span className="text-sm text-gray-400">
                    建設に必要な資源が足りない時は、余った資源を交易しましょう
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* アクションボタン */}
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push('/games/island-settlers/cpu')} size="lg">
              CPU対戦を始める
            </Button>
            <Button
              onClick={() => router.push('/games/island-settlers/local')}
              variant="secondary"
              size="lg"
            >
              ローカル対戦を始める
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
