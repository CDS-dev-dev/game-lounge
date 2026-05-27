// 中国象棋（シャンチー）の型定義

// プレイヤーロール
export type PlayerRole = 'red' | 'black';

// 駒の種類
export type PieceType =
  | 'king'      // 帥/将
  | 'advisor'   // 仕/士
  | 'elephant'  // 相/象
  | 'horse'     // 馬
  | 'chariot'   // 車
  | 'cannon'    // 炮/砲
  | 'soldier';  // 兵/卒

// 座標（列a-i=0-8、行1-10=0-9）
export interface Position {
  col: number; // 0-8 (a-i)
  row: number; // 0-9 (1-10)
}

// 駒
export interface Piece {
  id: string;
  type: PieceType;
  owner: PlayerRole;
  position: Position;
  hasCrossedRiver: boolean; // 兵/卒が川を渡ったか
}

// 移動
export interface Move {
  from: Position;
  to: Position;
  capturedPiece?: Piece;
}

// ゲーム状態
export type GameStatus = 'waiting' | 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';

// ゲームステート
export interface XiangqiState {
  gameId: string;
  status: GameStatus;
  board: (Piece | null)[][]; // [row][col] 10x9
  pieces: {
    red: Piece[];
    black: Piece[];
  };
  currentTurn: PlayerRole;
  players: {
    red: string | null;
    black: string | null;
  };
  moveHistory: Move[];
  winner: PlayerRole | null;
  inCheck: PlayerRole | null; // どちらが王手されているか
  createdAt: number;
  updatedAt: number;
}

// クライアント用状態
export interface XiangqiClientState {
  gameId: string;
  status: GameStatus;
  board: (Piece | null)[][];
  currentTurn: PlayerRole;
  myRole: PlayerRole;
  myPlayerId: string;
  isMyTurn: boolean;
  canOperate: boolean;
  myPiecesCount: number;
  opponentPiecesCount: number;
  winner: PlayerRole | null;
  inCheck: PlayerRole | null;
  lastMove: Move | null;
}
