// エンペラーゲーム（カイジのEカード）ローカル対戦ページ（準備中）

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';

export default function EmperorLocalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 sm:pt-20 pb-4 sm:pb-8 px-2 sm:px-4">
      <GameHeader title="エンペラーゲーム - ローカル対戦" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/95">
            <CardHeader>
              <h2 className="text-2xl font-bold text-slate-900">ローカル対戦</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">ローカル対戦機能は準備中です。</p>
              <p className="text-sm text-slate-600">
                現在、CPU対戦をお楽しみいただけます。
              </p>
              <Link href="/games/emperor/cpu">
                <Button variant="primary" size="lg" className="w-full">
                  CPU対戦を始める
                </Button>
              </Link>
              <Link href="/games/emperor">
                <Button variant="secondary" className="w-full">
                  メニューに戻る
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
