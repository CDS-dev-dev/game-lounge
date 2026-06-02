'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';
import {
  createInitialState,
  progressGame,
  toClientState,
} from '@/lib/games/emperor/engine';
import type { EmperorState, EmperorClientState } from '@/lib/games/emperor/types';
import { EmperorBoard } from '@/components/game/EmperorBoard';
import { useToast } from '@/components/ui/Toast';
import { formatGameError } from '@/lib/utils/error-handler';
import { useSafeTimeout } from '@/lib/hooks/useSafeTimeout';

type GamePhase = 'playerSelect' | 'playing' | 'autoProgress' | 'finished';

const PLAYER_ID = 'player-human';
const GAME_ID = 'emperor-cpu-game';

export default function EmperorCpuPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { setSafeTimeout } = useSafeTimeout();
  const [phase, setPhase] = useState<GamePhase>('playerSelect');
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [gameState, setGameState] = useState<EmperorState | null>(null);
  const [clientState, setClientState] = useState<EmperorClientState | null>(null);

  // ゲーム開始
  const handleStartGame = (count: number) => {
    setPlayerCount(count);

    // プレイヤーIDと名前を生成
    const playerIds = [PLAYER_ID];
    const playerNames = ['あなた'];
    const cpuFlags = [false];

    for (let i = 1; i < count; i++) {
      playerIds.push(`cpu-${i}`);
      playerNames.push(`CPU ${i}`);
      cpuFlags.push(true);
    }

    const newState = createInitialState(GAME_ID, playerIds, playerNames, cpuFlags);
    setGameState(newState);
    setClientState(toClientState(newState, PLAYER_ID));
    setPhase('playing');

    // 自動的にゲームを進行
    autoProgress(newState);
  };

  // 自動進行
  const autoProgress = async (state: EmperorState) => {
    try {
      setPhase('autoProgress');

      // カードを配る
      await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 1000));
      let newState = progressGame(state); // waiting → dealing
      setGameState(newState);
      setClientState(toClientState(newState, PLAYER_ID));

      // カードを公開
      await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 1500));
      newState = progressGame(newState); // dealing → reveal
      setGameState(newState);
      setClientState(toClientState(newState, PLAYER_ID));

      // コイン移動
      await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 2000));
      newState = progressGame(newState); // reveal → transfer
      setGameState(newState);
      setClientState(toClientState(newState, PLAYER_ID));

      // ゲーム終了判定
      if (newState.winner) {
        setPhase('finished');
        const winner = newState.players.find((p) => p.id === newState.winner);
        if (winner) {
          if (winner.id === PLAYER_ID) {
            showToast('おめでとうございます！あなたの勝利です！', 'success');
          } else {
            showToast(`${winner.name}の勝利です`, 'info');
          }
        }
      } else {
        setPhase('playing');
      }
    } catch (error) {
      console.error('Auto progress error:', error);
      showToast(formatGameError(error), 'error');
      setPhase('playing');
    }
  };

  // 次のラウンドへ
  const handleNextRound = () => {
    if (!gameState) return;

    try {
      // transfer → waiting（次のラウンド）
      let newState = progressGame(gameState);
      setGameState(newState);
      setClientState(toClientState(newState, PLAYER_ID));

      // 自動進行を開始
      autoProgress(newState);
    } catch (error) {
      console.error('Next round error:', error);
      showToast(formatGameError(error), 'error');
    }
  };

  // リスタート
  const handleRestart = () => {
    setPhase('playerSelect');
    setGameState(null);
    setClientState(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <GameHeader title="エンペラーゲーム - CPU対戦" />

      <main className="container mx-auto px-4 py-8">
        {/* プレイヤー人数選択 */}
        {phase === 'playerSelect' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-center">プレイヤー人数を選択</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[3, 4, 5, 6].map((count) => (
                    <button
                      key={count}
                      onClick={() => handleStartGame(count)}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-8 rounded-lg font-bold text-2xl transition-colors"
                    >
                      {count}人
                    </button>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>ヒント：</strong> プレイヤー人数が多いほど、市民が増えて運要素が高まります。
                    3人プレイでは皇帝・市民・奴隷が1人ずつになります。
                  </p>
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href="/games/emperor"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    モード選択に戻る
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ゲーム画面 */}
        {(phase === 'playing' || phase === 'autoProgress' || phase === 'finished') &&
          clientState && (
            <div>
              {/* ゲームボード */}
              <EmperorBoard
                gameState={clientState}
                onNextRound={phase === 'playing' ? handleNextRound : undefined}
              />

              {/* コントロールボタン */}
              <div className="max-w-4xl mx-auto mt-6 flex justify-center gap-4">
                {phase === 'finished' && (
                  <Button onClick={handleRestart} variant="primary" size="lg">
                    もう一度プレイ
                  </Button>
                )}

                <Button variant="secondary" size="lg" asChild>
                  <Link href="/games/emperor">モード選択に戻る</Link>
                </Button>
              </div>
            </div>
          )}
      </main>
    </div>
  );
}
