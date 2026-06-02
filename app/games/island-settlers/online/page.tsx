// アイランドセトラーズ オンライン対戦ページ（準備中）

'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';

export default function IslandSettlersOnlinePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 sm:pt-24 pb-4 sm:pb-8 px-3 sm:px-4">
      <GameHeader title="アイランドセトラーズ - オンライン対戦" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold text-center">🚧 オンライン対戦 準備中</h2>
            </CardHeader>
            <CardContent className="py-8 space-y-8">
              {/* 開発進捗表示 */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>開発進捗</span>
                  <span className="font-semibold">30%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className="bg-indigo-600 h-3 rounded-full" style={{ width: '30%' }}></div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={() => router.push('/games/island-settlers/cpu')}
                    variant="primary"
                    size="lg"
                    className="w-full h-auto py-4 text-lg shadow-lg hover:shadow-xl transition-shadow"
                  >
                    🤖 CPU対戦
                  </Button>
                  <Button
                    onClick={() => router.push('/games/island-settlers/local')}
                    variant="primary"
                    size="lg"
                    className="w-full h-auto py-4 text-lg shadow-lg hover:shadow-xl transition-shadow"
                  >
                    👥 ローカル対戦
                  </Button>
                </div>
                <p className="text-sm text-slate-600 text-center mt-4">
                  友達と同じ端末で対戦、またはAIと対戦できます
                </p>
              </div>

              {/* 戻るボタン */}
              <div className="text-center pt-4 border-t">
                <Button
                  onClick={() => router.push('/games/island-settlers')}
                  variant="secondary"
                  size="lg"
                >
                  モード選択に戻る
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
