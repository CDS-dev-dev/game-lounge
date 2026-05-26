// ガイスターの定数定義

import type { Position } from './types';

// 盤面サイズ
export const BOARD_SIZE = 6;

// ゴール座標（盤面四隅）
export const GOAL_POSITIONS: Position[] = [
  { x: 0, y: 0 }, // 左上
  { x: 5, y: 0 }, // 右上
  { x: 0, y: 5 }, // 左下
  { x: 5, y: 5 }, // 右下
];

// 移動方向（上下左右）
export const DIRECTIONS: Position[] = [
  { x: 0, y: -1 }, // 上
  { x: 0, y: 1 },  // 下
  { x: -1, y: 0 }, // 左
  { x: 1, y: 0 },  // 右
];

// 初期配置可能範囲
export const PLAYER1_SETUP_ROWS = [0, 1]; // プレイヤー1は上側2行
export const PLAYER2_SETUP_ROWS = [4, 5]; // プレイヤー2は下側2行

// 駒の数
export const PIECES_PER_PLAYER = 8;
export const BLUE_PIECES_COUNT = 4;
export const RED_PIECES_COUNT = 4;

// タイマー設定（秒）
export const TIME_LIMIT = 300; // 5分
