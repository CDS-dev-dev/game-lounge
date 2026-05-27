// 中国象棋 モード選択ページ

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function XiangqiModePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">中国象棋（シャンチー）</h1>
          <p className="text-gray-100">プレイモードを選択してください</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* オンライン対戦 */}
          <Card className="hover:shadow-xl transition-shadow duration-200 border-2 border-indigo-500 bg-white/95">
            <CardHeader>
              <h2 className="text-2xl font-bold text-slate-900">🌐 オンライン対戦</h2>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4 font-medium">
                世界中のプレイヤーと対戦
              </p>
              <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed">
                • 自動マッチング<br />
                • リアルタイム対戦<br />
                • ランダムマッチ
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => router.push('/games/xiangqi/online')}
              >
                オンライン対戦を開始
              </Button>
            </CardContent>
          </Card>

          {/* ローカル対戦 */}
          <Card className="hover:shadow-xl transition-shadow duration-200 bg-white/95">
            <CardHeader>
              <h2 className="text-2xl font-bold text-slate-900">👥 ローカル対戦</h2>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4 font-medium">
                同じ端末で2人対戦
              </p>
              <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed">
                • 交互に操作<br />
                • 1つの端末で対戦<br />
                • オフライン対応
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => router.push('/games/xiangqi/local')}
              >
                ローカル対戦を開始
              </Button>
            </CardContent>
          </Card>

          {/* CPU対戦 */}
          <Card className="hover:shadow-xl transition-shadow duration-200 bg-white/95">
            <CardHeader>
              <h2 className="text-2xl font-bold text-slate-900">🤖 CPU対戦</h2>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4 font-medium">
                コンピュータと対戦
              </p>
              <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed">
                • 一人プレイ<br />
                • 3段階の難易度<br />
                • 練習に最適
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => router.push('/games/xiangqi/cpu')}
              >
                CPU対戦を開始
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 bg-white/95">
          <CardHeader>
            <h3 className="text-xl font-bold text-slate-900">中国象棋とは？</h3>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p className="text-slate-700 font-medium leading-relaxed">
              中国象棋（シャンチー）は中国の伝統的な将棋ゲームです。
              9×10の盤面で、楚河漢界と呼ばれる「川」が特徴。
              帥/将、仕/士、相/象、馬、車、炮/砲、兵/卒の7種類の駒が登場し、
              各駒に固有の動き方があります。
            </p>
            <div className="mt-4">
              <Link
                href="/games/xiangqi/rules"
                className="text-indigo-600 hover:text-indigo-500 underline font-semibold"
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
