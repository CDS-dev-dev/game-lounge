'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GeisterBoard } from '@/components/game/GeisterBoard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  createInitialState,
  setupPieces,
  canMovePiece,
  movePiece,
  toClientState,
  getValidMoves,
} from '@/lib/games/geister/engine';
import type { GeisterState, GeisterClientState, Position } from '@/lib/games/geister/types';

export default function PlayPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GeisterState | null>(null);
  const [clientState, setClientState] = useState<GeisterClientState | null>(null);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [currentPlayerView, setCurrentPlayerView] = useState<'player1' | 'player2'>('player1');

  useEffect(() => {
    // 初期状態を作成
    const initial = createInitialState();

    // デモ用: 固定配置で駒を配置
    const player1Setup = [
      { pieceId: 'p1-1', position: { x: 1, y: 0 }, type: 'good' as const },
      { pieceId: 'p1-2', position: { x: 2, y: 0 }, type: 'good' as const },
      { pieceId: 'p1-3', position: { x: 3, y: 0 }, type: 'good' as const },
      { pieceId: 'p1-4', position: { x: 4, y: 0 }, type: 'good' as const },
      { pieceId: 'p1-5', position: { x: 1, y: 1 }, type: 'bad' as const },
      { pieceId: 'p1-6', position: { x: 2, y: 1 }, type: 'bad' as const },
      { pieceId: 'p1-7', position: { x: 3, y: 1 }, type: 'bad' as const },
      { pieceId: 'p1-8', position: { x: 4, y: 1 }, type: 'bad' as const },
    ];

    const player2Setup = [
      { pieceId: 'p2-1', position: { x: 1, y: 4 }, type: 'bad' as const },
      { pieceId: 'p2-2', position: { x: 2, y: 4 }, type: 'bad' as const },
      { pieceId: 'p2-3', position: { x: 3, y: 4 }, type: 'bad' as const },
      { pieceId: 'p2-4', position: { x: 4, y: 4 }, type: 'bad' as const },
      { pieceId: 'p2-5', position: { x: 1, y: 5 }, type: 'good' as const },
      { pieceId: 'p2-6', position: { x: 2, y: 5 }, type: 'good' as const },
      { pieceId: 'p2-7', position: { x: 3, y: 5 }, type: 'good' as const },
      { pieceId: 'p2-8', position: { x: 4, y: 5 }, type: 'good' as const },
    ];

    let state = setupPieces(initial, 'player1', player1Setup);
    state = setupPieces(state, 'player2', player2Setup);

    setGameState(state);
    setClientState(toClientState(state, 'player1'));
  }, []);

  const handlePieceClick = (pieceId: string) => {
    if (!gameState) return;

    // 現在のプレイヤーの駒かチェック
    const piece = [...gameState.pieces.player1, ...gameState.pieces.player2].find(
      (p) => p.id === pieceId
    );
    if (!piece || piece.owner !== gameState.currentPlayer) {
      return;
    }

    setSelectedPieceId(pieceId);
    const moves = getValidMoves(gameState, pieceId);
    setValidMoves(moves);
  };

  const handleCellClick = (position: Position) => {
    if (!gameState || !selectedPieceId) return;

    try {
      // 移動を適用
      const newState = movePiece(gameState, selectedPieceId, position);
      setGameState(newState);

      // クライアント状態を現在のプレイヤー視点で更新
      setClientState(toClientState(newState, currentPlayerView));

      setSelectedPieceId(null);
      setValidMoves([]);

      // ゲーム終了チェック
      if (newState.isFinished) {
        setTimeout(() => {
          const winnerText =
            newState.winner === 'player1' ? 'プレイヤー1' : 'プレイヤー2';
          const reasonText =
            newState.winReason === 'escape'
              ? '脱出勝ち'
              : newState.winReason === 'captureAllGood'
              ? '相手のgood駒を全て取った'
              : '自分のbad駒を全て取らせた';

          alert(`ゲーム終了！\n勝者: ${winnerText}\n理由: ${reasonText}`);
          router.push('/games');
        }, 500);
      }
    } catch (error) {
      console.error('移動エラー:', error);
      alert(error instanceof Error ? error.message : '無効な移動です');
    }
  };

  const handleSwitchView = () => {
    if (!gameState) return;
    const newView = currentPlayerView === 'player1' ? 'player2' : 'player1';
    setCurrentPlayerView(newView);
    setClientState(toClientState(gameState, newView));
    setSelectedPieceId(null);
    setValidMoves([]);
  };

  const handleReset = () => {
    window.location.reload();
  };

  const handleSurrender = () => {
    if (confirm('投了しますか？')) {
      router.push('/games');
    }
  };

  if (!clientState || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-white text-xl">ゲームを準備中...</p>
      </div>
    );
  }

  const isMyTurn = gameState.currentPlayer === currentPlayerView;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-6">
          ガイスター（ローカル2人対戦）
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左サイド: プレイヤー1情報 */}
          <div className="space-y-4">
            <Card className={gameState.currentPlayer === 'player1' ? 'ring-4 ring-indigo-500' : ''}>
              <CardHeader>
                <h2 className="text-xl font-bold">プレイヤー1</h2>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-semibold">
                  {gameState.currentPlayer === 'player1' ? '🟢 あなたのターン' : '⚪ 待機中'}
                </p>
                <div className="mt-3 text-sm space-y-1">
                  <p>残り駒: {gameState.pieces.player1.filter((p) => !p.captured && !p.escaped).length} / 8</p>
                  <p className="text-xs text-gray-600">
                    捕獲されたgood: {clientState.capturedCounts.myGood}
                  </p>
                  <p className="text-xs text-gray-600">
                    捕獲されたbad: {clientState.capturedCounts.myBad}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 中央: ゲーム盤面 */}
          <div className="lg:col-span-2 flex flex-col items-center space-y-4">
            <div className="bg-white/10 px-6 py-3 rounded-lg">
              <p className="text-white text-lg font-semibold text-center">
                現在: {gameState.currentPlayer === 'player1' ? 'プレイヤー1' : 'プレイヤー2'}のターン
              </p>
              <p className="text-gray-300 text-sm text-center mt-1">
                表示中: {currentPlayerView === 'player1' ? 'プレイヤー1' : 'プレイヤー2'}の視点
              </p>
            </div>

            <GeisterBoard
              gameState={clientState}
              onPieceClick={handlePieceClick}
              onCellClick={handleCellClick}
              selectedPieceId={selectedPieceId}
              validMoves={validMoves}
            />

            <div className="text-white text-center">
              {selectedPieceId ? (
                <p className="text-sm bg-indigo-600 px-4 py-2 rounded">
                  駒を選択中。移動先（緑色）をクリックしてください。
                </p>
              ) : (
                <p className="text-sm bg-white/10 px-4 py-2 rounded">
                  {isMyTurn ? '自分の駒をクリックして選択してください' : '相手のターンです'}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleSwitchView}>
                視点切替
              </Button>
              <Button variant="secondary" onClick={handleReset}>
                リセット
              </Button>
              <Button variant="danger" onClick={handleSurrender}>
                投了
              </Button>
            </div>

            {/* ルール簡易説明 */}
            <Card className="max-w-md">
              <CardHeader>
                <h3 className="text-lg font-bold">勝利条件</h3>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p>✓ 相手のgood駒（👻）を4個全て取る</p>
                <p>✓ 自分のbad駒（😈）を4個全て取らせる</p>
                <p>✓ 自分のgood駒を脱出口（🚪）から脱出させる</p>
              </CardContent>
            </Card>
          </div>

          {/* 右サイド: プレイヤー2情報 */}
          <div className="space-y-4">
            <Card className={gameState.currentPlayer === 'player2' ? 'ring-4 ring-indigo-500' : ''}>
              <CardHeader>
                <h2 className="text-xl font-bold">プレイヤー2</h2>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-semibold">
                  {gameState.currentPlayer === 'player2' ? '🟢 あなたのターン' : '⚪ 待機中'}
                </p>
                <div className="mt-3 text-sm space-y-1">
                  <p>残り駒: {gameState.pieces.player2.filter((p) => !p.captured && !p.escaped).length} / 8</p>
                  <p className="text-xs text-gray-600">
                    捕獲されたgood: {clientState.capturedCounts.opponentGood}
                  </p>
                  <p className="text-xs text-gray-600">
                    捕獲されたbad: {clientState.capturedCounts.opponentBad}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
