// 立体四目並べ ローカル対戦ページ

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  createInitialState,
  joinPlayer2,
  placePiece,
  checkWinner,
  finishGame,
  toClientState,
  getAvailablePositions,
} from '@/lib/games/connect4/engine';
import type { Connect4State, Position3D, PlayerRole } from '@/lib/games/connect4/types';
import { Connect4Board3D } from '@/components/game/Connect4Board3D';
import { useToast } from '@/components/ui/Toast';
import { GameHeader } from '@/components/layout/GameHeader';

type LocalGamePhase = 'playing' | 'turnChange' | 'finished';

const PLAYER1_ID = 'local-player1';
const PLAYER2_ID = 'local-player2';
const GAME_ID = 'local-game';

export default function Connect4LocalPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [phase, setPhase] = useState<LocalGamePhase>('playing');
  const [currentPlayer, setCurrentPlayer] = useState<PlayerRole>('player1');
  const [gameState, setGameState] = useState<Connect4State>(() => {
    let state = createInitialState(GAME_ID, PLAYER1_ID);
    state = joinPlayer2(state, PLAYER2_ID);
    return state;
  });

  // 駒を配置
  const handleCellClick = (pos: Position3D) => {
    if (phase !== 'playing') return;

    try {
      const playerId = currentPlayer === 'player1' ? PLAYER1_ID : PLAYER2_ID;
      let newState = placePiece(gameState, playerId, pos);

      // 勝敗判定（最適化：最後に置いた位置のみチェック）
      const result = checkWinner(newState, pos);
      if (result.winner !== null) {
        newState = finishGame(newState, result.winner, result.winningLine);
        setGameState(newState);
        setPhase('finished');
        return;
      }

      // 引き分け判定
      if (getAvailablePositions(newState).length === 0) {
        newState = finishGame(newState, null, null);
        setGameState(newState);
        setPhase('finished');
        showToast('引き分けです！', 'info');
        return;
      }

      // ターン交代
      setGameState(newState);
      const nextPlayer: PlayerRole = currentPlayer === 'player1' ? 'player2' : 'player1';
      setCurrentPlayer(nextPlayer);
      setPhase('turnChange');
    } catch (error) {
      console.error('Move error:', error);
      showToast((error as Error).message, 'error');
    }
  };

  // ターン交代画面から戻る
  const handleReadyForTurn = () => {
    setPhase('playing');
  };

  // リプレイ
  const handleReplay = () => {
    let state = createInitialState(GAME_ID, PLAYER1_ID);
    state = joinPlayer2(state, PLAYER2_ID);
    setGameState(state);
    setCurrentPlayer('player1');
    setPhase('playing');
  };

  const playerId = currentPlayer === 'player1' ? PLAYER1_ID : PLAYER2_ID;
  const clientState = toClientState(gameState, playerId);
  const availablePositions = phase === 'playing' ? getAvailablePositions(gameState) : [];

  return (
    <>
      <GameHeader
        title="立体四目並べ ローカル対戦"
        backUrl="/games/connect4"
        backLabel="モード選択"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 sm:pt-20 pb-4 sm:pb-8 px-2 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">立体四目並べ ローカル対戦</h1>
            <p className="text-gray-200">同じ端末で2人対戦</p>
          </div>

        {/* ターン交代画面 */}
        {phase === 'turnChange' && (
          <Card className="bg-white/95">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Player {currentPlayer === 'player1' ? '1' : '2'} の番です
              </h2>
              <p className="text-slate-700 mb-8">
                端末を Player {currentPlayer === 'player1' ? '1' : '2'} に渡してください。<br />
                準備ができたらボタンを押してください。
              </p>
              <Button variant="primary" onClick={handleReadyForTurn}>
                準備完了
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ゲームプレイ */}
        {phase === 'playing' && (
          <>
            <Card className="mb-6 bg-white/95">
              <CardContent className="py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">現在のターン</p>
                    <p className="text-xl font-bold text-slate-900">
                      Player {currentPlayer === 'player1' ? '1 🔵' : '2 🔴'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 font-medium">配置した駒</p>
                    <p className="text-lg font-semibold text-slate-900">
                      P1: {clientState.myRole === 'player1' ? clientState.myPiecesCount : clientState.opponentPiecesCount} /
                      P2: {clientState.myRole === 'player2' ? clientState.myPiecesCount : clientState.opponentPiecesCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ルール概要 */}
            <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm">
              <p className="font-semibold text-indigo-900 mb-1">🎯 勝利条件</p>
              <p className="text-indigo-800">
                • 縦・横・斜め（3次元含む）のいずれかで<span className="font-bold">4つ揃える</span>
              </p>
            </div>

            <Connect4Board3D
              gameState={clientState}
              onCellClick={handleCellClick}
              availablePositions={availablePositions}
            />
          </>
        )}

        {/* ゲーム終了 */}
        {phase === 'finished' && (
          <Card className="mt-6 bg-white/95">
            <CardHeader>
              <h2 className="text-3xl font-bold text-center text-slate-900">
                {gameState.winner === 'player1' && '🎉 Player 1 の勝ち！'}
                {gameState.winner === 'player2' && '🎉 Player 2 の勝ち！'}
                {gameState.winner === null && '🤝 引き分け'}
              </h2>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex gap-4 justify-center mt-6">
                <Button variant="primary" onClick={handleReplay}>
                  もう一度プレイ
                </Button>
                <Button variant="secondary" onClick={() => router.push('/games/connect4')}>
                  モード選択に戻る
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
    </>
  );
}
