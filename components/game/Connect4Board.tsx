// 立体四目並べのボードコンポーネント

'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [focusedCell, setFocusedCell] = useState<Position3D | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const isAvailable = (pos: Position3D) => {
    return availablePositions.some((p) => p.x === pos.x && p.y === pos.y && p.z === pos.z);
  };

  const isWinningPiece = (pos: Position3D) => {
    if (!gameState.winningLine) return false;
    return gameState.winningLine.some((p) => p.x === pos.x && p.y === pos.y && p.z === pos.z);
  };

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.canOperate || !boardRef.current) return;

      // フォーカスがない場合は中央にセット
      if (!focusedCell) {
        setFocusedCell({ x: 1, y: 1, z: 2 });
        return;
      }

      let newX = focusedCell.x;
      let newY = focusedCell.y;
      let newZ = focusedCell.z;

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
        case 'PageUp':
        case 'w':
        case 'W':
          e.preventDefault();
          newZ = Math.min(BOARD_SIZE - 1, focusedCell.z + 1);
          break;
        case 'PageDown':
        case 's':
        case 'S':
          e.preventDefault();
          newZ = Math.max(0, focusedCell.z - 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isAvailable(focusedCell)) {
            onCellClick?.(focusedCell);
          }
          return;
      }

      if (newX !== focusedCell.x || newY !== focusedCell.y || newZ !== focusedCell.z) {
        setFocusedCell({ x: newX, y: newY, z: newZ });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedCell, gameState.canOperate, availablePositions]);

  const getCellAriaLabel = (pos: Position3D): string => {
    const piece = gameState.board[pos.z][pos.y][pos.x];
    let label = `L${pos.z + 1} 行${pos.y + 1} 列${pos.x + 1}`;

    if (piece) {
      const playerColor = PLAYER_COLORS[piece.owner];
      label += `, ${playerColor.name}の駒`;
    } else if (isAvailable(pos)) {
      label += `, 配置可能`;
    }

    return label;
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={boardRef}
        className="inline-block bg-slate-800 p-3 sm:p-4 rounded-lg shadow-2xl"
        role="grid"
        aria-label="立体四目並べの盤面"
        tabIndex={0}
      >
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
                        const isFocused = focusedCell && focusedCell.x === x && focusedCell.y === y && focusedCell.z === z;

                        return (
                          <div
                            key={`${x}-${y}`}
                            role="gridcell"
                            aria-label={getCellAriaLabel(pos)}
                            onClick={() => available && onCellClick?.(pos)}
                            onFocus={() => setFocusedCell(pos)}
                            tabIndex={isFocused ? 0 : -1}
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
                              ${isFocused ? 'ring-2 ring-blue-400' : ''}
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

      {/* 操作説明 */}
      <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-white max-w-md px-2">
        <p className="text-[10px] sm:text-xs text-slate-300">
          矢印キー: 平面移動 | W/S or PageUp/Down: 層移動 | Enter/Space: 配置
        </p>
      </div>
    </div>
  );
};
