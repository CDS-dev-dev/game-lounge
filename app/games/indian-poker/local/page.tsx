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
import type { IndianPokerState, IndianPokerClientState, BettingAction } from '@/lib/games/indian-poker/types';
import { IndianPokerBoard } from '@/components/game/IndianPokerBoard';
import { useToast } from '@/components/ui/Toast';
import { formatGameError } from '@/lib/utils/error-handler';
import { useSafeTimeout } from '@/lib/hooks/useSafeTimeout';
import { logger } from '@/lib/utils/logger';

type GamePhase = 'playerSelect' | 'nameInput' | 'playing' | 'finished';

const GAME_ID = 'indian-poker-local-game';

const getRankValue = (rank: string): number => {
  const values: Record<string, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  return values[rank] || 0;
};

export default function IndianPokerLocalPage() {
  const { showToast } = useToast();
  const { setSafeTimeout } = useSafeTimeout();
  const [phase, setPhase] = useState<GamePhase>('playerSelect');
  const [playerCount, setPlayerCount] = useState<number>(3);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [gameState, setGameState] = useState<IndianPokerState | null>(null);
  const [clientState, setClientState] = useState<IndianPokerClientState | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('');

  // プレイヤー人数選択
  const handleSelectPlayerCount = useCallback((count: number) => {
    setPlayerCount(count);
    setPlayerNames(Array(count).fill('').map((_, i) => `プレイヤー${i + 1}`));
    setPhase('nameInput');
  }, []);

  // 名前変更
  const handleNameChange = useCallback((index: number, name: string) => {
    setPlayerNames(prev => {
      const newNames = [...prev];
      newNames[index] = name || `プレイヤー${index + 1}`;
      return newNames;
    });
  }, []);

  // ゲーム開始
  const handleStartGame = useCallback(() => {
    let newState = createInitialState(GAME_ID, playerCount, `player-0`, 0);
    newState = startRound(newState);

    setGameState(newState);
    const firstPlayerId = newState.players[newState.currentTurn].id;
    setCurrentPlayerId(firstPlayerId);
    setClientState(toClientState(newState, firstPlayerId));
    setPhase('playing');
  }, [playerCount]);

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

    const winnerNames = winners
      .map(id => state.players.find(p => p.id === id)?.name)
      .filter(Boolean)
      .join(', ');
    showToast(`${winnerNames}の勝利です！`, 'success');
  }, [showToast]);

  // プレイヤーのアクション
  const handlePlayerAction = useCallback((action: BettingAction) => {
    if (!gameState || !clientState) return;

    try {
      const newState = executeAction(gameState, currentPlayerId, action);
      setGameState(newState);

      // ショーダウンになったら結果表示
      if (newState.status === 'showdown') {
        // 全員にカードを見せるため、最初のプレイヤーの視点で表示
        setClientState(toClientState(newState, newState.players[0].id));
        setSafeTimeout(() => handleShowdown(newState), 1500);
      } else if (newState.status === 'betting') {
        // 次のプレイヤーに切り替え
        const nextPlayerId = newState.players[newState.currentTurn].id;
        setCurrentPlayerId(nextPlayerId);
        setClientState(toClientState(newState, nextPlayerId));
      }
    } catch (error) {
      logger.error('Player action error:', error);
      showToast(formatGameError(error), 'error');
    }
  }, [clientState, currentPlayerId, gameState, handleShowdown, setSafeTimeout, showToast]);

  // リスタート
  const handleRestart = useCallback(() => {
    setPhase('playerSelect');
    setGameState(null);
    setClientState(null);
    setPlayerNames([]);
  }, []);

  return (
    <div className="min-h-screen app-bg board-pattern pt-16 sm:pt-20 pb-4 sm:pb-8 px-3 sm:px-4">
      <GameHeader title="インディアンポーカー - ローカル対戦" />

      <main className="container mx-auto px-4 py-8">
        {phase === 'playerSelect' && (
          <PlaySetupCard
            title="プレイヤー人数を選択"
            subtitle="同じ端末を回しながら遊びます。人数に合わせて名前入力へ進みます。"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[2, 3, 4, 5, 6].map((count) => (
                <SetupOptionButton
                  key={count}
                  title={`${count}人`}
                  description={count <= 3 ? '短め' : count <= 5 ? '標準' : '大人数'}
                  onClick={() => handleSelectPlayerCount(count)}
                  tone={count <= 3 ? 'teal' : count <= 5 ? 'violet' : 'amber'}
                  className="min-h-[86px]"
                />
              ))}
            </div>

            <div className="mt-5">
              <SetupHint>自分のターンでは自分のカードを見ない前提です。端末を渡す前に画面を伏せると遊びやすくなります。</SetupHint>
            </div>

            <div className="mt-5 text-center">
              <SetupBackLink href="/games/indian-poker">モード選択に戻る</SetupBackLink>
            </div>
          </PlaySetupCard>
        )}

        {phase === 'nameInput' && (
          <PlaySetupCard
            title="プレイヤー名を入力"
            subtitle={`${playerCount}人で開始します。空欄にすると標準名のまま進みます。`}
          >
            <div className="space-y-3">
              {playerNames.map((name, index) => (
                <div key={index}>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">プレイヤー{index + 1}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-neutral-950 focus:outline-none focus:ring-4 focus:ring-teal-300"
                    placeholder={`プレイヤー${index + 1}`}
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button onClick={() => setPhase('playerSelect')} variant="secondary" size="md" className="w-full">
                戻る
              </Button>
              <Button onClick={handleStartGame} variant="primary" size="md" className="w-full">
                ゲーム開始
              </Button>
            </div>
          </PlaySetupCard>
        )}

        {/* ゲーム画面 */}
        {(phase === 'playing' || phase === 'finished') && clientState && (
          <div>
            {/* 現在のプレイヤー表示 */}
            {phase === 'playing' && (
              <div className="max-w-4xl mx-auto mb-4 rounded-lg border border-teal-200 bg-white/95 p-3 text-center shadow-lg">
                <p className="text-lg font-bold text-neutral-950">{clientState.players[clientState.myIndex].name}のターン</p>
                <p className="text-sm text-neutral-600">自分のカードは見ないで、相手のカードとベットから判断します</p>
              </div>
            )}

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
