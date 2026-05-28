/**
 * 共通型定義
 */

// 2D座標
export type Coord2D = {
  x: number;
  y: number;
};

// 3D座標
export type Coord3D = {
  x: number;
  y: number;
  z: number;
};

// プレイヤーロール
export type PlayerRole = 'player1' | 'player2';

// ゲーム状態
export type GameStatus = 'waiting' | 'setup' | 'playing' | 'finished';

// ブランド型：GameId
export type GameId = string & { readonly __brand: 'GameId' };
export type PlayerId = string & { readonly __brand: 'PlayerId' };
