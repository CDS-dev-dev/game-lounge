'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';

export default function EmperorOnlinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 sm:pt-20 pb-4 sm:pb-8 px-2 sm:px-4">
      <GameHeader title="エンペラーゲーム - オンライン対戦" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold text-center">オンライン対戦</h2>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">準備中</h3>
                <p className="text-gray-600 mb-6">
                  オンライン対戦機能は現在開発中です。
                  <br />
                  しばらくお待ちください。
                </p>

                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-bold text-blue-800 mb-2">実装予定の機能</h4>
                    <ul className="text-sm text-gray-700 space-y-1 text-left list-disc list-inside">
                      <li>リアルタイムマッチング（3-6人）</li>
                      <li>フレンド対戦（ルームコード共有）</li>
                      <li>ランキングシステム</li>
                      <li>戦績記録</li>
                    </ul>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      代わりにCPU対戦またはローカル対戦をお試しください
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button variant="primary" size="lg" asChild>
                        <Link href="/games/emperor/cpu">CPU対戦</Link>
                      </Button>
                      <Button variant="secondary" size="lg" asChild>
                        <Link href="/games/emperor/local">ローカル対戦</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link href="/games/emperor" className="text-blue-600 hover:text-blue-800 underline">
                  モード選択に戻る
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
