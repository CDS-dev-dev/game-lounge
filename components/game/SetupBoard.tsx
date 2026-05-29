'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PieceSetup, Position, PlayerRole } from '@/lib/games/geister/types';
import { BOARD_SIZE, SETUP_COLS } from '@/lib/games/geister/constants';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface SetupBoardProps {
  myRole: PlayerRole;
  setup: PieceSetup[];
  onSetupChange: (setup: PieceSetup[]) => void;
  timeLimit?: number; // 秒数、undefined = 無制限
  onTimeout?: () => void;
  onComplete: (setup: PieceSetup[]) => void;
}

export const SetupBoard: React.FC<SetupBoardProps> = ({
  myRole,
  setup,
  onSetupChange,
  timeLimit,
  onTimeout,
  onComplete,
}) => {
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState<'good' | 'bad'>('good');
  const [remainingTime, setRemainingTime] = useState(timeLimit || 0);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const pieceIdCounter = useRef(0);

  const allowedRows = myRole === 'player1' ? [0, 1] : [4, 5];
  const goodCount = setup.filter((s) => s.type === 'good').length;
  const badCount = setup.filter((s) => s.type === 'bad').length;

  const handleTimeout = useCallback(() => {
    if (isTimedOut) return;
    setIsTimedOut(true);

    // 残りをランダム配置
    const randomSetup = generateRandomSetup(setup, myRole);
    onSetupChange(randomSetup);
    onTimeout?.();

    // 自動的に完了
    setTimeout(() => {
      onComplete(randomSetup);
    }, 1000);
  }, [isTimedOut, setup, myRole, onSetupChange, onTimeout, onComplete]);

  // タイマーカウントダウン
  useEffect(() => {
    if (!timeLimit || isTimedOut || remainingTime === 0) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLimit, isTimedOut, remainingTime, handleTimeout]);

  // eslint-disable-next-line react-hooks/refs
  const handleCellClick = useCallback((x: number, y: number) => {
    if (isTimedOut) return;

    // 配置可能範囲チェック
    if (!allowedRows.includes(y) || !SETUP_COLS.includes(x)) {
      return;
    }

    // 既に配置済みか確認
    const existingPiece = setup.find((s) => s.position.x === x && s.position.y === y);

    if (existingPiece) {
      // クリック: 駒の種類を切り替える
      const newSetup = setup.map((s) =>
        s === existingPiece
          ? { ...s, type: s.type === 'good' ? ('bad' as const) : ('good' as const) }
          : s
      );
      onSetupChange(newSetup);
    } else {
      // 新規配置
      if (setup.length >= 8) {
        return;
      }

      // 同じtypeが4個以上にならないようにチェック
      const sameTypeCount = setup.filter((s) => s.type === selectedType).length;
      if (sameTypeCount >= 4) {
        return;
      }

      const newPieceId = `${myRole}-${pieceIdCounter.current++}`;
      onSetupChange([
        ...setup,
        {
          pieceId: newPieceId,
          position: { x, y },
          type: selectedType,
        },
      ]);
    }
  }, [isTimedOut, allowedRows, setup, onSetupChange, selectedType, myRole]);

  const handleRandomSetup = () => {
    if (isTimedOut) return;
    const randomSetup = generateRandomSetup(setup, myRole);
    onSetupChange(randomSetup);
  };

  const handleCompleteClick = () => {
    if (setup.length !== 8) {
      showToast('8個すべて配置してください', 'error');
      return;
    }

    if (goodCount !== 4 || badCount !== 4) {
      showToast('good 4個、bad 4個を配置してください', 'error');
      return;
    }

    onComplete(setup);
  };

  const getPieceAtPosition = (x: number, y: number) => {
    return setup.find((s) => s.position.x === x && s.position.y === y);
  };

  return (
    <div className="space-y-6">
      {/* タイマー */}
      {timeLimit && !isTimedOut && (
        <div
          className={`
          text-center p-4 rounded-lg font-mono text-4xl font-bold
          ${remainingTime <= 10 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}
          ${remainingTime <= 5 ? 'animate-pulse' : ''}
        `}
        >
          残り時間: {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
        </div>
      )}

      {isTimedOut && (
        <div className="text-center p-4 rounded-lg bg-yellow-100 text-yellow-900 font-bold">
          時間切れ！残りの駒をランダム配置しました
        </div>
      )}

      {/* 駒タイプ選択 */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <button
          onClick={() => setSelectedType('good')}
          disabled={isTimedOut}
          className={`
            p-3 sm:p-6 rounded-xl border-2 sm:border-4 transition-all
            ${
              selectedType === 'good'
                ? 'border-blue-500 bg-blue-50 ring-2 sm:ring-4 ring-blue-200'
                : 'border-gray-300 bg-white hover:border-blue-300'
            }
            ${isTimedOut ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="text-4xl sm:text-6xl mb-1 sm:mb-2">👻</div>
          <div className="text-base sm:text-xl font-bold text-gray-900">Good駒</div>
          <div className="text-xs sm:text-sm text-gray-700 mt-1 sm:mt-2">残り: {4 - goodCount} / 4</div>
          {/* プログレスバー */}
          <div className="mt-1 sm:mt-2 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${(goodCount / 4) * 100}%` }}
            />
          </div>
        </button>

        <button
          onClick={() => setSelectedType('bad')}
          disabled={isTimedOut}
          className={`
            p-3 sm:p-6 rounded-xl border-2 sm:border-4 transition-all
            ${
              selectedType === 'bad'
                ? 'border-red-500 bg-red-50 ring-2 sm:ring-4 ring-red-200'
                : 'border-gray-300 bg-white hover:border-red-300'
            }
            ${isTimedOut ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="text-4xl sm:text-6xl mb-1 sm:mb-2">😈</div>
          <div className="text-base sm:text-xl font-bold text-gray-900">Bad駒</div>
          <div className="text-xs sm:text-sm text-gray-700 mt-1 sm:mt-2">残り: {4 - badCount} / 4</div>
          {/* プログレスバー */}
          <div className="mt-1 sm:mt-2 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${(badCount / 4) * 100}%` }}
            />
          </div>
        </button>
      </div>

      {/* ヒント */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-4 text-xs sm:text-sm text-blue-900">
        <p className="font-semibold mb-1 sm:mb-2">💡 操作方法</p>
        <ul className="space-y-0.5 sm:space-y-1 list-disc list-inside">
          <li>盤面の<strong>下側2行（緑色）</strong>に駒を配置</li>
          <li>配置済みの駒をクリックして種類を変更（👻 ⇔ 😈）</li>
          <li>上のボタンで配置する駒の種類を選択</li>
        </ul>
      </div>

      {/* 盤面 */}
      <div className="flex justify-center">
        <div className="inline-block bg-amber-100 p-2 sm:p-4 rounded-lg shadow-lg max-w-full">
          <div className="grid gap-0.5 sm:gap-1" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}>
            {Array.from({ length: BOARD_SIZE }).map((_, rowIndex) => {
              // player1は反転（下から上へ描画）、player2は通常の順序（自分が常に下に来るように）
              const y = myRole === 'player1'
                ? BOARD_SIZE - 1 - rowIndex // player1は反転（下から上）
                : rowIndex; // player2は通常の順序（上から下）

              return Array.from({ length: BOARD_SIZE }).map((_, x) => {
                const piece = getPieceAtPosition(x, y);
                const isAllowed = allowedRows.includes(y) && SETUP_COLS.includes(x);

                return (
                  <div
                    key={`${x}-${y}`}
                    onClick={() => isAllowed && handleCellClick(x, y)}
                    className={`
                      w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center border-2 transition-all
                      ${
                        isAllowed
                          ? 'bg-green-100 border-green-300 cursor-pointer hover:bg-green-200'
                          : 'bg-gray-200 border-gray-300'
                      }
                      ${piece ? 'ring-2 ring-indigo-500' : ''}
                      ${isTimedOut && isAllowed ? 'cursor-not-allowed' : ''}
                    `}
                  >
                    {piece && (
                      <div className="text-2xl sm:text-4xl">
                        {piece.type === 'good' ? '👻' : '😈'}
                      </div>
                    )}
                  </div>
                );
              });
            })}
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-2 sm:gap-4 justify-center">
        <Button variant="secondary" onClick={handleRandomSetup} disabled={isTimedOut}>
          ランダム配置
        </Button>
        <Button
          variant="primary"
          onClick={handleCompleteClick}
          disabled={setup.length !== 8 || goodCount !== 4 || isTimedOut}
        >
          配置完了
        </Button>
      </div>
    </div>
  );
};

