// アイランドセトラーズ メインページ

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';

export default function IslandSettlersPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <GameHeader
        title="アイランドセトラーズ"
        subtitle="島を開拓する戦略ゲーム"
        onBack={() => router.push('/games')}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ゲーム説明 */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">ゲーム概要</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                アイランドセトラーズは、サイコロを振って資源を集め、
                道・村・町を建設して領土を拡大する戦略ゲームです。
              </p>
              <p>最初に8点を獲得したプレイヤーが勝利します。</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-gray-800 rounded p-3 text-center">
                  <div className="text-3xl mb-1">🌲</div>
                  <div className="text-sm">森林</div>
                  <div className="text-xs text-gray-400">木材</div>
                </div>
                <div className="bg-gray-800 rounded p-3 text-center">
                  <div className="text-3xl mb-1">⛰️</div>
                  <div className="text-sm">山岳</div>
                  <div className="text-xs text-gray-400">石材</div>
                </div>
                <div className="bg-gray-800 rounded p-3 text-center">
                  <div className="text-3xl mb-1">🌾</div>
                  <div className="text-sm">平原</div>
                  <div className="text-xs text-gray-400">食料</div>
                </div>
                <div className="bg-gray-800 rounded p-3 text-center">
                  <div className="text-3xl mb-1">🌊</div>
                  <div className="text-sm">水域</div>
                  <div className="text-xs text-gray-400">金</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ゲームモード選択 */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:scale-105 transition-transform cursor-pointer">
              <Link href="/games/island-settlers/cpu">
                <CardHeader>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    🤖 CPU対戦
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300">
                    AIと対戦できます。3つの難易度から選択可能。
                  </p>
                  <div className="mt-4">
                    <Button className="w-full">プレイ</Button>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:scale-105 transition-transform cursor-pointer">
              <Link href="/games/island-settlers/local">
                <CardHeader>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    👥 ローカル対戦
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300">
                    同じ端末で友達と対戦できます。3-4人対応。
                  </p>
                  <div className="mt-4">
                    <Button className="w-full">プレイ</Button>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:scale-105 transition-transform cursor-pointer opacity-60">
              <Link href="/games/island-settlers/online">
                <CardHeader>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    🌐 オンライン対戦
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300">
                    オンラインで他のプレイヤーと対戦（準備中）
                  </p>
                  <div className="mt-4">
                    <Button className="w-full" disabled>
                      準備中
                    </Button>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>

          {/* ゲーム特徴 */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">ゲームの特徴</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>
                    <strong>戦略性の高いゲームプレイ</strong>
                    <br />
                    <span className="text-sm text-gray-400">
                      資源管理、建設計画、拡張戦略が勝敗を分けます
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>
                    <strong>ランダム生成ボード</strong>
                    <br />
                    <span className="text-sm text-gray-400">
                      毎回異なるマップで新鮮なプレイ体験
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>
                    <strong>3段階の難易度</strong>
                    <br />
                    <span className="text-sm text-gray-400">
                      初心者から上級者まで楽しめるAI
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>
                    <strong>3-4人対応</strong>
                    <br />
                    <span className="text-sm text-gray-400">
                      友達と一緒に遊べます
                    </span>
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* ルール */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">基本ルール</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold mb-2">建設コスト</h3>
                  <ul className="text-sm space-y-1">
                    <li>🛤️ 道: 🪵1 + 🌾1</li>
                    <li>🏘️ 村: 🪵1 + 🪨1 + 🌾1 + 💰1</li>
                    <li>🏛️ 町: 🪨2 + 💰3</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-2">得点</h3>
                  <ul className="text-sm space-y-1">
                    <li>🏘️ 村: 1点</li>
                    <li>🏛️ 町: 2点</li>
                    <li>⭐ 勝利: 8点</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/games/island-settlers/rules">
                  <Button variant="secondary" className="w-full">
                    詳細ルールを見る
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
