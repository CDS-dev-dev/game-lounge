'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { setupPieces } from '@/lib/games/geister/engine';
import { loadGameSession, saveGameSession, getOrCreatePlayerId } from '@/lib/supabase/gameState';
import type { PieceSetup, PlayerRole } from '@/lib/games/geister/types';
import { SetupBoard } from '@/components/game/SetupBoard';

const SETUP_TIME_LIMIT = 60; // 60秒

export default function SetupPage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.gameId as string;

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
          alert('ゲームが見つかりません');
          router.push('/games');
          return;
        }

        // 自分のロールを判定
        if (state.players.player1 === pid) {
          setMyRole('player1');
        } else if (state.players.player2 === pid) {
          setMyRole('player2');
        } else {
          alert('このゲームの参加者ではありません');
          router.push('/games');
        }
      } catch (error) {
        console.error('セットアップエラー:', error);
        alert('ゲームの読み込みに失敗しました');
        router.push('/games');
      }
    };

    initSetup();
  }, [gameId, router]);

  const handleComplete = async (finalSetup: PieceSetup[]) => {
    if (!playerId) return;

    try {
      const state = await loadGameSession(gameId);
      if (!state) {
        alert('ゲームが見つかりません');
        return;
      }

      const newState = setupPieces(state, playerId, finalSetup);
      await saveGameSession(gameId, newState);

      // 対戦画面に遷移
      router.push(`/play/${gameId}`);
    } catch (error) {
      console.error('配置エラー:', error);
      alert(error instanceof Error ? error.message : '配置に失敗しました');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <h1 className="text-4xl font-bold text-center">駒の配置</h1>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <p className="text-lg text-gray-700">
                あなたは{' '}
                <span className="font-bold text-indigo-600">
                  {myRole === 'player1' ? 'プレイヤー1' : 'プレイヤー2'}
                </span>{' '}
                です
              </p>
              <p className="text-sm text-gray-600 mt-2">
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
      </div>
    </div>
  );
}
