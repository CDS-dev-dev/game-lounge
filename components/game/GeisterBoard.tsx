'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { GeisterClientState, Position } from '@/lib/games/geister/types';
import { BOARD_SIZE, PLAYER1_ESCAPE_POSITIONS, PLAYER2_ESCAPE_POSITIONS } from '@/lib/games/geister/constants';
import { KeyboardHelpModal } from '@/components/ui/KeyboardHelpModal';

interface GeisterBoardProps {
  gameState: GeisterClientState;
  onPieceClick?: (pieceId: string) => void;
  onCellClick?: (position: Position) => void;
  selectedPieceId?: string | null;
  validMoves?: Position[];
}

export const GeisterBoard: React.FC<GeisterBoardProps> = ({
  gameState,
  onPieceClick,
  onCellClick,
  selectedPieceId,
  validMoves = [],
}) => {
  const [focusedCell, setFocusedCell] = useState<Position | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // 表示座標→内部座標の変換（player2は反転が必要）
  const toInternalCoords = (displayX: number, displayY: number): Position => {
    if (gameState.myRole === 'player2') {
      return {
        x: BOARD_SIZE - 1 - displayX,
        y: BOARD_SIZE - 1 - displayY,
      };
    }
    return { x: displayX, y: displayY };
  };

  // 内部座標→表示座標の変換（player2は反転が必要）
  const toDisplayCoords = (internalX: number, internalY: number): Position => {
    if (gameState.myRole === 'player2') {
      return {
        x: BOARD_SIZE - 1 - internalX,
        y: BOARD_SIZE - 1 - internalY,
      };
    }
    return { x: internalX, y: internalY };
  };

  const isEscapePosition = (x: number, y: number) => {
    return (
      PLAYER1_ESCAPE_POSITIONS.some((pos) => pos.x === x && pos.y === y) ||
      PLAYER2_ESCAPE_POSITIONS.some((pos) => pos.x === x && pos.y === y)
    );
  };

  const isValidMove = (displayX: number, displayY: number) => {
    // validMovesは内部座標なので、表示座標を内部座標に変換して比較
    const internal = toInternalCoords(displayX, displayY);
    return validMoves.some((pos) => pos.x === internal.x && pos.y === internal.y);
  };

  const handleCellClick = (displayX: number, displayY: number) => {
    // 表示座標を内部座標に変換
    const internal = toInternalCoords(displayX, displayY);
    const piece = gameState.board[internal.y][internal.x];

    if (piece && piece.owner === gameState.myRole && !piece.captured && !piece.escaped) {
      // 自分の駒をクリック
      onPieceClick?.(piece.id);
    } else if (selectedPieceId) {
      // 駒を選択中の状態でセルをクリック（移動先）
      // 内部座標で渡す
      onCellClick?.(internal);
    }
  };

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.canOperate || !boardRef.current) return;

      // フォーカスがない場合は中央にセット
      if (!focusedCell) {
        setFocusedCell({ x: Math.floor(BOARD_SIZE / 2), y: Math.floor(BOARD_SIZE / 2) });
        return;
      }

      let newX = focusedCell.x;
      let newY = focusedCell.y;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          // 画面上で上に移動（displayY を減らす）
          newY = Math.max(0, focusedCell.y - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          // 画面上で下に移動（displayY を増やす）
          newY = Math.min(BOARD_SIZE - 1, focusedCell.y + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          // 画面上で左に移動（displayX を減らす）
          newX = Math.max(0, focusedCell.x - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          // 画面上で右に移動（displayX を増やす）
          newX = Math.min(BOARD_SIZE - 1, focusedCell.x + 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          // 表示座標でクリック処理
          handleCellClick(focusedCell.x, focusedCell.y);
          return;
      }

      if (newX !== focusedCell.x || newY !== focusedCell.y) {
        setFocusedCell({ x: newX, y: newY });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedCell, gameState.canOperate, selectedPieceId]);

  const getPieceDisplay = (piece: NonNullable<GeisterClientState['board'][number][number]>) => {
    if (piece.owner === gameState.myRole) {
      // 自分の駒：typeが見える
      return piece.type === 'good' ? '👻' : '😈';
    } else {
      // 相手の駒：typeが見えない
      return '👤';
    }
  };

  const getCellAriaLabel = (internalX: number, internalY: number): string => {
    const piece = gameState.board[internalY][internalX];
    const isEscape = isEscapePosition(internalX, internalY);
    // canMoveは表示座標で判定する必要があるため、内部→表示に変換
    const display = toDisplayCoords(internalX, internalY);
    const canMove = isValidMove(display.x, display.y);

    let label = `${String.fromCharCode(65 + internalX)}${internalY + 1}`;

    if (piece) {
      if (piece.owner === gameState.myRole) {
        label += `, 自分の${piece.type === 'good' ? '青いお化け' : '赤い悪魔'}`;
      } else {
        label += `, 相手の駒`;
      }
    } else if (isEscape) {
      label += `, 脱出口`;
    }

    if (canMove) {
      label += `, 移動可能`;
    }

    return label;
  };

  const keyboardShortcuts = [
    { keys: ['↑', '↓', '←', '→'], description: 'セルを移動' },
    { keys: ['Enter'], description: '駒を選択/移動実行' },
    { keys: ['Space'], description: '駒を選択/移動実行' },
  ];

  return (
    <>
      <KeyboardHelpModal shortcuts={keyboardShortcuts} gameName="ガイスター" />
      <div
        ref={boardRef}
        className="inline-block bg-amber-100 p-2 sm:p-4 rounded-lg shadow-lg"
        role="grid"
        aria-label="ガイスターの盤面"
        tabIndex={0}
      >
      <div className="grid gap-0.5 sm:gap-1" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}>
        {Array.from({ length: BOARD_SIZE }).map((_, rowIndex) => {
          // 表示座標は常にrowIndexをそのまま使用（上から下に0,1,2...）
          const displayY = rowIndex;

          return Array.from({ length: BOARD_SIZE }).map((_, colIndex) => {
            // 表示座標
            const displayX = colIndex;

            // 内部座標に変換してデータを取得
            const internal = toInternalCoords(displayX, displayY);
            const piece = gameState.board[internal.y][internal.x];
            const isSelected = piece?.id === selectedPieceId;
            const isEscape = isEscapePosition(internal.x, internal.y);
            const canMove = isValidMove(displayX, displayY);

            const isFocused = focusedCell && focusedCell.x === displayX && focusedCell.y === displayY;

            return (
              <div
                key={`${displayX}-${displayY}`}
                role="gridcell"
                aria-label={getCellAriaLabel(internal.x, internal.y)}
                onClick={() => handleCellClick(displayX, displayY)}
                onFocus={() => setFocusedCell({ x: displayX, y: displayY })}
                tabIndex={isFocused ? 0 : -1}
                className={`
                  w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center border-2 cursor-pointer transition-all
                  ${isEscape ? 'bg-yellow-200 border-yellow-400' : 'bg-amber-50 border-amber-300'}
                  ${isSelected ? 'ring-2 sm:ring-4 ring-indigo-500' : ''}
                  ${canMove ? 'bg-green-200 ring-2 ring-green-400' : ''}
                  ${isFocused ? 'ring-2 ring-blue-400' : ''}
                  ${!isSelected && !canMove ? 'hover:bg-amber-100' : ''}
                `}
              >
                {piece && !piece.captured && !piece.escaped && (
                  <div
                    className={`text-2xl sm:text-4xl transition-all duration-300 ${
                      piece.owner === gameState.myRole ? 'opacity-100' : 'opacity-80'
                    } ${isSelected ? 'scale-110' : 'scale-100'} hover:scale-105`}
                  >
                    {getPieceDisplay(piece)}
                  </div>
                )}
                {/* 脱出口のマーカー */}
                {isEscape && !piece && (
                  <div className="text-xl sm:text-2xl">🚪</div>
                )}
              </div>
            );
          });
        })}
      </div>

      {/* 操作説明 */}
      <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-slate-600 max-w-md px-2">
        <p className="font-medium">駒をクリックして選択 → 移動先をクリック</p>
        <p className="text-[10px] sm:text-xs mt-1 text-slate-500">
          矢印キー: 移動 | Enter/Space: 選択/移動 | ⌨️ヘルプボタンで詳細
        </p>
      </div>
    </div>
    </>
  );
};
