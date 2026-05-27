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
    <div className="flex flex-col items-center space-y-8">
      {/* 各層を上から下へ表示 */}
      {Array.from({ length: BOARD_SIZE })
        .map((_, z) => BOARD_SIZE - 1 - z) // 上から下へ（z=3,2,1,0）
        .map((z) => (
          <div key={z} className="relative">
            {/* 層番号 */}
            <div className="text-center mb-2">
              <span className="text-sm font-bold text-white bg-slate-700 px-3 py-1 rounded-full">
                レベル {z + 1}
              </span>
            </div>

            {/* グリッド */}
            <div
              className="inline-block bg-slate-800 p-2 rounded-lg shadow-2xl"
              style={{
                transform: `perspective(800px) rotateX(${10 + z * 2}deg)`,
                opacity: 1 - z * 0.05,
              }}
            >
              <div
                className="grid gap-2"
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
                          w-16 h-16 rounded-lg border-2 flex items-center justify-center
                          transition-all duration-200
                          ${
                            piece
                              ? isWinning
                                ? 'ring-4 ring-yellow-400 animate-pulse'
                                : ''
                              : available
                              ? 'bg-slate-600 border-slate-500 hover:bg-slate-500 cursor-pointer hover:scale-105'
                              : 'bg-slate-700 border-slate-600'
                          }
                        `}
                      >
                        {piece && (
                          <div
                            className={`text-5xl ${
                              isWinning ? 'animate-bounce' : ''
                            }`}
                          >
                            {PLAYER_COLORS[piece.owner].emoji}
                          </div>
                        )}
                        {!piece && available && (
                          <div className="text-2xl opacity-30">+</div>
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
  );
};
