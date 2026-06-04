// アイランドセトラーズ メインページ

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';
import { GameModeSelector } from '@/components/game/GameModeSelector';
import { TEXT_SIZE, CARD_BG, PADDING } from '@/lib/constants/ui-scale';
import { Palmtree } from 'lucide-react';

export default function IslandSettlersPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen app-bg board-pattern pt-16 sm:pt-20 pb-8 px-4">
      <GameHeader
        title="アイランドセトラーズ"
        icon={<Palmtree className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className={`${TEXT_SIZE.heading1} font-bold text-white mb-1 sm:mb-2`}>アイランドセトラーズ</h1>
            <p className={`${TEXT_SIZE.label} text-gray-200`}>プレイモードを選択</p>
          </div>

          {/* ゲームモード選択 */}
          <GameModeSelector
            gameName="アイランドセトラーズ"
            modes={[
              {
                type: 'cpu',
                title: 'CPU対戦',
                emoji: '🤖',
                description: 'AIと対戦',
                href: '/games/island-settlers/cpu',
              },
              {
                type: 'local',
                title: 'ローカル対戦',
                emoji: '👥',
                description: '同じ端末で',
                href: '/games/island-settlers/local',
              },
              {
                type: 'online',
                title: 'オンライン対戦',
                emoji: '🌐',
                description: '準備中',
                href: '/games/island-settlers/online',
                disabled: true,
              },
            ]}
          />

          {/* ゲーム説明 */}
          <Card className={CARD_BG}>
            <CardHeader>
              <h2 className={`${TEXT_SIZE.heading2} font-bold`}>ゲーム概要</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className={TEXT_SIZE.body}>
                アイランドセトラーズは、サイコロを振って資源を集め、
                道・村・町を建設して領土を拡大する戦略ゲームです。
              </p>
              <p className={TEXT_SIZE.body}>最初に8点を獲得したプレイヤーが勝利します。</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-gray-800 rounded p-3 text-center">
                  <div className="text-3xl mb-1">🌲</div>
                  <div className={TEXT_SIZE.label}>森林</div>
                  <div className={`${TEXT_SIZE.caption} text-gray-400`}>木材</div>
                </div>
                <div className="bg-gray-800 rounded p-3 text-center">
                  <div className="text-3xl mb-1">⛰️</div>
                  <div className={TEXT_SIZE.label}>山岳</div>
                  <div className={`${TEXT_SIZE.caption} text-gray-400`}>石材</div>
                </div>
                <div className="bg-gray-800 rounded p-3 text-center">
                  <div className="text-3xl mb-1">🌾</div>
                  <div className={TEXT_SIZE.label}>平原</div>
                  <div className={`${TEXT_SIZE.caption} text-gray-400`}>食料</div>
                </div>
                <div className="bg-gray-800 rounded p-3 text-center">
                  <div className="text-3xl mb-1">🌊</div>
                  <div className={TEXT_SIZE.label}>水域</div>
                  <div className={`${TEXT_SIZE.caption} text-gray-400`}>金</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ゲーム特徴 */}
          <Card className={CARD_BG}>
            <CardHeader>
              <h2 className={`${TEXT_SIZE.heading2} font-bold`}>ゲームの特徴</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>
                    <strong className={TEXT_SIZE.body}>戦略性の高いゲームプレイ</strong>
                    <br />
                    <span className={`${TEXT_SIZE.label} text-gray-400`}>
                      資源管理、建設計画、拡張戦略が勝敗を分けます
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>
                    <strong className={TEXT_SIZE.body}>ランダム生成ボード</strong>
                    <br />
                    <span className={`${TEXT_SIZE.label} text-gray-400`}>
                      毎回異なるマップで新鮮なプレイ体験
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>
                    <strong className={TEXT_SIZE.body}>3段階の難易度</strong>
                    <br />
                    <span className={`${TEXT_SIZE.label} text-gray-400`}>
                      初心者から上級者まで楽しめるAI
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>
                    <strong className={TEXT_SIZE.body}>3-4人対応</strong>
                    <br />
                    <span className={`${TEXT_SIZE.label} text-gray-400`}>
                      友達と一緒に遊べます
                    </span>
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* ルール */}
          <Card className={CARD_BG}>
            <CardHeader>
              <h2 className={`${TEXT_SIZE.heading2} font-bold`}>基本ルール</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className={`${TEXT_SIZE.body} font-bold mb-2`}>建設コスト</h3>
                  <ul className={`${TEXT_SIZE.label} space-y-1`}>
                    <li>🛤️ 道: 🪵1 + 🌾1</li>
                    <li>🏘️ 村: 🪵1 + 🪨1 + 🌾1 + 💰1</li>
                    <li>🏛️ 町: 🪨2 + 💰3</li>
                  </ul>
                </div>
                <div>
                  <h3 className={`${TEXT_SIZE.body} font-bold mb-2`}>得点</h3>
                  <ul className={`${TEXT_SIZE.label} space-y-1`}>
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
