// テキサスホールデム ルール説明ページ

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { GameHeader } from '@/components/layout/GameHeader';

export const metadata = {
  title: 'テキサスホールデム ルール | Game Lounge',
  description: 'テキサスホールデムポーカーの詳細なルールと遊び方',
};

export default function TexasHoldemRulesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 sm:pt-20 pb-4 sm:pb-8 px-2 sm:px-4">
      <GameHeader title="テキサスホールデム - ルール" showBackToGames />

      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ゲーム概要 */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">ゲーム概要</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                テキサスホールデムは、世界で最も人気のあるポーカーの一種です。
                各プレイヤーは2枚の手札（ホールカード）と、テーブル中央に公開される5枚の共有カード（コミュニティカード）を組み合わせて、
                最強の5枚の役を作ります。
              </p>
            </CardContent>
          </Card>

          {/* ゲームの流れ */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">ゲームの流れ</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">1. ブラインドとカード配布</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>ディーラーボタンの左隣のプレイヤーがスモールブラインド（強制ベット）</li>
                  <li>その左隣のプレイヤーがビッグブラインド（スモールブラインドの2倍）</li>
                  <li>全プレイヤーに2枚ずつ裏向きでカードが配られる</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">2. プリフロップ</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>ビッグブラインドの左隣から、時計回りにアクション</li>
                  <li>フォールド、コール、レイズを選択</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">3. フロップ</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>3枚のコミュニティカードが表向きで公開される</li>
                  <li>スモールブラインドから、時計回りにアクション</li>
                  <li>チェック、ベット、フォールド、コール、レイズを選択</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">4. ターン</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>4枚目のコミュニティカードが公開される</li>
                  <li>再度ベッティングラウンド</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">5. リバー</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>5枚目（最後）のコミュニティカードが公開される</li>
                  <li>最後のベッティングラウンド</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">6. ショーダウン</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>残ったプレイヤーが手札を公開</li>
                  <li>最強の役を持つプレイヤーがポットを獲得</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* アクション */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">アクション</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <strong>フォールド（Fold）</strong>: ゲームから降りる。それまでのベット額は失う。
              </div>
              <div>
                <strong>チェック（Check）</strong>: ベットせずにパス。次のプレイヤーにターンを回す。
              </div>
              <div>
                <strong>コール（Call）</strong>: 現在のベット額に合わせる。
              </div>
              <div>
                <strong>レイズ（Raise）</strong>: ベット額を上げる。
              </div>
              <div>
                <strong>オールイン（All-in）</strong>: 全チップを賭ける。
              </div>
            </CardContent>
          </Card>

          {/* ポーカーの役 */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">ポーカーの役（弱→強）</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <strong>1. ハイカード</strong>: 役なし。最も高いカードで勝負。
              </div>
              <div>
                <strong>2. ワンペア</strong>: 同じランクのカードが2枚。
              </div>
              <div>
                <strong>3. ツーペア</strong>: ペアが2組。
              </div>
              <div>
                <strong>4. スリーカード</strong>: 同じランクのカードが3枚。
              </div>
              <div>
                <strong>5. ストレート</strong>: 連続する5枚のカード。
              </div>
              <div>
                <strong>6. フラッシュ</strong>: 同じスートの5枚のカード。
              </div>
              <div>
                <strong>7. フルハウス</strong>: スリーカード + ペア。
              </div>
              <div>
                <strong>8. フォーカード</strong>: 同じランクのカードが4枚。
              </div>
              <div>
                <strong>9. ストレートフラッシュ</strong>: 同じスートで連続する5枚。
              </div>
              <div>
                <strong>10. ロイヤルフラッシュ</strong>: 10-J-Q-K-Aの同スート。最強！
              </div>
            </CardContent>
          </Card>

          {/* 戻るボタン */}
          <div className="text-center">
            <Link
              href="/games/texas-holdem"
              className="inline-block px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
