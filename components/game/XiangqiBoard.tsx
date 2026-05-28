// 中国象棋のボードコンポーネント

'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { XiangqiClientState, Position } from '@/lib/games/xiangqi/types';
import { BOARD_COLS, BOARD_ROWS, PIECE_NAMES, PLAYER_COLORS } from '@/lib/games/xiangqi/constants';

interface XiangqiBoardProps {
  gameState: XiangqiClientState;
  onCellClick?: (position: Position) => void;
  selectedPiece?: Position | null;
  validMoves?: Position[];
}

export const XiangqiBoard: React.FC<XiangqiBoardProps> = ({
  gameState,
  onCellClick,
  selectedPiece,
  validMoves = [],
}) => {
  const [focusedCell, setFocusedCell] = useState<Position | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const isValidMove = (pos: Position) => {
    return validMoves.some((p) => p.col === pos.col && p.row === pos.row);
  };

  const isSelected = (pos: Position) => {
    return selectedPiece && selectedPiece.col === pos.col && selectedPiece.row === pos.row;
  };

  const handleCellClick = (pos: Position) => {
    if (onCellClick) {
      onCellClick(pos);
    }
  };

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.canOperate || !boardRef.current) return;

      // フォーカスがない場合は中央にセット
      if (!focusedCell) {
        setFocusedCell({ col: Math.floor(BOARD_COLS / 2), row: Math.floor(BOARD_ROWS / 2) });
        return;
      }

      let newCol = focusedCell.col;
      let newRow = focusedCell.row;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newRow = Math.min(BOARD_ROWS - 1, focusedCell.row + 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newRow = Math.max(0, focusedCell.row - 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newCol = Math.max(0, focusedCell.col - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newCol = Math.min(BOARD_COLS - 1, focusedCell.col + 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleCellClick(focusedCell);
          return;
      }

      if (newCol !== focusedCell.col || newRow !== focusedCell.row) {
        setFocusedCell({ col: newCol, row: newRow });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedCell, gameState.canOperate, selectedPiece]);

  // 列ラベル（a-i）
  const colLabels = Array.from({ length: BOARD_COLS }, (_, i) =>
    String.fromCharCode(97 + i)
  );

  const getCellAriaLabel = (pos: Position): string => {
    const piece = gameState.board[pos.row][pos.col];
    const colLabel = String.fromCharCode(97 + pos.col);
    let label = `${colLabel}${pos.row + 1}`;

    if (piece) {
      const pieceName = PIECE_NAMES[piece.owner][piece.type];
      label += `, ${piece.owner === 'red' ? '赤' : '黒'}の${pieceName}`;
    }

    if (isValidMove(pos)) {
      label += `, 移動可能`;
    }

    return label;
  };

  return (
    <div className="flex flex-col items-center overflow-x-auto">
      {/* ボード */}
      <div
        ref={boardRef}
        className="inline-block bg-amber-100 p-2 sm:p-4 md:p-6 rounded-lg shadow-2xl border-2 sm:border-4 border-amber-800"
        role="grid"
        aria-label="中国象棋の盤面"
        tabIndex={0}
      >
        {/* 黒陣地ラベル */}
        <div className="text-center mb-1 sm:mb-2">
          <span className="text-xs sm:text-sm font-bold text-slate-800 px-2 sm:px-3 py-0.5 sm:py-1 bg-slate-200 rounded">
            {PLAYER_COLORS.black.name}
          </span>
        </div>

        {/* グリッド（上から下：row 9→0） */}
        <div className="relative">
          {Array.from({ length: BOARD_ROWS })
            .map((_, i) => BOARD_ROWS - 1 - i) // 9→0
            .map((row) => (
              <div key={row} className="flex items-center">
                {/* 行番号（左） */}
                <div className="w-4 sm:w-6 text-center text-[10px] sm:text-xs font-semibold text-amber-900">
                  {row + 1}
                </div>

                {/* セル */}
                {Array.from({ length: BOARD_COLS }).map((_, col) => {
                  const pos: Position = { col, row };
                  const piece = gameState.board[row][col];
                  const selected = isSelected(pos);
                  const valid = isValidMove(pos);
                  const isFocused = focusedCell && focusedCell.col === col && focusedCell.row === row;

                  return (
                    <div
                      key={`${col}-${row}`}
                      role="gridcell"
                      aria-label={getCellAriaLabel(pos)}
                      onClick={() => handleCellClick(pos)}
                      onFocus={() => setFocusedCell(pos)}
                      tabIndex={isFocused ? 0 : -1}
                      className={`
                        w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center relative
                        cursor-pointer transition-all duration-150
                        ${selected ? 'bg-yellow-200' : ''}
                        ${valid ? 'bg-green-100' : ''}
                        ${isFocused ? 'ring-2 ring-blue-400' : ''}
                        hover:bg-yellow-50
                      `}
                      style={{
                        borderRight: col < BOARD_COLS - 1 ? '1px solid #92400e' : 'none',
                        borderBottom: row > 0 ? '1px solid #92400e' : 'none',
                      }}
                    >
                      {/* 楚河漢界 */}
                      {row === 4 && (
                        <div className="absolute inset-0 border-t-2 sm:border-t-4 border-amber-700 pointer-events-none"></div>
                      )}

                      {/* 駒 */}
                      {piece && (
                        <div
                          className={`
                            w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center
                            font-bold text-sm sm:text-base md:text-lg border-2 shadow-md
                            ${piece.owner === 'red' ? 'bg-red-500 border-red-700 text-white' : 'bg-slate-800 border-slate-900 text-white'}
                            ${selected ? 'ring-2 sm:ring-4 ring-yellow-400' : ''}
                            hover:scale-110 transition-transform
                          `}
                        >
                          {PIECE_NAMES[piece.owner][piece.type]}
                        </div>
                      )}

                      {/* 合法手マーカー */}
                      {!piece && valid && (
                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 opacity-60"></div>
                      )}
                    </div>
                  );
                })}

                {/* 行番号（右） */}
                <div className="w-4 sm:w-6 text-center text-[10px] sm:text-xs font-semibold text-amber-900">
                  {row + 1}
                </div>
              </div>
            ))}

          {/* 楚河漢界テキスト */}
          <div
            className="absolute left-0 right-0 flex justify-center pointer-events-none"
            style={{ top: '43%' }}
          >
            <div className="bg-amber-700 text-amber-50 px-2 sm:px-4 md:px-6 py-0.5 sm:py-1 rounded font-bold text-[10px] sm:text-xs md:text-sm shadow-lg whitespace-nowrap">
              楚河──漢界
            </div>
          </div>
        </div>

        {/* 列ラベル */}
        <div className="flex items-center mt-1 sm:mt-2">
          <div className="w-4 sm:w-6"></div>
          {colLabels.map((label) => (
            <div key={label} className="w-8 sm:w-10 md:w-12 text-center text-[10px] sm:text-xs font-semibold text-amber-900">
              {label}
            </div>
          ))}
          <div className="w-4 sm:w-6"></div>
        </div>

        {/* 赤陣地ラベル */}
        <div className="text-center mt-1 sm:mt-2">
          <span className="text-xs sm:text-sm font-bold text-red-700 px-2 sm:px-3 py-0.5 sm:py-1 bg-red-100 rounded">
            {PLAYER_COLORS.red.name}
          </span>
        </div>
      </div>

      {/* 操作説明 */}
      <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-slate-600 max-w-md px-2">
        <p className="font-medium">駒をクリックして選択 → 移動先をクリック</p>
        <p className="text-[10px] sm:text-xs mt-1 text-slate-500">矢印キー: 移動 | Enter/Space: 選択/移動</p>
      </div>
    </div>
  );
};
