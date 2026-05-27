// 中国象棋（シャンチー）の定数

import type { PieceType, PlayerRole, Position } from './types';

// ボードサイズ
export const BOARD_COLS = 9; // a-i
export const BOARD_ROWS = 10; // 1-10

// 楚河漢界（川）
export const RIVER_ROW_TOP = 4; // 4行目と5行目の間
export const RIVER_ROW_BOTTOM = 5;

// 九宮（王宮）の範囲
export const PALACE_COLS = { min: 3, max: 5 }; // d-f
export const PALACE_ROWS_RED = { min: 0, max: 2 }; // 1-3行
export const PALACE_ROWS_BLACK = { min: 7, max: 9 }; // 8-10行

// プレイヤーカラー
export const PLAYER_COLORS = {
  red: {
    primary: 'bg-red-600',
    hover: 'hover:bg-red-500',
    text: 'text-red-600',
    border: 'border-red-600',
    name: '紅（赤）',
  },
  black: {
    primary: 'bg-slate-800',
    hover: 'hover:bg-slate-700',
    text: 'text-slate-800',
    border: 'border-slate-800',
    name: '黒',
  },
} as const;

// 駒の表示名（簡体字）
export const PIECE_NAMES: Record<PlayerRole, Record<PieceType, string>> = {
  red: {
    king: '帥',      // Shuai
    advisor: '仕',   // Shi
    elephant: '相',  // Xiang
    horse: '馬',     // Ma
    chariot: '車',   // Ju
    cannon: '炮',    // Pao
    soldier: '兵',   // Bing
  },
  black: {
    king: '将',      // Jiang
    advisor: '士',   // Shi
    elephant: '象',  // Xiang
    horse: '馬',     // Ma
    chariot: '車',   // Ju
    cannon: '砲',    // Pao
    soldier: '卒',   // Zu
  },
};

// 駒の初期配置
export const INITIAL_POSITIONS: Record<PlayerRole, Record<PieceType, Position[]>> = {
  red: {
    king: [{ col: 4, row: 0 }], // e1
    advisor: [
      { col: 3, row: 0 }, // d1
      { col: 5, row: 0 }, // f1
    ],
    elephant: [
      { col: 2, row: 0 }, // c1
      { col: 6, row: 0 }, // g1
    ],
    horse: [
      { col: 1, row: 0 }, // b1
      { col: 7, row: 0 }, // h1
    ],
    chariot: [
      { col: 0, row: 0 }, // a1
      { col: 8, row: 0 }, // i1
    ],
    cannon: [
      { col: 1, row: 2 }, // b3
      { col: 7, row: 2 }, // h3
    ],
    soldier: [
      { col: 0, row: 3 }, // a4
      { col: 2, row: 3 }, // c4
      { col: 4, row: 3 }, // e4
      { col: 6, row: 3 }, // g4
      { col: 8, row: 3 }, // i4
    ],
  },
  black: {
    king: [{ col: 4, row: 9 }], // e10
    advisor: [
      { col: 3, row: 9 }, // d10
      { col: 5, row: 9 }, // f10
    ],
    elephant: [
      { col: 2, row: 9 }, // c10
      { col: 6, row: 9 }, // g10
    ],
    horse: [
      { col: 1, row: 9 }, // b10
      { col: 7, row: 9 }, // h10
    ],
    chariot: [
      { col: 0, row: 9 }, // a10
      { col: 8, row: 9 }, // i10
    ],
    cannon: [
      { col: 1, row: 7 }, // b8
      { col: 7, row: 7 }, // h8
    ],
    soldier: [
      { col: 0, row: 6 }, // a7
      { col: 2, row: 6 }, // c7
      { col: 4, row: 6 }, // e7
      { col: 6, row: 6 }, // g7
      { col: 8, row: 6 }, // i7
    ],
  },
};

// 駒の価値（AI評価用）
export const PIECE_VALUES: Record<PieceType, number> = {
  king: 10000,
  advisor: 200,
  elephant: 200,
  horse: 400,
  chariot: 900,
  cannon: 450,
  soldier: 100, // 渡河後は200
};

// 座標をチェス記法に変換
export function positionToNotation(pos: Position): string {
  const col = String.fromCharCode(97 + pos.col); // a-i
  const row = pos.row + 1; // 1-10
  return `${col}${row}`;
}

// チェス記法を座標に変換
export function notationToPosition(notation: string): Position | null {
  if (notation.length < 2) return null;
  const col = notation.charCodeAt(0) - 97; // a-i -> 0-8
  const row = parseInt(notation.slice(1)) - 1; // 1-10 -> 0-9
  if (col < 0 || col >= BOARD_COLS || row < 0 || row >= BOARD_ROWS) {
    return null;
  }
  return { col, row };
}
