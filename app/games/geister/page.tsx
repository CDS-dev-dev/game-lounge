'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function GeisterModePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">ガイスター</h1>
          <p className="text-gray-100">プレイモードを選択してください</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* オンライン対戦 */}
          <Card className="hover:shadow-xl transition-shadow duration-200 border-2 border-indigo-500">
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-800">🌐 オンライン対戦</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                世界中のプレイヤーと対戦
              </p>
              <p className="text-sm text-gray-500 mb-6">
                • 自動マッチング<br />
                • リアルタイム対戦<br />
                • ランダムマッチ
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => router.push('/games/geister/online')}
              >
                オンライン対戦を開始
              </Button>
            </CardContent>
          </Card>

          {/* ローカル対戦（未実装） */}
          <Card className="hover:shadow-xl transition-shadow duration-200 opacity-50">
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-800">👥 ローカル対戦</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                同じ端末で2人対戦
              </p>
              <p className="text-sm text-gray-500 mb-6">
                • 交互に操作<br />
                • 1つの端末で対戦<br />
                • オフライン対応
              </p>
              <Button
                variant="secondary"
                className="w-full"
                disabled
              >
                近日公開
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-xl font-bold">ガイスターとは？</h3>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              ガイスターは、good（青）とbad（赤）のオバケ駒を使った心理戦ボードゲームです。
              相手の駒の種類は見えないため、ブラフや読み合いが重要になります。
            </p>
            <div className="mt-4">
              <Link
                href="/games/geister/rules"
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                詳しいルールを見る →
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/games" className="text-gray-200 hover:text-white underline">
            ゲーム選択に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
