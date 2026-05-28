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

  const isEscapePosition = (x: number, y: number) => {
    return (
      PLAYER1_ESCAPE_POSITIONS.some((pos) => pos.x === x && pos.y === y) ||
      PLAYER2_ESCAPE_POSITIONS.some((pos) => pos.x === x && pos.y === y)
    );
  };

  const isValidMove = (x: number, y: number) => {
    return validMoves.some((pos) => pos.x === x && pos.y === y);
  };

  const handleCellClick = (x: number, y: number) => {
    const piece = gameState.board[y][x];
    if (piece && piece.owner === gameState.myRole && !piece.captured && !piece.escaped) {
      // 自分の駒をクリック
      onPieceClick?.(piece.id);
    } else if (selectedPieceId) {
      // 駒を選択中の状態でセルをクリック（移動先）
      onCellClick?.({ x, y });
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
          newY = Math.max(0, focusedCell.y - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newY = Math.min(BOARD_SIZE - 1, focusedCell.y + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newX = Math.max(0, focusedCell.x - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newX = Math.min(BOARD_SIZE - 1, focusedCell.x + 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
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

  const getCellAriaLabel = (x: number, y: number): string => {
    const piece = gameState.board[y][x];
    const isEscape = isEscapePosition(x, y);
    const canMove = isValidMove(x, y);

    let label = `${String.fromCharCode(65 + x)}${y + 1}`;

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
          // プレイヤー視点に応じて盤面を反転（自分が常に下に来るように）
          const y = gameState.myRole === 'player1'
            ? rowIndex // player1は通常の順序（上から下）
            : BOARD_SIZE - 1 - rowIndex; // player2は反転（下から上）

          return Array.from({ length: BOARD_SIZE }).map((_, x) => {
            const piece = gameState.board[y][x];
            const isSelected = piece?.id === selectedPieceId;
            const isEscape = isEscapePosition(x, y);
            const canMove = isValidMove(x, y);

            const isFocused = focusedCell && focusedCell.x === x && focusedCell.y === y;

            return (
              <div
                key={`${x}-${y}`}
                role="gridcell"
                aria-label={getCellAriaLabel(x, y)}
                onClick={() => handleCellClick(x, y)}
                onFocus={() => setFocusedCell({ x, y })}
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
