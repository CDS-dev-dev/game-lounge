// テキサスホールデム CPU対戦ページ

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';
import { PlaySetupCard, SetupOptionButton } from '@/components/game/PlaySetup';
import {
  createInitialState,
  startGame,
  playerAction,
  toClientState,
  startNextRound,
} from '@/lib/games/texas-holdem/engine';
import { calculateCpuAction } from '@/lib/games/texas-holdem/ai';
import type { TexasHoldemState, PlayerAction } from '@/lib/games/texas-holdem/types';
import { TexasHoldemBoard } from '@/components/game/TexasHoldemBoard';
import { useToast } from '@/components/ui/Toast';
import { formatGameError } from '@/lib/utils/error-handler';
import { useSafeTimeout } from '@/lib/hooks/useSafeTimeout';
import { logger } from '@/lib/utils/logger';
import { Z_INDEX } from '@/lib/constants/z-index';

type GamePhase = 'setup' | 'playing' | 'cpuThinking' | 'roundEnd' | 'finished';

const PLAYER_ID = 'player-0';
const GAME_ID = 'cpu-game';

export default function TexasHoldemCpuPage() {
  const { showToast } = useToast();
  const { setSafeTimeout } = useSafeTimeout();

  const [phase, setPhase] = useState<GamePhase>('setup');
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [gameState, setGameState] = useState<TexasHoldemState | null>(null);

  const updatePlayerCount = (value: number) => {
    if (Number.isNaN(value)) return;
    setPlayerCount(Math.min(9, Math.max(2, value)));
  };

  // ゲーム開始
  const handleStartGame = async () => {
    try {
      // プレイヤー名を生成
      const playerNames = ['あなた'];
      for (let i = 1; i < playerCount; i++) {
        playerNames.push(`CPU${i}`);
      }

      // CPU位置を指定
      const cpuPositions = Array(playerCount).fill(false);
      for (let i = 1; i < playerCount; i++) {
        cpuPositions[i] = true;
      }

      // 初期状態を作成
      let newState = createInitialState(GAME_ID, playerCount, playerNames, cpuPositions);
      newState = startGame(newState);

      setGameState(newState);
      setPhase('playing');

      // CPUのターンを処理
      await processCpuTurns(newState);
    } catch (error) {
      logger.error('Game start error:', error);
      showToast(formatGameError(error), 'error');
    }
  };

  // CPUのターン処理
  const processCpuTurns = async (state: TexasHoldemState) => {
    let currentState = state;

    while (currentState.status !== 'showdown' && currentState.status !== 'finished') {
      const currentPlayer = currentState.players[currentState.currentTurn];

      if (!currentPlayer.isCpu || !currentPlayer.isActive) {
        break;
      }

      setPhase('cpuThinking');
      await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 1000));

      try {
        const cpuDecision = calculateCpuAction(currentState, currentPlayer.id, difficulty);
        currentState = playerAction(
          currentState,
          currentPlayer.id,
          cpuDecision.action,
          cpuDecision.raiseAmount
        );

        setGameState(currentState);
      } catch (error) {
        logger.error('CPU action error:', error);
        break;
      }
    }

    // ショーダウンまたは終了
    if (currentState.status === 'showdown') {
      setPhase('roundEnd');
    } else if (currentState.status === 'finished') {
      setPhase('finished');
    } else {
      setPhase('playing');
    }

    setGameState(currentState);
  };

  // プレイヤーのアクション
  const handlePlayerAction = async (action: PlayerAction, raiseAmount?: number) => {
    if (!gameState || phase !== 'playing') return;

    try {
      const newState = playerAction(gameState, PLAYER_ID, action, raiseAmount);
      setGameState(newState);

      // CPUのターンを処理
      await processCpuTurns(newState);
    } catch (error) {
      logger.error('Player action error:', error);
      showToast(formatGameError(error), 'error');
    }
  };

  // 次のラウンド
  const handleNextRound = () => {
    if (!gameState) return;

    try {
      const newState = startNextRound(gameState);
      setGameState(newState);

      if (newState.status === 'finished') {
        setPhase('finished');
      } else {
        setPhase('playing');
        processCpuTurns(newState);
      }
    } catch (error) {
      logger.error('Next round error:', error);
      showToast(formatGameError(error), 'error');
    }
  };

  return (
    <div className="min-h-screen app-bg board-pattern pt-16 sm:pt-20 pb-4 sm:pb-8 px-3 sm:px-4">
      <GameHeader
        title="テキサスホールデム - CPU対戦"
        showBackToGames
      />

      {/* セットアップ画面 */}
      {phase === 'setup' && (
        <div className="container mx-auto p-4">
          <PlaySetupCard
            title="ゲーム設定"
            subtitle="CPUテーブルに参加します。人数が増えるほどプリフロップの判断が重くなります。"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  プレイヤー人数（2～9人）
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => updatePlayerCount(playerCount - 1)}
                    className="px-4"
                  >
                    -
                  </Button>
                  <input
                    type="number"
                    min={2}
                    max={9}
                    value={playerCount}
                    onChange={(e) => updatePlayerCount(parseInt(e.target.value, 10))}
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-center text-lg font-bold text-neutral-950 focus:outline-none focus:ring-4 focus:ring-teal-300"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => updatePlayerCount(playerCount + 1)}
                    className="px-4"
                  >
                    +
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">難易度</label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { value: 'easy' as const, title: '簡単', description: 'コール多め', tone: 'green' as const },
                    { value: 'medium' as const, title: '普通', description: '標準戦略', tone: 'amber' as const },
                    { value: 'hard' as const, title: '難しい', description: 'ハンド強度を重視', tone: 'red' as const },
                  ].map((item) => (
                    <SetupOptionButton
                      key={item.value}
                      title={item.title}
                      description={item.description}
                      selected={difficulty === item.value}
                      onClick={() => setDifficulty(item.value)}
                      tone={item.tone}
                    />
                  ))}
                </div>
              </div>

              <Button onClick={handleStartGame} variant="primary" className="w-full">
                ゲーム開始
              </Button>

              <Link href="/games/texas-holdem">
                <Button variant="secondary" className="w-full">
                  戻る
                </Button>
              </Link>
            </div>
          </PlaySetupCard>
        </div>
      )}

      {/* ゲーム画面 */}
      {(phase === 'playing' || phase === 'cpuThinking' || phase === 'roundEnd') && gameState && (
        <div className="container mx-auto p-4">
          <TexasHoldemBoard
            gameState={toClientState(gameState, PLAYER_ID)}
            onAction={handlePlayerAction}
            disabled={phase !== 'playing'}
          />

          {phase === 'roundEnd' && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center pointer-events-none" style={{ zIndex: Z_INDEX.OVERLAY }}>
              <Card className="max-w-md pointer-events-auto">
                <CardHeader>
                  <h2 className="text-2xl font-bold">ラウンド終了</h2>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleNextRound} variant="primary" className="w-full">
                    次のラウンドへ
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* 終了画面 */}
      {phase === 'finished' && gameState && (
        <div className="container mx-auto p-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <h2 className="text-2xl font-bold">ゲーム終了</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                {gameState.players
                  .filter(p => p.chips > 0)
                  .sort((a, b) => b.chips - a.chips)
                  .map((player, index) => (
                    <div key={player.id} className="mb-2">
                      <div className="font-semibold">
                        {index + 1}位: {player.name}
                      </div>
                      <div className="text-sm text-gray-600">💰 {player.chips}</div>
                    </div>
                  ))}
              </div>

              <Button onClick={() => setPhase('setup')} variant="primary" className="w-full">
                もう一度プレイ
              </Button>

              <Link href="/games/texas-holdem">
                <Button variant="secondary" className="w-full">
                  メニューに戻る
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
