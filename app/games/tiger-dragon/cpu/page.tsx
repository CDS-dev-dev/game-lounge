'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';
import {
  createInitialState,
  startRound,
  attack,
  defend,
  pass,
  endRound,
  toClientState,
} from '@/lib/games/tiger-dragon/engine';
import type {
  TigerDragonState,
  TigerDragonClientState,
} from '@/lib/games/tiger-dragon/types';
import { TigerDragonBoard } from '@/components/game/TigerDragonBoard';
import { useToast } from '@/components/ui/Toast';
import { formatGameError } from '@/lib/utils/error-handler';
import { useSafeTimeout } from '@/lib/hooks/useSafeTimeout';
import { getAIAction } from '@/lib/games/tiger-dragon/ai';
import { logger } from '@/lib/utils/logger';

type GamePhase = 'playerSelect' | 'difficultySelect' | 'playing' | 'roundEnd' | 'finished';

const PLAYER_ID = 'player-human';
const GAME_ID = 'tiger-dragon-cpu-game';

export default function TigerDragonCpuPage() {
  const { showToast } = useToast();
  const { setSafeTimeout } = useSafeTimeout();
  const [phase, setPhase] = useState<GamePhase>('playerSelect');
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [gameState, setGameState] = useState<TigerDragonState | null>(null);
  const [clientState, setClientState] = useState<TigerDragonClientState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // ゲーム開始
  const handleStartGame = useCallback(() => {
    // プレイヤーIDと名前を生成
    const playerIds = [PLAYER_ID];
    const playerNames = ['あなた'];
    const cpuFlags = [false];
    const cpuDifficulties: ('easy' | 'medium' | 'hard')[] = [difficulty];

    for (let i = 1; i < playerCount; i++) {
      playerIds.push(`cpu-${i}`);
      playerNames.push(`CPU ${i}`);
      cpuFlags.push(true);
      cpuDifficulties.push(difficulty);
    }

    const newState = createInitialState(
      GAME_ID,
      playerIds,
      playerNames,
      cpuFlags,
      cpuDifficulties
    );
    setGameState(newState);
    setClientState(toClientState(newState, PLAYER_ID));
    setPhase('playing');

    // ラウンド開始
    startNewRound(newState);
  }, [playerCount, difficulty]);

  // ラウンド開始
  const startNewRound = useCallback(async (state: TigerDragonState) => {
    try {
      setIsProcessing(true);
      await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 500));

      let newState = startRound(state);
      setGameState(newState);
      setClientState(toClientState(newState, PLAYER_ID));
      setIsProcessing(false);

      // CPUのターンなら自動実行
      if (newState.currentPlayerId !== PLAYER_ID) {
        executeCPUTurn(newState);
      }
    } catch (error) {
      logger.error('Start round error:', error);
      showToast(formatGameError(error), 'error');
      setIsProcessing(false);
    }
  }, [setSafeTimeout, showToast]);

  // CPUのターン実行
  const executeCPUTurn = useCallback(async (state: TigerDragonState) => {
    if (state.status !== 'playing') return;

    const currentPlayer = state.players.find((p) => p.id === state.currentPlayerId);
    if (!currentPlayer || !currentPlayer.isCpu) return;

    setIsProcessing(true);

    try {
      await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 1000));

      const aiAction = getAIAction(
        state,
        currentPlayer.id,
        currentPlayer.cpuDifficulty || 'medium'
      );

      let newState = state;

      if (aiAction.action === 'attack' && aiAction.tileId) {
        newState = attack(state, currentPlayer.id, aiAction.tileId);
        showToast(`${currentPlayer.name}が攻めました`, 'info');
      } else if (aiAction.action === 'defend' && aiAction.tileId) {
        newState = defend(state, currentPlayer.id, aiAction.tileId);
        showToast(`${currentPlayer.name}が受けました`, 'info');
      } else if (aiAction.action === 'pass') {
        newState = pass(state, currentPlayer.id);
        showToast(`${currentPlayer.name}がパスしました`, 'info');
      }

      setGameState(newState);
      setClientState(toClientState(newState, PLAYER_ID));

      // ラウンド終了チェック
      if (newState.status === 'roundEnd') {
        setPhase('roundEnd');
        setIsProcessing(false);
        return;
      }

      setIsProcessing(false);

      // 次のプレイヤーがCPUなら続行
      if (newState.currentPlayerId !== PLAYER_ID) {
        executeCPUTurn(newState);
      }
    } catch (error) {
      logger.error('CPU turn error:', error);
      showToast(formatGameError(error), 'error');
      setIsProcessing(false);
    }
  }, [setSafeTimeout, showToast]);

  // 攻めアクション
  const handleAttack = useCallback(async (tileId: string) => {
    if (!gameState || isProcessing) return;

    try {
      setIsProcessing(true);
      let newState = attack(gameState, PLAYER_ID, tileId);
      setGameState(newState);
      setClientState(toClientState(newState, PLAYER_ID));

      // ラウンド終了チェック
      if (newState.status === 'roundEnd') {
        setPhase('roundEnd');
        setIsProcessing(false);
        return;
      }

      setIsProcessing(false);

      // 次のプレイヤーがCPUなら実行
      if (newState.currentPlayerId !== PLAYER_ID) {
        executeCPUTurn(newState);
      }
    } catch (error) {
      logger.error('Attack error:', error);
      showToast(formatGameError(error), 'error');
      setIsProcessing(false);
    }
  }, [gameState, isProcessing, executeCPUTurn, showToast]);

  // 受けアクション
  const handleDefend = useCallback(async (tileId: string) => {
    if (!gameState || isProcessing) return;

    try {
      setIsProcessing(true);
      let newState = defend(gameState, PLAYER_ID, tileId);
      setGameState(newState);
      setClientState(toClientState(newState, PLAYER_ID));

      // ラウンド終了チェック
      if (newState.status === 'roundEnd') {
        setPhase('roundEnd');
        setIsProcessing(false);
        return;
      }

      setIsProcessing(false);

      // 次のプレイヤーがCPUなら実行
      if (newState.currentPlayerId !== PLAYER_ID) {
        executeCPUTurn(newState);
      }
    } catch (error) {
      logger.error('Defend error:', error);
      showToast(formatGameError(error), 'error');
      setIsProcessing(false);
    }
  }, [gameState, isProcessing, executeCPUTurn, showToast]);

  // パスアクション
  const handlePass = useCallback(async () => {
    if (!gameState || isProcessing) return;

    try {
      setIsProcessing(true);
      let newState = pass(gameState, PLAYER_ID);
      setGameState(newState);
      setClientState(toClientState(newState, PLAYER_ID));
      setIsProcessing(false);

      // 次のプレイヤーがCPUなら実行
      if (newState.currentPlayerId !== PLAYER_ID) {
        executeCPUTurn(newState);
      }
    } catch (error) {
      logger.error('Pass error:', error);
      showToast(formatGameError(error), 'error');
      setIsProcessing(false);
    }
  }, [gameState, isProcessing, executeCPUTurn, showToast]);

  // ラウンド終了処理
  const handleEndRound = useCallback(async () => {
    if (!gameState || isProcessing) return;

    try {
      setIsProcessing(true);
      await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 1000));

      let newState = endRound(gameState);
      setGameState(newState);
      setClientState(toClientState(newState, PLAYER_ID));

      // 勝者判定
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
        // 次のラウンドを開始
        startNewRound(newState);
      }

      setIsProcessing(false);
    } catch (error) {
      logger.error('End round error:', error);
      showToast(formatGameError(error), 'error');
      setIsProcessing(false);
    }
  }, [gameState, isProcessing, setSafeTimeout, startNewRound, showToast]);

  // リスタート
  const handleRestart = useCallback(() => {
    setPhase('playerSelect');
    setPlayerCount(2);
    setDifficulty('medium');
    setGameState(null);
    setClientState(null);
    setIsProcessing(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 sm:pt-24 pb-4 sm:pb-8 px-3 sm:px-4">
      <GameHeader title="タイガー&ドラゴン - CPU対戦" />

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
                  {[2, 3, 4, 5].map((count) => (
                    <button
                      key={count}
                      onClick={() => {
                        setPlayerCount(count);
                        setPhase('difficultySelect');
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-8 rounded-lg font-bold text-2xl transition-colors"
                    >
                      {count}人
                    </button>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>配牌枚数：</strong> 2人=20枚、3人=13枚、4人=10枚、5人=8枚
                    <br />
                    スタートプレイヤーは+1枚
                  </p>
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href="/games/tiger-dragon"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    モード選択に戻る
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 難易度選択 */}
        {phase === 'difficultySelect' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-center">難易度を選択</h2>
                <p className="text-sm text-gray-600 text-center mt-2">
                  {playerCount}人プレイ
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => {
                      setDifficulty('easy');
                      handleStartGame();
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white py-8 rounded-lg font-bold text-xl transition-colors"
                  >
                    イージー
                    <p className="text-sm mt-2">ランダムに行動</p>
                  </button>
                  <button
                    onClick={() => {
                      setDifficulty('medium');
                      handleStartGame();
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-8 rounded-lg font-bold text-xl transition-colors"
                  >
                    ノーマル
                    <p className="text-sm mt-2">基本戦略あり</p>
                  </button>
                  <button
                    onClick={() => {
                      setDifficulty('hard');
                      handleStartGame();
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white py-8 rounded-lg font-bold text-xl transition-colors"
                  >
                    ハード
                    <p className="text-sm mt-2">高度な戦略</p>
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setPhase('playerSelect')}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    人数選択に戻る
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ゲーム画面 */}
        {(phase === 'playing' || phase === 'roundEnd' || phase === 'finished') &&
          clientState && (
            <div>
              {/* ゲームボード */}
              <TigerDragonBoard
                gameState={clientState}
                onAttack={phase === 'playing' && !isProcessing ? handleAttack : undefined}
                onDefend={phase === 'playing' && !isProcessing ? handleDefend : undefined}
                onPass={phase === 'playing' && !isProcessing ? handlePass : undefined}
                onEndRound={phase === 'roundEnd' && !isProcessing ? handleEndRound : undefined}
              />

              {/* 処理中表示 */}
              {isProcessing && (
                <div className="max-w-6xl mx-auto mt-4 text-center">
                  <p className="text-gray-600">処理中...</p>
                </div>
              )}

              {/* コントロールボタン */}
              <div className="max-w-6xl mx-auto mt-6 flex justify-center gap-4">
                {phase === 'finished' && (
                  <Button onClick={handleRestart} variant="primary" size="lg">
                    もう一度プレイ
                  </Button>
                )}

                <Button variant="secondary" size="lg" asChild>
                  <Link href="/games/tiger-dragon">モード選択に戻る</Link>
                </Button>
              </div>
            </div>
          )}
      </main>
    </div>
  );
}
