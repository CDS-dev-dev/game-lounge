'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';
import { PlaySetupCard, SetupBackLink, SetupHint, SetupOptionButton } from '@/components/game/PlaySetup';
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

  // CPUのターン実行
  const executeCPUTurn = useCallback(async (state: TigerDragonState) => {
    let currentState = state;

    while (currentState.status === 'playing') {
      const currentPlayer = currentState.players.find((p) => p.id === currentState.currentPlayerId);
      if (!currentPlayer || !currentPlayer.isCpu) return;

      setIsProcessing(true);

      try {
        await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 1000));

        const aiAction = getAIAction(
          currentState,
          currentPlayer.id,
          currentPlayer.cpuDifficulty || 'medium'
        );

        let newState = currentState;

        if (aiAction.action === 'attack' && aiAction.tileId) {
          newState = attack(currentState, currentPlayer.id, aiAction.tileId);
          showToast(`${currentPlayer.name}が攻めました`, 'info');
        } else if (aiAction.action === 'defend' && aiAction.tileId) {
          newState = defend(currentState, currentPlayer.id, aiAction.tileId);
          showToast(`${currentPlayer.name}が受けました`, 'info');
        } else if (aiAction.action === 'pass') {
          newState = pass(currentState, currentPlayer.id);
          showToast(`${currentPlayer.name}がパスしました`, 'info');
        }

        setGameState(newState);
        setClientState(toClientState(newState, PLAYER_ID));

        if (newState.status === 'roundEnd') {
          setPhase('roundEnd');
          setIsProcessing(false);
          return;
        }

        setIsProcessing(false);
        currentState = newState;
      } catch (error) {
        logger.error('CPU turn error:', error);
        showToast(formatGameError(error), 'error');
        setIsProcessing(false);
        return;
      }
    }
  }, [setSafeTimeout, showToast]);

  // ラウンド開始
  const startNewRound = useCallback(async (state: TigerDragonState) => {
    try {
      setIsProcessing(true);
      await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 500));

      const newState = startRound(state);
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
  }, [executeCPUTurn, setSafeTimeout, showToast]);

  // ゲーム開始
  const handleStartGame = useCallback((selectedDifficulty: 'easy' | 'medium' | 'hard' = difficulty) => {
    // プレイヤーIDと名前を生成
    const playerIds = [PLAYER_ID];
    const playerNames = ['あなた'];
    const cpuFlags = [false];
    const cpuDifficulties: ('easy' | 'medium' | 'hard')[] = [selectedDifficulty];

    for (let i = 1; i < playerCount; i++) {
      playerIds.push(`cpu-${i}`);
      playerNames.push(`CPU ${i}`);
      cpuFlags.push(true);
      cpuDifficulties.push(selectedDifficulty);
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
  }, [difficulty, playerCount, startNewRound]);

  // 攻めアクション
  const handleAttack = useCallback(async (tileId: string) => {
    if (!gameState || isProcessing) return;

    try {
      setIsProcessing(true);
      const newState = attack(gameState, PLAYER_ID, tileId);
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
      const newState = defend(gameState, PLAYER_ID, tileId);
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
      const newState = pass(gameState, PLAYER_ID);
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

      const newState = endRound(gameState);
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
    <div className="min-h-screen app-bg board-pattern pt-16 pb-3 px-3 sm:pt-20 sm:px-4">
      <GameHeader title="タイガー&ドラゴン - CPU対戦" />

      <main className="container mx-auto px-0 py-2 sm:px-4 sm:py-4">
        {phase === 'playerSelect' && (
          <PlaySetupCard
            title="プレイヤー人数を選択"
            subtitle="人数が増えるほど手牌が少なくなり、早い判断が大事になります。"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { count: 2, meta: '20枚' },
                { count: 3, meta: '13枚' },
                { count: 4, meta: '10枚' },
                { count: 5, meta: '8枚' },
              ].map(({ count, meta }) => (
                <SetupOptionButton
                  key={count}
                  title={`${count}人`}
                  description="配牌"
                  meta={meta}
                  onClick={() => {
                    setPlayerCount(count);
                    setPhase('difficultySelect');
                  }}
                  tone={count <= 3 ? 'teal' : 'amber'}
                  className="min-h-[104px]"
                />
              ))}
            </div>

            <div className="mt-5">
              <SetupHint tone="warning">スタートプレイヤーは+1枚です。人数が多いほど1手の重みが増えます。</SetupHint>
            </div>

            <div className="mt-5 text-center">
              <SetupBackLink href="/games/tiger-dragon">モード選択に戻る</SetupBackLink>
            </div>
          </PlaySetupCard>
        )}

        {phase === 'difficultySelect' && (
          <PlaySetupCard title="難易度を選択" subtitle={`${playerCount}人プレイで開始します。`}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { value: 'easy' as const, title: 'イージー', description: 'ランダム寄りに行動', tone: 'green' as const },
                { value: 'medium' as const, title: 'ノーマル', description: '基本戦略あり', tone: 'amber' as const },
                { value: 'hard' as const, title: 'ハード', description: '受け牌を読んで行動', tone: 'red' as const },
              ].map((item) => (
                <SetupOptionButton
                  key={item.value}
                  title={item.title}
                  description={item.description}
                  selected={difficulty === item.value}
                  onClick={() => {
                    setDifficulty(item.value);
                    handleStartGame(item.value);
                  }}
                  tone={item.tone}
                />
              ))}
            </div>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setPhase('playerSelect')}
                className="inline-flex min-h-10 items-center justify-center rounded-lg px-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 focus:outline-none focus:ring-4 focus:ring-teal-300"
              >
                人数選択に戻る
              </button>
            </div>
          </PlaySetupCard>
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
                <div className="mx-auto mt-2 max-w-6xl text-center">
                  <p className="rounded-lg bg-white/90 px-3 py-2 text-sm font-semibold text-neutral-700">処理中...</p>
                </div>
              )}

              {/* コントロールボタン */}
              <div className="mx-auto mt-2 flex max-w-6xl justify-center gap-3">
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
