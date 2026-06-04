// アイランドセトラーズ ローカル対戦ページ

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { PlaySetupCard, SetupHint, SetupOptionButton } from '@/components/game/PlaySetup';
import {
  createInitialState,
  addPlayer,
  rollDice,
  buildRoad,
  buildVillage,
  buildTown,
  trade,
  endTurn,
  toClientState,
} from '@/lib/games/island-settlers/engine';
import type { IslandSettlersState, IslandSettlersClientState, Position, ResourceType } from '@/lib/games/island-settlers/types';
import { IslandSettlersBoard } from '@/components/game/IslandSettlersBoard';
import { useToast } from '@/components/ui/Toast';
import { GameHeader } from '@/components/layout/GameHeader';
import { formatGameError } from '@/lib/utils/error-handler';

type GamePhase = 'setup' | 'playing' | 'finished';

const GAME_ID = 'local-game';

export default function IslandSettlersLocalPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [playerCount, setPlayerCount] = useState<3 | 4>(3);
  const [gameState, setGameState] = useState<IslandSettlersState | null>(null);

  // ゲーム開始
  const startGame = () => {
    let newState = createInitialState(GAME_ID, 'player-1', playerCount);
    newState = addPlayer(newState, 'player-2');
    newState = addPlayer(newState, 'player-3');
    if (playerCount === 4) {
      newState = addPlayer(newState, 'player-4');
    }

    setGameState(newState);
    setPhase('playing');
  };

  // 現在のプレイヤーIDを取得
  const getCurrentPlayerId = (): string => {
    if (!gameState) return 'player-1';
    return gameState.players[gameState.currentTurn].id;
  };

  // サイコロを振る
  const handleRollDice = () => {
    if (!gameState) return;

    try {
      const playerId = getCurrentPlayerId();
      const newState = rollDice(gameState, playerId);
      setGameState(newState);
      showToast(`サイコロ: ${newState.diceValue}`, 'success');
    } catch (error) {
      const message = formatGameError(error);
      showToast(message, 'error');
    }
  };

  // 道を建設
  const handleBuildRoad = (from: Position, to: Position) => {
    if (!gameState) return;

    try {
      const playerId = getCurrentPlayerId();
      const newState = buildRoad(gameState, playerId, from, to);
      setGameState(newState);
      showToast('道を建設しました', 'success');
    } catch (error) {
      const message = formatGameError(error);
      showToast(message, 'error');
    }
  };

  // 村を建設
  const handleBuildVillage = (position: Position) => {
    if (!gameState) return;

    try {
      const playerId = getCurrentPlayerId();
      const newState = buildVillage(gameState, playerId, position);
      setGameState(newState);
      showToast('村を建設しました', 'success');
    } catch (error) {
      const message = formatGameError(error);
      showToast(message, 'error');
    }
  };

  // 町を建設
  const handleBuildTown = (position: Position) => {
    if (!gameState) return;

    try {
      const playerId = getCurrentPlayerId();
      const newState = buildTown(gameState, playerId, position);
      setGameState(newState);
      showToast('町を建設しました', 'success');
    } catch (error) {
      const message = formatGameError(error);
      showToast(message, 'error');
    }
  };

  // 交易
  const handleTrade = (give: ResourceType, receive: ResourceType) => {
    if (!gameState) return;

    try {
      const playerId = getCurrentPlayerId();
      const newState = trade(gameState, playerId, give, receive);
      setGameState(newState);
      showToast('交易しました', 'success');
    } catch (error) {
      const message = formatGameError(error);
      showToast(message, 'error');
    }
  };

  // ターン終了
  const handleEndTurn = () => {
    if (!gameState) return;

    try {
      const newState = endTurn(gameState);
      setGameState(newState);

      if (newState.status === 'finished') {
        setPhase('finished');
        const winner = newState.players.find((p) => p.id === newState.winner);
        showToast(`ゲーム終了！勝者: ${winner?.name}`, 'success');
      }
    } catch (error) {
      const message = formatGameError(error);
      showToast(message, 'error');
    }
  };

  // 再挑戦
  const handleRetry = () => {
    setPhase('setup');
    setGameState(null);
  };

  // クライアント状態を取得
  const getClientState = (): IslandSettlersClientState | null => {
    if (!gameState) return null;
    const playerId = getCurrentPlayerId();
    return toClientState(gameState, playerId);
  };

  const clientState = getClientState();

  return (
    <div className="min-h-screen app-bg board-pattern pt-16 sm:pt-20 pb-4 sm:pb-8 px-3 sm:px-4">
      <GameHeader title="アイランドセトラーズ - ローカル対戦" />

      <main className="container mx-auto px-4 py-8">
        {phase === 'setup' && (
          <PlaySetupCard
            title="ゲーム設定"
            subtitle="同じ端末で順番に操作します。現在プレイヤーの視点で盤面を表示します。"
          >
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">プレイヤー数</label>
                <div className="grid grid-cols-2 gap-3">
                  <SetupOptionButton
                    title="3人"
                    description="ゆったり遊べる"
                    selected={playerCount === 3}
                    onClick={() => setPlayerCount(3)}
                    tone="teal"
                  />
                  <SetupOptionButton
                    title="4人"
                    description="盤面が競りやすい"
                    selected={playerCount === 4}
                    onClick={() => setPlayerCount(4)}
                    tone="amber"
                  />
                </div>
              </div>

              <SetupHint>
                サイコロで資源を得て、道・村・町を建設します。資源は4:1で交易できます。
              </SetupHint>

              <Button onClick={startGame} size="lg" className="w-full">
                ゲーム開始
              </Button>
            </div>
          </PlaySetupCard>
        )}

        {(phase === 'playing' || phase === 'finished') && clientState && (
          <div className="space-y-4">
            <IslandSettlersBoard
              gameState={clientState}
              onRollDice={handleRollDice}
              onBuildRoad={handleBuildRoad}
              onBuildVillage={handleBuildVillage}
              onBuildTown={handleBuildTown}
              onTrade={handleTrade}
              onEndTurn={handleEndTurn}
            />

            {phase === 'finished' && (
              <div className="flex justify-center gap-4 mt-4">
                <Button onClick={handleRetry} size="lg">
                  もう一度プレイ
                </Button>
                <Button onClick={() => router.push('/games')} variant="secondary" size="lg">
                  ゲーム一覧に戻る
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
