'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';

export default function IndianPokerRulesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 sm:pt-24 pb-4 sm:pb-8 px-3 sm:px-4">
      <GameHeader title="インディアンポーカー - ルール説明" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 概要 */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">ゲーム概要</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                インディアンポーカーは、<strong>自分のカードが見えない</strong>という特殊なルールのポーカーです。
                額にカードを当てるイメージで、自分のカードだけが見えず、他のプレイヤーのカードは全て見えます。
                相手の反応や行動から自分のカードを推測し、ベットするかフォールドするかを決める心理戦ゲームです。
              </p>
            </CardContent>
          </Card>

          {/* 基本ルール */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">基本ルール</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg mb-2">1. カード配布</h3>
                  <p className="text-gray-700">
                    各プレイヤーに1枚ずつカードが配られます。
                    自分のカードは見えませんが、他のプレイヤーのカードは全て見えます。
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2">2. ベッティングラウンド</h3>
                  <p className="text-gray-700 mb-2">
                    ディーラーの左隣から時計回りにベットを行います。
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li><strong>フォールド：</strong> ラウンドから降りる（これまでのベットは失う）</li>
                    <li><strong>チェック：</strong> ベット額が0の時、パスする</li>
                    <li><strong>コール：</strong> 現在のベット額に合わせる</li>
                    <li><strong>レイズ：</strong> ベット額を上げる</li>
                    <li><strong>オールイン：</strong> 残り全チップを賭ける</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2">3. ショーダウン</h3>
                  <p className="text-gray-700">
                    全員がコールorフォールドしたらショーダウン。
                    残っているプレイヤーの中で最も強いカードを持つプレイヤーが勝利し、ポットを獲得します。
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2">4. カードの強さ</h3>
                  <p className="text-gray-700">
                    A（エース）が最強、2が最弱です。<br />
                    <span className="font-mono text-sm">A &gt; K &gt; Q &gt; J &gt; 10 &gt; 9 &gt; 8 &gt; 7 &gt; 6 &gt; 5 &gt; 4 &gt; 3 &gt; 2</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 戦略のヒント */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">戦略のヒント</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg mb-2">🎭 相手の反応を観察</h3>
                  <p className="text-gray-700">
                    相手が強気にベットしてきたら、あなたのカードは弱い可能性があります。
                    逆に、相手が慎重ならあなたのカードが強いかもしれません。
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2">🃏 他のプレイヤーのカードを見る</h3>
                  <p className="text-gray-700">
                    複数人対戦の場合、他のプレイヤーのカードを見て相対的な強さを推測しましょう。
                    全員が弱いカードなら、自分も弱い可能性が高いです。
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2">💰 ブラフも重要</h3>
                  <p className="text-gray-700">
                    弱いカードでも強気にベットすることで、相手をフォールドさせられることもあります。
                    ただし、やりすぎは禁物です。
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2">📊 確率を考える</h3>
                  <p className="text-gray-700">
                    相手のカードを見て、自分がどれくらいの強さなのかを確率的に考えましょう。
                    例：相手が全員8以下なら、自分が9以上である確率は高くなります。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ゲームモード */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">ゲームモード</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-bold mb-1">🤖 CPU対戦</h3>
                  <p className="text-sm text-gray-700">
                    AI相手に練習できます。難易度は Easy / Medium / Hard の3段階。
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-bold mb-1">👥 ローカル対戦</h3>
                  <p className="text-sm text-gray-700">
                    同じ端末で交代しながら遊べます。友達と一緒にプレイ！
                  </p>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="font-bold mb-1">🌐 オンライン対戦（準備中）</h3>
                  <p className="text-sm text-gray-700">
                    世界中のプレイヤーとリアルタイム対戦できます（実装予定）。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 戻るボタン */}
          <div className="text-center">
            <Button variant="primary" size="lg" asChild>
              <Link href="/games/indian-poker">ゲームで遊ぶ</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
