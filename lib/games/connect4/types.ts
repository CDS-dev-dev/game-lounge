// 立体四目並べの型定義

export type PlayerRole = 'player1' | 'player2';
export type GameStatus = 'waiting' | 'playing' | 'finished';

// 3次元座標
export interface Position3D {
  x: number; // 0-3
  y: number; // 0-3
  z: number; // 0-3（高さ）
}

// 駒
export interface Piece {
  id: string;
  owner: PlayerRole;
  position: Position3D;
}

// ゲーム状態
export interface Connect4State {
  gameId: string;
  status: GameStatus;
  board: (Piece | null)[][][]; // [z][y][x] 高さ×行×列
  pieces: {
    player1: Piece[];
    player2: Piece[];
  };
  currentTurn: PlayerRole;
  players: {
    player1: string | null; // プレイヤーID
    player2: string | null;
  };
  winner: PlayerRole | null;
  winningLine: Position3D[] | null; // 勝利ライン
  createdAt: number;
  updatedAt: number;
}

// クライアント用のゲーム状態
export interface Connect4ClientState {
  gameId: string;
  status: GameStatus;
  board: (Piece | null)[][][];
  currentTurn: PlayerRole;
  myRole: PlayerRole;
  myPlayerId: string;
  isMyTurn: boolean;
  canOperate: boolean;
  myPiecesCount: number;
  opponentPiecesCount: number;
  winner: PlayerRole | null;
  winningLine: Position3D[] | null;
}

// 勝利パターンの方向
export type Direction =
  | 'horizontal-x'  // x軸方向
  | 'horizontal-y'  // y軸方向
  | 'vertical'      // z軸方向（垂直）
  | 'diagonal-xy'   // xy平面の斜め
  | 'diagonal-xz'   // xz平面の斜め
  | 'diagonal-yz'   // yz平面の斜め
  | 'diagonal-3d';  // 3次元の斜め
