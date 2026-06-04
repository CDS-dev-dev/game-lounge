'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';
import { PlaySetupCard, SetupBackLink, SetupOptionButton } from '@/components/game/PlaySetup';
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
import { logger } from '@/lib/utils/logger';

type GamePhase = 'setup' | 'playing' | 'roundEnd' | 'finished';

const GAME_ID = 'tiger-dragon-local-game';

export default function TigerDragonLocalPage() {
  const { showToast } = useToast();
  const { setSafeTimeout } = useSafeTimeout();
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [playerNames, setPlayerNames] = useState<string[]>(['プレイヤー1', 'プレイヤー2']);
  const [gameState, setGameState] = useState<TigerDragonState | null>(null);
  const [clientState, setClientState] = useState<TigerDragonClientState | null>(null);
  const [currentViewPlayerId, setCurrentViewPlayerId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // プレイヤー人数変更
  const handlePlayerCountChange = useCallback((count: number) => {
    setPlayerCount(count);
    const names = Array.from({ length: count }, (_, i) => `プレイヤー${i + 1}`);
    setPlayerNames(names);
  }, []);

  // プレイヤー名変更
  const handlePlayerNameChange = useCallback((index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name || `プレイヤー${index + 1}`;
    setPlayerNames(newNames);
  }, [playerNames]);

  // ラウンド開始
  const startNewRound = useCallback(async (state: TigerDragonState, viewPlayerId: string) => {
    try {
      setIsProcessing(true);
      await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 500));

      const newState = startRound(state);
      setGameState(newState);
      setClientState(toClientState(newState, viewPlayerId));
      setIsProcessing(false);
    } catch (error) {
      logger.error('Start round error:', error);
      showToast(formatGameError(error), 'error');
      setIsProcessing(false);
    }
  }, [setSafeTimeout, showToast]);

  // ゲーム開始
  const handleStartGame = useCallback(() => {
    const playerIds = playerNames.map((_, i) => `player-${i + 1}`);
    const cpuFlags = Array(playerCount).fill(false);

    const newState = createInitialState(
      GAME_ID,
      playerIds,
      playerNames,
      cpuFlags
    );
    setGameState(newState);
    setCurrentViewPlayerId(playerIds[0]);
    setClientState(toClientState(newState, playerIds[0]));
    setPhase('playing');

    // ラウンド開始
    startNewRound(newState, playerIds[0]);
  }, [playerCount, playerNames, startNewRound]);

  // 攻めアクション
  const handleAttack = useCallback(async (tileId: string) => {
    if (!gameState || isProcessing) return;

    try {
      setIsProcessing(true);
      const newState = attack(gameState, currentViewPlayerId, tileId);
      setGameState(newState);
      setClientState(toClientState(newState, currentViewPlayerId));

      // ラウンド終了チェック
      if (newState.status === 'roundEnd') {
        setPhase('roundEnd');
        setIsProcessing(false);
        return;
      }

      setIsProcessing(false);
    } catch (error) {
      logger.error('Attack error:', error);
      showToast(formatGameError(error), 'error');
      setIsProcessing(false);
    }
  }, [gameState, isProcessing, currentViewPlayerId, showToast]);

  // 受けアクション
  const handleDefend = useCallback(async (tileId: string) => {
    if (!gameState || isProcessing) return;

    try {
      setIsProcessing(true);
      const newState = defend(gameState, currentViewPlayerId, tileId);
      setGameState(newState);
      setClientState(toClientState(newState, currentViewPlayerId));

      // ラウンド終了チェック
      if (newState.status === 'roundEnd') {
        setPhase('roundEnd');
        setIsProcessing(false);
        return;
      }

      setIsProcessing(false);
    } catch (error) {
      logger.error('Defend error:', error);
      showToast(formatGameError(error), 'error');
      setIsProcessing(false);
    }
  }, [gameState, isProcessing, currentViewPlayerId, showToast]);

  // パスアクション
  const handlePass = useCallback(async () => {
    if (!gameState || isProcessing) return;

    try {
      setIsProcessing(true);
      const newState = pass(gameState, currentViewPlayerId);
      setGameState(newState);
      setClientState(toClientState(newState, currentViewPlayerId));
      setIsProcessing(false);
    } catch (error) {
      logger.error('Pass error:', error);
      showToast(formatGameError(error), 'error');
      setIsProcessing(false);
    }
  }, [gameState, isProcessing, currentViewPlayerId, showToast]);

  // ラウンド終了処理
  const handleEndRound = useCallback(async () => {
    if (!gameState || isProcessing) return;

    try {
      setIsProcessing(true);
      await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 1000));

      const newState = endRound(gameState);
      setGameState(newState);
      setClientState(toClientState(newState, currentViewPlayerId));

      // 勝者判定
      if (newState.winner) {
        setPhase('finished');
        const winner = newState.players.find((p) => p.id === newState.winner);
        if (winner) {
          showToast(`${winner.name}の勝利です！`, 'success');
        }
      } else {
        setPhase('playing');
        // 次のラウンドを開始
        startNewRound(newState, currentViewPlayerId);
      }

      setIsProcessing(false);
    } catch (error) {
      logger.error('End round error:', error);
      showToast(formatGameError(error), 'error');
      setIsProcessing(false);
    }
  }, [gameState, isProcessing, setSafeTimeout, currentViewPlayerId, startNewRound, showToast]);

  // プレイヤー切り替え
  const handleSwitchPlayer = useCallback((playerId: string) => {
    if (!gameState) return;
    setCurrentViewPlayerId(playerId);
    setClientState(toClientState(gameState, playerId));
  }, [gameState]);

  // リスタート
  const handleRestart = useCallback(() => {
    setPhase('setup');
    setPlayerCount(2);
    setPlayerNames(['プレイヤー1', 'プレイヤー2']);
    setGameState(null);
    setClientState(null);
    setCurrentViewPlayerId('');
    setIsProcessing(false);
  }, []);

  return (
    <div className="min-h-screen app-bg board-pattern pt-16 sm:pt-20 pb-4 sm:pb-8 px-3 sm:px-4">
      <GameHeader title="タイガー&ドラゴン - ローカル対戦" />

      <main className="container mx-auto px-4 py-8">
        {phase === 'setup' && (
          <PlaySetupCard
            title="ゲーム設定"
            subtitle="同じ端末で表示プレイヤーを切り替えながら遊びます。"
          >
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">プレイヤー人数</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[2, 3, 4, 5].map((count) => (
                    <SetupOptionButton
                      key={count}
                      title={`${count}人`}
                      description={count <= 3 ? '手牌多め' : '短期戦'}
                      selected={playerCount === count}
                      onClick={() => handlePlayerCountChange(count)}
                      tone={count <= 3 ? 'teal' : 'amber'}
                      className="min-h-[92px]"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">プレイヤー名</label>
                <div className="space-y-2">
                  {playerNames.map((name, index) => (
                    <input
                      key={index}
                      type="text"
                      value={name}
                      onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                      placeholder={`プレイヤー${index + 1}`}
                      className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-neutral-950 focus:outline-none focus:ring-4 focus:ring-teal-300"
                    />
                  ))}
                </div>
              </div>

              <Button onClick={handleStartGame} className="w-full" size="lg">
                ゲーム開始
              </Button>

              <div className="text-center">
                <SetupBackLink href="/games/tiger-dragon">モード選択に戻る</SetupBackLink>
              </div>
            </div>
          </PlaySetupCard>
        )}

        {/* ゲーム画面 */}
        {(phase === 'playing' || phase === 'roundEnd' || phase === 'finished') &&
          clientState && (
            <div>
              {/* プレイヤー切り替え */}
              <div className="max-w-6xl mx-auto mb-4">
                <div className="rounded-lg border border-neutral-200 bg-white/95 p-3 shadow-lg">
                  <p className="text-sm text-neutral-600 mb-2 text-center">
                    表示プレイヤー切り替え
                  </p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {gameState?.players.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => handleSwitchPlayer(player.id)}
                        className={`min-h-10 px-4 py-2 rounded-lg font-bold transition-colors focus:outline-none focus:ring-4 focus:ring-teal-300 ${
                          currentViewPlayerId === player.id
                            ? 'bg-neutral-950 text-white'
                            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {player.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

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
