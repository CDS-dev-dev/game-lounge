// 中国象棋 オンライン対戦ページ（スタブ）

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function XiangqiOnlinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-4 sm:py-8 md:py-12 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">中国象棋 オンライン対戦</h1>
        </div>

        <Card className="bg-white/95">
          <CardHeader>
            <h2 className="text-2xl font-bold text-slate-900">🚧 準備中</h2>
          </CardHeader>
          <CardContent className="py-8 text-center">
            <p className="text-lg text-slate-700 mb-6 font-medium">
              オンライン対戦機能は現在開発中です。<br />
              しばらくお待ちください。
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/games/xiangqi/cpu">
                <Button variant="primary">CPU対戦で遊ぶ</Button>
              </Link>
              <Link href="/games/xiangqi/local">
                <Button variant="primary">ローカル対戦で遊ぶ</Button>
              </Link>
              <Link href="/games/xiangqi">
                <Button variant="secondary">モード選択に戻る</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/games/xiangqi" className="text-gray-200 hover:text-white underline">
            モード選択に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
