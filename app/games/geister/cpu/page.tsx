'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';
import {
  createInitialState,
  setupPieces,
  movePiece,
  checkWinner,
  toClientState,
  getValidMoves,
} from '@/lib/games/geister/engine';
import { calculateCpuMove, generateCpuSetup } from '@/lib/games/geister/ai';
import type { GeisterState, PieceSetup, Position, GeisterClientState } from '@/lib/games/geister/types';
import { GeisterBoard } from '@/components/game/GeisterBoard';
import { SetupBoard } from '@/components/game/SetupBoard';
import { RulesSummary } from '@/components/game/RulesSummary';
import { RulesModal } from '@/components/game/RulesModal';
import { useToast } from '@/components/ui/Toast';
import { formatGameError } from '@/lib/utils/error-handler';
import { useSafeTimeout } from '@/lib/hooks/useSafeTimeout';
import { useGameHistory } from '@/lib/hooks/useGameHistory';

type CpuGamePhase = 'orderSelect' | 'setup' | 'playing' | 'cpuThinking' | 'finished';

const PLAYER_ID = 'player-human';
const CPU_ID = 'player-cpu';
const GAME_ID = 'cpu-game';

export default function GeisterCpuPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { setSafeTimeout } = useSafeTimeout();
  const gameHistory = useGameHistory<GeisterState>(2); // CPU対戦は2手戻すため最小履歴3
  const [phase, setPhase] = useState<CpuGamePhase>('orderSelect');
  const [playerOrder, setPlayerOrder] = useState<'first' | 'second' | null>(null);
  const [gameState, setGameState] = useState<GeisterState>(() =>
    createInitialState(GAME_ID, PLAYER_ID)
  );
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [playerSetup, setPlayerSetup] = useState<PieceSetup[]>([]);

  // 先攻後攻選択
  const handleOrderSelect = useCallback((order: 'first' | 'second') => {
    setPlayerOrder(order);

    // ゲーム状態を初期化
    let newState: GeisterState;
    if (order === 'first') {
      // プレイヤーが先攻（player1）
      newState = createInitialState(GAME_ID, PLAYER_ID);
      newState = {
        ...newState,
        status: 'setup',
        players: {
          player1: PLAYER_ID,
          player2: CPU_ID,
        },
      };
    } else {
      // プレイヤーが後攻（player2）、CPUが先攻（player1）
      newState = createInitialState(GAME_ID, CPU_ID);
      newState = {
        ...newState,
        status: 'setup',
        players: {
          player1: CPU_ID,
          player2: PLAYER_ID,
        },
      };
    }

    setGameState(newState);
    setPhase('setup');
  }, []);

  // プレイヤーの配置完了
  const handlePlayerSetupComplete = async (setup: PieceSetup[]) => {
    try {
      const playerRole = playerOrder === 'first' ? 'player1' : 'player2';
      const cpuRole = playerOrder === 'first' ? 'player2' : 'player1';

      let newState = setupPieces(gameState, PLAYER_ID, setup);

      // CPUの配置を自動生成
      const cpuSetup = generateCpuSetup(cpuRole);
      const cpuPieceSetup: PieceSetup[] = cpuSetup.map((s, i) => ({
        pieceId: `cpu-piece-${i}`,
        type: s.type,
        position: s.position,
      }));

      newState = setupPieces(newState, CPU_ID, cpuPieceSetup);

      setGameState(newState);

      // 後攻の場合、CPUが先に動く
      if (playerOrder === 'second') {
        setPhase('cpuThinking');
        await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 1000));

        const cpuMove = calculateCpuMove(newState, CPU_ID);
        newState = movePiece(newState, CPU_ID, cpuMove.pieceId, cpuMove.to);

        const cpuWinResult = checkWinner(newState);
        if (cpuWinResult.winner) {
          setGameState(newState);
          setPhase('finished');
          return;
        }

        setGameState(newState);
      }

      setPhase('playing');
    } catch (error) {
      console.error('Setup error:', error);
      showToast(formatGameError(error), 'error');
    }
  };

  // 待った機能（プレイヤーの手とCPUの手の2手戻す）
  const handleUndo = useCallback(() => {
    const previousState = gameHistory.undo(2);
    if (!previousState) {
      showToast('待ったできません', 'error');
      return;
    }

    setGameState(previousState);
    setSelectedPiece(null);
    setValidMoves([]);
    showToast('1手戻しました', 'success');
  }, [gameHistory, showToast]);

  // プレイヤーの駒選択
  const handlePieceClick = useCallback((pieceId: string) => {
    const playerRole = playerOrder === 'first' ? 'player1' : 'player2';
    if (phase !== 'playing' || gameState.currentTurn !== playerRole) {
      return;
    }

    setSelectedPiece(pieceId);
    const moves = getValidMoves(gameState, PLAYER_ID, pieceId);
    setValidMoves(moves);
  }, [phase, gameState, playerOrder]);

  // プレイヤーの移動
  const handleMove = useCallback(async (to: Position) => {
    if (!selectedPiece || phase !== 'playing') {
      return;
    }

    try {
      // プレイヤーの移動
      let newState = movePiece(gameState, PLAYER_ID, selectedPiece, to);
      gameHistory.addHistory(newState); // 履歴に追加
      setSelectedPiece(null);
      setValidMoves([]);

      // 勝敗判定
      const playerWinResult = checkWinner(newState);
      if (playerWinResult.winner) {
        setGameState(newState);
        setPhase('finished');
        return;
      }

      setGameState(newState);

      // CPUのターン
      setPhase('cpuThinking');

      // 1秒待機（思考演出）
      await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 1000));

      // CPUが移動
      const cpuMove = calculateCpuMove(newState, CPU_ID);
      newState = movePiece(newState, CPU_ID, cpuMove.pieceId, cpuMove.to);
      gameHistory.addHistory(newState); // 履歴に追加

      // 勝敗判定
      const cpuWinResult = checkWinner(newState);
      if (cpuWinResult.winner) {
        setGameState(newState);
        setPhase('finished');
        return;
      }

      setGameState(newState);
      setPhase('playing');
    } catch (error) {
      console.error('Move error:', error);
      showToast(formatGameError(error), 'error');
      setSelectedPiece(null);
      setValidMoves([]);
      setPhase('playing');
    }
  }, [selectedPiece, phase, gameState, gameHistory, setSafeTimeout, showToast]);

  // リプレイ
  const handleReplay = useCallback(() => {
    setPhase('orderSelect');
    setPlayerOrder(null);
    setGameState(createInitialState(GAME_ID, PLAYER_ID));
    setSelectedPiece(null);
    setValidMoves([]);
    setPlayerSetup([]);
    gameHistory.clearHistory();
  }, [gameHistory]);

  // CPU対戦用のクライアント状態を作成
  const createCpuClientState = (state: GeisterState): GeisterClientState => {
    const myRole = playerOrder === 'first' ? 'player1' : 'player2';
    const opponentRole = playerOrder === 'first' ? 'player2' : 'player1';

    // 盤面を変換（相手の駒のtypeを隠す）
    const clientBoard = state.board.map((row) =>
      row.map((piece) => {
        if (!piece) return null;
        return {
          id: piece.id,
          owner: piece.owner,
          position: piece.position,
          type: piece.owner === myRole ? piece.type : undefined,
          captured: piece.captured,
          escaped: piece.escaped,
        };
      })
    );

    const opponentPieces = state.pieces[opponentRole];
    const opponentCaptured = opponentPieces.filter((p) => p.captured).length;

    const myCapturedGood = state.pieces[myRole].filter((p) => p.type === 'good' && p.captured).length;
    const myCapturedBad = state.pieces[myRole].filter((p) => p.type === 'bad' && p.captured).length;
    const opponentCapturedGood = opponentPieces.filter((p) => p.type === 'good' && p.captured).length;
    const opponentCapturedBad = opponentPieces.filter((p) => p.type === 'bad' && p.captured).length;

    // lastMoveをクライアント用に変換
    let clientLastMove: { from: Position; to: Position } | null = null;
    if (state.lastMove) {
      clientLastMove = {
        from: state.lastMove.from,
        to: state.lastMove.to,
      };
    }

    return {
      gameId: state.gameId,
      status: state.status,
      board: clientBoard,
      currentTurn: state.currentTurn,
      myRole,
      myPlayerId: PLAYER_ID,
      myPieces: state.pieces[myRole],
      isMyTurn: state.currentTurn === myRole,
      canOperate: state.status === 'playing' && state.currentTurn === myRole,
      opponentPiecesCount: {
        total: 8,
        captured: opponentCaptured,
      },
      capturedCounts: {
        myGood: myCapturedGood,
        myBad: myCapturedBad,
        opponentGood: opponentCapturedGood,
        opponentBad: opponentCapturedBad,
      },
      setupReady: {
        player1: state.status !== 'setup',
        player2: state.status !== 'setup',
      },
      winner: state.winner,
      winReason: state.winReason,
      lastMove: clientLastMove, // 最後の手を含める
    };
  };

  // orderSelect/setup状態の時はclientStateを作らない
  const clientState = (phase === 'orderSelect' || phase === 'setup') ? null : createCpuClientState(gameState);
  const playerRole = playerOrder === 'first' ? 'player1' : 'player2';
  const isPlayerTurn = phase === 'playing' && gameState.currentTurn === playerRole;

  return (
    <>
      <GameHeader
        title="ガイスター CPU対戦"
        backUrl="/games/geister"
        backLabel="モード選択"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 sm:pt-20 pb-3 px-2 sm:px-3">
        <div className="max-w-3xl mx-auto">
          {/* ヘッダー（コンパクト） */}
          <div className="text-center mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">CPU対戦</h1>
            <p className="text-xs sm:text-sm text-gray-200">あなた vs コンピュータ</p>
          </div>

        {/* 先攻後攻選択（コンパクト） */}
        {phase === 'orderSelect' && (
          <Card className="bg-white/95">
            <CardHeader className="pb-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 text-center">先攻・後攻を選択</h2>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  onClick={() => handleOrderSelect('first')}
                  className="p-3 sm:p-4 rounded-lg border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 transition-all hover:scale-105 active:scale-95"
                >
                  <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">⚡</div>
                  <div className="text-sm sm:text-lg font-bold text-slate-900 mb-0.5 sm:mb-1">先攻</div>
                  <div className="text-[10px] sm:text-xs text-slate-600">
                    先に動く
                  </div>
                </button>

                <button
                  onClick={() => handleOrderSelect('second')}
                  className="p-3 sm:p-4 rounded-lg border-2 border-purple-500 bg-purple-50 hover:bg-purple-100 transition-all hover:scale-105 active:scale-95"
                >
                  <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">🛡️</div>
                  <div className="text-sm sm:text-lg font-bold text-slate-900 mb-0.5 sm:mb-1">後攻</div>
                  <div className="text-[10px] sm:text-xs text-slate-600">
                    後から動く
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 配置フェーズ（コンパクト） */}
        {phase === 'setup' && (
          <>
            <Card className="bg-white/95">
              <CardHeader className="pb-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">駒の初期配置</h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  👻×4、😈×4を配置
                </p>
              </CardHeader>
              <CardContent className="pt-2">
                <SetupBoard
                  myRole={playerOrder === 'first' ? 'player1' : 'player2'}
                  setup={playerSetup}
                  onSetupChange={setPlayerSetup}
                  onComplete={handlePlayerSetupComplete}
                />
              </CardContent>
            </Card>
            <div className="mt-2 text-center">
              <Link href="/games/geister" className="text-gray-200 hover:text-white underline text-xs sm:text-sm">
                モード選択に戻る
              </Link>
            </div>
          </>
        )}

        {/* CPU思考中インジケーター（画面サイズを変えない固定配置） */}
        {phase === 'cpuThinking' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 pointer-events-none">
            <Card className="bg-white/95 pointer-events-auto">
              <CardContent className="py-6 px-8 text-center">
                <div className="flex justify-center mb-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
                <p className="text-lg font-semibold text-slate-900">CPUが思考中...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ゲームプレイ（コンパクト） */}
        {(phase === 'playing' || phase === 'finished' || phase === 'cpuThinking') && clientState && (
          <>
            <Card className="mb-2 bg-white/95">
              <CardContent className="py-1.5 sm:py-2 px-2 sm:px-3">
                <div className="flex items-center justify-between text-[10px] sm:text-xs">
                  <div className="flex gap-1">
                    <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold">
                      👻 {clientState.capturedCounts.myGood}
                    </span>
                    <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-semibold">
                      😈 {clientState.capturedCounts.myBad}
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-slate-900">
                    {gameState.currentTurn === playerRole ? 'あなた' : 'CPU'}
                  </div>
                  <div className="flex gap-1">
                    <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold">
                      👻 {clientState.capturedCounts.opponentGood}
                    </span>
                    <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-semibold">
                      😈 {clientState.capturedCounts.opponentBad}
                    </span>
                  </div>
                </div>
                {/* ボタン（コンパクト） */}
                {phase === 'playing' && gameHistory.canUndo() && (
                  <div className="flex gap-1 justify-center mt-1.5">
                    <Button
                      variant="secondary"
                      onClick={handleUndo}
                      className="text-[10px] sm:text-xs py-1 px-2"
                      aria-label="1手戻す"
                    >
                      ↩️ 待った
                    </Button>
                    <RulesModal gameName="ガイスター">
                      <RulesSummary />
                    </RulesModal>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <GeisterBoard
                gameState={clientState}
                onPieceClick={handlePieceClick}
                onCellClick={handleMove}
                selectedPieceId={selectedPiece}
                validMoves={validMoves}
              />
            </div>

            {phase === 'finished' && (
              <div role="alert" aria-live="assertive">
                <Card className="mt-3 bg-white/95 animate-[fadeIn_0.5s_ease-in]">
                  <CardHeader className="pb-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-center text-slate-900">
                      {gameState.winner === playerRole ? '🎉 勝利！' : gameState.winner ? '😢 敗北' : '🤝 引き分け'}
                    </h2>
                  </CardHeader>
                <CardContent className="text-center pt-2">
                  <p className="text-xs sm:text-sm text-slate-700 mb-3 font-medium">
                    {gameState.winReason === 'escape' && '👻脱出成功！'}
                    {gameState.winReason === 'captureAllGood' && '相手の👻を全て捕獲！'}
                    {gameState.winReason === 'loseAllBad' && '😈を全て取らせた！'}
                    {gameState.winReason === 'draw' && '引き分け'}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="primary" onClick={handleReplay} className="text-xs sm:text-sm py-1.5 px-3">
                      もう一度
                    </Button>
                    <Button variant="secondary" onClick={() => router.push('/games/geister')} className="text-xs sm:text-sm py-1.5 px-3">
                      戻る
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
