'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { findOrCreateGame, getOrCreatePlayerId } from '@/lib/supabase/gameState';

export default function GeisterOnlinePage() {
  const router = useRouter();
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    // ページを開いたら自動的にマッチング開始
    startMatching();
  }, []);

  const startMatching = async () => {
    setIsMatching(true);
    try {
      const playerId = await getOrCreatePlayerId();

      // 待機中のゲームを探すか、新規作成
      const gameId = await findOrCreateGame(playerId);

      // 初期配置画面に遷移
      router.push(`/setup/${gameId}`);
    } catch (error) {
      console.error('マッチング エラー:', error);
      alert('マッチングに失敗しました');
      setIsMatching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <h1 className="text-3xl font-bold">オンライン対戦</h1>
          </CardHeader>
          <CardContent className="space-y-6">
            {isMatching ? (
              <>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
                </div>
                <p className="text-lg font-semibold text-gray-700">
                  対戦相手を探しています...
                </p>
                <p className="text-sm text-gray-500">
                  マッチングが完了するまでお待ちください
                </p>
              </>
            ) : (
              <>
                <p className="text-lg text-gray-700">
                  マッチングエラーが発生しました
                </p>
                <Button
                  variant="primary"
                  onClick={startMatching}
                >
                  再試行
                </Button>
              </>
            )}

            <div className="mt-8 pt-6 border-t">
              <Link
                href="/games/geister"
                className="text-gray-600 hover:text-gray-800 underline"
              >
                モード選択に戻る
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
