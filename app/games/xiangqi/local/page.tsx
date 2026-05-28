// 中国象棋 ローカル対戦ページ

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  createInitialState,
  joinBlackPlayer,
  movePiece,
  checkWinner,
  finishGame,
  toClientState,
  getValidMoves,
} from '@/lib/games/xiangqi/engine';
import type { XiangqiState, Position, PlayerRole } from '@/lib/games/xiangqi/types';
import { XiangqiBoard } from '@/components/game/XiangqiBoard';
import { useToast } from '@/components/ui/Toast';
import { GameHeader } from '@/components/layout/GameHeader';

type LocalGamePhase = 'playing' | 'turnChange' | 'finished';

const PLAYER_RED_ID = 'local-player-red';
const PLAYER_BLACK_ID = 'local-player-black';
const GAME_ID = 'local-game';

export default function XiangqiLocalPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [phase, setPhase] = useState<LocalGamePhase>('playing');
  const [currentPlayer, setCurrentPlayer] = useState<PlayerRole>('red');
  const [gameState, setGameState] = useState<XiangqiState>(() => {
    let state = createInitialState(GAME_ID, PLAYER_RED_ID);
    state = joinBlackPlayer(state, PLAYER_BLACK_ID);
    return state;
  });
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);

  // セルクリック
  const handleCellClick = (pos: Position) => {
    if (phase !== 'playing') return;

    const clickedPiece = gameState.board[pos.row][pos.col];
    const playerId = currentPlayer === 'red' ? PLAYER_RED_ID : PLAYER_BLACK_ID;

    // 駒を選択
    if (clickedPiece && clickedPiece.owner === currentPlayer) {
      setSelectedPiece(pos);
      const moves = getValidMoves(gameState, playerId, clickedPiece.id);
      setValidMoves(moves);
      return;
    }

    // 移動
    if (selectedPiece) {
      try {
        let newState = movePiece(gameState, playerId, selectedPiece, pos);
        setSelectedPiece(null);
        setValidMoves([]);

        // 勝敗判定
        const result = checkWinner(newState);
        if (result.winner !== null) {
          newState = finishGame(newState, result.winner);
          setGameState(newState);
          setPhase('finished');
          return;
        }

        // ターン交代
        setGameState(newState);
        const nextPlayer: PlayerRole = currentPlayer === 'red' ? 'black' : 'red';
        setCurrentPlayer(nextPlayer);
        setPhase('turnChange');
      } catch (error) {
        console.error('Move error:', error);
        showToast((error as Error).message, 'error');
        setSelectedPiece(null);
        setValidMoves([]);
      }
    }
  };

  // ターン交代画面から戻る
  const handleReadyForTurn = () => {
    setPhase('playing');
  };

  // リプレイ
  const handleReplay = () => {
    let state = createInitialState(GAME_ID, PLAYER_RED_ID);
    state = joinBlackPlayer(state, PLAYER_BLACK_ID);
    setGameState(state);
    setCurrentPlayer('red');
    setPhase('playing');
    setSelectedPiece(null);
    setValidMoves([]);
  };

  const playerId = currentPlayer === 'red' ? PLAYER_RED_ID : PLAYER_BLACK_ID;
  const clientState = toClientState(gameState, playerId);

  return (
    <>
      <GameHeader
        title="中国象棋 ローカル対戦"
        backUrl="/games/xiangqi"
        backLabel="モード選択"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 sm:pt-20 pb-4 sm:pb-8 px-2 sm:px-4">
        <div className="max-w-5xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">中国象棋 ローカル対戦</h1>
            <p className="text-gray-200">同じ端末で2人対戦</p>
          </div>

        {/* ターン交代画面 */}
        {phase === 'turnChange' && (
          <Card className="bg-white/95">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                {currentPlayer === 'red' ? '紅（赤）' : '黒'} の番です
              </h2>
              <p className="text-slate-700 mb-8">
                端末を {currentPlayer === 'red' ? '紅（赤）' : '黒'} プレイヤーに渡してください。<br />
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
                      {currentPlayer === 'red' ? '紅（赤）' : '黒'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 font-medium">残り駒数</p>
                    <p className="text-lg font-semibold text-slate-900">
                      紅: {clientState.myRole === 'red' ? clientState.myPiecesCount : clientState.opponentPiecesCount} /
                      黒: {clientState.myRole === 'black' ? clientState.myPiecesCount : clientState.opponentPiecesCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ルール概要 */}
            <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm">
              <p className="font-semibold text-indigo-900 mb-1">🎯 勝利条件</p>
              <p className="text-indigo-800">
                • 相手の<span className="font-bold">将/帥を取る</span>（チェックメイト）
              </p>
            </div>

            <XiangqiBoard
              gameState={clientState}
              onCellClick={handleCellClick}
              selectedPiece={selectedPiece}
              validMoves={validMoves}
            />
          </>
        )}

        {/* ゲーム終了 */}
        {phase === 'finished' && (
          <Card className="mt-6 bg-white/95">
            <CardHeader>
              <h2 className="text-3xl font-bold text-center text-slate-900">
                {gameState.winner === 'red' && '🎉 紅（赤）の勝ち！'}
                {gameState.winner === 'black' && '🎉 黒の勝ち！'}
              </h2>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex gap-4 justify-center mt-6">
                <Button variant="primary" onClick={handleReplay}>
                  もう一度プレイ
                </Button>
                <Button variant="secondary" onClick={() => router.push('/games/xiangqi')}>
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
