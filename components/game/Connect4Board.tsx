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
        className="inline-block bg-gradient-to-br from-slate-800 to-slate-900 p-4 sm:p-8 rounded-lg shadow-2xl"
        role="grid"
        aria-label="立体四目並べの盤面"
        tabIndex={0}
      >
        {/* レイヤーごとに分けて表示（上下に並べる） */}
        <div className="space-y-6">
          {Array.from({ length: BOARD_SIZE })
            .map((_, z) => BOARD_SIZE - 1 - z) // 上の層から順に表示（L4 → L1）
            .map((z) => (
              <div key={z} className="relative">
                {/* レイヤー番号 */}
                <div className="text-center mb-2">
                  <span className="inline-block px-3 py-1 text-sm font-bold text-white bg-slate-600 rounded-full shadow">
                    レイヤー {z + 1}
                  </span>
                </div>

                {/* 4×4グリッド */}
                <div
                  className="grid gap-1 sm:gap-2 mx-auto"
                  style={{
                    gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                    width: 'fit-content',
                  }}
                >
                  {Array.from({ length: BOARD_SIZE }).map((_, y) =>
                    Array.from({ length: BOARD_SIZE }).map((_, x) => {
                      const pos: Position3D = { x, y, z };
                      const piece = gameState.board[z][y][x];
                      const available = isAvailable(pos);
                      const isWinning = isWinningPiece(pos);
                      const isFocused =
                        focusedCell &&
                        focusedCell.x === x &&
                        focusedCell.y === y &&
                        focusedCell.z === z;

                      return (
                        <div
                          key={`${x}-${y}-${z}`}
                          role="gridcell"
                          aria-label={getCellAriaLabel(pos)}
                          onClick={() => available && onCellClick?.(pos)}
                          onFocus={() => setFocusedCell(pos)}
                          tabIndex={isFocused ? 0 : -1}
                          className={`
                            w-12 h-12 sm:w-16 sm:h-16 rounded-lg border-2 flex items-center justify-center
                            transition-all duration-200
                            ${
                              piece
                                ? `bg-slate-600 border-slate-500 ${
                                    isWinning ? 'ring-4 ring-yellow-400 animate-pulse' : ''
                                  }`
                                : available
                                ? 'bg-blue-600/70 border-blue-500 hover:bg-blue-500 cursor-pointer hover:scale-110 hover:shadow-lg'
                                : 'bg-slate-700/40 border-slate-600'
                            }
                            ${isFocused ? 'ring-4 ring-blue-400' : ''}
                          `}
                        >
                          {piece && (
                            <div
                              className={`text-2xl sm:text-4xl ${
                                isWinning ? 'animate-bounce' : ''
                              }`}
                            >
                              {PLAYER_COLORS[piece.owner].emoji}
                            </div>
                          )}
                          {!piece && available && (
                            <div className="text-base sm:text-xl opacity-70 font-bold text-white">
                              +
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 操作説明 */}
      <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-slate-200 max-w-md px-2">
        <p className="font-semibold mb-2">💡 操作方法</p>
        <div className="bg-slate-700/50 rounded-lg p-3 text-left space-y-1">
          <p><kbd className="px-2 py-0.5 bg-slate-600 rounded text-white text-xs">矢印キー</kbd> : セル移動（平面）</p>
          <p><kbd className="px-2 py-0.5 bg-slate-600 rounded text-white text-xs">W/S</kbd> または <kbd className="px-2 py-0.5 bg-slate-600 rounded text-white text-xs">PageUp/Down</kbd> : レイヤー移動</p>
          <p><kbd className="px-2 py-0.5 bg-slate-600 rounded text-white text-xs">Enter</kbd> / <kbd className="px-2 py-0.5 bg-slate-600 rounded text-white text-xs">Space</kbd> : 駒を配置</p>
        </div>
      </div>
    </div>
  );
};
