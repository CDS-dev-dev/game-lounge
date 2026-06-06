'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { GeisterClientState, Position } from '@/lib/games/geister/types';
import { BOARD_SIZE, PLAYER1_ESCAPE_POSITIONS, PLAYER2_ESCAPE_POSITIONS } from '@/lib/games/geister/constants';
import { KeyboardHelpModal } from '@/components/ui/KeyboardHelpModal';
import { DoorOpen } from 'lucide-react';

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

  // Board coordinates stay internal everywhere except render order.
  // That keeps click/tap selection tied to the exact piece id in the tapped cell.
  const toInternalY = (displayRowIndex: number): number => {
    return gameState.myRole === 'player1'
      ? BOARD_SIZE - 1 - displayRowIndex
      : displayRowIndex;
  };

  const isEscapePosition = (x: number, y: number) => {
    return (
      PLAYER1_ESCAPE_POSITIONS.some((pos) => pos.x === x && pos.y === y) ||
      PLAYER2_ESCAPE_POSITIONS.some((pos) => pos.x === x && pos.y === y)
    );
  };

  const isValidMove = (internalX: number, internalY: number) => {
    return validMoves.some((pos) => pos.x === internalX && pos.y === internalY);
  };

  // 最後の移動元/移動先かチェック（内部座標で判定）
  const isLastMoveFrom = (internalX: number, internalY: number) => {
    if (!gameState.lastMove) return false;
    return gameState.lastMove.from.x === internalX && gameState.lastMove.from.y === internalY;
  };

  const isLastMoveTo = (internalX: number, internalY: number) => {
    if (!gameState.lastMove) return false;
    return gameState.lastMove.to.x === internalX && gameState.lastMove.to.y === internalY;
  };

  const handleCellClick = useCallback((internalX: number, internalY: number) => {
    const piece = gameState.board[internalY]?.[internalX];

    if (piece && piece.owner === gameState.myRole && !piece.captured && !piece.escaped) {
      // 自分の駒をクリック
      onPieceClick?.(piece.id);
    } else if (selectedPieceId) {
      // 駒を選択中の状態でセルをクリック（移動先）
      onCellClick?.({ x: internalX, y: internalY });
    }
  }, [gameState.board, gameState.myRole, onCellClick, onPieceClick, selectedPieceId]);

  // キーボード操作（画面座標で操作、内部座標に変換）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.canOperate || !boardRef.current) return;

      // フォーカスがない場合は中央にセット（内部座標）
      if (!focusedCell) {
        const centerInternal = Math.floor(BOARD_SIZE / 2);
        setFocusedCell({ x: centerInternal, y: centerInternal });
        return;
      }

      let newX = focusedCell.x;
      let newY = focusedCell.y;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          // 画面上に移動 = player1なら内部Yを増やす、player2なら内部Yを減らす
          if (gameState.myRole === 'player1') {
            newY = Math.min(BOARD_SIZE - 1, focusedCell.y + 1);
          } else {
            newY = Math.max(0, focusedCell.y - 1);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          // 画面下に移動 = player1なら内部Yを減らす、player2なら内部Yを増やす
          if (gameState.myRole === 'player1') {
            newY = Math.max(0, focusedCell.y - 1);
          } else {
            newY = Math.min(BOARD_SIZE - 1, focusedCell.y + 1);
          }
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
  }, [focusedCell, gameState.canOperate, handleCellClick, gameState.myRole]);

  const getPieceDisplay = (piece: NonNullable<GeisterClientState['board'][number][number]>) => {
    if (piece.owner === gameState.myRole) {
      // 自分の駒：typeが見える
      return piece.type === 'good' ? '👻' : '😈';
    } else {
      // 相手の駒：typeが見えない
      return '👤';
    }
  };

  const getCellAriaLabel = (internalX: number, internalY: number): string => {
    const piece = gameState.board[internalY][internalX];
    const isEscape = isEscapePosition(internalX, internalY);
    const canMove = isValidMove(internalX, internalY);

    let label = `${String.fromCharCode(65 + internalX)}${internalY + 1}`;

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

    if (isLastMoveFrom(internalX, internalY)) {
      label += `, 最後に移動した元の位置`;
    } else if (isLastMoveTo(internalX, internalY)) {
      label += `, 最後に移動した先の位置`;
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
        className="inline-block rounded-lg border border-stone-300/80 bg-stone-100 p-2 shadow-xl shadow-black/15 sm:p-3"
        role="grid"
        aria-label="ガイスターの盤面"
        tabIndex={0}
      >
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}>
        {Array.from({ length: BOARD_SIZE }).map((_, rowIndex) => {
          // どちらのプレイヤーも自分が下側に来るように描画順序を調整
          // Y座標のみ反転（SetupBoardと統一）
          const internalY = toInternalY(rowIndex);

          return Array.from({ length: BOARD_SIZE }).map((_, colIndex) => {
            // X座標は反転しない
            const internalX = colIndex;

            const piece = gameState.board[internalY]?.[internalX];
            const isSelected = piece?.id === selectedPieceId;
            const isEscape = isEscapePosition(internalX, internalY);
            const canMove = isValidMove(internalX, internalY);
            const isLastFrom = isLastMoveFrom(internalX, internalY);
            const isLastTo = isLastMoveTo(internalX, internalY);

            const isFocused = focusedCell && focusedCell.x === internalX && focusedCell.y === internalY;

            return (
              <div
                key={`${internalX}-${internalY}`}
                role="gridcell"
                aria-label={getCellAriaLabel(internalX, internalY)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCellClick(internalX, internalY);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCellClick(internalX, internalY);
                }}
                onFocus={() => setFocusedCell({ x: internalX, y: internalY })}
                tabIndex={isFocused ? 0 : -1}
                data-position={`${internalX},${internalY}`}
                data-piece-id={piece?.id ?? ''}
                className={`
                  relative flex h-12 w-12 items-center justify-center rounded-md border text-center transition-all touch-manipulation focus:outline-none focus:ring-4 focus:ring-teal-300 sm:h-16 sm:w-16 md:h-20 md:w-20
                  ${isEscape ? 'border-amber-400 bg-amber-100' : 'border-stone-300 bg-stone-50'}
                  ${isLastFrom ? 'border-yellow-400 bg-yellow-100' : ''}
                  ${isLastTo ? 'ring-2 ring-yellow-500' : ''}
                  ${isSelected ? 'ring-4 ring-indigo-500' : ''}
                  ${canMove ? 'border-emerald-400 bg-emerald-100 ring-2 ring-emerald-400' : ''}
                  ${isFocused ? 'ring-2 ring-teal-400' : ''}
                  ${piece || canMove ? 'cursor-pointer' : 'cursor-default'}
                  ${!isSelected && !canMove && !isLastFrom ? 'hover:bg-stone-100' : ''}
                `}
              >
                {piece && !piece.captured && !piece.escaped && (
                  <div
                    className={`pointer-events-none grid h-9 w-9 place-items-center rounded-full border text-2xl shadow-sm transition-all duration-200 sm:h-12 sm:w-12 sm:text-3xl md:h-14 md:w-14 md:text-4xl ${
                      piece.owner === gameState.myRole ? 'opacity-100' : 'opacity-80'
                    } ${piece.owner === gameState.myRole ? 'border-white bg-white' : 'border-slate-200 bg-slate-100'} ${isSelected ? 'scale-110' : 'scale-100'}`}
                  >
                    {getPieceDisplay(piece)}
                  </div>
                )}
                {isEscape && !piece && (
                  <DoorOpen className="pointer-events-none h-5 w-5 text-amber-700 sm:h-7 sm:w-7" aria-hidden="true" />
                )}
              </div>
            );
          });
        })}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1 text-center text-[11px] font-semibold text-slate-600 sm:text-xs">
        <span className="rounded-md bg-white px-2 py-1">👻 {gameState.capturedCounts.myGood}</span>
        <span className="rounded-md bg-white px-2 py-1">😈 {gameState.capturedCounts.myBad}</span>
        <span className="rounded-md bg-white px-2 py-1">👤 {gameState.opponentPiecesCount.captured}</span>
      </div>
    </div>
    </>
  );
};
