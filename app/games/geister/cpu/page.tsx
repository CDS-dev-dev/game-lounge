'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';
import { PlaySetupCard, SetupOptionButton } from '@/components/game/PlaySetup';
import {
  createInitialState,
  setupPieces,
  movePiece,
  checkWinner,
  getValidMoves,
} from '@/lib/games/geister/engine';
import { calculateCpuMove, generateCpuSetup } from '@/lib/games/geister/ai';
import type { GeisterState, PieceSetup, Position, PlayerRole } from '@/lib/games/geister/types';
import { GeisterBoard } from '@/components/game/GeisterBoard';
import { SetupBoard } from '@/components/game/SetupBoard';
import { RulesSummary } from '@/components/game/RulesSummary';
import { RulesModal } from '@/components/game/RulesModal';
import { useToast } from '@/components/ui/Toast';
import { formatGameError } from '@/lib/utils/error-handler';
import { useSafeTimeout } from '@/lib/hooks/useSafeTimeout';
import { useGameHistory } from '@/lib/hooks/useGameHistory';
import { logger } from '@/lib/utils/logger';
import { Z_INDEX } from '@/lib/constants/z-index';
import { Bot, RotateCcw, User } from 'lucide-react';

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
      logger.error('Setup error:', error);
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
      logger.error('Move error:', error);
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

  // CPU対戦用のクライアント状態を作成（メモ化）
  const clientState = useMemo(() => {
    if (phase === 'orderSelect' || phase === 'setup' || !playerOrder) {
      return null;
    }

    const myRole: PlayerRole = playerOrder === 'first' ? 'player1' : 'player2';
    const opponentRole: PlayerRole = playerOrder === 'first' ? 'player2' : 'player1';

    // 盤面を変換（相手の駒のtypeを隠す）
    const clientBoard = gameState.board.map((row) =>
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

    const opponentPieces = gameState.pieces[opponentRole];
    const opponentCaptured = opponentPieces.filter((p) => p.captured).length;

    const myCapturedGood = gameState.pieces[myRole].filter((p) => p.type === 'good' && p.captured).length;
    const myCapturedBad = gameState.pieces[myRole].filter((p) => p.type === 'bad' && p.captured).length;
    const opponentCapturedGood = opponentPieces.filter((p) => p.type === 'good' && p.captured).length;
    const opponentCapturedBad = opponentPieces.filter((p) => p.type === 'bad' && p.captured).length;

    // lastMoveをクライアント用に変換
    let clientLastMove: { from: Position; to: Position } | null = null;
    if (gameState.lastMove) {
      clientLastMove = {
        from: gameState.lastMove.from,
        to: gameState.lastMove.to,
      };
    }

    return {
      gameId: gameState.gameId,
      status: gameState.status,
      board: clientBoard,
      currentTurn: gameState.currentTurn,
      myRole,
      myPlayerId: PLAYER_ID,
      myPieces: gameState.pieces[myRole],
      isMyTurn: gameState.currentTurn === myRole,
      canOperate: gameState.status === 'playing' && gameState.currentTurn === myRole,
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
        player1: gameState.status !== 'setup',
        player2: gameState.status !== 'setup',
      },
      winner: gameState.winner,
      winReason: gameState.winReason,
      lastMove: clientLastMove,
    };
  }, [phase, playerOrder, gameState]);

  // プレイヤーロールをメモ化
  const playerRole = useMemo(() => {
    return playerOrder === 'first' ? 'player1' : 'player2';
  }, [playerOrder]);

  return (
    <>
      <GameHeader
        title="ガイスター CPU対戦"
        backUrl="/games/geister"
        backLabel="モード選択"
      />
      <div className="min-h-screen app-bg board-pattern pt-16 sm:pt-20 pb-3 px-3 sm:px-4">
        <div className="max-w-3xl mx-auto">

        {/* 先攻後攻選択 */}
        {phase === 'orderSelect' && (
          <PlaySetupCard
            title="先攻・後攻を選択"
            subtitle="先攻はすぐ動けます。後攻はCPUの初手を見てから始まります。"
            className="max-w-xl"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SetupOptionButton
                title="先攻"
                description="あなたが先に動きます"
                onClick={() => handleOrderSelect('first')}
                tone="blue"
              />
              <SetupOptionButton
                title="後攻"
                description="CPUが先に動きます"
                onClick={() => handleOrderSelect('second')}
                tone="slate"
              />
            </div>
          </PlaySetupCard>
        )}

        {/* 配置フェーズ */}
        {phase === 'setup' && (
          <Card className="bg-white/95">
            <CardHeader className="pb-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">駒の初期配置</h2>
              <p className="text-xs text-slate-600 mt-1">👻×4、😈×4を配置</p>
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
        )}

        {/* CPU思考中インジケーター */}
        {phase === 'cpuThinking' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center pointer-events-none" style={{ zIndex: Z_INDEX.OVERLAY }}>
            <Card className="bg-white/95 pointer-events-auto">
              <CardContent className="py-4 px-6 text-center">
                <div className="flex justify-center mb-2">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                </div>
                <p className="text-sm font-semibold text-slate-900">CPUが思考中...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ゲームプレイ（コンパクト） */}
        {(phase === 'playing' || phase === 'finished' || phase === 'cpuThinking') && clientState && (
          <>
            <Card className="mb-3 bg-white/95">
              <CardContent className="px-3 py-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <div className="flex items-center gap-2">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-100 text-indigo-700">
                      <User className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">あなた</p>
                      <p className="text-sm font-bold text-slate-950">👻 {clientState.capturedCounts.myGood} / 😈 {clientState.capturedCounts.myBad}</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-950 px-4 py-2 text-center text-sm font-bold text-white">
                    {phase === 'cpuThinking' ? 'CPU思考中' : gameState.currentTurn === playerRole ? 'あなたの番' : 'CPUの番'}
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-700">
                      <Bot className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="sm:text-right">
                      <p className="text-xs font-semibold text-slate-500">CPU</p>
                      <p className="text-sm font-bold text-slate-950">👻 {clientState.capturedCounts.opponentGood} / 😈 {clientState.capturedCounts.opponentBad}</p>
                    </div>
                  </div>
                </div>

                {phase === 'playing' && (
                  <div className="mt-3 flex justify-center gap-2">
                    {gameHistory.canUndo() && (
                      <Button
                        variant="secondary"
                        onClick={handleUndo}
                        className="gap-1 px-3 py-2 text-xs"
                        aria-label="1手戻す"
                      >
                        <RotateCcw className="inline h-4 w-4" aria-hidden="true" />
                        待った
                      </Button>
                    )}
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
                <Card className="mt-2 bg-white/95">
                  <CardHeader className="pb-2">
                    <h2 className="text-lg sm:text-xl font-bold text-center text-slate-900">
                      {gameState.winner === playerRole ? '🎉 勝利！' : gameState.winner ? '😢 敗北' : '🤝 引き分け'}
                    </h2>
                  </CardHeader>
                <CardContent className="text-center pt-2">
                  <p className="text-xs text-slate-700 mb-3 font-medium">
                    {gameState.winReason === 'escape' && '👻脱出成功！'}
                    {gameState.winReason === 'captureAllGood' && '相手の👻を全て捕獲！'}
                    {gameState.winReason === 'loseAllBad' && '😈を全て取らせた！'}
                    {gameState.winReason === 'draw' && '引き分け'}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="primary" onClick={handleReplay} className="text-xs py-1 px-2">
                      もう一度
                    </Button>
                    <Button variant="secondary" onClick={() => router.push('/games/geister')} className="text-xs py-1 px-2">
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
