// 中国象棋のボードコンポーネント

'use client';

import React from 'react';
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

  // 列ラベル（a-i）
  const colLabels = Array.from({ length: BOARD_COLS }, (_, i) =>
    String.fromCharCode(97 + i)
  );

  return (
    <div className="flex flex-col items-center overflow-x-auto">
      {/* ボード */}
      <div className="inline-block bg-amber-100 p-2 sm:p-4 md:p-6 rounded-lg shadow-2xl border-2 sm:border-4 border-amber-800">
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

                  return (
                    <div
                      key={`${col}-${row}`}
                      onClick={() => handleCellClick(pos)}
                      className={`
                        w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center relative
                        cursor-pointer transition-all duration-150
                        ${selected ? 'bg-yellow-200' : ''}
                        ${valid ? 'bg-green-100' : ''}
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
      </div>
    </div>
  );
};
