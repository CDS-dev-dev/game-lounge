// 中国象棋 各駒の移動ルール詳細実装

import type { XiangqiState, Position, PlayerRole, PieceType } from './types';
import {
  BOARD_COLS,
  BOARD_ROWS,
  PALACE_COLS,
  PALACE_ROWS_RED,
  PALACE_ROWS_BLACK,
  RIVER_ROW_TOP,
} from './constants';

// 位置が有効か
function isValidPosition(pos: Position): boolean {
  return pos.col >= 0 && pos.col < BOARD_COLS && pos.row >= 0 && pos.row < BOARD_ROWS;
}

// 九宮内か
function isInPalace(pos: Position, role: PlayerRole): boolean {
  const rows = role === 'red' ? PALACE_ROWS_RED : PALACE_ROWS_BLACK;
  return (
    pos.col >= PALACE_COLS.min &&
    pos.col <= PALACE_COLS.max &&
    pos.row >= rows.min &&
    pos.row <= rows.max
  );
}

// 自陣側か（相/象用）
function isOnOwnSide(pos: Position, role: PlayerRole): boolean {
  if (role === 'red') {
    return pos.row <= RIVER_ROW_TOP; // 1-5行
  } else {
    return pos.row >= RIVER_ROW_TOP + 1; // 6-10行
  }
}

// 2点間に駒があるかチェック（縦横のみ）
function hasPieceBetween(
  state: XiangqiState,
  from: Position,
  to: Position
): boolean {
  // 同じ列（縦）
  if (from.col === to.col) {
    const minRow = Math.min(from.row, to.row);
    const maxRow = Math.max(from.row, to.row);
    for (let row = minRow + 1; row < maxRow; row++) {
      if (state.board[row][from.col] !== null) {
        return true;
      }
    }
  }
  // 同じ行（横）
  else if (from.row === to.row) {
    const minCol = Math.min(from.col, to.col);
    const maxCol = Math.max(from.col, to.col);
    for (let col = minCol + 1; col < maxCol; col++) {
      if (state.board[from.row][col] !== null) {
        return true;
      }
    }
  }

  return false;
}

// 2点間の駒の数（炮用）
function countPiecesBetween(
  state: XiangqiState,
  from: Position,
  to: Position
): number {
  let count = 0;

  if (from.col === to.col) {
    const minRow = Math.min(from.row, to.row);
    const maxRow = Math.max(from.row, to.row);
    for (let row = minRow + 1; row < maxRow; row++) {
      if (state.board[row][from.col] !== null) {
        count++;
      }
    }
  } else if (from.row === to.row) {
    const minCol = Math.min(from.col, to.col);
    const maxCol = Math.max(from.col, to.col);
    for (let col = minCol + 1; col < maxCol; col++) {
      if (state.board[from.row][col] !== null) {
        count++;
      }
    }
  }

  return count;
}

// 帥/将（King）の移動判定
export function isValidKingMove(
  state: XiangqiState,
  from: Position,
  to: Position,
  role: PlayerRole
): boolean {
  // 九宮内のみ
  if (!isInPalace(to, role)) return false;

  // 縦横1マスのみ
  const colDiff = Math.abs(to.col - from.col);
  const rowDiff = Math.abs(to.row - from.row);

  if ((colDiff === 1 && rowDiff === 0) || (colDiff === 0 && rowDiff === 1)) {
    return true;
  }

  return false;
}

// 仕/士（Advisor）の移動判定
export function isValidAdvisorMove(
  state: XiangqiState,
  from: Position,
  to: Position,
  role: PlayerRole
): boolean {
  // 九宮内のみ
  if (!isInPalace(to, role)) return false;

  // 斜め1マスのみ
  const colDiff = Math.abs(to.col - from.col);
  const rowDiff = Math.abs(to.row - from.row);

  if (colDiff === 1 && rowDiff === 1) {
    return true;
  }

  return false;
}

// 相/象（Elephant）の移動判定
export function isValidElephantMove(
  state: XiangqiState,
  from: Position,
  to: Position,
  role: PlayerRole
): boolean {
  // 自陣のみ（川を渡れない）
  if (!isOnOwnSide(to, role)) return false;

  // 斜め2マス（田の字型）
  const colDiff = to.col - from.col;
  const rowDiff = to.row - from.row;

  if (Math.abs(colDiff) === 2 && Math.abs(rowDiff) === 2) {
    // 塞象眼チェック：中間マスに駒があったらNG
    const midCol = from.col + colDiff / 2;
    const midRow = from.row + rowDiff / 2;
    if (state.board[midRow][midCol] !== null) {
      return false; // 塞象眼
    }
    return true;
  }

  return false;
}

