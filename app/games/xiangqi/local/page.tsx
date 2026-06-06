// 中国象棋 ローカル対戦ページ

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameStatePanel } from '@/components/game/GamePlayUI';
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
      <div className="min-h-screen app-bg board-pattern pt-16 pb-3 px-3 sm:pt-20 sm:px-4">
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
            <div className="mb-2">
              <GameStatePanel
                title={`${currentPlayer === 'red' ? '紅（赤）' : '黒'}の番です`}
                subtitle="駒を選び、緑の移動先をタップします。"
                status="ローカル対戦"
                items={[
                  { label: '捕獲', value: `${Object.values(clientState.myCapturedPieces).reduce((a, b) => a + b, 0)}個`, emphasis: true },
                  { label: '喪失', value: `${Object.values(clientState.opponentCapturedPieces).reduce((a, b) => a + b, 0)}個` },
                  { label: '選択', value: selectedPiece ? '選択中' : 'なし' },
                  { label: '移動先', value: `${validMoves.length}箇所`, emphasis: validMoves.length > 0 },
                ]}
              />
              <div className="mt-2 flex gap-2 justify-center">
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
