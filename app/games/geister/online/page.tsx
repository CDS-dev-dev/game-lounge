'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  findOrCreateGame,
  getOrCreatePlayerId,
  loadGameSession,
  subscribeToGameSession
} from '@/lib/supabase/gameState';

type MatchingStatus = 'searching' | 'waiting' | 'matched';

export default function GeisterOnlinePage() {
  const router = useRouter();
  const [matchingStatus, setMatchingStatus] = useState<MatchingStatus>('searching');
  const [gameId, setGameId] = useState<string | null>(null);

  useEffect(() => {
    // ページを開いたら自動的にマッチング開始
    startMatching();
  }, []);

  // ゲーム状態の監視
  useEffect(() => {
    if (!gameId) return;

    // ゲーム状態をリアルタイム監視
    const unsubscribe = subscribeToGameSession(gameId, (state) => {
      console.log('Game state updated:', state.status);

      // setupフェーズになったら配置画面へ遷移
      if (state.status === 'setup') {
        setMatchingStatus('matched');
        router.push(`/setup/${gameId}`);
      }
    });

    // 現在の状態も確認
    loadGameSession(gameId).then((state) => {
      if (state) {
        if (state.status === 'setup') {
          setMatchingStatus('matched');
          router.push(`/setup/${gameId}`);
        } else if (state.status === 'waiting') {
          if (state.players.player2) {
            setMatchingStatus('matched');
          } else {
            setMatchingStatus('waiting');
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [gameId, router]);

  const startMatching = async () => {
    setMatchingStatus('searching');
    try {
      const playerId = await getOrCreatePlayerId();

      // 待機中のゲームを探すか、新規作成
      const newGameId = await findOrCreateGame(playerId);
      setGameId(newGameId);

      // ゲーム状態を確認
      const state = await loadGameSession(newGameId);
      if (state) {
        if (state.status === 'setup') {
          // すでにマッチング済み（自分がplayer2として参加した場合）
          setMatchingStatus('matched');
          router.push(`/setup/${newGameId}`);
        } else if (state.players.player2) {
          // player2がいる場合は待機中
          setMatchingStatus('waiting');
        } else {
          // player2がいない場合も待機中
          setMatchingStatus('waiting');
        }
      }
    } catch (error) {
      console.error('マッチング エラー:', error);
      alert('マッチングに失敗しました');
      setMatchingStatus('searching');
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
            {matchingStatus === 'searching' && (
              <>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  ゲームを検索しています...
                </p>
                <p className="text-sm text-gray-500">
                  待機中のゲームを探すか、新しいゲームを作成します
                </p>
              </>
            )}

            {matchingStatus === 'waiting' && (
              <>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  対戦相手を待っています...
                </p>
                <p className="text-sm text-gray-500">
                  他のプレイヤーが参加するまでお待ちください
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <p>ゲームID: {gameId?.slice(0, 8)}...</p>
                  <p className="mt-1">マッチングが完了すると自動的に駒の配置画面に移動します</p>
                </div>
              </>
            )}

            {matchingStatus === 'matched' && (
              <>
                <div className="flex justify-center">
                  <div className="text-green-500 text-6xl mb-4">✓</div>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  マッチング完了！
                </p>
                <p className="text-sm text-gray-500">
                  駒の配置画面に移動します...
                </p>
              </>
            )}

            <div className="mt-8 pt-6 border-t">
              <Link
                href="/games/geister"
                className="text-gray-700 hover:text-gray-900 underline"
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
