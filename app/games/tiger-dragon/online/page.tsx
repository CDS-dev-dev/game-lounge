'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';

export default function TigerDragonOnlinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 sm:pt-20 pb-4 sm:pb-8 px-2 sm:px-4">
      <GameHeader title="タイガー&ドラゴン - オンライン対戦" />

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
                  もうしばらくお待ちください。
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700">
                    <strong>実装予定の機能：</strong>
                  </p>
                  <ul className="text-sm text-gray-700 mt-2 space-y-1 text-left list-disc list-inside">
                    <li>リアルタイムマッチング</li>
                    <li>フレンド招待</li>
                    <li>チャット機能</li>
                    <li>ランキングシステム</li>
                  </ul>
                </div>

                <Button variant="primary" size="lg" asChild>
                  <Link href="/games/tiger-dragon">モード選択に戻る</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
