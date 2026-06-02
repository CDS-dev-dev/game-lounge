// エンペラーゲーム（カイジのEカード）メインページ

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';
import { GameModeSelector } from '@/components/game/GameModeSelector';
import { TEXT_SIZE, CARD_BG, PADDING } from '@/lib/constants/ui-scale';
import { Crown } from 'lucide-react';

export default function EmperorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 sm:pt-24 pb-8 px-4">
      <GameHeader
        title="エンペラーゲーム（Eカード）"
        icon={<Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />}
      />
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className={`${TEXT_SIZE.heading1} font-bold text-white mb-2 sm:mb-3`}>
            エンペラーゲーム
          </h1>
          <p className={`${TEXT_SIZE.body} text-gray-300`}>カイジのEカード</p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* ゲーム説明 */}
          <Card className={CARD_BG}>
            <CardHeader>
              <h2 className={`${TEXT_SIZE.heading2} font-bold text-slate-900`}>ゲーム概要</h2>
            </CardHeader>
            <CardContent className={`space-y-2 sm:space-y-3 ${TEXT_SIZE.body} text-slate-700`}>
              <p>
                カイジに登場する心理戦カードゲーム「Eカード」。
              </p>
              <p>
                皇帝側と奴隷側に分かれ、3種類のカードで読み合います。
              </p>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-3 sm:mt-4">
                <div className="bg-yellow-50 rounded p-2 sm:p-3 text-center border-2 border-yellow-400">
                  <div className="text-2xl sm:text-3xl mb-1">👑</div>
                  <div className={`${TEXT_SIZE.label} font-bold text-yellow-900`}>皇帝</div>
                </div>
                <div className="bg-blue-50 rounded p-2 sm:p-3 text-center border-2 border-blue-400">
                  <div className="text-2xl sm:text-3xl mb-1">🧑</div>
                  <div className={`${TEXT_SIZE.label} font-bold text-blue-900`}>市民</div>
                </div>
                <div className="bg-gray-50 rounded p-2 sm:p-3 text-center border-2 border-gray-400">
                  <div className="text-2xl sm:text-3xl mb-1">⛓️</div>
                  <div className={`${TEXT_SIZE.label} font-bold text-gray-900`}>奴隷</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ゲームモード選択 */}
          <GameModeSelector
            gameName="エンペラーゲーム"
            modes={[
              {
                type: 'cpu',
                title: 'CPU対戦',
                emoji: '🤖',
                description: 'AIと1対1で対戦',
                href: '/games/emperor/cpu',
              },
              {
                type: 'local',
                title: 'ローカル対戦',
                emoji: '👥',
                description: '準備中',
                href: '/games/emperor/local',
                disabled: true,
              },
              {
                type: 'online',
                title: 'オンライン対戦',
                emoji: '🌐',
                description: '準備中',
                href: '/games/emperor/online',
                disabled: true,
              },
            ]}
          />

          {/* ゲームの特徴 */}
          <Card className={CARD_BG}>
            <CardHeader>
              <h2 className={`${TEXT_SIZE.heading2} font-bold text-slate-900`}>ゲームの特徴</h2>
            </CardHeader>
            <CardContent className={`space-y-2 sm:space-y-3 ${TEXT_SIZE.body} text-slate-700`}>
              <div className="flex items-start gap-2">
                <span className="text-green-500 font-bold mt-0.5">✓</span>
                <div>
                  <strong>シンプルな心理戦</strong>
                  <br />
                  <span className={`${TEXT_SIZE.label} text-slate-600`}>
                    3種類のカードで読み合う駆け引きが熱い
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 font-bold mt-0.5">✓</span>
                <div>
                  <strong>奴隷の逆転劇</strong>
                  <br />
                  <span className={`${TEXT_SIZE.label} text-slate-600`}>
                    奴隷で皇帝を倒せば5点の大逆転！
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 font-bold mt-0.5">✓</span>
                <div>
                  <strong>戦略性の高いAI</strong>
                  <br />
                  <span className={`${TEXT_SIZE.label} text-slate-600`}>
                    3段階の難易度で初心者から上級者まで楽しめる
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 基本ルール */}
          <Card className={CARD_BG}>
            <CardHeader>
              <h2 className={`${TEXT_SIZE.heading2} font-bold text-slate-900`}>基本ルール</h2>
            </CardHeader>
            <CardContent className={`space-y-2 sm:space-y-3 ${TEXT_SIZE.body} text-slate-700`}>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">カードの強弱</h3>
                <ul className={`space-y-1 ${TEXT_SIZE.label}`}>
                  <li>👑 皇帝 → 🧑 市民に勝つ</li>
                  <li>🧑 市民 → ⛓️ 奴隷に勝つ</li>
                  <li>⛓️ 奴隷 → 👑 皇帝に勝つ</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">得点</h3>
                <ul className={`space-y-1 ${TEXT_SIZE.label}`}>
                  <li>👑 皇帝側の勝利: 1点</li>
                  <li>⛓️ 奴隷側の勝利: 5点</li>
                  <li>全6セットで合計点を競う</li>
                </ul>
              </div>
              <div className="mt-3 sm:mt-4">
                <Link href="/games/emperor/rules">
                  <Button variant="secondary" className="w-full">
                    詳細ルールを見る
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
