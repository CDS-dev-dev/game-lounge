'use client';

import React from 'react';
import type { GeisterClientState, Position } from '@/lib/games/geister/types';
import { BOARD_SIZE, PLAYER1_ESCAPE_POSITIONS, PLAYER2_ESCAPE_POSITIONS } from '@/lib/games/geister/constants';

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

  const getPieceDisplay = (piece: any) => {
    if (piece.owner === gameState.myRole) {
      // 自分の駒：typeが見える
      return piece.type === 'good' ? '👻' : '😈';
    } else {
      // 相手の駒：typeが見えない
      return '👤';
    }
  };

  return (
    <div className="inline-block bg-amber-100 p-2 sm:p-4 rounded-lg shadow-lg">
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

            return (
              <div
                key={`${x}-${y}`}
                onClick={() => handleCellClick(x, y)}
                className={`
                  w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center border-2 cursor-pointer transition-all
                  ${isEscape ? 'bg-yellow-200 border-yellow-400' : 'bg-amber-50 border-amber-300'}
                  ${isSelected ? 'ring-2 sm:ring-4 ring-indigo-500' : ''}
                  ${canMove ? 'bg-green-200 ring-2 ring-green-400' : ''}
                  ${!isSelected && !canMove ? 'hover:bg-amber-100' : ''}
                `}
              >
                {piece && !piece.captured && !piece.escaped && (
                  <div
                    className={`text-2xl sm:text-4xl ${
                      piece.owner === gameState.myRole ? 'opacity-100' : 'opacity-80'
                    }`}
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
    </div>
  );
};
