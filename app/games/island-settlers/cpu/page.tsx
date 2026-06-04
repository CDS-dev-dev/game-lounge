// アイランドセトラーズ CPU対戦ページ

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
import { executeCpuTurn } from '@/lib/games/island-settlers/ai';
import type { IslandSettlersState, IslandSettlersClientState, Position, ResourceType } from '@/lib/games/island-settlers/types';
import { IslandSettlersBoard } from '@/components/game/IslandSettlersBoard';
import { useToast } from '@/components/ui/Toast';
import { GameHeader } from '@/components/layout/GameHeader';
import { formatGameError } from '@/lib/utils/error-handler';
import { useSafeTimeout } from '@/lib/hooks/useSafeTimeout';
import { logger } from '@/lib/utils/logger';

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
        logger.error('CPU turn error:', error);
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
    <div className="min-h-screen app-bg board-pattern pt-16 sm:pt-20 pb-4 sm:pb-8 px-3 sm:px-4">
      <GameHeader title="アイランドセトラーズ - CPU対戦" />

      <main className="container mx-auto px-4 py-8">
        {phase === 'setup' && (
          <PlaySetupCard
            title="ゲーム設定"
            subtitle="CPUを相手に、資源を集めて8点を目指します。"
          >
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">プレイヤー数</label>
                <div className="grid grid-cols-2 gap-3">
                  <SetupOptionButton
                    title="3人"
                    description="読みやすい標準構成"
                    selected={playerCount === 3}
                    onClick={() => setPlayerCount(3)}
                    tone="teal"
                  />
                  <SetupOptionButton
                    title="4人"
                    description="盤面が混みやすい"
                    selected={playerCount === 4}
                    onClick={() => setPlayerCount(4)}
                    tone="amber"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">難易度</label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { value: 'easy' as Difficulty, title: '簡単', description: '建設優先は控えめ', tone: 'green' as const },
                    { value: 'medium' as Difficulty, title: '普通', description: '標準的に発展', tone: 'amber' as const },
                    { value: 'hard' as Difficulty, title: '難しい', description: '得点効率を重視', tone: 'red' as const },
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

              <SetupHint>
                サイコロで資源を得て、道・村・町を建設します。村は1点、町は2点、最初に8点で勝利です。
              </SetupHint>

              <Button onClick={startGame} size="lg" className="w-full">
                ゲーム開始
              </Button>
            </div>
          </PlaySetupCard>
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
