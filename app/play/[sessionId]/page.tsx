'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { GeisterBoard } from '@/components/game/GeisterBoard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  movePiece,
  toClientState,
  getValidMoves,
} from '@/lib/games/geister/engine';
import {
  loadGameSession,
  saveGameSession,
  getOrCreatePlayerId,
  subscribeToGameSession,
} from '@/lib/supabase/gameState';
import type { GeisterState, GeisterClientState, Position } from '@/lib/games/geister/types';
import { BOARD_SIZE } from '@/lib/games/geister/constants';
import { RulesSummary } from '@/components/game/RulesSummary';

export default function PlayPage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.sessionId as string;

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GeisterState | null>(null);
  const [clientState, setClientState] = useState<GeisterClientState | null>(null);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);

  // ゲーム状態の読み込みとリアルタイム更新
  useEffect(() => {
    const initGame = async () => {
      try {
        const pid = await getOrCreatePlayerId();
        setPlayerId(pid);

        const state = await loadGameSession(gameId);
        if (!state) {
          alert('ゲームが見つかりません');
          router.push('/games');
          return;
        }

        setGameState(state);

        try {
          const client = toClientState(state, pid);
          setClientState(client);
        } catch (error) {
          console.error('クライアント状態の取得エラー:', error);
          alert('このゲームの参加者ではありません');
          router.push('/games');
          return;
        }

        // リアルタイム更新を購読
        const unsubscribe = subscribeToGameSession(gameId, (newState) => {
          setGameState(newState);
          try {
            const newClient = toClientState(newState, pid);
            setClientState(newClient);
          } catch (error) {
            console.error('クライアント状態の更新エラー:', error);
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('ゲーム初期化エラー:', error);
        alert('ゲームの読み込みに失敗しました');
        router.push('/games');
      }
    };

    const unsubscribePromise = initGame();

    return () => {
      unsubscribePromise?.then((unsub) => unsub?.());
    };
  }, [gameId, router]);

  const handlePieceClick = (pieceId: string) => {
    if (!gameState || !clientState || !playerId) return;

    // 操作可能かチェック
    if (!clientState.canOperate) {
      return;
    }

    // 駒の所有者チェック
    const piece = clientState.myPieces.find((p) => p.id === pieceId);
    if (!piece || piece.captured || piece.escaped) {
      return;
    }

    setSelectedPieceId(pieceId);
    const moves = getValidMoves(gameState, playerId, pieceId);
    setValidMoves(moves);
  };

  const handleCellClick = async (position: Position) => {
    if (!gameState || !selectedPieceId || !clientState || !playerId) return;

    // 視点変換：表示座標を内部座標に変換
    let internalPos = position;
    if (clientState.myRole === 'player2') {
      internalPos = {
        x: BOARD_SIZE - 1 - position.x,
        y: BOARD_SIZE - 1 - position.y,
      };
    }

    try {
      // 移動を適用
      const newState = movePiece(gameState, playerId, selectedPieceId, internalPos);
      await saveGameSession(gameId, newState);

      // リアルタイム更新により自動的に状態が更新される
      setSelectedPieceId(null);
      setValidMoves([]);

      // ゲーム終了チェック
      if (newState.status === 'finished') {
        setTimeout(() => {
          const winnerText =
            newState.winner === clientState.myRole ? 'あなた' : '相手';
          const reasonText =
            newState.winReason === 'escape'
              ? '青いお化け👻を脱出させた'
              : newState.winReason === 'captureAllGood'
              ? '相手の青いお化け👻を全て取った'
              : '自分の赤い悪魔😈を全て取らせた';

          alert(`ゲーム終了！\n勝者: ${winnerText}\n理由: ${reasonText}`);
          router.push('/games');
        }, 500);
      }
    } catch (error) {
      console.error('移動エラー:', error);
      alert(error instanceof Error ? error.message : '無効な移動です');
    }
  };

  if (!clientState || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-white text-xl">ゲームを読み込み中...</p>
      </div>
    );
  }

  // セットアップ中の場合
  if (clientState.status === 'setup') {
    const myReady = clientState.setupReady[clientState.myRole];
    const opponentRole = clientState.myRole === 'player1' ? 'player2' : 'player1';
    const opponentReady = clientState.setupReady[opponentRole];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <Card className="max-w-md">
          <CardHeader>
            <h2 className="text-2xl font-bold text-center">配置待ち</h2>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p>
              あなた: {myReady ? '✅ 配置完了' : '❌ 配置中'}
            </p>
            <p>
              相手: {opponentReady ? '✅ 配置完了' : '⏳ 待機中'}
            </p>
            {!myReady && (
              <Button
                onClick={() => router.push(`/setup/${gameId}`)}
                variant="primary"
              >
                配置画面に戻る
              </Button>
            )}
            {myReady && !opponentReady && (
              <p className="text-sm text-gray-600">
                相手が配置を完了するまでお待ちください
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const opponentRole = clientState.myRole === 'player1' ? 'player2' : 'player1';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-6">
          ガイスター（オンライン対戦）
        </h1>

        <div className="text-white text-center mb-4">
          <p className="text-sm bg-white/10 px-4 py-2 rounded inline-block">
            ゲームID: <span className="font-mono font-bold">{gameId}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左サイド: 相手情報 */}
          <div className="space-y-4">
            <Card className={!clientState.isMyTurn ? 'ring-4 ring-yellow-500' : ''}>
              <CardHeader>
                <h2 className="text-xl font-bold">相手</h2>
                <p className="text-sm text-gray-600">
                  ({opponentRole})
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-semibold">
                  {!clientState.isMyTurn ? '🟡 相手のターン' : '⚪ 待機中'}
                </p>
                <div className="mt-3 text-sm space-y-1">
                  <p>
                    残り駒:{' '}
                    {clientState.opponentPiecesCount.total -
                      clientState.opponentPiecesCount.captured}{' '}
                    / 8
                  </p>
                  <p className="text-xs text-gray-600">
                    捕獲した駒: {clientState.opponentPiecesCount.captured}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 中央: ゲーム盤面 */}
          <div className="lg:col-span-2 flex flex-col items-center space-y-4">
            <div className="bg-white/10 px-6 py-3 rounded-lg">
              <p className="text-white text-lg font-semibold text-center">
                {clientState.isMyTurn ? '🟢 あなたのターン' : '⏳ 相手のターンを待っています'}
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
              ) : clientState.canOperate ? (
                <p className="text-sm bg-white/10 px-4 py-2 rounded">
                  自分の駒をクリックして選択してください
                </p>
              ) : (
                <p className="text-sm bg-white/10 px-4 py-2 rounded">
                  相手のターンです
                </p>
              )}
            </div>

            {/* ルール簡易説明 */}
            <div className="max-w-md">
              <RulesSummary />
            </div>
          </div>

          {/* 右サイド: 自分情報 */}
          <div className="space-y-4">
            <Card className={clientState.isMyTurn ? 'ring-4 ring-green-500' : ''}>
              <CardHeader>
                <h2 className="text-xl font-bold">あなた</h2>
                <p className="text-sm text-gray-600">
                  ({clientState.myRole})
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-semibold">
                  {clientState.isMyTurn ? '🟢 あなたのターン' : '⚪ 待機中'}
                </p>
                <div className="mt-3 text-sm space-y-1">
                  <p>
                    残り駒:{' '}
                    {clientState.myPieces.filter((p) => !p.captured && !p.escaped).length} / 8
                  </p>
                  <p className="text-xs text-gray-600">
                    捕獲されたgood: {clientState.capturedCounts.myGood}
                  </p>
                  <p className="text-xs text-gray-600">
                    捕獲されたbad: {clientState.capturedCounts.myBad}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => router.push('/games')}
              >
                ゲーム選択に戻る
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
