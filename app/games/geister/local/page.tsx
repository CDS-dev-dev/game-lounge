'use client';

import { useState } from 'react';
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
import type { GeisterState, PieceSetup, Position, PlayerRole } from '@/lib/games/geister/types';
import { GeisterBoard } from '@/components/game/GeisterBoard';
import { SetupBoard } from '@/components/game/SetupBoard';
import { RulesSummary } from '@/components/game/RulesSummary';
import { useToast } from '@/components/ui/Toast';

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

  // Player1の配置完了
  const handlePlayer1SetupComplete = (setup: PieceSetup[]) => {
    try {
      const newState = setupPieces(gameState, PLAYER1_ID, setup);
      setGameState(newState);
      setPhase('setup-p2-interstitial');
    } catch (error) {
      console.error('Setup error:', error);
      showToast((error as Error).message, 'error');
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
      console.error('Setup error:', error);
      showToast((error as Error).message, 'error');
    }
  };

  // 中間画面から配置画面へ
  const handleReadyForSetup = () => {
    setPhase('setup-p2');
  };

  // 中間画面からゲームへ
  const handleReadyForTurn = () => {
    setPhase('playing');
  };

  // 駒選択
  const handlePieceClick = (pieceId: string) => {
    if (phase !== 'playing') {
      return;
    }

    const playerId = currentPlayer === 'player1' ? PLAYER1_ID : PLAYER2_ID;
    setSelectedPiece(pieceId);
    const moves = getValidMoves(gameState, playerId, pieceId);
    setValidMoves(moves);
  };

  // 移動
  const handleMove = (to: Position) => {
    if (!selectedPiece || phase !== 'playing') {
      return;
    }

    try {
      const playerId = currentPlayer === 'player1' ? PLAYER1_ID : PLAYER2_ID;
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
      console.error('Move error:', error);
      showToast((error as Error).message, 'error');
      setSelectedPiece(null);
      setValidMoves([]);
    }
  };

  // リプレイ
  const handleReplay = () => {
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
  };

  const playerId = currentPlayer === 'player1' ? PLAYER1_ID : PLAYER2_ID;
  const clientState = phase === 'playing' || phase === 'finished'
    ? toClientState(gameState, playerId)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-4 sm:py-8 md:py-12 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">ローカル対戦</h1>
          <p className="text-sm sm:text-base text-gray-200">同じ端末で2人対戦</p>
        </div>

        {/* Player1配置フェーズ */}
        {phase === 'setup-p1' && (
          <Card className="bg-white/95">
            <CardHeader>
              <h2 className="text-2xl font-bold text-slate-900">Player 1 - 駒の初期配置</h2>
              <p className="text-sm text-slate-600 mt-2 font-medium">
                青いお化け👻×4、赤い悪魔😈×4を中央4列×2行（下側）に配置してください
              </p>
            </CardHeader>
            <CardContent>
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
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Player 2の番です</h2>
              <p className="text-gray-700 mb-8">
                端末をPlayer 2に渡してください。<br />
                準備ができたらボタンを押してください。
              </p>
              <Button variant="primary" onClick={handleReadyForSetup}>
                準備完了
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Player2配置フェーズ */}
        {phase === 'setup-p2' && (
          <Card className="bg-white/95">
            <CardHeader>
              <h2 className="text-2xl font-bold text-slate-900">Player 2 - 駒の初期配置</h2>
              <p className="text-sm text-slate-600 mt-2 font-medium">
                青いお化け👻×4、赤い悪魔😈×4を中央4列×2行（上側）に配置してください
              </p>
            </CardHeader>
            <CardContent>
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
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Player {currentPlayer === 'player1' ? '1' : '2'} の番です
              </h2>
              <p className="text-gray-700 mb-8">
                端末を Player {currentPlayer === 'player1' ? '1' : '2'} に渡してください。<br />
                準備ができたらボタンを押してください。
              </p>
              <Button variant="primary" onClick={handleReadyForTurn}>
                準備完了
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ゲームプレイ */}
        {phase === 'playing' && clientState && (
          <>
            <Card className="mb-6 bg-white/95">
              <CardContent className="py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">現在のターン</p>
                    <p className="text-xl font-bold text-slate-900">
                      Player {currentPlayer === 'player1' ? '1' : '2'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 font-medium">捕獲した駒</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {clientState.capturedCounts.opponentGood + clientState.capturedCounts.opponentBad} / 8
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ルール概要 */}
            <div className="mb-6">
              <RulesSummary />
            </div>

            <GeisterBoard
              gameState={clientState}
              onPieceClick={handlePieceClick}
              onCellClick={handleMove}
              selectedPieceId={selectedPiece}
              validMoves={validMoves}
            />

            <div className="mt-6 text-center">
              <Button
                variant="secondary"
                onClick={() => {
                  setPhase('turnChange');
                  const nextPlayer: PlayerRole = currentPlayer === 'player1' ? 'player2' : 'player1';
                  setCurrentPlayer(nextPlayer);
                  setSelectedPiece(null);
                  setValidMoves([]);
                }}
              >
                ターン終了
              </Button>
            </div>
          </>
        )}

        {/* ゲーム終了 */}
        {phase === 'finished' && (
          <Card>
            <CardHeader>
              <h2 className="text-3xl font-bold text-center">
                🎉 Player {gameState.winner === 'player1' ? '1' : '2'} の勝ち！
              </h2>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-700 mb-6">
                {gameState.winReason === 'escape' && '青いお化け👻の脱出成功！'}
                {gameState.winReason === 'captureAllGood' && '相手の青いお化け👻を全て捕獲！'}
                {gameState.winReason === 'loseAllBad' && '相手に赤い悪魔😈を全て取らせた！'}
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

        <div className="mt-8 text-center">
          <Link href="/games/geister" className="text-gray-200 hover:text-white underline">
            モード選択に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
