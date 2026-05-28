// 立体四目並べのボードコンポーネント

'use client';

import React from 'react';
import type { Connect4ClientState, Position3D } from '@/lib/games/connect4/types';
import { BOARD_SIZE, PLAYER_COLORS } from '@/lib/games/connect4/constants';

interface Connect4BoardProps {
  gameState: Connect4ClientState;
  onCellClick?: (position: Position3D) => void;
  availablePositions?: Position3D[];
}

export const Connect4Board: React.FC<Connect4BoardProps> = ({
  gameState,
  onCellClick,
  availablePositions = [],
}) => {
  const isAvailable = (pos: Position3D) => {
    return availablePositions.some((p) => p.x === pos.x && p.y === pos.y && p.z === pos.z);
  };

  const isWinningPiece = (pos: Position3D) => {
    if (!gameState.winningLine) return false;
    return gameState.winningLine.some((p) => p.x === pos.x && p.y === pos.y && p.z === pos.z);
  };

  return (
    <div className="flex justify-center">
      {/* 4つの層を2×2グリッドで表示 */}
      <div className="inline-block bg-slate-800 p-3 sm:p-4 rounded-lg shadow-2xl">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {Array.from({ length: BOARD_SIZE })
            .map((_, z) => BOARD_SIZE - 1 - z) // 上から下へ（z=3,2,1,0）
            .map((z) => (
              <div key={z} className="relative">
                {/* 層番号 */}
                <div className="text-center mb-1.5">
                  <span className="text-xs sm:text-sm font-bold text-white bg-slate-700 px-2 py-0.5 rounded-full">
                    L{z + 1}
                  </span>
                </div>

                {/* グリッド */}
                <div className="bg-slate-700/50 p-1 sm:p-1.5 rounded">
                  <div
                    className="grid gap-0.5 sm:gap-1"
                    style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}
                  >
                    {Array.from({ length: BOARD_SIZE }).map((_, y) =>
                      Array.from({ length: BOARD_SIZE }).map((_, x) => {
                        const pos: Position3D = { x, y, z };
                        const piece = gameState.board[z][y][x];
                        const available = isAvailable(pos);
                        const isWinning = isWinningPiece(pos);

                        return (
                          <div
                            key={`${x}-${y}`}
                            onClick={() => available && onCellClick?.(pos)}
                            className={`
                              w-8 h-8 sm:w-12 sm:h-12 rounded border-2 flex items-center justify-center
                              transition-all duration-200
                              ${
                                piece
                                  ? isWinning
                                    ? 'ring-2 ring-yellow-400 animate-pulse'
                                    : ''
                                  : available
                                  ? 'bg-slate-600 border-slate-500 hover:bg-slate-500 cursor-pointer hover:scale-105'
                                  : 'bg-slate-700 border-slate-600'
                              }
                            `}
                          >
                            {piece && (
                              <div
                                className={`text-xl sm:text-3xl ${
                                  isWinning ? 'animate-bounce' : ''
                                }`}
                              >
                                {PLAYER_COLORS[piece.owner].emoji}
                              </div>
                            )}
                            {!piece && available && (
                              <div className="text-sm sm:text-xl opacity-30">+</div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
