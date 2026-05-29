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
import { RulesModal } from '@/components/game/RulesModal';
import { useToast } from '@/components/ui/Toast';
import { GameHeader } from '@/components/layout/GameHeader';

type CpuGamePhase = 'difficulty-select' | 'order-select' | 'playing' | 'cpuThinking' | 'finished';
type Difficulty = 'easy' | 'medium' | 'hard';

const PLAYER_ID = 'player-human';
const CPU_ID = 'player-cpu';
const GAME_ID = 'cpu-game';

export default function XiangqiCpuPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [phase, setPhase] = useState<CpuGamePhase>('difficulty-select');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerColor, setPlayerColor] = useState<'red' | 'black' | null>(null);
  const [gameState, setGameState] = useState<XiangqiState | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [history, setHistory] = useState<XiangqiState[]>([]); // 履歴保存

  // 難易度選択
  const handleDifficultySelect = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setPhase('order-select');
  };

  // 先攻後攻選択してゲーム開始
  const startGame = async (color: 'red' | 'black') => {
    setPlayerColor(color);

    let newState: XiangqiState;
    if (color === 'red') {
      // プレイヤーが紅（先攻）
      newState = createInitialState(GAME_ID, PLAYER_ID);
      newState = joinBlackPlayer(newState, CPU_ID);
    } else {
      // プレイヤーが黒（後攻）、CPUが紅（先攻）
      newState = createInitialState(GAME_ID, CPU_ID);
      newState = joinBlackPlayer(newState, PLAYER_ID);

      // CPUが先に動く
      setPhase('cpuThinking');
      setGameState(newState);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const cpuMove = calculateCpuMove(newState, 'red', difficulty);
      newState = movePiece(newState, CPU_ID, cpuMove.from, cpuMove.to);
    }

    setGameState(newState);
    setHistory([newState]); // 初期状態を履歴に保存
    setPhase('playing');
  };

  // 待った機能
  const handleUndo = () => {
    if (!gameState || history.length < 3) {
      showToast('待ったできません', 'error');
      return;
    }

    const newHistory = history.slice(0, -2);
    const previousState = newHistory[newHistory.length - 1];

    setGameState(previousState);
    setHistory(newHistory);
    setSelectedPiece(null);
    setValidMoves([]);
    showToast('1手戻しました', 'success');
  };

  // セルクリック
  const handleCellClick = async (pos: Position) => {
    if (!gameState || phase !== 'playing' || gameState.currentTurn !== playerColor) return;

    const clickedPiece = gameState.board[pos.row][pos.col];

    // 駒を選択
    if (clickedPiece && clickedPiece.owner === playerColor) {
      setSelectedPiece(pos);
      const moves = getValidMoves(gameState, PLAYER_ID, clickedPiece.id);
      setValidMoves(moves);
      return;
    }

    // 移動
    if (selectedPiece) {
      try {
        let newState = movePiece(gameState, PLAYER_ID, selectedPiece, pos);
        setHistory([...history, newState]); // 履歴に追加
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
        const cpuColor = playerColor === 'red' ? 'black' : 'red';
        const cpuMove = calculateCpuMove(newState, cpuColor, difficulty);
        newState = movePiece(newState, CPU_ID, cpuMove.from, cpuMove.to);
        setHistory((prev) => [...prev, newState]); // 履歴に追加

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
    setPlayerColor(null);
    setGameState(null);
    setSelectedPiece(null);
    setValidMoves([]);
    setHistory([]);
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
              <Link href="/games/xiangqi" className="text-gray-200 hover:text-white underline text-sm">
                モード選択に戻る
              </Link>
            </div>
          </>
        )}

        {/* 先攻後攻選択 */}
        {phase === 'order-select' && (
          <Card className="bg-white/95 max-w-2xl mx-auto">
            <CardHeader>
              <h2 className="text-2xl font-bold text-slate-900 text-center">紅・黒を選択</h2>
              <p className="text-sm text-slate-600 mt-2 text-center">
                難易度: {difficulty === 'easy' && '😊 初級'}{difficulty === 'medium' && '🤔 中級'}{difficulty === 'hard' && '🔥 上級'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => startGame('red')}
                  className="p-6 sm:p-8 rounded-xl border-4 border-red-500 bg-red-50 hover:bg-red-100 transition-all hover:scale-105"
                >
                  <div className="text-4xl sm:text-6xl mb-3">🔴</div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">紅（先攻）</div>
                  <div className="text-sm sm:text-base text-slate-600">
                    あなたが先に動きます
                  </div>
                </button>

                <button
                  onClick={() => startGame('black')}
                  className="p-6 sm:p-8 rounded-xl border-4 border-slate-700 bg-slate-50 hover:bg-slate-100 transition-all hover:scale-105"
                >
                  <div className="text-4xl sm:text-6xl mb-3">⚫</div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">黒（後攻）</div>
                  <div className="text-sm sm:text-base text-slate-600">
                    CPUが先に動きます
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
            <Card className="mb-4 bg-white/95">
              <CardContent className="py-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">ターン</p>
                    <p className="text-base sm:text-xl font-bold text-slate-900">
                      {gameState!.currentTurn === playerColor ? `あなた（${playerColor === 'red' ? '紅' : '黒'}）` : `CPU（${playerColor === 'red' ? '黒' : '紅'}）`}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">難易度</p>
                    <p className="text-sm sm:text-base font-semibold text-slate-900">
                      {difficulty === 'easy' && '😊 初級'}
                      {difficulty === 'medium' && '🤔 中級'}
                      {difficulty === 'hard' && '🔥 上級'}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {/* ルールボタン */}
                    <RulesModal gameName="中国象棋">
                      <div className="space-y-3">
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                          <p className="font-semibold text-indigo-900 mb-2">🎯 勝利条件</p>
                          <p className="text-indigo-800 text-sm">
                            • 相手の<span className="font-bold">将/帥を取る</span>（チェックメイト）
                          </p>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <p className="font-semibold text-amber-900 mb-2">📖 主要な駒</p>
                          <ul className="text-amber-800 text-sm space-y-1">
                            <li>• <strong>将/帥:</strong> 九宮内で縦横1マス</li>
                            <li>• <strong>車:</strong> 縦横に何マスでも（最強）</li>
                            <li>• <strong>馬:</strong> 日の字型（蹩馬腿あり）</li>
                            <li>• <strong>炮/砲:</strong> 台を飛び越えて攻撃</li>
                            <li>• <strong>兵/卒:</strong> 川を渡ると左右にも動ける</li>
                          </ul>
                          <p className="text-amber-700 text-xs mt-2">
                            💡 詳細は<a href="/games/xiangqi/rules" target="_blank" className="underline">ルールページ</a>をご覧ください
                          </p>
                        </div>
                      </div>
                    </RulesModal>
                    {/* 待ったボタン */}
                    {phase === 'playing' && history.length >= 3 && (
                      <Button
                        variant="secondary"
                        onClick={handleUndo}
                        className="text-xs sm:text-sm"
                        aria-label="1手戻す"
                      >
                        ↩️ 待った
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <XiangqiBoard
              gameState={clientState}
              onCellClick={handleCellClick}
              selectedPiece={selectedPiece}
              validMoves={validMoves}
            />

            {phase === 'finished' && (
              <div role="alert" aria-live="assertive">
                <Card className="mt-6 bg-white/95">
                  <CardHeader>
                    <h2 className="text-3xl font-bold text-center text-slate-900">
                      {gameState!.winner === playerColor && '🎉 あなたの勝ち！'}
                      {gameState!.winner && gameState!.winner !== playerColor && '😢 CPUの勝ち'}
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
              </div>
            )}
          </>
        )}

      </div>
    </div>
    </>
  );
}
