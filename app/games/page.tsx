'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function GamesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">ゲーム選択</h1>
          <p className="text-gray-100">オンライン対戦を始めましょう</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-800">ガイスター</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                青と赤のオバケ駒を使った心理戦ボードゲーム
              </p>
              <p className="text-sm text-gray-500 mb-4">プレイ人数: 2人</p>
              <div className="flex flex-col gap-2">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => router.push('/games/geister')}
                >
                  遊ぶ
                </Button>
                <Link
                  href="/games/geister/rules"
                  className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 text-center font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  ルールを見る
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-12 max-w-2xl mx-auto">
          <CardHeader>
            <h3 className="text-xl font-bold">遊び方</h3>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>1. 遊びたいゲームを選択</p>
            <p>2. プレイモード（オンライン対戦など）を選択</p>
            <p>3. ゲーム開始！</p>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <Link href="/" className="text-gray-200 hover:text-white underline">
            トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
