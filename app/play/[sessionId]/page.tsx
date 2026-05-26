'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GeisterBoard } from '@/components/game/GeisterBoard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  createInitialState,
  setupPieces,
  validateMove,
  applyMove,
  toClientState,
} from '@/lib/games/geister/engine';
import type { GeisterState, GeisterClientState, Position } from '@/lib/games/geister/types';

export default function PlayPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GeisterState | null>(null);
  const [clientState, setClientState] = useState<GeisterClientState | null>(null);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [isSetupPhase, setIsSetupPhase] = useState(true);

  useEffect(() => {
    // 初期状態を作成
    const initial = createInitialState();

    // デモ用: 自動的に駒を配置
    const player1Setup = [
      { pieceId: 'p1-1', position: { x: 0, y: 0 }, color: 'blue' as const },
      { pieceId: 'p1-2', position: { x: 1, y: 0 }, color: 'blue' as const },
      { pieceId: 'p1-3', position: { x: 2, y: 0 }, color: 'red' as const },
      { pieceId: 'p1-4', position: { x: 3, y: 0 }, color: 'red' as const },
      { pieceId: 'p1-5', position: { x: 0, y: 1 }, color: 'blue' as const },
      { pieceId: 'p1-6', position: { x: 1, y: 1 }, color: 'blue' as const },
      { pieceId: 'p1-7', position: { x: 2, y: 1 }, color: 'red' as const },
      { pieceId: 'p1-8', position: { x: 3, y: 1 }, color: 'red' as const },
    ];

    const player2Setup = [
      { pieceId: 'p2-1', position: { x: 2, y: 4 }, color: 'blue' as const },
      { pieceId: 'p2-2', position: { x: 3, y: 4 }, color: 'blue' as const },
      { pieceId: 'p2-3', position: { x: 4, y: 4 }, color: 'red' as const },
      { pieceId: 'p2-4', position: { x: 5, y: 4 }, color: 'red' as const },
      { pieceId: 'p2-5', position: { x: 2, y: 5 }, color: 'blue' as const },
      { pieceId: 'p2-6', position: { x: 3, y: 5 }, color: 'blue' as const },
      { pieceId: 'p2-7', position: { x: 4, y: 5 }, color: 'red' as const },
      { pieceId: 'p2-8', position: { x: 5, y: 5 }, color: 'red' as const },
    ];

    let state = setupPieces(initial, 'player1', player1Setup);
    state = setupPieces(state, 'player2', player2Setup);

    setGameState(state);
    setClientState(toClientState(state, 'player1'));
    setIsSetupPhase(false);
  }, []);

  const handlePieceClick = (pieceId: string) => {
    setSelectedPieceId(pieceId);
  };

  const handleCellClick = (position: Position) => {
    if (!gameState || !selectedPieceId) return;

    // 移動の検証
    if (validateMove(gameState, selectedPieceId, position)) {
      // 移動を適用
      const newState = applyMove(gameState, selectedPieceId, position);
      setGameState(newState);
      setClientState(toClientState(newState, 'player1'));
      setSelectedPieceId(null);

      // ゲーム終了チェック
      if (newState.isFinished) {
        setTimeout(() => {
          alert(
            `ゲーム終了！\n勝者: ${newState.winner}\n理由: ${
              newState.winReason === 'escape'
                ? '脱出勝ち'
                : newState.winReason === 'captureBlue'
                ? '駒取り勝ち'
                : '押し付け勝ち'
            }`
          );
          router.push('/games');
        }, 500);
      }
    }
  };

  const handleSurrender = () => {
    if (confirm('投了しますか？')) {
      router.push('/games');
    }
  };

  if (isSetupPhase || !clientState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-white text-xl">ゲームを準備中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左サイド: プレイヤー情報 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold">あなた</h2>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {clientState.currentPlayer === clientState.myRole
                    ? '🟢 あなたのターン'
                    : '⚪ 相手のターン'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  駒の数: {clientState.myPieces.filter((p) => !p.captured).length} / 8
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold">相手</h2>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  駒の数:{' '}
                  {clientState.opponentPiecesCount.total -
                    clientState.opponentPiecesCount.captured}{' '}
                  / 8
                </p>
              </CardContent>
            </Card>

            <Button variant="danger" onClick={handleSurrender} className="w-full">
              投了する
            </Button>
          </div>

          {/* 中央: ゲーム盤面 */}
          <div className="lg:col-span-2 flex flex-col items-center">
            <h1 className="text-3xl font-bold text-white mb-6">ガイスター</h1>
            <GeisterBoard
              gameState={clientState}
              onPieceClick={handlePieceClick}
              onCellClick={handleCellClick}
              selectedPieceId={selectedPieceId}
            />
            <div className="mt-6 text-white text-center">
              <p className="text-lg font-semibold">
                {clientState.currentPlayer === clientState.myRole
                  ? 'あなたのターンです'
                  : '相手のターンを待っています'}
              </p>
              {selectedPieceId && (
                <p className="text-sm text-gray-300 mt-2">
                  駒を選択中。移動先をクリックしてください。
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
