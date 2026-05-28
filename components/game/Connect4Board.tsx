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
        className="inline-block bg-gradient-to-br from-slate-800 to-slate-900 p-4 sm:p-6 rounded-lg shadow-2xl"
        role="grid"
        aria-label="立体四目並べの盤面"
        tabIndex={0}
      >
        {/* アイソメトリック表示: 斜め上から見た立体 */}
        <div className="relative" style={{ width: '280px', height: '280px', margin: '0 auto' }}>
          {/* 全64箇所を1つの視点で表示 */}
          {Array.from({ length: BOARD_SIZE }).map((_, z) =>
            Array.from({ length: BOARD_SIZE }).map((_, y) =>
              Array.from({ length: BOARD_SIZE }).map((_, x) => {
                const pos: Position3D = { x, y, z };
                const piece = gameState.board[z][y][x];
                const available = isAvailable(pos);
                const isWinning = isWinningPiece(pos);
                const isFocused = focusedCell && focusedCell.x === x && focusedCell.y === y && focusedCell.z === z;

                // アイソメトリック座標計算（斜め上から見た配置）
                const offsetX = x * 16 + y * 16 + z * 3;
                const offsetY = y * 8 - x * 8 + z * 20;

                return (
                  <div
                    key={`${x}-${y}-${z}`}
                    role="gridcell"
                    aria-label={getCellAriaLabel(pos)}
                    onClick={() => available && onCellClick?.(pos)}
                    onFocus={() => setFocusedCell(pos)}
                    tabIndex={isFocused ? 0 : -1}
                    className={`
                      absolute w-7 h-7 sm:w-9 sm:h-9 rounded border-2 flex items-center justify-center
                      transition-all duration-200
                      ${
                        piece
                          ? `bg-slate-600 border-slate-500 ${isWinning ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`
                          : available
                          ? 'bg-blue-600/70 border-blue-500 hover:bg-blue-500 cursor-pointer hover:scale-110'
                          : 'bg-slate-700/40 border-slate-600'
                      }
                      ${isFocused ? 'ring-2 ring-blue-400 z-50' : ''}
                    `}
                    style={{
                      left: `${offsetX}px`,
                      top: `${offsetY}px`,
                      zIndex: z * 10 + y * 2 + x,
                    }}
                  >
                    {piece && (
                      <div
                        className={`text-base sm:text-xl ${
                          isWinning ? 'animate-bounce' : ''
                        }`}
                      >
                        {PLAYER_COLORS[piece.owner].emoji}
                      </div>
                    )}
                    {!piece && available && (
                      <div className="text-xs sm:text-sm opacity-60 font-bold text-white">+</div>
                    )}
                    {/* 層番号（最下層のみ表示） */}
                    {z === 0 && x === 0 && y === 0 && (
                      <div className="absolute -top-5 left-0 text-[8px] sm:text-[10px] font-bold text-white bg-slate-700 px-1 rounded">
                        L1
                      </div>
                    )}
                    {z === 1 && x === 0 && y === 0 && (
                      <div className="absolute -top-5 left-0 text-[8px] sm:text-[10px] font-bold text-white bg-slate-600 px-1 rounded">
                        L2
                      </div>
                    )}
                    {z === 2 && x === 0 && y === 0 && (
                      <div className="absolute -top-5 left-0 text-[8px] sm:text-[10px] font-bold text-white bg-slate-500 px-1 rounded">
                        L3
                      </div>
                    )}
                    {z === 3 && x === 0 && y === 0 && (
                      <div className="absolute -top-5 left-0 text-[8px] sm:text-[10px] font-bold text-white bg-slate-400 px-1 rounded">
                        L4
                      </div>
                    )}
                  </div>
                );
              })
            )
          )}
        </div>
      </div>

      {/* 操作説明 */}
      <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-white max-w-md px-2">
        <p className="font-semibold mb-1">🎯 立体的に64箇所全てが見えます</p>
        <p className="text-[10px] sm:text-xs text-slate-300">
          矢印キー: 平面移動 | W/S or PageUp/Down: 層移動 | Enter/Space: 配置
        </p>
      </div>
    </div>
  );
};
