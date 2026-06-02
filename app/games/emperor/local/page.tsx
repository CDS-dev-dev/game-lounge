'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';
import {
  createInitialState,
  progressGame,
  toClientState,
} from '@/lib/games/emperor/engine';
import type { EmperorState, EmperorClientState } from '@/lib/games/emperor/types';
import { EmperorBoard } from '@/components/game/EmperorBoard';
import { useToast } from '@/components/ui/Toast';
import { formatGameError } from '@/lib/utils/error-handler';
import { useSafeTimeout } from '@/lib/hooks/useSafeTimeout';

type GamePhase = 'playerSelect' | 'playerNames' | 'playing' | 'autoProgress' | 'finished';

const GAME_ID = 'emperor-local-game';

export default function EmperorLocalPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { setSafeTimeout } = useSafeTimeout();
  const [phase, setPhase] = useState<GamePhase>('playerSelect');
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [gameState, setGameState] = useState<EmperorState | null>(null);
  const [currentViewingPlayer, setCurrentViewingPlayer] = useState<number>(0);

  // プレイヤー人数選択
  const handlePlayerCountSelect = (count: number) => {
    setPlayerCount(count);
    setPlayerNames(Array(count).fill('').map((_, i) => `プレイヤー${i + 1}`));
    setPhase('playerNames');
  };

  // プレイヤー名変更
  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name || `プレイヤー${index + 1}`;
    setPlayerNames(newNames);
  };

  // ゲーム開始
  const handleStartGame = () => {
    const playerIds = playerNames.map((_, i) => `player-${i}`);
    const cpuFlags = Array(playerCount).fill(false);

    const newState = createInitialState(GAME_ID, playerIds, playerNames, cpuFlags);
    setGameState(newState);
    setPhase('playing');
    setCurrentViewingPlayer(0);

    // 自動進行を開始
    autoProgress(newState);
  };

  // 自動進行
  const autoProgress = async (state: EmperorState) => {
    try {
      setPhase('autoProgress');

      // カードを配る
      await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 1000));
      let newState = progressGame(state); // waiting → dealing
      setGameState(newState);

      // カードを公開
      await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 1500));
      newState = progressGame(newState); // dealing → reveal
      setGameState(newState);

      // コイン移動
      await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 2000));
      newState = progressGame(newState); // reveal → transfer
      setGameState(newState);

      // ゲーム終了判定
      if (newState.winner) {
        setPhase('finished');
        const winner = newState.players.find((p) => p.id === newState.winner);
        if (winner) {
          showToast(`${winner.name}の勝利です！`, 'success');
        }
      } else {
        setPhase('playing');
      }
    } catch (error) {
      console.error('Auto progress error:', error);
      showToast(formatGameError(error), 'error');
      setPhase('playing');
    }
  };

  // 次のラウンドへ
  const handleNextRound = () => {
    if (!gameState) return;

    try {
      let newState = progressGame(gameState);
      setGameState(newState);
      autoProgress(newState);
    } catch (error) {
      console.error('Next round error:', error);
      showToast(formatGameError(error), 'error');
    }
  };

  // リスタート
  const handleRestart = () => {
    setPhase('playerSelect');
    setGameState(null);
    setPlayerNames([]);
    setCurrentViewingPlayer(0);
  };

  // 現在表示中のプレイヤーのクライアント状態を取得
  const getClientState = (): EmperorClientState | null => {
    if (!gameState) return null;
    const playerId = `player-${currentViewingPlayer}`;
    return toClientState(gameState, playerId);
  };

  const clientState = getClientState();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <GameHeader title="エンペラーゲーム - ローカル対戦" />

      <main className="container mx-auto px-4 py-8">
        {/* プレイヤー人数選択 */}
        {phase === 'playerSelect' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-center">プレイヤー人数を選択</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[3, 4, 5, 6].map((count) => (
                    <button
                      key={count}
                      onClick={() => handlePlayerCountSelect(count)}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-8 rounded-lg font-bold text-2xl transition-colors"
                    >
                      {count}人
                    </button>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href="/games/emperor"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    モード選択に戻る
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* プレイヤー名入力 */}
        {phase === 'playerNames' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-center">プレイヤー名を入力</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {playerNames.map((name, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        プレイヤー {index + 1}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleNameChange(index, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`プレイヤー${index + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-4">
                  <Button
                    onClick={() => setPhase('playerSelect')}
                    variant="secondary"
                    size="lg"
                    className="flex-1"
                  >
                    戻る
                  </Button>
                  <Button onClick={handleStartGame} variant="primary" size="lg" className="flex-1">
                    ゲーム開始
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ゲーム画面 */}
        {(phase === 'playing' || phase === 'autoProgress' || phase === 'finished') &&
          clientState && (
            <div>
              {/* プレイヤー切り替え */}
              <div className="max-w-4xl mx-auto mb-4">
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">視点切り替え:</span>
                    <div className="flex gap-2 flex-wrap">
                      {playerNames.map((name, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentViewingPlayer(index)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            currentViewingPlayer === index
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ゲームボード */}
              <EmperorBoard
                gameState={clientState}
                onNextRound={phase === 'playing' ? handleNextRound : undefined}
              />

              {/* コントロールボタン */}
              <div className="max-w-4xl mx-auto mt-6 flex justify-center gap-4">
                {phase === 'finished' && (
                  <Button onClick={handleRestart} variant="primary" size="lg">
                    もう一度プレイ
                  </Button>
                )}

                <Button variant="secondary" size="lg" asChild>
                  <Link href="/games/emperor">モード選択に戻る</Link>
                </Button>
              </div>
            </div>
          )}
      </main>
    </div>
  );
}
