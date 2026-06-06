'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';
import { PlaySetupCard, SetupBackLink, SetupHint, SetupOptionButton } from '@/components/game/PlaySetup';
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

const getRankValue = (rank: string): number => {
  const values: Record<string, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  return values[rank] || 0;
};

export default function IndianPokerCpuPage() {
  const { showToast } = useToast();
  const { setSafeTimeout } = useSafeTimeout();
  const [phase, setPhase] = useState<GamePhase>('playerSelect');
  const [playerCount, setPlayerCount] = useState<number>(3);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameState, setGameState] = useState<IndianPokerState | null>(null);
  const [clientState, setClientState] = useState<IndianPokerClientState | null>(null);

  const handleSelectPlayerCount = useCallback((count: number) => {
    setPlayerCount(count);
    setPhase('difficultySelect');
  }, []);

  const handleShowdown = useCallback((state: IndianPokerState) => {
    setPhase('finished');

    const activePlayers = state.players.filter(p => p.isActive);
    if (activePlayers.length === 0) return;

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
  }, [showToast]);

  const executeCPUTurns = useCallback(async (state: IndianPokerState) => {
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
  }, [handleShowdown, setSafeTimeout, showToast]);

  const handleStartGame = useCallback((selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);

    const cpuCount = playerCount - 1;
    let newState = createInitialState(GAME_ID, playerCount, PLAYER_ID, cpuCount, selectedDifficulty);

    newState = startRound(newState);

    setGameState(newState);
    setClientState(toClientState(newState, PLAYER_ID));
    setPhase('playing');

    if (newState.players[newState.currentTurn].isCPU) {
      executeCPUTurns(newState);
    }
  }, [executeCPUTurns, playerCount]);

  // プレイヤーのアクション
  const handlePlayerAction = useCallback((action: BettingAction) => {
    if (!gameState || !clientState) return;

    try {
      const newState = executeAction(gameState, PLAYER_ID, action);
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
  }, [clientState, executeCPUTurns, gameState, handleShowdown, setSafeTimeout, showToast]);

  // リスタート
  const handleRestart = useCallback(() => {
    setPhase('playerSelect');
    setGameState(null);
    setClientState(null);
  }, []);

  return (
    <div className="min-h-screen app-bg board-pattern pt-16 pb-3 px-3 sm:pt-20 sm:px-4">
      <GameHeader title="インディアンポーカー - CPU対戦" />

      <main className="container mx-auto px-0 py-2 sm:px-4 sm:py-4">
        {phase === 'playerSelect' && (
          <PlaySetupCard
            title="プレイヤー人数を選択"
            subtitle="人数が増えるほど、見えるカードと降りる判断が複雑になります。"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[2, 3, 4, 5, 6].map((count) => (
                <SetupOptionButton
                  key={count}
                  title={`${count}人`}
                  description={count <= 3 ? '軽め' : count <= 5 ? '標準' : '多人数'}
                  onClick={() => handleSelectPlayerCount(count)}
                  tone={count <= 3 ? 'teal' : count <= 5 ? 'violet' : 'amber'}
                  className="min-h-[86px]"
                />
              ))}
            </div>

            <div className="mt-5">
              <SetupHint>初心者は3〜4人がおすすめです。相手のカードを見ながら、自分の強さを推理します。</SetupHint>
            </div>

            <div className="mt-5 text-center">
              <SetupBackLink href="/games/indian-poker">モード選択に戻る</SetupBackLink>
            </div>
          </PlaySetupCard>
        )}

        {phase === 'difficultySelect' && (
          <PlaySetupCard
            title="難易度を選択"
            subtitle={`${playerCount}人で開始します。CPUの降り方とレイズ判断が変わります。`}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { value: 'easy' as Difficulty, title: '簡単', description: '控えめに勝負します', tone: 'green' as const },
                { value: 'medium' as Difficulty, title: '普通', description: '標準的に読み合います', tone: 'amber' as const },
                { value: 'hard' as Difficulty, title: '難しい', description: '強気な駆け引きあり', tone: 'red' as const },
              ].map((item) => (
                <SetupOptionButton
                  key={item.value}
                  title={item.title}
                  description={item.description}
                  selected={difficulty === item.value}
                  onClick={() => handleStartGame(item.value)}
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
