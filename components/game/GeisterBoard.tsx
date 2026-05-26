'use client';

import React from 'react';
import type { GeisterClientState, Position } from '@/lib/games/geister/types';
import { BOARD_SIZE, GOAL_POSITIONS } from '@/lib/games/geister/constants';

interface GeisterBoardProps {
  gameState: GeisterClientState;
  onPieceClick?: (pieceId: string) => void;
  onCellClick?: (position: Position) => void;
  selectedPieceId?: string | null;
}

export const GeisterBoard: React.FC<GeisterBoardProps> = ({
  gameState,
  onPieceClick,
  onCellClick,
  selectedPieceId,
}) => {
  const isGoal = (x: number, y: number) => {
    return GOAL_POSITIONS.some((pos) => pos.x === x && pos.y === y);
  };

  const handleCellClick = (x: number, y: number) => {
    const piece = gameState.board[y][x];
    if (piece && piece.owner === gameState.myRole && !piece.captured) {
      // 自分の駒をクリック
      onPieceClick?.(piece.id);
    } else if (selectedPieceId) {
      // 駒を選択中の状態でセルをクリック（移動先）
      onCellClick?.({ x, y });
    }
  };

  return (
    <div className="inline-block bg-amber-100 p-4 rounded-lg shadow-lg">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}>
        {Array.from({ length: BOARD_SIZE }).map((_, y) =>
          Array.from({ length: BOARD_SIZE }).map((_, x) => {
            const piece = gameState.board[y][x];
            const isSelected = piece?.id === selectedPieceId;
            const isGoalCell = isGoal(x, y);

            return (
              <div
                key={`${x}-${y}`}
                onClick={() => handleCellClick(x, y)}
                className={`
                  w-16 h-16 flex items-center justify-center border-2 cursor-pointer transition-all
                  ${isGoalCell ? 'bg-yellow-200 border-yellow-400' : 'bg-amber-50 border-amber-300'}
                  ${isSelected ? 'ring-4 ring-indigo-500' : ''}
                  hover:bg-amber-100
                `}
              >
                {piece && !piece.captured && (
                  <div
                    className={`text-4xl ${
                      piece.owner === gameState.myRole ? 'opacity-100' : 'opacity-80'
                    }`}
                  >
                    {piece.owner === gameState.myRole ? (
                      // 自分の駒: 色が見える
                      piece.color === 'blue' ? '👻' : '😈'
                    ) : (
                      // 相手の駒: 色が見えない
                      '👤'
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
