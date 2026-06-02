// テキサスホールデム メインページ（モード選択）

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { GameHeader } from '@/components/layout/GameHeader';
import { GameModeSelector } from '@/components/game/GameModeSelector';
import { TEXT_SIZE, CARD_BG, PADDING } from '@/lib/constants/ui-scale';
import { Spade } from 'lucide-react';

export const metadata = {
  title: 'テキサスホールデム | Game Lounge',
  description: 'テキサスホールデムポーカーをプレイ。CPU対戦、ローカル対戦、オンライン対戦が可能です。',
};

export default function TexasHoldemPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 sm:pt-24 pb-8 px-4">
      <GameHeader
        title="テキサスホールデム"
        showBackToGames
        icon={<Spade className="w-5 h-5 sm:w-6 sm:h-6 text-slate-200" />}
      />

      <div className="container mx-auto p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className={`${TEXT_SIZE.heading1} font-bold text-white mb-1 sm:mb-2`}>テキサスホールデム</h1>
            <p className={`${TEXT_SIZE.label} text-gray-200`}>プレイモードを選択</p>
          </div>

          {/* モード選択 */}
          <GameModeSelector
            gameName="テキサスホールデム"
            modes={[
              {
                type: 'cpu',
                title: 'CPU対戦',
                emoji: '🤖',
                description: 'コンピューター相手に練習',
                href: '/games/texas-holdem/cpu',
              },
              {
                type: 'local',
                title: 'ローカル対戦',
                emoji: '👥',
                description: '準備中',
                href: '/games/texas-holdem/local',
                disabled: true,
              },
              {
                type: 'online',
                title: 'オンライン対戦',
                emoji: '🌐',
                description: '準備中',
                href: '/games/texas-holdem/online',
                disabled: true,
              },
            ]}
          />

          {/* ゲーム説明 */}
          <Card className={CARD_BG}>
            <CardHeader>
              <h2 className={`${TEXT_SIZE.heading2} font-bold`}>テキサスホールデムとは？</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className={`${TEXT_SIZE.body} text-gray-700`}>
                世界で最も人気のあるポーカーの一種。プレイヤーは2枚の手札と5枚の共有カードで最強の役を作ります。
              </p>

              <div>
                <h3 className={`${TEXT_SIZE.body} font-semibold mb-2`}>基本ルール</h3>
                <ul className={`list-disc list-inside space-y-1 ${TEXT_SIZE.label} text-gray-700`}>
                  <li>各プレイヤーに2枚の手札が配られます</li>
                  <li>共有カードが順次公開されます（フロップ3枚、ターン1枚、リバー1枚）</li>
                  <li>各ラウンドでベットアクション（フォールド、チェック、コール、レイズ）を選択</li>
                  <li>最後に残ったプレイヤーまたは最強の役を持つプレイヤーが勝利</li>
                </ul>
              </div>

              <div>
                <h3 className={`${TEXT_SIZE.body} font-semibold mb-2`}>役の強さ（弱→強）</h3>
                <ol className={`list-decimal list-inside space-y-1 ${TEXT_SIZE.label} text-gray-700`}>
                  <li>ハイカード</li>
                  <li>ワンペア</li>
                  <li>ツーペア</li>
                  <li>スリーカード</li>
                  <li>ストレート</li>
                  <li>フラッシュ</li>
                  <li>フルハウス</li>
                  <li>フォーカード</li>
                  <li>ストレートフラッシュ</li>
                  <li>ロイヤルフラッシュ</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* 戻るボタン */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              ゲーム一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
