// エンペラーゲーム（カイジのEカード）オンライン対戦ページ（準備中）

'use client';

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
          <Card className="bg-white/95">
            <CardHeader>
              <h2 className="text-2xl font-bold text-slate-900 text-center">🚧 オンライン対戦 準備中</h2>
            </CardHeader>
            <CardContent className="py-8 space-y-8">
              {/* 開発進捗表示 */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>開発進捗</span>
                  <span className="font-semibold">15%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className="bg-indigo-600 h-3 rounded-full" style={{ width: '15%' }}></div>
                </div>
                <p className="text-sm text-slate-600 text-center">
                  マッチング機能とリアルタイム通信を実装予定です
                </p>
              </div>

              {/* 代替機能への強い導線 */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-6">
                <p className="text-lg font-bold text-slate-900 mb-4 text-center">
                  ✨ 今すぐプレイ可能！
                </p>
                <div className="grid grid-cols-1 gap-4">
                  <Link href="/games/emperor/cpu" className="block">
                    <Button variant="primary" size="lg" className="w-full h-auto py-4 text-lg shadow-lg hover:shadow-xl transition-shadow">
                      🤖 CPU対戦
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-slate-600 text-center mt-4">
                  AIとの緊張感あふれる心理戦を楽しめます
                </p>
              </div>

              {/* 戻るボタン */}
              <div className="text-center pt-4 border-t">
                <Link href="/games/emperor">
                  <Button variant="secondary" size="lg">モード選択に戻る</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
