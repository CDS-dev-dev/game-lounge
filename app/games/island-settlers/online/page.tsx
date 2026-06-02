// アイランドセトラーズ オンライン対戦ページ（準備中）

'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';

export default function IslandSettlersOnlinePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <GameHeader
        title="アイランドセトラーズ"
        subtitle="オンライン対戦"
        onBack={() => router.push('/games')}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">オンライン対戦</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">オンライン対戦機能は準備中です。</p>
              <p className="text-sm text-gray-400">
                現在、ローカル対戦とCPU対戦をお楽しみいただけます。
              </p>
              <div className="flex gap-4">
                <Button onClick={() => router.push('/games/island-settlers/local')} size="lg">
                  ローカル対戦
                </Button>
                <Button onClick={() => router.push('/games/island-settlers/cpu')} size="lg">
                  CPU対戦
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
