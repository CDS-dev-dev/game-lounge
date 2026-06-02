// アイランドセトラーズ CPU対戦ページ

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
import { executeCpuTurn } from '@/lib/games/island-settlers/ai';
import type { IslandSettlersState, IslandSettlersClientState, Position, ResourceType } from '@/lib/games/island-settlers/types';
import { IslandSettlersBoard } from '@/components/game/IslandSettlersBoard';
import { useToast } from '@/components/ui/Toast';
import { GameHeader } from '@/components/layout/GameHeader';
import { formatGameError } from '@/lib/utils/error-handler';
import { useSafeTimeout } from '@/lib/hooks/useSafeTimeout';

type GamePhase = 'setup' | 'playing' | 'cpuThinking' | 'finished';
type Difficulty = 'easy' | 'medium' | 'hard';

const PLAYER_ID = 'player-human';
const CPU_ID_1 = 'cpu-1';
const CPU_ID_2 = 'cpu-2';
const CPU_ID_3 = 'cpu-3';
const GAME_ID = 'cpu-game';

export default function IslandSettlersCpuPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { setSafeTimeout } = useSafeTimeout();
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerCount, setPlayerCount] = useState<3 | 4>(3);
  const [gameState, setGameState] = useState<IslandSettlersState | null>(null);
  const [clientState, setClientState] = useState<IslandSettlersClientState | null>(null);

  // ゲーム開始
  const startGame = async () => {
    // プレイヤーが先攻
    let newState = createInitialState(GAME_ID, PLAYER_ID, playerCount);
    newState = addPlayer(newState, CPU_ID_1);
    newState = addPlayer(newState, CPU_ID_2);
    if (playerCount === 4) {
      newState = addPlayer(newState, CPU_ID_3);
    }

    setGameState(newState);
    setClientState(toClientState(newState, PLAYER_ID));
    setPhase('playing');
  };

  // サイコロを振る
  const handleRollDice = async () => {
    if (!gameState) return;

    try {
      const newState = rollDice(gameState, PLAYER_ID);
      setGameState(newState);
      setClientState(toClientState(newState, PLAYER_ID));
      showToast(`サイコロ: ${newState.diceValue}`, 'success');
    } catch (error) {
      const message = formatGameError(error);
      showToast(message, 'error');
    }
  };

  // 道を建設
  const handleBuildRoad = async (from: Position, to: Position) => {
    if (!gameState) return;

    try {
      const newState = buildRoad(gameState, PLAYER_ID, from, to);
      setGameState(newState);
      setClientState(toClientState(newState, PLAYER_ID));
      showToast('道を建設しました', 'success');
    } catch (error) {
      const message = formatGameError(error);
      showToast(message, 'error');
    }
  };

  // 村を建設
  const handleBuildVillage = async (position: Position) => {
    if (!gameState) return;

    try {
      const newState = buildVillage(gameState, PLAYER_ID, position);
      setGameState(newState);
      setClientState(toClientState(newState, PLAYER_ID));
      showToast('村を建設しました', 'success');
    } catch (error) {
      const message = formatGameError(error);
      showToast(message, 'error');
    }
  };

  // 町を建設
  const handleBuildTown = async (position: Position) => {
    if (!gameState) return;

    try {
      const newState = buildTown(gameState, PLAYER_ID, position);
      setGameState(newState);
      setClientState(toClientState(newState, PLAYER_ID));
      showToast('町を建設しました', 'success');
    } catch (error) {
      const message = formatGameError(error);
      showToast(message, 'error');
    }
  };

  // 交易
  const handleTrade = async (give: ResourceType, receive: ResourceType) => {
    if (!gameState) return;

    try {
      const newState = trade(gameState, PLAYER_ID, give, receive);
      setGameState(newState);
      setClientState(toClientState(newState, PLAYER_ID));
      showToast('交易しました', 'success');
    } catch (error) {
      const message = formatGameError(error);
      showToast(message, 'error');
    }
  };

  // ターン終了
  const handleEndTurn = async () => {
    if (!gameState) return;

    try {
      const newState = endTurn(gameState);
      setGameState(newState);

      // ゲーム終了チェック
      if (newState.status === 'finished') {
        setClientState(toClientState(newState, PLAYER_ID));
        setPhase('finished');
        const winner = newState.players.find((p) => p.id === newState.winner);
        showToast(`ゲーム終了！勝者: ${winner?.name}`, 'success');
        return;
      }

      // CPUのターン
      await processCpuTurns(newState);
    } catch (error) {
      const message = formatGameError(error);
      showToast(message, 'error');
    }
  };

  // CPUのターンを処理
  const processCpuTurns = async (state: IslandSettlersState) => {
    let currentState = state;

    while (currentState.status === 'playing') {
      const currentPlayerId = currentState.players[currentState.currentTurn].id;

      // プレイヤーのターンなら終了
      if (currentPlayerId === PLAYER_ID) {
        break;
      }

      // CPUのターン
      setPhase('cpuThinking');
      await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 1500));

      try {
        currentState = await executeCpuTurn(currentState, currentPlayerId, difficulty);
        setGameState(currentState);

        // ゲーム終了チェック
        if (currentState.status === 'finished') {
          setClientState(toClientState(currentState, PLAYER_ID));
          setPhase('finished');
          const winner = currentState.players.find((p) => p.id === currentState.winner);
          showToast(`ゲーム終了！勝者: ${winner?.name}`, 'success');
          return;
        }
      } catch (error) {
        console.error('CPU turn error:', error);
        break;
      }
    }

    setClientState(toClientState(currentState, PLAYER_ID));
    setPhase('playing');
  };

  // 再挑戦
  const handleRetry = () => {
    setPhase('setup');
    setGameState(null);
    setClientState(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 sm:pt-20 pb-4 sm:pb-8 px-2 sm:px-4">
      <GameHeader title="アイランドセトラーズ - CPU対戦" />

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

                {/* 難易度選択 */}
                <div>
                  <label className="block text-sm font-medium mb-2">難易度</label>
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      onClick={() => setDifficulty('easy')}
                      variant={difficulty === 'easy' ? 'primary' : 'secondary'}
                      size="lg"
                    >
                      簡単
                    </Button>
                    <Button
                      onClick={() => setDifficulty('medium')}
                      variant={difficulty === 'medium' ? 'primary' : 'secondary'}
                      size="lg"
                    >
                      普通
                    </Button>
                    <Button
                      onClick={() => setDifficulty('hard')}
                      variant={difficulty === 'hard' ? 'primary' : 'secondary'}
                      size="lg"
                    >
                      難しい
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

        {(phase === 'playing' || phase === 'cpuThinking' || phase === 'finished') && clientState && (
          <div className="space-y-4">
            {phase === 'cpuThinking' && (
              <div className="bg-blue-600 text-white py-3 px-6 rounded-lg text-center font-bold animate-pulse">
                🤖 CPUが考え中...
              </div>
            )}

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