// 馬（Horse）の移動判定
export function isValidHorseMove(
  state: XiangqiState,
  from: Position,
  to: Position
): boolean {
  const colDiff = to.col - from.col;
  const rowDiff = to.row - from.row;

  // 日の字型：縦横1マス→斜め1マス
  // (±2, ±1) or (±1, ±2)
  if (
    (Math.abs(colDiff) === 2 && Math.abs(rowDiff) === 1) ||
    (Math.abs(colDiff) === 1 && Math.abs(rowDiff) === 2)
  ) {
    // 蹩馬腿チェック：最初の1マス目に駒があったらNG
    let blockCol = from.col;
    let blockRow = from.row;

    if (Math.abs(colDiff) === 2) {
      // 横に2マス移動する場合、横1マス目をチェック
      blockCol = from.col + (colDiff > 0 ? 1 : -1);
    } else {
      // 縦に2マス移動する場合、縦1マス目をチェック
      blockRow = from.row + (rowDiff > 0 ? 1 : -1);
    }

    if (state.board[blockRow][blockCol] !== null) {
      return false; // 蹩馬腿
    }
    return true;
  }

  return false;
}

// 車（Chariot）の移動判定
export function isValidChariotMove(
  state: XiangqiState,
  from: Position,
  to: Position
): boolean {
  // 縦横の直線移動
  if (from.col !== to.col && from.row !== to.row) {
    return false;
  }

  // 間に駒がないか
  if (hasPieceBetween(state, from, to)) {
    return false;
  }

  return true;
}

// 炮/砲（Cannon）の移動判定
export function isValidCannonMove(
  state: XiangqiState,
  from: Position,
  to: Position
): boolean {
  // 縦横の直線移動のみ
  if (from.col !== to.col && from.row !== to.row) {
    return false;
  }

  const targetPiece = state.board[to.row][to.col];
  const betweenCount = countPiecesBetween(state, from, to);

  if (targetPiece) {
    // 攻撃：必ず1つの駒を飛び越える
    return betweenCount === 1;
  } else {
    // 移動：間に駒がない
    return betweenCount === 0;
  }
}

// 兵/卒（Soldier）の移動判定
export function isValidSoldierMove(
  state: XiangqiState,
  from: Position,
  to: Position,
  role: PlayerRole,
  hasCrossedRiver: boolean
): boolean {
  const colDiff = to.col - from.col;
  const rowDiff = to.row - from.row;

  // 1マスのみ移動
  if (Math.abs(colDiff) + Math.abs(rowDiff) !== 1) {
    return false;
  }

  // 後退禁止
  if (role === 'red') {
    if (rowDiff < 0) return false; // 赤は下に戻れない
  } else {
    if (rowDiff > 0) return false; // 黒は上に戻れない
  }

  if (hasCrossedRiver) {
    // 川を渡った後：前・左・右OK
    return true;
  } else {
    // 川を渡る前：前のみ
    if (colDiff !== 0) return false; // 横移動NG
    return true;
  }
}

// 駒の移動が合法かチェック（総合）
export function isValidPieceMove(
  state: XiangqiState,
  from: Position,
  to: Position,
  pieceType: PieceType,
  role: PlayerRole,
  hasCrossedRiver: boolean
): boolean {
  switch (pieceType) {
    case 'king':
      return isValidKingMove(state, from, to, role);
    case 'advisor':
      return isValidAdvisorMove(state, from, to, role);
    case 'elephant':
      return isValidElephantMove(state, from, to, role);
    case 'horse':
      return isValidHorseMove(state, from, to);
    case 'chariot':
      return isValidChariotMove(state, from, to);
    case 'cannon':
      return isValidCannonMove(state, from, to);
    case 'soldier':
      return isValidSoldierMove(state, from, to, role, hasCrossedRiver);
    default:
      return false;
  }
}

// 指定駒の全合法手を取得
export function getAllValidMoves(
  state: XiangqiState,
  from: Position
): Position[] {
  const piece = state.board[from.row][from.col];
  if (!piece) return [];

  const validMoves: Position[] = [];

  // 全てのマスをチェック
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      const to: Position = { col, row };

      // 同じ位置はスキップ
      if (from.col === col && from.row === row) continue;

      // 移動先に自分の駒がある場合はスキップ
      const targetPiece = state.board[row][col];
      if (targetPiece && targetPiece.owner === piece.owner) continue;

      // 駒の移動ルールチェック
      if (isValidPieceMove(state, from, to, piece.type, piece.owner, piece.hasCrossedRiver)) {
        validMoves.push(to);
      }
    }
  }

  return validMoves;
}
