'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { GameHeader } from '@/components/layout/GameHeader';
import {
  createInitialState,
  startRound,
  executeAction,
  toClientState,
} from '@/lib/games/indian-poker/engine';
import { decideAIAction } from '@/lib/games/indian-poker/ai';
import type { IndianPokerState, IndianPokerClientState, Difficulty, BettingAction } from '@/lib/games/indian-poker/types';
import { IndianPokerBoard } from '@/components/game/IndianPokerBoard';
import { useToast } from '@/components/ui/Toast';
import { formatGameError } from '@/lib/utils/error-handler';
import { useSafeTimeout } from '@/lib/hooks/useSafeTimeout';
import { logger } from '@/lib/utils/logger';

type GamePhase = 'playerSelect' | 'difficultySelect' | 'playing' | 'finished';

const PLAYER_ID = 'player-human';
const GAME_ID = 'indian-poker-cpu-game';

export default function IndianPokerCpuPage() {
  const { showToast } = useToast();
  const { setSafeTimeout } = useSafeTimeout();
  const [phase, setPhase] = useState<GamePhase>('playerSelect');
  const [playerCount, setPlayerCount] = useState<number>(3);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameState, setGameState] = useState<IndianPokerState | null>(null);
  const [clientState, setClientState] = useState<IndianPokerClientState | null>(null);

  // プレイヤー人数選択
  const handleSelectPlayerCount = useCallback((count: number) => {
    setPlayerCount(count);
    setPhase('difficultySelect');
  }, []);

  // 難易度選択してゲーム開始
  const handleStartGame = useCallback((selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);

    const cpuCount = playerCount - 1;
    let newState = createInitialState(GAME_ID, playerCount, PLAYER_ID, cpuCount, selectedDifficulty);

    // カードを配る
    newState = startRound(newState);

    setGameState(newState);
    setClientState(toClientState(newState, PLAYER_ID));
    setPhase('playing');

    // 最初のターンがCPUなら自動実行
    if (newState.players[newState.currentTurn].isCPU) {
      executeCPUTurns(newState);
    }
  }, [playerCount]);

  // CPUターンを連続実行
  const executeCPUTurns = async (state: IndianPokerState) => {
    let currentState = state;

    while (
      currentState.status === 'betting' &&
      currentState.players[currentState.currentTurn].isCPU
    ) {
      await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 800));

      const cpuPlayer = currentState.players[currentState.currentTurn];
      const action = decideAIAction(currentState, cpuPlayer.id);

      try {
        currentState = executeAction(currentState, cpuPlayer.id, action);
        setGameState(currentState);
        setClientState(toClientState(currentState, PLAYER_ID));

        // ショーダウンまたは終了したら停止
        if (currentState.status !== 'betting') {
          if (currentState.status === 'showdown') {
            await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 2000));
            handleShowdown(currentState);
          }
          break;
        }
      } catch (error) {
        logger.error('CPU action error:', error);
        showToast(formatGameError(error), 'error');
        break;
      }
    }
  };

  // プレイヤーのアクション
  const handlePlayerAction = useCallback((action: BettingAction) => {
    if (!gameState || !clientState) return;

    try {
      let newState = executeAction(gameState, PLAYER_ID, action);
      setGameState(newState);
      setClientState(toClientState(newState, PLAYER_ID));

      // ショーダウンになったら結果表示
      if (newState.status === 'showdown') {
        setSafeTimeout(() => handleShowdown(newState), 1500);
      } else if (newState.status === 'betting') {
        // CPUのターンを実行
        executeCPUTurns(newState);
      }
    } catch (error) {
      logger.error('Player action error:', error);
      showToast(formatGameError(error), 'error');
    }
  }, [gameState, clientState, setSafeTimeout, showToast]);

  // ショーダウン処理
  const handleShowdown = (state: IndianPokerState) => {
    setPhase('finished');

    const activePlayers = state.players.filter(p => p.isActive);
    if (activePlayers.length === 0) return;

    // 最も強いカードを持つプレイヤーを探す
    let maxValue = 0;
    const winners: string[] = [];

    activePlayers.forEach(p => {
      if (!p.card) return;
      const rankValue = getRankValue(p.card.rank);
      if (rankValue > maxValue) {
        maxValue = rankValue;
        winners.length = 0;
        winners.push(p.id);
      } else if (rankValue === maxValue) {
        winners.push(p.id);
      }
    });

    const isWinner = winners.includes(PLAYER_ID);
    if (isWinner) {
      showToast('おめでとうございます！あなたの勝利です！', 'success');
    } else {
      const winnerNames = winners
        .map(id => state.players.find(p => p.id === id)?.name)
        .filter(Boolean)
        .join(', ');
      showToast(`${winnerNames}の勝利です`, 'info');
    }
  };

  // カードの数値化
  const getRankValue = (rank: string): number => {
    const values: Record<string, number> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
      'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return values[rank] || 0;
  };

  // リスタート
  const handleRestart = useCallback(() => {
    setPhase('playerSelect');
    setGameState(null);
    setClientState(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 sm:pt-24 pb-4 sm:pb-8 px-3 sm:px-4">
      <GameHeader title="インディアンポーカー - CPU対戦" />

      <main className="container mx-auto px-4 py-8">
        {/* プレイヤー人数選択 */}
        {phase === 'playerSelect' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-center">プレイヤー人数を選択</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                  {[2, 3, 4, 5, 6].map((count) => (
                    <button
                      key={count}
                      onClick={() => handleSelectPlayerCount(count)}
                      className="bg-purple-500 hover:bg-purple-600 text-white py-8 rounded-lg font-bold text-2xl transition-colors"
                    >
                      {count}人
                    </button>
                  ))}
                </div>

                <p className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
                  <strong>ヒント：</strong> 人数が多いほど心理戦が複雑になります。初心者は3-4人がおすすめです。
                </p>

                <div className="mt-6 text-center">
                  <Link href="/games/indian-poker" className="text-purple-600 hover:text-purple-800 underline">
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
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center gap-8">
                  {[
                    { difficulty: 'easy' as Difficulty, icon: '🟢', label: '簡単', variant: 'success' as const },
                    { difficulty: 'medium' as Difficulty, icon: '🟡', label: '普通', variant: 'warning' as const },
                    { difficulty: 'hard' as Difficulty, icon: '🔴', label: '難しい', variant: 'danger' as const },
                  ].map(({ difficulty, icon, label, variant }) => (
                    <div key={difficulty} className="flex flex-col items-center gap-2">
                      <IconButton
                        icon={<span className="text-2xl">{icon}</span>}
                        label={label}
                        onClick={() => handleStartGame(difficulty)}
                        variant={variant}
                        size="lg"
                      />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setPhase('playerSelect')}
                    className="text-purple-600 hover:text-purple-800 underline"
                  >
                    人数選択に戻る
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ゲーム画面 */}
        {(phase === 'playing' || phase === 'finished') && clientState && (
          <div>
            {/* ゲームボード */}
            <IndianPokerBoard
              state={clientState}
              onAction={phase === 'playing' ? handlePlayerAction : undefined}
            />

            {/* コントロールボタン */}
            <div className="max-w-4xl mx-auto mt-6 flex justify-center gap-4">
              {phase === 'finished' && (
                <Button onClick={handleRestart} variant="primary" size="lg">
                  もう一度プレイ
                </Button>
              )}

              <Button variant="secondary" size="lg" asChild>
                <Link href="/games/indian-poker">モード選択に戻る</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
