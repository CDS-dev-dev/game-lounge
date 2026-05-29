// 立体四目並べ CPU対戦ページ

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
import { calculateCpuMove } from '@/lib/games/connect4/ai';
import type { Connect4State, Position3D, Connect4ClientState } from '@/lib/games/connect4/types';
import { Connect4Board3D } from '@/components/game/Connect4Board3D';
import { RulesModal } from '@/components/game/RulesModal';
import { useToast } from '@/components/ui/Toast';
import { PLAYER_COLORS } from '@/lib/games/connect4/constants';
import { GameHeader } from '@/components/layout/GameHeader';

type CpuGamePhase = 'difficulty-select' | 'order-select' | 'playing' | 'cpuThinking' | 'finished';
type Difficulty = 'easy' | 'medium' | 'hard';

const PLAYER_ID = 'player-human';
const CPU_ID = 'player-cpu';
const GAME_ID = 'cpu-game';

export default function Connect4CpuPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [phase, setPhase] = useState<CpuGamePhase>('difficulty-select');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerOrder, setPlayerOrder] = useState<'first' | 'second' | null>(null);
  const [gameState, setGameState] = useState<Connect4State | null>(null);
  const [history, setHistory] = useState<Connect4State[]>([]); // 履歴保存

  // 難易度選択
  const handleDifficultySelect = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setPhase('order-select');
  };

  // 先攻後攻選択してゲーム開始
  const startGame = async (order: 'first' | 'second') => {
    setPlayerOrder(order);

    let newState: Connect4State;
    if (order === 'first') {
      // プレイヤーが先攻
      newState = createInitialState(GAME_ID, PLAYER_ID);
      newState = joinPlayer2(newState, CPU_ID);
    } else {
      // CPUが先攻
      newState = createInitialState(GAME_ID, CPU_ID);
      newState = joinPlayer2(newState, PLAYER_ID);

      // CPUが先に動く
      setPhase('cpuThinking');
      setGameState(newState);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const cpuMove = calculateCpuMove(newState, 'player1', difficulty);
      newState = placePiece(newState, CPU_ID, cpuMove);
    }

    setGameState(newState);
    setHistory([newState]); // 初期状態を履歴に保存
    setPhase('playing');
  };

  // 待った機能
  const handleUndo = () => {
    if (history.length < 3) {
      showToast('待ったできません', 'error');
      return;
    }

    // プレイヤーの手とCPUの手の2手戻す
    const newHistory = history.slice(0, -2);
    const previousState = newHistory[newHistory.length - 1];

    setGameState(previousState);
    setHistory(newHistory);
    showToast('1手戻しました', 'success');
  };

  // プレイヤーの手
  const handleCellClick = async (pos: Position3D) => {
    if (!gameState || phase !== 'playing') return;

    const playerRole = playerOrder === 'first' ? 'player1' : 'player2';
    if (gameState.currentTurn !== playerRole) return;

    try {
      // プレイヤーの配置
      let newState = placePiece(gameState, PLAYER_ID, pos);
      setHistory([...history, newState]); // 履歴に追加

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

      setGameState(newState);

      // CPUのターン
      setPhase('cpuThinking');

      // 少し待機（思考演出）
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // CPUが配置
      const cpuRole = playerOrder === 'first' ? 'player2' : 'player1';
      const cpuMove = calculateCpuMove(newState, cpuRole, difficulty);
      newState = placePiece(newState, CPU_ID, cpuMove);
      setHistory((prev) => [...prev, newState]); // 履歴に追加

      // 勝敗判定（最適化：最後に置いた位置のみチェック）
      const cpuResult = checkWinner(newState, cpuMove);
      if (cpuResult.winner !== null) {
        newState = finishGame(newState, cpuResult.winner, cpuResult.winningLine);
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

      setGameState(newState);
      setPhase('playing');
    } catch (error) {
      console.error('Move error:', error);
      showToast((error as Error).message, 'error');
    }
  };

  // リプレイ
  const handleReplay = () => {
    setPhase('difficulty-select');
    setPlayerOrder(null);
    setGameState(null);
    setHistory([]);
  };

  const clientState: Connect4ClientState | null = gameState
    ? toClientState(gameState, PLAYER_ID)
    : null;

  const availablePositions = gameState && phase === 'playing' ? getAvailablePositions(gameState) : [];

  return (
    <>
      <GameHeader
        title="立体四目並べ CPU対戦"
        backUrl="/games/connect4"
        backLabel="モード選択"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 sm:pt-20 pb-4 sm:pb-8 px-2 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">立体四目並べ CPU対戦</h1>
            <p className="text-sm sm:text-base text-gray-200">4×4×4の立体空間で4つ揃えよう！</p>
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
                    onClick={() => handleDifficultySelect('easy')}
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
                    onClick={() => handleDifficultySelect('medium')}
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
                    onClick={() => handleDifficultySelect('hard')}
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
              <Link href="/games/connect4" className="text-gray-200 hover:text-white underline text-sm">
                モード選択に戻る
              </Link>
            </div>
          </>
        )}

        {/* 先攻後攻選択 */}
        {phase === 'order-select' && (
          <Card className="bg-white/95 max-w-2xl mx-auto">
            <CardHeader>
              <h2 className="text-2xl font-bold text-slate-900 text-center">先攻・後攻を選択</h2>
              <p className="text-sm text-slate-600 mt-2 text-center">
                難易度: {difficulty === 'easy' && '😊 初級'}{difficulty === 'medium' && '🤔 中級'}{difficulty === 'hard' && '🔥 上級'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => startGame('first')}
                  className="p-6 sm:p-8 rounded-xl border-4 border-blue-500 bg-blue-50 hover:bg-blue-100 transition-all hover:scale-105"
                >
                  <div className="text-4xl sm:text-6xl mb-3">🔵</div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">先攻</div>
                  <div className="text-sm sm:text-base text-slate-600">
                    あなたが先に置きます
                  </div>
                </button>

                <button
                  onClick={() => startGame('second')}
                  className="p-6 sm:p-8 rounded-xl border-4 border-red-500 bg-red-50 hover:bg-red-100 transition-all hover:scale-105"
                >
                  <div className="text-4xl sm:text-6xl mb-3">🔴</div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">後攻</div>
                  <div className="text-sm sm:text-base text-slate-600">
                    CPUが先に置きます
                  </div>
                </button>
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => setPhase('difficulty-select')}
                  className="text-slate-600 hover:text-slate-900 underline text-sm"
                >
                  難易度を変更
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CPU思考中インジケーター（固定配置） */}
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
            <Card className="mb-3 sm:mb-4 bg-white/95">
              <CardContent className="py-2 sm:py-3">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <div>
                    <p className="text-slate-600 font-medium">ターン</p>
                    <p className="text-base sm:text-xl font-bold text-slate-900">
                      {gameState!.currentTurn === (playerOrder === 'first' ? 'player1' : 'player2') ? '🔵 あなた' : '🔴 CPU'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-600 font-medium">難易度</p>
                    <p className="text-sm sm:text-lg font-semibold text-slate-900">
                      {difficulty === 'easy' && '😊 初級'}
                      {difficulty === 'medium' && '🤔 中級'}
                      {difficulty === 'hard' && '🔥 上級'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-600 font-medium">駒数</p>
                    <p className="text-sm sm:text-lg font-semibold text-slate-900">
                      {clientState.myPiecesCount} / {clientState.opponentPiecesCount}
                    </p>
                  </div>
                </div>
                {/* 待ったボタン */}
                {phase === 'playing' && history.length >= 3 && (
                  <div className="mt-3 text-center">
                    <Button
                      variant="secondary"
                      onClick={handleUndo}
                      className="text-sm"
                    >
                      ↩️ 待った（1手戻す）
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ルール概要 */}
            <div className="mb-3 sm:mb-4 bg-indigo-50 border border-indigo-200 rounded-lg p-2 text-xs sm:text-sm">
              <p className="font-semibold text-indigo-900 mb-1">🎯 勝利条件</p>
              <p className="text-indigo-800">
                • 縦・横・斜め（3次元含む）のいずれかで<span className="font-bold">4つ揃える</span>
              </p>
              <p className="text-indigo-700 mt-1 text-[10px] sm:text-xs">
                💡 4つの層（L1〜L4）を俯瞰して戦略を立てよう
              </p>
            </div>

            <Connect4Board3D
              gameState={clientState}
              onCellClick={handleCellClick}
              availablePositions={availablePositions}
            />

            {phase === 'finished' && (
              <Card className="mt-6 bg-white/95">
                <CardHeader>
                  <h2 className="text-3xl font-bold text-center text-slate-900">
                    {gameState!.winner === (playerOrder === 'first' ? 'player1' : 'player2') && '🎉 あなたの勝ち！'}
                    {gameState!.winner && gameState!.winner !== (playerOrder === 'first' ? 'player1' : 'player2') && '😢 CPUの勝ち'}
                    {gameState!.winner === null && '🤝 引き分け'}
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
          </>
        )}

      </div>
    </div>
    </>
  );
}