/**
 * ランダム配置生成
 */
function generateRandomSetup(
  currentSetup: PieceSetup[],
  role: PlayerRole
): PieceSetup[] {
  const goodCount = currentSetup.filter((s) => s.type === 'good').length;
  const badCount = currentSetup.filter((s) => s.type === 'bad').length;

  const needGood = 4 - goodCount;
  const needBad = 4 - badCount;

  if (needGood === 0 && needBad === 0) {
    return currentSetup;
  }

  // 配置可能位置を取得
  const allowedRows = role === 'player1' ? [0, 1] : [4, 5];
  const allowedCols = [1, 2, 3, 4];

  const availablePositions: Position[] = [];
  for (const y of allowedRows) {
    for (const x of allowedCols) {
      if (!currentSetup.find((s) => s.position.x === x && s.position.y === y)) {
        availablePositions.push({ x, y });
      }
    }
  }

  // シャッフル
  const shuffled = availablePositions.sort(() => Math.random() - 0.5);

  const newPieces: PieceSetup[] = [];
  let goodAdded = 0;
  let badAdded = 0;

  for (const pos of shuffled) {
    if (goodAdded < needGood) {
      newPieces.push({
        pieceId: `auto-${role}-${Date.now()}-${goodAdded}`,
        position: pos,
        type: 'good',
      });
      goodAdded++;
    } else if (badAdded < needBad) {
      newPieces.push({
        pieceId: `auto-${role}-${Date.now()}-${badAdded}`,
        position: pos,
        type: 'bad',
      });
      badAdded++;
    }
  }

  return [...currentSetup, ...newPieces];
}
