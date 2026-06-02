'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';

export default function IndianPokerOnlinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <GameHeader title="インディアンポーカー - オンライン対戦" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold text-center">オンライン対戦</h2>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-6">🚧</div>
                <h3 className="text-xl font-bold mb-4">準備中</h3>
                <p className="text-gray-600 mb-8">
                  オンライン対戦機能は現在開発中です。<br />
                  リアルタイムマッチングとマルチプレイヤー対戦を実装予定です。
                </p>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                    <h4 className="font-bold mb-2">実装予定の機能</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>✓ 自動マッチング</li>
                      <li>✓ プレイヤー人数選択（2-6人）</li>
                      <li>✓ CPU混在マッチング</li>
                      <li>✓ リアルタイム対戦</li>
                      <li>✓ 観戦モード</li>
                    </ul>
                  </div>

                  <p className="text-sm text-gray-600">
                    現在は<strong>CPU対戦</strong>または<strong>ローカル対戦</strong>をお楽しみください。
                  </p>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="primary" size="lg" asChild>
                    <Link href="/games/indian-poker/cpu">CPU対戦で遊ぶ</Link>
                  </Button>
                  <Button variant="secondary" size="lg" asChild>
                    <Link href="/games/indian-poker">モード選択に戻る</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
