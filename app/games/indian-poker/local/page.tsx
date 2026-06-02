'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';
import {
  createInitialState,
  dealCards,
  processBettingAction,
  toClientState,
} from '@/lib/games/indian-poker/engine';
import type { IndianPokerState, IndianPokerClientState, BettingAction } from '@/lib/games/indian-poker/types';
import { IndianPokerBoard } from '@/components/game/IndianPokerBoard';
import { useToast } from '@/components/ui/Toast';
import { formatGameError } from '@/lib/utils/error-handler';
import { useSafeTimeout } from '@/lib/hooks/useSafeTimeout';

type GamePhase = 'playerSelect' | 'nameInput' | 'playing' | 'finished';

const GAME_ID = 'indian-poker-local-game';

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
  const handleSelectPlayerCount = (count: number) => {
    setPlayerCount(count);
    setPlayerNames(Array(count).fill('').map((_, i) => `プレイヤー${i + 1}`));
    setPhase('nameInput');
  };

  // 名前変更
  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name || `プレイヤー${index + 1}`;
    setPlayerNames(newNames);
  };

  // ゲーム開始
  const handleStartGame = () => {
    const playerIds = playerNames.map((_, i) => `player-${i}`);
    const cpuFlags = playerNames.map(() => false);

    let newState = createInitialState(GAME_ID, playerIds, playerNames, cpuFlags);
    newState = dealCards(newState);

    setGameState(newState);
    const firstPlayerId = newState.players[newState.currentTurn].id;
    setCurrentPlayerId(firstPlayerId);
    setClientState(toClientState(newState, firstPlayerId));
    setPhase('playing');
  };

  // プレイヤーのアクション
  const handlePlayerAction = (action: BettingAction) => {
    if (!gameState || !clientState) return;

    try {
      let newState = processBettingAction(gameState, currentPlayerId, action);
      setGameState(newState);

      // ショーダウンになったら結果表示
      if (newState.status === 'showdown') {
        // 全員にカードを見せるため、最初のプレイヤーの視点で表示
        setClientState(toClientState(newState, newState.players[0].id, true));
        setSafeTimeout(() => handleShowdown(newState), 1500);
      } else if (newState.status === 'betting') {
        // 次のプレイヤーに切り替え
        const nextPlayerId = newState.players[newState.currentTurn].id;
        setCurrentPlayerId(nextPlayerId);
        setClientState(toClientState(newState, nextPlayerId));
      }
    } catch (error) {
      console.error('Player action error:', error);
      showToast(formatGameError(error), 'error');
    }
  };

  // ショーダウン処理
  const handleShowdown = (state: IndianPokerState) => {
    setPhase('finished');

    const activePlayers = state.players.filter(p => p.isActive);
    if (activePlayers.length === 0) return;

    // 最も強いカードを持つプレイヤーを探す
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
  };

  // カードの数値化
  const getRankValue = (rank: string): number => {
    const values: Record<string, number> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
      'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return values[rank] || 0;
  };

  // リスタート
  const handleRestart = () => {
    setPhase('playerSelect');
    setGameState(null);
    setClientState(null);
    setPlayerNames([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <GameHeader title="インディアンポーカー - ローカル対戦" />

      <main className="container mx-auto px-4 py-8">
        {/* プレイヤー人数選択 */}
        {phase === 'playerSelect' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-center">プレイヤー人数を選択</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                  {[2, 3, 4, 5, 6].map((count) => (
                    <button
                      key={count}
                      onClick={() => handleSelectPlayerCount(count)}
                      className="bg-purple-500 hover:bg-purple-600 text-white py-8 rounded-lg font-bold text-2xl transition-colors"
                    >
                      {count}人
                    </button>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>ローカル対戦：</strong> 同じ端末でプレイヤーが交代しながら遊びます。
                    自分のターンが来たら端末を受け取って操作してください。
                  </p>
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href="/games/indian-poker"
                    className="text-purple-600 hover:text-purple-800 underline"
                  >
                    モード選択に戻る
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* プレイヤー名入力 */}
        {phase === 'nameInput' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-center">プレイヤー名を入力</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {playerNames.map((name, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium mb-1">
                        プレイヤー{index + 1}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleNameChange(index, e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder={`プレイヤー${index + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => setPhase('playerSelect')}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    戻る
                  </button>
                  <button
                    onClick={handleStartGame}
                    className="flex-1 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold transition-colors"
                  >
                    ゲーム開始
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ゲーム画面 */}
        {(phase === 'playing' || phase === 'finished') && clientState && (
          <div>
            {/* 現在のプレイヤー表示 */}
            {phase === 'playing' && (
              <div className="max-w-4xl mx-auto mb-4 p-4 bg-purple-100 border-2 border-purple-300 rounded-lg text-center">
                <p className="text-lg font-bold text-purple-900">
                  {clientState.players[clientState.myIndex].name}のターン
                </p>
                <p className="text-sm text-purple-700 mt-1">
                  カードを額に当てるイメージで、自分のカードは見ないでください
                </p>
              </div>
            )}

            {/* ゲームボード */}
            <IndianPokerBoard
              gameState={clientState}
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
