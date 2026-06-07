'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  createInitialState,
  setupPieces,
  movePiece,
  checkWinner,
  toClientState,
  getValidMoves,
} from '@/lib/games/geister/engine';
import type { GeisterState, PieceSetup, Position, PlayerRole } from '@/lib/games/geister/types';
import { GeisterBoard } from '@/components/game/GeisterBoard';
import { SetupBoard } from '@/components/game/SetupBoard';
import { RulesSummary } from '@/components/game/RulesSummary';
import { DecisionPanel } from '@/components/game/GamePlayUI';
import { useToast } from '@/components/ui/Toast';
import { GameHeader } from '@/components/layout/GameHeader';
import { formatGameError } from '@/lib/utils/error-handler';
import { useGameHistory } from '@/lib/hooks/useGameHistory';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/Accordion';
import { logger } from '@/lib/utils/logger';
import { RotateCcw } from 'lucide-react';

type LocalGamePhase = 'setup-p1' | 'setup-p2-interstitial' | 'setup-p2' | 'playing' | 'turnChange' | 'finished';

const PLAYER1_ID = 'local-player1';
const PLAYER2_ID = 'local-player2';
const GAME_ID = 'local-game';

export default function GeisterLocalPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [phase, setPhase] = useState<LocalGamePhase>('setup-p1');
  const [gameState, setGameState] = useState<GeisterState>(() => {
    const initial = createInitialState(GAME_ID, PLAYER1_ID);
    return {
      ...initial,
      players: {
        player1: PLAYER1_ID,
        player2: PLAYER2_ID,
      },
      status: 'setup',
    };
  });
  const [currentPlayer, setCurrentPlayer] = useState<PlayerRole>('player1');
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [player1Setup, setPlayer1Setup] = useState<PieceSetup[]>([]);
  const [player2Setup, setPlayer2Setup] = useState<PieceSetup[]>([]);
  const gameHistory = useGameHistory<{ state: GeisterState; player: PlayerRole; selectedPiece: string | null }>();

  // Player1の配置完了
  const handlePlayer1SetupComplete = (setup: PieceSetup[]) => {
    try {
      const newState = setupPieces(gameState, PLAYER1_ID, setup);
      setGameState(newState);
      setPhase('setup-p2-interstitial');
    } catch (error) {
      logger.error('Setup error:', error);
      showToast(formatGameError(error), 'error');
    }
  };

  // Player2の配置完了
  const handlePlayer2SetupComplete = (setup: PieceSetup[]) => {
    try {
      const newState = setupPieces(gameState, PLAYER2_ID, setup);
      setGameState(newState);
      setPhase('playing');
      setCurrentPlayer('player1');
    } catch (error) {
      logger.error('Setup error:', error);
      showToast(formatGameError(error), 'error');
    }
  };

  // 中間画面から配置画面へ
  const handleReadyForSetup = useCallback(() => {
    setPhase('setup-p2');
  }, []);

  // 中間画面からゲームへ
  const handleReadyForTurn = useCallback(() => {
    setPhase('playing');
  }, []);

  // 駒選択
  const handlePieceClick = useCallback((pieceId: string) => {
    if (phase !== 'playing') {
      return;
    }

    const playerId = currentPlayer === 'player1' ? PLAYER1_ID : PLAYER2_ID;
    setSelectedPiece(pieceId);
    const moves = getValidMoves(gameState, playerId, pieceId);
    setValidMoves(moves);
  }, [phase, currentPlayer, gameState]);

  // 移動
  const handleMove = useCallback((to: Position) => {
    if (!selectedPiece || phase !== 'playing') {
      return;
    }

    try {
      const playerId = currentPlayer === 'player1' ? PLAYER1_ID : PLAYER2_ID;

      // 履歴に現在の状態を保存
      gameHistory.addHistory({ state: gameState, player: currentPlayer, selectedPiece });

      const newState = movePiece(gameState, playerId, selectedPiece, to);

      setSelectedPiece(null);
      setValidMoves([]);

      // 勝敗判定
      const winResult = checkWinner(newState);
      if (winResult.winner) {
        setGameState(newState);
        setPhase('finished');
        return;
      }

      // ターン交代
      setGameState(newState);
      const nextPlayer: PlayerRole = currentPlayer === 'player1' ? 'player2' : 'player1';
      setCurrentPlayer(nextPlayer);
      setPhase('turnChange');
    } catch (error) {
      logger.error('Move error:', error);
      showToast(formatGameError(error), 'error');
      setSelectedPiece(null);
      setValidMoves([]);
    }
  }, [selectedPiece, phase, currentPlayer, gameState, gameHistory, showToast]);

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
    setPhase('setup-p1');
    const initial = createInitialState(GAME_ID, PLAYER1_ID);
    setGameState({
      ...initial,
      players: {
        player1: PLAYER1_ID,
        player2: PLAYER2_ID,
      },
      status: 'setup',
    });
    setCurrentPlayer('player1');
    setSelectedPiece(null);
    setValidMoves([]);
    setPlayer1Setup([]);
    setPlayer2Setup([]);
    gameHistory.clearHistory();
  }, [gameHistory]);

  // クライアント状態をメモ化
  const playerId = currentPlayer === 'player1' ? PLAYER1_ID : PLAYER2_ID;
  const clientState = useMemo(() => {
    if (phase !== 'playing' && phase !== 'finished') {
      return null;
    }
    return toClientState(gameState, playerId);
  }, [phase, gameState, playerId]);

  return (
    <>
      <GameHeader
        title="ガイスター ローカル対戦"
        backUrl="/games/geister"
        backLabel="モード選択"
      />
      <div className="min-h-screen app-bg board-pattern pt-16 sm:pt-20 pb-3 px-3 sm:px-4">
        <div className="max-w-3xl mx-auto">

        {/* Player1配置フェーズ */}
        {phase === 'setup-p1' && (
          <Card className="bg-white/95">
            <CardHeader className="pb-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Player 1 - 駒の配置</h2>
              <p className="text-xs text-slate-600 mt-1">👻×4、😈×4を配置</p>
            </CardHeader>
            <CardContent className="pt-2">
              <SetupBoard
                myRole="player1"
                setup={player1Setup}
                onSetupChange={setPlayer1Setup}
                onComplete={handlePlayer1SetupComplete}
              />
            </CardContent>
          </Card>
        )}

        {/* Player2配置前の中間画面 */}
        {phase === 'setup-p2-interstitial' && (
          <Card className="bg-white/95">
            <CardContent className="py-6 text-center">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Player 2の番です</h2>
              <p className="text-xs sm:text-sm text-slate-700 mb-4">端末をPlayer 2に渡してください</p>
              <Button variant="primary" onClick={handleReadyForSetup} className="text-sm">準備完了</Button>
            </CardContent>
          </Card>
        )}

        {/* Player2配置フェーズ */}
        {phase === 'setup-p2' && (
          <Card className="bg-white/95">
            <CardHeader className="pb-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Player 2 - 駒の配置</h2>
              <p className="text-xs text-slate-600 mt-1">👻×4、😈×4を配置</p>
            </CardHeader>
            <CardContent className="pt-2">
              <SetupBoard
                myRole="player2"
                setup={player2Setup}
                onSetupChange={setPlayer2Setup}
                onComplete={handlePlayer2SetupComplete}
              />
            </CardContent>
          </Card>
        )}

        {/* ターン交代画面 */}
        {phase === 'turnChange' && (
          <Card className="bg-white/95">
            <CardContent className="py-6 text-center">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">
                Player {currentPlayer === 'player1' ? '1' : '2'} の番です
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 mb-4">
                端末を Player {currentPlayer === 'player1' ? '1' : '2'} に渡してください
              </p>
              <Button variant="primary" onClick={handleReadyForTurn} className="text-sm">準備完了</Button>
            </CardContent>
          </Card>
        )}

        {/* ゲームプレイ（コンパクト） */}
        {phase === 'playing' && clientState && (
          <>
            <DecisionPanel
              title={selectedPiece ? '緑の移動先を選ぶ' : `Player ${currentPlayer === 'player1' ? '1' : '2'}: 動かす駒を選ぶ`}
              detail="良い駒は脱出、悪い駒は取らせる。選択した駒の移動先だけを強調します。"
              status="ローカル対戦"
              primary={selectedPiece ? `${validMoves.length}手` : '駒を選択'}
              metrics={[
                { label: '自分👻', value: clientState.capturedCounts.myGood },
                { label: '自分😈', value: clientState.capturedCounts.myBad },
                { label: '相手捕獲', value: clientState.opponentPiecesCount.captured, tone: 'cool' },
                { label: '勝ち筋', value: '脱出/捕獲', tone: 'hot' },
              ]}
            >
                <div className="flex justify-center gap-2">
                  {gameHistory.canUndo() && (
                    <Button
                      variant="secondary"
                      onClick={handleUndo}
                      className="px-3 py-2 text-xs"
                      aria-label="1手戻す"
                    >
                      <RotateCcw className="inline h-4 w-4" aria-hidden="true" />
                      待った
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setPhase('turnChange');
                      const nextPlayer: PlayerRole = currentPlayer === 'player1' ? 'player2' : 'player1';
                      setCurrentPlayer(nextPlayer);
                      setSelectedPiece(null);
                      setValidMoves([]);
                    }}
                    className="px-3 py-2 text-xs"
                  >
                    交代
                  </Button>
                </div>
            </DecisionPanel>

            {/* ルール概要（Accordion化） */}
            <div className="mb-2">
              <Accordion type="single" collapsible defaultValue="">
                <AccordionItem value="rules">
                  <AccordionTrigger className="text-xs sm:text-sm py-2 px-3 bg-white/95 rounded-t-lg">
                    ルール概要
                  </AccordionTrigger>
                  <AccordionContent className="bg-white/95">
                    <RulesSummary />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="flex justify-center">
              <GeisterBoard
                gameState={clientState}
                onPieceClick={handlePieceClick}
                onCellClick={handleMove}
                selectedPieceId={selectedPiece}
                validMoves={validMoves}
              />
            </div>
          </>
        )}

        {/* ゲーム終了 */}
        {phase === 'finished' && (
          <div role="alert" aria-live="assertive">
            <Card className="bg-white/95">
              <CardHeader className="pb-2">
                <h2 className="text-lg sm:text-xl font-bold text-center text-slate-900">
                  🎉 Player {gameState.winner === 'player1' ? '1' : '2'} の勝ち！
                </h2>
              </CardHeader>
              <CardContent className="text-center pt-2">
                <p className="text-xs text-slate-700 mb-3 font-medium">
                  {gameState.winReason === 'escape' && '👻脱出成功！'}
                  {gameState.winReason === 'captureAllGood' && '相手の👻を全て捕獲！'}
                  {gameState.winReason === 'loseAllBad' && '😈を全て取らせた！'}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="primary" onClick={handleReplay} className="text-xs py-1 px-2">もう一度</Button>
                  <Button variant="secondary" onClick={() => router.push('/games/geister')} className="text-xs py-1 px-2">戻る</Button>
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
