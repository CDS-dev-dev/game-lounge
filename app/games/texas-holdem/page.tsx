// テキサスホールデム メインページ（モード選択）

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { GameHeader } from '@/components/layout/GameHeader';

export const metadata = {
  title: 'テキサスホールデム | Game Lounge',
  description: 'テキサスホールデムポーカーをプレイ。CPU対戦、ローカル対戦、オンライン対戦が可能です。',
};

export default function TexasHoldemPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <GameHeader title="テキサスホールデム" showBackButton />

      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ゲーム説明 */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">テキサスホールデムとは？</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                世界で最も人気のあるポーカーの一種。プレイヤーは2枚の手札と5枚の共有カードで最強の役を作ります。
              </p>

              <div>
                <h3 className="font-semibold mb-2">基本ルール</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>各プレイヤーに2枚の手札が配られます</li>
                  <li>共有カードが順次公開されます（フロップ3枚、ターン1枚、リバー1枚）</li>
                  <li>各ラウンドでベットアクション（フォールド、チェック、コール、レイズ）を選択</li>
                  <li>最後に残ったプレイヤーまたは最強の役を持つプレイヤーが勝利</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">役の強さ（弱→強）</h3>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
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

          {/* モード選択 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CPU対戦 */}
            <Link href="/games/texas-holdem/cpu">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <h3 className="text-xl font-bold">🤖 CPU対戦</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    コンピューター相手に練習しましょう。難易度は選択可能です。
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* ローカル対戦 */}
            <div className="opacity-50 cursor-not-allowed">
              <Card className="h-full">
                <CardHeader>
                  <h3 className="text-xl font-bold">👥 ローカル対戦</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    同じデバイスで対戦（準備中）
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* オンライン対戦 */}
            <div className="opacity-50 cursor-not-allowed">
              <Card className="h-full">
                <CardHeader>
                  <h3 className="text-xl font-bold">🌐 オンライン対戦</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    オンラインで他のプレイヤーと対戦（準備中）
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

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
