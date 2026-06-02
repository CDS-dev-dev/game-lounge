// アイランドセトラーズ ローカル対戦ページ

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 sm:pt-24 pb-4 sm:pb-8 px-3 sm:px-4">
      <GameHeader title="アイランドセトラーズ - ローカル対戦" />

      <main className="container mx-auto px-4 py-8">
        {phase === 'setup' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold">ゲーム設定</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* プレイヤー数選択 */}
                <div>
                  <label className="block text-sm font-medium mb-2">プレイヤー数</label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => setPlayerCount(3)}
                      variant={playerCount === 3 ? 'primary' : 'secondary'}
                      size="lg"
                    >
                      3人
                    </Button>
                    <Button
                      onClick={() => setPlayerCount(4)}
                      variant={playerCount === 4 ? 'primary' : 'secondary'}
                      size="lg"
                    >
                      4人
                    </Button>
                  </div>
                </div>

                <Button onClick={startGame} size="lg" className="w-full">
                  ゲーム開始
                </Button>
              </CardContent>
            </Card>

            {/* ルール説明 */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold">ルール</h3>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• サイコロを振って資源を獲得</p>
                <p>• 道・村・町を建設して領土を拡大</p>
                <p>• 資源は4:1レートで交易可能</p>
                <p>• 最初に8点獲得したプレイヤーの勝利</p>
                <p>• 村=1点、町=2点</p>
              </CardContent>
            </Card>
          </div>
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
