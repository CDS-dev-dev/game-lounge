'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { setupPieces, toClientState } from '@/lib/games/geister/engine';
import { loadGameSession, saveGameSession, getOrCreatePlayerId } from '@/lib/supabase/gameState';
import type { PieceSetup, PieceType } from '@/lib/games/geister/types';
import { BOARD_SIZE, SETUP_COLS } from '@/lib/games/geister/constants';

export default function SetupPage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.gameId as string;

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<PieceType>('good');
  const [setup, setSetup] = useState<PieceSetup[]>([]);
  const [myRole, setMyRole] = useState<'player1' | 'player2' | null>(null);

  useEffect(() => {
    const initSetup = async () => {
      try {
        const pid = await getOrCreatePlayerId();
        setPlayerId(pid);

        const state = await loadGameSession(gameId);
        if (!state) {
          alert('ゲームが見つかりません');
          router.push('/games');
          return;
        }

        // 自分のロールを判定
        if (state.players.player1 === pid) {
          setMyRole('player1');
        } else if (state.players.player2 === pid) {
          setMyRole('player2');
        } else {
          alert('このゲームの参加者ではありません');
          router.push('/games');
        }
      } catch (error) {
        console.error('セットアップエラー:', error);
        alert('ゲームの読み込みに失敗しました');
        router.push('/games');
      }
    };

    initSetup();
  }, [gameId, router]);

  const handleCellClick = (x: number, y: number) => {
    if (!myRole || !playerId) return;

    // 配置可能範囲チェック
    const allowedRows = myRole === 'player1' ? [0, 1] : [4, 5];
    if (!allowedRows.includes(y) || !SETUP_COLS.includes(x)) {
      alert('配置できない位置です');
      return;
    }

    // 既に配置済みか確認
    const existingIndex = setup.findIndex(
      (s) => s.position.x === x && s.position.y === y
    );

    if (existingIndex >= 0) {
      // 既に配置されている場合は削除
      setSetup(setup.filter((_, i) => i !== existingIndex));
    } else {
      // 8個まで配置可能
      if (setup.length >= 8) {
        alert('8個まで配置できます');
        return;
      }

      // 同じtypeが4個以上にならないようにチェック
      const sameTypeCount = setup.filter((s) => s.type === selectedType).length;
      if (sameTypeCount >= 4) {
        alert(`${selectedType}は4個まで配置できます`);
        return;
      }

      // 配置
      setSetup([
        ...setup,
        {
          pieceId: `${myRole}-${setup.length + 1}`,
          position: { x, y },
          type: selectedType,
        },
      ]);
    }
  };

  const handleComplete = async () => {
    if (!playerId) return;

    if (setup.length !== 8) {
      alert('8個すべて配置してください');
      return;
    }

    const goodCount = setup.filter((s) => s.type === 'good').length;
    if (goodCount !== 4) {
      alert('good 4個、bad 4個を配置してください');
      return;
    }

    try {
      const state = await loadGameSession(gameId);
      if (!state) {
        alert('ゲームが見つかりません');
        return;
      }

      const newState = setupPieces(state, playerId, setup);
      await saveGameSession(gameId, newState);

      // 対戦画面に遷移
      router.push(`/play/${gameId}`);
    } catch (error) {
      console.error('配置エラー:', error);
      alert(error instanceof Error ? error.message : '配置に失敗しました');
    }
  };

  const getPieceAtPosition = (x: number, y: number) => {
    return setup.find((s) => s.position.x === x && s.position.y === y);
  };

  if (!myRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-white text-xl">読み込み中...</p>
      </div>
    );
  }

  const allowedRows = myRole === 'player1' ? [0, 1] : [4, 5];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-6">
          駒の配置
        </h1>

        <div className="text-white text-center mb-6">
          <p className="text-lg">
            あなたは <span className="font-bold text-indigo-400">{myRole === 'player1' ? 'プレイヤー1' : 'プレイヤー2'}</span> です
          </p>
          <p className="text-sm mt-2">
            good 4個、bad 4個を自陣に配置してください
          </p>
        </div>

        {/* 駒タイプ選択 */}
        <div className="flex justify-center gap-4 mb-6">
          <Button
            variant={selectedType === 'good' ? 'primary' : 'secondary'}
            onClick={() => setSelectedType('good')}
          >
            👻 Good ({setup.filter((s) => s.type === 'good').length}/4)
          </Button>
          <Button
            variant={selectedType === 'bad' ? 'primary' : 'secondary'}
            onClick={() => setSelectedType('bad')}
          >
            😈 Bad ({setup.filter((s) => s.type === 'bad').length}/4)
          </Button>
        </div>

        {/* 盤面 */}
        <div className="flex justify-center mb-6">
          <div className="inline-block bg-amber-100 p-4 rounded-lg shadow-lg">
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}
            >
              {Array.from({ length: BOARD_SIZE }).map((_, y) =>
                Array.from({ length: BOARD_SIZE }).map((_, x) => {
                  const piece = getPieceAtPosition(x, y);
                  const isAllowed =
                    allowedRows.includes(y) && SETUP_COLS.includes(x);

                  return (
                    <div
                      key={`${x}-${y}`}
                      onClick={() => isAllowed && handleCellClick(x, y)}
                      className={`
                        w-16 h-16 flex items-center justify-center border-2 transition-all
                        ${isAllowed ? 'bg-green-100 border-green-300 cursor-pointer hover:bg-green-200' : 'bg-gray-200 border-gray-300'}
                        ${piece ? 'ring-2 ring-indigo-500' : ''}
                      `}
                    >
                      {piece && (
                        <div className="text-4xl">
                          {piece.type === 'good' ? '👻' : '😈'}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 配置完了ボタン */}
        <div className="flex justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={handleComplete}
            disabled={setup.length !== 8}
          >
            配置完了 ({setup.length}/8)
          </Button>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <h3 className="text-lg font-bold">配置方法</h3>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>1. 上のボタンでgoodまたはbadを選択</p>
            <p>2. 緑色のマス（自陣）をクリックして配置</p>
            <p>3. 既に配置した駒をクリックすると削除できます</p>
            <p>4. good 4個、bad 4個を配置したら「配置完了」を押してください</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
