'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';
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

  // プレイヤーのアクション
  const handlePlayerAction = useCallback((action: BettingAction) => {
    if (!gameState || !clientState) return;

    try {
      let newState = executeAction(gameState, currentPlayerId, action);
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
  }, [gameState, clientState, currentPlayerId, setSafeTimeout, showToast]);

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
  const handleRestart = useCallback(() => {
    setPhase('playerSelect');
    setGameState(null);
    setClientState(null);
    setPlayerNames([]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 sm:pt-24 pb-4 sm:pb-8 px-3 sm:px-4">
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

                <p className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
                  <strong>ローカル対戦：</strong> 同じ端末でプレイヤーが交代しながら遊びます。自分のターンが来たら端末を受け取って操作してください。
                </p>

                <div className="mt-6 text-center">
                  <Link href="/games/indian-poker" className="text-purple-600 hover:text-purple-800 underline">
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
                <div className="space-y-3">
                  {playerNames.map((name, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium mb-1">プレイヤー{index + 1}</label>
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
                  <Button onClick={() => setPhase('playerSelect')} variant="secondary" size="md" className="flex-1">
                    戻る
                  </Button>
                  <Button onClick={handleStartGame} variant="primary" size="md" className="flex-1">
                    ゲーム開始
                  </Button>
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
              <div className="max-w-4xl mx-auto mb-4 p-3 bg-purple-100 border-2 border-purple-300 rounded-lg text-center">
                <p className="text-lg font-bold text-purple-900">{clientState.players[clientState.myIndex].name}のターン</p>
                <p className="text-sm text-purple-700">カードを額に当てるイメージで、自分のカードは見ないでください</p>
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
