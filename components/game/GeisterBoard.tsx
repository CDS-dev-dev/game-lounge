'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { GeisterClientState, Position } from '@/lib/games/geister/types';
import { BOARD_SIZE, PLAYER1_ESCAPE_POSITIONS, PLAYER2_ESCAPE_POSITIONS } from '@/lib/games/geister/constants';
import { KeyboardHelpModal } from '@/components/ui/KeyboardHelpModal';

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

  // どちらのプレイヤーも常に自分が下側に表示されるようにする
  // Y座標（行）のみを反転する（SetupBoardと同じロジック）
  // player1: 内部座標の上が画面の上（Y反転なし）→ 自分は内部Y=0,1なので上に見える → Y反転が必要
  // player2: 内部座標の下が画面の下（Y反転なし）→ 自分は内部Y=4,5なので下に見える → Y反転不要
  const toInternalY = (displayRowIndex: number): number => {
    // player1の場合：画面上部が内部下部になるよう反転
    // displayRowIndex 0 → 内部 Y=5（相手陣地）
    // displayRowIndex 5 → 内部 Y=0（自分陣地を下に表示）
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

  const handleCellClick = (internalX: number, internalY: number) => {
    const piece = gameState.board[internalY][internalX];

    if (piece && piece.owner === gameState.myRole && !piece.captured && !piece.escaped) {
      // 自分の駒をクリック
      onPieceClick?.(piece.id);
    } else if (selectedPieceId) {
      // 駒を選択中の状態でセルをクリック（移動先）
      onCellClick?.({ x: internalX, y: internalY });
    }
  };

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
  }, [focusedCell, gameState.canOperate, selectedPieceId, gameState.myRole]);

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
        className="inline-block bg-amber-100 p-2 sm:p-4 rounded-lg shadow-lg"
        role="grid"
        aria-label="ガイスターの盤面"
        tabIndex={0}
      >
      <div className="grid gap-0.5 sm:gap-1" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}>
        {Array.from({ length: BOARD_SIZE }).map((_, rowIndex) => {
          // どちらのプレイヤーも自分が下側に来るように描画順序を調整
          // Y座標のみ反転（SetupBoardと統一）
          const internalY = toInternalY(rowIndex);

          return Array.from({ length: BOARD_SIZE }).map((_, colIndex) => {
            // X座標は反転しない
            const internalX = colIndex;

            const piece = gameState.board[internalY][internalX];
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
                className={`
                  w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center border-2 cursor-pointer transition-all touch-manipulation focus:ring-4 focus:ring-blue-400
                  ${isEscape ? 'bg-yellow-200 border-yellow-400' : 'bg-amber-50 border-amber-300'}
                  ${isLastFrom ? 'bg-yellow-100 border-yellow-300' : ''}
                  ${isLastTo ? 'ring-2 ring-yellow-500' : ''}
                  ${isSelected ? 'ring-2 sm:ring-4 ring-indigo-500' : ''}
                  ${canMove ? 'bg-green-200 ring-2 ring-green-400' : ''}
                  ${isFocused ? 'ring-2 ring-blue-400' : ''}
                  ${!isSelected && !canMove && !isLastFrom ? 'hover:bg-amber-100' : ''}
                `}
              >
                {piece && !piece.captured && !piece.escaped && (
                  <div
                    className={`text-2xl sm:text-4xl transition-all duration-300 pointer-events-none ${
                      piece.owner === gameState.myRole ? 'opacity-100' : 'opacity-80'
                    } ${isSelected ? 'scale-110' : 'scale-100'} hover:scale-105`}
                  >
                    {getPieceDisplay(piece)}
                  </div>
                )}
                {/* 脱出口のマーカー */}
                {isEscape && !piece && (
                  <div className="text-xl sm:text-2xl pointer-events-none">🚪</div>
                )}
              </div>
            );
          });
        })}
      </div>

      {/* 操作説明 */}
      <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-slate-600 max-w-md px-2">
        <p className="font-medium">駒をクリックして選択 → 移動先をクリック</p>
        <p className="text-[10px] sm:text-xs mt-1 text-slate-500">
          矢印キー: 移動 | Enter/Space: 選択/移動 | ⌨️ヘルプボタンで詳細
        </p>
      </div>
    </div>
    </>
  );
};
