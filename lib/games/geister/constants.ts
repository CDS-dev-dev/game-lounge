// ガイスターの定数定義

import type { Position } from './types';

// 盤面サイズ
export const BOARD_SIZE = 6;

// 移動方向（上下左右のみ）
export const DIRECTIONS: Position[] = [
  { x: 0, y: -1 }, // 上
  { x: 0, y: 1 },  // 下
  { x: -1, y: 0 }, // 左
  { x: 1, y: 0 },  // 右
];

// 初期配置可能範囲（中央4列×2行）
export const PLAYER1_SETUP_ROWS = [0, 1]; // プレイヤー1は上側2行
export const PLAYER2_SETUP_ROWS = [4, 5]; // プレイヤー2は下側2行
export const SETUP_COLS = [1, 2, 3, 4]; // 中央4列（0,5は端なので配置不可）

// 脱出口（各プレイヤーから見て相手陣奥側の左右端）
// プレイヤー1の脱出口：下側の左右端
export const PLAYER1_ESCAPE_POSITIONS: Position[] = [
  { x: 0, y: 5 }, // 左下
  { x: 5, y: 5 }, // 右下
];

// プレイヤー2の脱出口：上側の左右端
export const PLAYER2_ESCAPE_POSITIONS: Position[] = [
  { x: 0, y: 0 }, // 左上
  { x: 5, y: 0 }, // 右上
];

// 駒の数
export const PIECES_PER_PLAYER = 8;
export const GOOD_PIECES_COUNT = 4;
export const BAD_PIECES_COUNT = 4;

// タイマー設定（秒）
export const TIME_LIMIT = 300; // 5分
