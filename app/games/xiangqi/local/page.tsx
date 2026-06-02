// 中国象棋 ローカル対戦ページ

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/Accordion';
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
import { formatGameError } from '@/lib/utils/error-handler';
import { useGameHistory } from '@/lib/hooks/useGameHistory';
import { logger } from '@/lib/utils/logger';

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
  const gameHistory = useGameHistory<{ state: XiangqiState; player: PlayerRole; selectedPiece: Position | null }>();

  // セルクリック
  const handleCellClick = useCallback((pos: Position) => {
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
        // 履歴に現在の状態を保存
        gameHistory.addHistory({ state: gameState, player: currentPlayer, selectedPiece });

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
        logger.error('Move error:', error);
        showToast(formatGameError(error), 'error');
        setSelectedPiece(null);
        setValidMoves([]);
      }
    }
  }, [phase, gameState, currentPlayer, gameHistory, showToast]);

  // ターン交代画面から戻る
  const handleReadyForTurn = useCallback(() => {
    setPhase('playing');
  }, []);

  // 待った（1手戻す）
  const handleUndo = useCallback(() => {
    const previousEntry = gameHistory.undo();
    if (!previousEntry) {
      showToast('これ以上戻せません', 'error');
      return;
    }

    setGameState(previousEntry.state);
    setCurrentPlayer(previousEntry.player);
    setSelectedPiece(null);
    setValidMoves([]);
    setPhase('playing');
    showToast('1手戻しました', 'info');
  }, [gameHistory, showToast]);

  // リプレイ
  const handleReplay = useCallback(() => {
    let state = createInitialState(GAME_ID, PLAYER_RED_ID);
    state = joinBlackPlayer(state, PLAYER_BLACK_ID);
    setGameState(state);
    setCurrentPlayer('red');
    setPhase('playing');
    setSelectedPiece(null);
    setValidMoves([]);
    gameHistory.clearHistory();
  }, [gameHistory]);

  const playerId = useMemo(() =>
    currentPlayer === 'red' ? PLAYER_RED_ID : PLAYER_BLACK_ID,
    [currentPlayer]
  );
  const clientState = useMemo(() =>
    toClientState(gameState, playerId),
    [gameState, playerId]
  );

  return (
    <>
      <GameHeader
        title="中国象棋 ローカル対戦"
        backUrl="/games/xiangqi"
        backLabel="モード選択"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 sm:pt-24 pb-4 sm:pb-8 px-3 sm:px-4">
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
                <div className="grid grid-cols-3 gap-2 items-start mb-3">
                  {/* 捕獲した駒（折りたたみ） */}
                  <div className="text-center">
                    <Accordion type="single" collapsible>
                      <AccordionItem value="my-captured">
                        <AccordionTrigger className="py-2 px-2 text-xs sm:text-sm">
                          <span className="flex flex-col items-start w-full">
                            <span className="text-[10px] sm:text-xs text-slate-600 font-medium">捕獲した駒</span>
                            <span className="text-xs sm:text-sm font-semibold text-slate-900">
                              {Object.values(clientState.myCapturedPieces).reduce((a, b) => a + b, 0)} / 16
                            </span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-wrap gap-0.5 justify-center text-[9px] sm:text-[10px]">
                            {clientState.myCapturedPieces.chariot > 0 && (
                              <span className="bg-red-100 text-red-800 px-1 py-0.5 rounded">車{clientState.myCapturedPieces.chariot}</span>
                            )}
                            {clientState.myCapturedPieces.horse > 0 && (
                              <span className="bg-orange-100 text-orange-800 px-1 py-0.5 rounded">馬{clientState.myCapturedPieces.horse}</span>
                            )}
                            {clientState.myCapturedPieces.cannon > 0 && (
                              <span className="bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">炮{clientState.myCapturedPieces.cannon}</span>
                            )}
                            {clientState.myCapturedPieces.elephant > 0 && (
                              <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded">象{clientState.myCapturedPieces.elephant}</span>
                            )}
                            {clientState.myCapturedPieces.advisor > 0 && (
                              <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded">士{clientState.myCapturedPieces.advisor}</span>
                            )}
                            {clientState.myCapturedPieces.soldier > 0 && (
                              <span className="bg-purple-100 text-purple-800 px-1 py-0.5 rounded">兵{clientState.myCapturedPieces.soldier}</span>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  {/* ターン情報（中央）*/}
                  <div className="text-center pt-2">
                    <p className="text-sm text-slate-600 font-medium">現在のターン</p>
                    <p className="text-xl font-bold text-slate-900">
                      {currentPlayer === 'red' ? '紅（赤）' : '黒'}
                    </p>
                  </div>

                  {/* 取られた駒（折りたたみ） */}
                  <div className="text-center">
                    <Accordion type="single" collapsible>
                      <AccordionItem value="opponent-captured">
                        <AccordionTrigger className="py-2 px-2 text-xs sm:text-sm">
                          <span className="flex flex-col items-start w-full">
                            <span className="text-[10px] sm:text-xs text-slate-600 font-medium">取られた駒</span>
                            <span className="text-xs sm:text-sm font-semibold text-slate-900">
                              {Object.values(clientState.opponentCapturedPieces).reduce((a, b) => a + b, 0)} / 16
                            </span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-wrap gap-0.5 justify-center text-[9px] sm:text-[10px]">
                            {clientState.opponentCapturedPieces.chariot > 0 && (
                              <span className="bg-red-100 text-red-800 px-1 py-0.5 rounded">車{clientState.opponentCapturedPieces.chariot}</span>
                            )}
                            {clientState.opponentCapturedPieces.horse > 0 && (
                              <span className="bg-orange-100 text-orange-800 px-1 py-0.5 rounded">馬{clientState.opponentCapturedPieces.horse}</span>
                            )}
                            {clientState.opponentCapturedPieces.cannon > 0 && (
                              <span className="bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">炮{clientState.opponentCapturedPieces.cannon}</span>
                            )}
                            {clientState.opponentCapturedPieces.elephant > 0 && (
                              <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded">象{clientState.opponentCapturedPieces.elephant}</span>
                            )}
                            {clientState.opponentCapturedPieces.advisor > 0 && (
                              <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded">士{clientState.opponentCapturedPieces.advisor}</span>
                            )}
                            {clientState.opponentCapturedPieces.soldier > 0 && (
                              <span className="bg-purple-100 text-purple-800 px-1 py-0.5 rounded">兵{clientState.opponentCapturedPieces.soldier}</span>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
                <div className="flex gap-2 justify-center">
                  {/* 待ったボタン */}
                  {gameHistory.canUndo() && (
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
          <div role="alert" aria-live="assertive">
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
          </div>
        )}

      </div>
    </div>
    </>
  );
}
