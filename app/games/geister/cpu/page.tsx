'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { calculateCpuMove, generateCpuSetup } from '@/lib/games/geister/ai';
import type { GeisterState, PieceSetup, Position, GeisterClientState } from '@/lib/games/geister/types';
import { GeisterBoard } from '@/components/game/GeisterBoard';
import { SetupBoard } from '@/components/game/SetupBoard';

type CpuGamePhase = 'setup' | 'playing' | 'cpuThinking' | 'finished';

const PLAYER_ID = 'player-human';
const CPU_ID = 'player-cpu';
const GAME_ID = 'cpu-game';

export default function GeisterCpuPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<CpuGamePhase>('setup');
  const [gameState, setGameState] = useState<GeisterState>(() =>
    createInitialState(GAME_ID, PLAYER_ID)
  );
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [playerSetup, setPlayerSetup] = useState<PieceSetup[]>([]);

  // CPU自動参加（ゲーム開始時）
  useEffect(() => {
    if (!gameState.players.player2) {
      // Player2としてCPUを参加させる
      const newState: GeisterState = {
        ...gameState,
        status: 'setup',
        players: {
          ...gameState.players,
          player2: CPU_ID,
        },
      };
      setGameState(newState);
    }
  }, []);

  // プレイヤーの配置完了
  const handlePlayerSetupComplete = (setup: PieceSetup[]) => {
    try {
      let newState = setupPieces(gameState, PLAYER_ID, setup);

      // CPUの配置を自動生成
      const cpuSetup = generateCpuSetup('player2');
      const cpuPieceSetup: PieceSetup[] = cpuSetup.map((s, i) => ({
        pieceId: `cpu-piece-${i}`,
        type: s.type,
        position: s.position,
      }));

      newState = setupPieces(newState, CPU_ID, cpuPieceSetup);

      setGameState(newState);
      setPhase('playing');
    } catch (error) {
      console.error('Setup error:', error);
      alert((error as Error).message);
    }
  };

  // プレイヤーの駒選択
  const handlePieceClick = (pieceId: string) => {
    if (phase !== 'playing' || gameState.currentTurn !== 'player1') {
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
      alert((error as Error).message);
      setSelectedPiece(null);
      setValidMoves([]);
      setPhase('playing');
    }
  };

  // リプレイ
  const handleReplay = () => {
    setPhase('setup');
    setGameState(createInitialState(GAME_ID, PLAYER_ID));
    setSelectedPiece(null);
    setValidMoves([]);
  };

  // CPU対戦用のクライアント状態を作成
  const createCpuClientState = (state: GeisterState): GeisterClientState => {
    const myRole = 'player1';
    const opponentRole = 'player2';

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

  // setup状態の時はclientStateを作らない
  const clientState = phase === 'setup' ? null : createCpuClientState(gameState);
  const isPlayerTurn = phase === 'playing' && gameState.currentTurn === 'player1';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">CPU対戦</h1>
          <p className="text-gray-200">あなた vs コンピュータ</p>
        </div>

        {/* 配置フェーズ */}
        {phase === 'setup' && (
          <Card className="bg-white/95">
            <CardHeader>
              <h2 className="text-2xl font-bold text-slate-900">駒の初期配置</h2>
              <p className="text-sm text-slate-600 mt-2 font-medium">
                青いお化け👻×4、赤い悪魔😈×4を中央4列×2行に配置してください
              </p>
            </CardHeader>
            <CardContent>
              <SetupBoard
                myRole="player1"
                setup={playerSetup}
                onSetupChange={setPlayerSetup}
                onComplete={handlePlayerSetupComplete}
              />
            </CardContent>
          </Card>
        )}

        {/* CPU思考中 */}
        {phase === 'cpuThinking' && (
          <Card className="bg-white/95">
            <CardContent className="py-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
              </div>
              <p className="text-xl font-semibold text-slate-900">CPUが思考中...</p>
            </CardContent>
          </Card>
        )}

        {/* ゲームプレイ */}
        {(phase === 'playing' || phase === 'finished') && clientState && (
          <>
            <Card className="mb-6 bg-white/95">
              <CardContent className="py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">現在のターン</p>
                    <p className="text-xl font-bold text-slate-900">
                      {gameState.currentTurn === 'player1' ? 'あなた' : 'CPU'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 font-medium">捕獲した駒</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {clientState.opponentPiecesCount.captured} / 8
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <GeisterBoard
              gameState={clientState}
              onPieceClick={handlePieceClick}
              onCellClick={handleMove}
              selectedPieceId={selectedPiece}
              validMoves={validMoves}
            />

            {phase === 'finished' && (
              <Card className="mt-6 bg-white/95">
                <CardHeader>
                  <h2 className="text-3xl font-bold text-center text-slate-900">
                    {gameState.winner === 'player1' ? '🎉 あなたの勝ち！' : '😢 CPUの勝ち'}
                  </h2>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-700 mb-6 font-medium">
                    {gameState.winReason === 'escape' && '青いお化け👻の脱出成功！'}
                    {gameState.winReason === 'captureAllGood' && '相手の青いお化け👻を全て捕獲！'}
                    {gameState.winReason === 'loseAllBad' && '自分の赤い悪魔😈を全て取らせた！'}
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button variant="primary" onClick={handleReplay}>
                      もう一度プレイ
                    </Button>
                    <Button variant="secondary" onClick={() => router.push('/games/geister')}>
                      モード選択に戻る
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <div className="mt-8 text-center">
          <Link href="/games/geister" className="text-gray-200 hover:text-white underline">
            モード選択に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
