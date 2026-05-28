'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { setupPieces } from '@/lib/games/geister/engine';
import { loadGameSession, saveGameSession, getOrCreatePlayerId } from '@/lib/supabase/gameState';
import type { PieceSetup, PlayerRole } from '@/lib/games/geister/types';
import { SetupBoard } from '@/components/game/SetupBoard';

const SETUP_TIME_LIMIT = 60; // 60秒

export default function SetupPage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.gameId as string;
  const { showToast } = useToast();

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [setup, setSetup] = useState<PieceSetup[]>([]);
  const [myRole, setMyRole] = useState<PlayerRole | null>(null);

  useEffect(() => {
    const initSetup = async () => {
      try {
        const pid = await getOrCreatePlayerId();
        setPlayerId(pid);

        const state = await loadGameSession(gameId);
        if (!state) {
          showToast('ゲームが見つかりません', 'error');
          router.push('/games');
          return;
        }

        // 自分のロールを判定
        if (state.players.player1 === pid) {
          setMyRole('player1');
        } else if (state.players.player2 === pid) {
          setMyRole('player2');
        } else {
          showToast('このゲームの参加者ではありません', 'error');
          router.push('/games');
        }
      } catch (error) {
        console.error('セットアップエラー:', error);
        showToast('ゲームの読み込みに失敗しました', 'error');
        router.push('/games');
      }
    };

    initSetup();
  }, [gameId, router, showToast]);

  const handleComplete = async (finalSetup: PieceSetup[]) => {
    if (!playerId) return;

    try {
      const state = await loadGameSession(gameId);
      if (!state) {
        showToast('ゲームが見つかりません', 'error');
        return;
      }

      const newState = setupPieces(state, playerId, finalSetup);
      await saveGameSession(gameId, newState);

      showToast('配置完了！対戦画面に移動します', 'success');
      // 対戦画面に遷移
      setTimeout(() => router.push(`/play/${gameId}`), 1000);
    } catch (error) {
      console.error('配置エラー:', error);
      showToast(error instanceof Error ? error.message : '配置に失敗しました', 'error');
    }
  };

  const handleTimeout = () => {
    console.log('時間切れ！ランダム配置が適用されます');
  };

  if (!myRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-white text-xl">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-3 sm:mb-6">
          <CardHeader>
            <h1 className="text-2xl sm:text-4xl font-bold text-center">駒の配置</h1>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-3 sm:mb-6">
              <p className="text-base sm:text-lg text-gray-700">
                あなたは{' '}
                <span className="font-bold text-indigo-600">
                  {myRole === 'player1' ? 'プレイヤー1' : 'プレイヤー2'}
                </span>{' '}
                です
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                good 4個、bad 4個を自陣に配置してください（制限時間: 1分）
              </p>
            </div>

            <SetupBoard
              myRole={myRole}
              setup={setup}
              onSetupChange={setSetup}
              timeLimit={SETUP_TIME_LIMIT}
              onTimeout={handleTimeout}
              onComplete={handleComplete}
            />
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Link href="/games/geister" className="text-gray-200 hover:text-white underline text-sm">
            キャンセルしてモード選択に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
