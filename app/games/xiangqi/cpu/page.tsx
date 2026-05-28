// 中国象棋 CPU対戦ページ

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
import { calculateCpuMove } from '@/lib/games/xiangqi/ai';
import type { XiangqiState, Position } from '@/lib/games/xiangqi/types';
import { XiangqiBoard } from '@/components/game/XiangqiBoard';
import { useToast } from '@/components/ui/Toast';
import { GameHeader } from '@/components/layout/GameHeader';

type CpuGamePhase = 'difficulty-select' | 'playing' | 'cpuThinking' | 'finished';
type Difficulty = 'easy' | 'medium' | 'hard';

const PLAYER_ID = 'player-human';
const CPU_ID = 'player-cpu';
const GAME_ID = 'cpu-game';

export default function XiangqiCpuPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [phase, setPhase] = useState<CpuGamePhase>('difficulty-select');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameState, setGameState] = useState<XiangqiState | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);

  // 難易度選択してゲーム開始
  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    let newState = createInitialState(GAME_ID, PLAYER_ID);
    newState = joinBlackPlayer(newState, CPU_ID);
    setGameState(newState);
    setPhase('playing');
  };

  // セルクリック
  const handleCellClick = async (pos: Position) => {
    if (!gameState || phase !== 'playing') return;

    const clickedPiece = gameState.board[pos.row][pos.col];

    // 駒を選択
    if (clickedPiece && clickedPiece.owner === 'red') {
      setSelectedPiece(pos);
      const moves = getValidMoves(gameState, PLAYER_ID, clickedPiece.id);
      setValidMoves(moves);
      return;
    }

    // 移動
    if (selectedPiece) {
      try {
        let newState = movePiece(gameState, PLAYER_ID, selectedPiece, pos);
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

        setGameState(newState);

        // CPUのターン
        setPhase('cpuThinking');

        // 少し待機（思考演出）
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // CPUが移動
        const cpuMove = calculateCpuMove(newState, 'black', difficulty);
        newState = movePiece(newState, CPU_ID, cpuMove.from, cpuMove.to);

        // 勝敗判定
        const cpuResult = checkWinner(newState);
        if (cpuResult.winner !== null) {
          newState = finishGame(newState, cpuResult.winner);
          setGameState(newState);
          setPhase('finished');
          return;
        }

        setGameState(newState);
        setPhase('playing');
      } catch (error) {
        console.error('Move error:', error);
        showToast((error as Error).message, 'error');
        setSelectedPiece(null);
        setValidMoves([]);
      }
    }
  };

  // リプレイ
  const handleReplay = () => {
    setPhase('difficulty-select');
    setGameState(null);
    setSelectedPiece(null);
    setValidMoves([]);
  };

  const clientState = gameState ? toClientState(gameState, PLAYER_ID) : null;

  return (
    <>
      <GameHeader
        title="中国象棋 CPU対戦"
        backUrl="/games/xiangqi"
        backLabel="モード選択"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 sm:pt-20 pb-4 sm:pb-8 px-2 sm:px-4">
        <div className="max-w-5xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">中国象棋 CPU対戦</h1>
            <p className="text-sm sm:text-base text-gray-200">中国伝統の将棋ゲーム</p>
          </div>

        {/* 難易度選択 */}
        {phase === 'difficulty-select' && (
          <>
            <Card className="bg-white/95 max-w-2xl mx-auto">
              <CardHeader>
                <h2 className="text-2xl font-bold text-slate-900">難易度を選択</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="primary"
                    onClick={() => startGame('easy')}
                    className="py-8 text-lg"
                  >
                    <div>
                      <div className="text-3xl mb-2">😊</div>
                      <div>初級</div>
                      <div className="text-xs mt-1 opacity-70">初心者向け</div>
                    </div>
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => startGame('medium')}
                    className="py-8 text-lg"
                  >
                    <div>
                      <div className="text-3xl mb-2">🤔</div>
                      <div>中級</div>
                      <div className="text-xs mt-1 opacity-70">標準</div>
                    </div>
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => startGame('hard')}
                    className="py-8 text-lg"
                  >
                    <div>
                      <div className="text-3xl mb-2">🔥</div>
                      <div>上級</div>
                      <div className="text-xs mt-1 opacity-70">挑戦者向け</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className="mt-4 text-center">
              <Link href="/games/xiangqi" className="text-gray-200 hover:text-white underline text-sm">
                モード選択に戻る
              </Link>
            </div>
          </>
        )}

        {/* CPU思考中インジケーター（固定オーバーレイ） */}
        {phase === 'cpuThinking' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-white/95">
              <CardContent className="py-6 px-8 text-center">
                <div className="flex justify-center mb-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
                <p className="text-lg font-semibold text-slate-900">CPUが思考中...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ゲームプレイ */}
        {(phase === 'playing' || phase === 'finished' || phase === 'cpuThinking') && clientState && (
          <>
            <Card className="mb-6 bg-white/95">
              <CardContent className="py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">現在のターン</p>
                    <p className="text-xl font-bold text-slate-900">
                      {gameState!.currentTurn === 'red' ? 'あなた（紅）' : 'CPU（黒）'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600 font-medium">難易度</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {difficulty === 'easy' && '初級 😊'}
                      {difficulty === 'medium' && '中級 🤔'}
                      {difficulty === 'hard' && '上級 🔥'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 font-medium">残り駒数</p>
                    <p className="text-lg font-semibold text-slate-900">
                      あなた: {clientState.myPiecesCount} / CPU: {clientState.opponentPiecesCount}
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

            {phase === 'finished' && (
              <Card className="mt-6 bg-white/95">
                <CardHeader>
                  <h2 className="text-3xl font-bold text-center text-slate-900">
                    {gameState!.winner === 'red' && '🎉 あなたの勝ち！'}
                    {gameState!.winner === 'black' && '😢 CPUの勝ち'}
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
          </>
        )}

      </div>
    </div>
    </>
  );
}
