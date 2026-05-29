'use client';

import { useState, useEffect } from 'react';
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

type CpuGamePhase = 'orderSelect' | 'setup' | 'playing' | 'cpuThinking' | 'finished';

const PLAYER_ID = 'player-human';
const CPU_ID = 'player-cpu';
const GAME_ID = 'cpu-game';

export default function GeisterCpuPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [phase, setPhase] = useState<CpuGamePhase>('orderSelect');
  const [playerOrder, setPlayerOrder] = useState<'first' | 'second' | null>(null);
  const [gameState, setGameState] = useState<GeisterState>(() =>
    createInitialState(GAME_ID, PLAYER_ID)
  );
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [playerSetup, setPlayerSetup] = useState<PieceSetup[]>([]);
  const [history, setHistory] = useState<GeisterState[]>([]); // 履歴保存

  // 先攻後攻選択
  const handleOrderSelect = (order: 'first' | 'second') => {
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
  };

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
        await new Promise((resolve) => setTimeout(resolve, 1000));

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
      showToast((error as Error).message, 'error');
    }
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
    setSelectedPiece(null);
    setValidMoves([]);
    showToast('1手戻しました', 'success');
  };

  // プレイヤーの駒選択
  const handlePieceClick = (pieceId: string) => {
    const playerRole = playerOrder === 'first' ? 'player1' : 'player2';
    if (phase !== 'playing' || gameState.currentTurn !== playerRole) {
      return;
    }

    setSelectedPiece(pieceId);
    const moves = getValidMoves(gameState, PLAYER_ID, pieceId);
    setValidMoves(moves);
  };

  // プレイヤーの移動
  const handleMove = async (to: Position) => {
    if (!selectedPiece || phase !== 'playing') {
      return;
    }

    try {
      // プレイヤーの移動
      let newState = movePiece(gameState, PLAYER_ID, selectedPiece, to);
      setHistory([...history, newState]); // 履歴に追加
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
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // CPUが移動
      const cpuMove = calculateCpuMove(newState, CPU_ID);
      newState = movePiece(newState, CPU_ID, cpuMove.pieceId, cpuMove.to);
      setHistory((prev) => [...prev, newState]); // 履歴に追加

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
      showToast((error as Error).message, 'error');
      setSelectedPiece(null);
      setValidMoves([]);
      setPhase('playing');
    }
  };

  // リプレイ
  const handleReplay = () => {
    setPhase('orderSelect');
    setPlayerOrder(null);
    setGameState(createInitialState(GAME_ID, PLAYER_ID));
    setSelectedPiece(null);
    setValidMoves([]);
    setPlayerSetup([]);
    setHistory([]);
  };

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 sm:pt-20 pb-4 sm:pb-8 px-2 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">CPU対戦</h1>
            <p className="text-sm sm:text-base text-gray-200">あなた vs コンピュータ</p>
          </div>

        {/* 先攻後攻選択 */}
        {phase === 'orderSelect' && (
          <Card className="bg-white/95">
            <CardHeader>
              <h2 className="text-2xl font-bold text-slate-900 text-center">先攻・後攻を選択</h2>
              <p className="text-sm text-slate-600 mt-2 text-center">
                どちらで対戦しますか？
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleOrderSelect('first')}
                  className="p-6 sm:p-8 rounded-xl border-4 border-blue-500 bg-blue-50 hover:bg-blue-100 transition-all hover:scale-105"
                >
                  <div className="text-4xl sm:text-6xl mb-3">⚡</div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">先攻</div>
                  <div className="text-sm sm:text-base text-slate-600">
                    あなたが先に動きます
                  </div>
                </button>

                <button
                  onClick={() => handleOrderSelect('second')}
                  className="p-6 sm:p-8 rounded-xl border-4 border-purple-500 bg-purple-50 hover:bg-purple-100 transition-all hover:scale-105"
                >
                  <div className="text-4xl sm:text-6xl mb-3">🛡️</div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">後攻</div>
                  <div className="text-sm sm:text-base text-slate-600">
                    CPUが先に動きます
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 配置フェーズ */}
        {phase === 'setup' && (
          <>
            <Card className="bg-white/95">
              <CardHeader>
                <h2 className="text-2xl font-bold text-slate-900">駒の初期配置</h2>
                <p className="text-sm text-slate-600 mt-2 font-medium">
                  青いお化け👻×4、赤い悪魔😈×4を中央4列×2行に配置してください
                </p>
              </CardHeader>
              <CardContent>
                <SetupBoard
                  myRole={playerOrder === 'first' ? 'player1' : 'player2'}
                  setup={playerSetup}
                  onSetupChange={setPlayerSetup}
                  onComplete={handlePlayerSetupComplete}
                />
              </CardContent>
            </Card>
            <div className="mt-4 text-center">
              <Link href="/games/geister" className="text-gray-200 hover:text-white underline text-sm">
                モード選択に戻る
              </Link>
            </div>
          </>
        )}

        {/* CPU思考中インジケーター（画面サイズを変えない固定配置） */}
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
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">現在のターン</p>
                    <p className="text-base sm:text-xl font-bold text-slate-900">
                      {gameState.currentTurn === playerRole ? 'あなた' : 'CPU'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">捕獲した駒</p>
                    <p className="text-sm sm:text-lg font-semibold text-slate-900">
                      {clientState.opponentPiecesCount.captured} / 8
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {/* ルールボタン */}
                    <RulesModal gameName="ガイスター">
                      <RulesSummary />
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
                <Card className="mt-6 bg-white/95 animate-[fadeIn_0.5s_ease-in]">
                  <CardHeader>
                    <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 animate-[bounce_1s_ease-in-out]">
                      {gameState.winner === playerRole ? '🎉 あなたの勝ち！' : gameState.winner ? '😢 CPUの勝ち' : '🤝 引き分け'}
                    </h2>
                  </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm sm:text-base text-slate-700 mb-4 sm:mb-6 font-medium">
                    {gameState.winReason === 'escape' && '青いお化け👻の脱出成功！'}
                    {gameState.winReason === 'captureAllGood' && '相手の青いお化け👻を全て捕獲！'}
                    {gameState.winReason === 'loseAllBad' && '自分の赤い悪魔😈を全て取らせた！'}
                    {gameState.winReason === 'draw' && '手数制限により引き分け'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
                    <Button variant="primary" onClick={handleReplay} className="w-full sm:w-auto">
                      もう一度プレイ
                    </Button>
                    <Button variant="secondary" onClick={() => router.push('/games/geister')} className="w-full sm:w-auto">
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
