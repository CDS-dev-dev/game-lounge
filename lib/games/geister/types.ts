// ガイスターの型定義

export type PieceType = 'good' | 'bad';
export type PlayerRole = 'player1' | 'player2';
export type WinReason = 'escape' | 'captureAllGood' | 'loseAllBad';

export interface Position {
  x: number;
  y: number;
}

export interface GeisterPiece {
  id: string;
  type: PieceType; // good or bad
  position: Position;
  owner: PlayerRole;
  captured: boolean;
  escaped: boolean;
}

export type GameStatus = 'waiting' | 'setup' | 'playing' | 'finished';

export interface GeisterState {
  gameId: string;
  status: GameStatus;
  board: (GeisterPiece | null)[][];
  pieces: {
    player1: GeisterPiece[];
    player2: GeisterPiece[];
  };
  currentTurn: PlayerRole;
  players: {
    player1: string | null; // プレイヤーのID
    player2: string | null;
  };
  setupReady: {
    player1: boolean;
    player2: boolean;
  };
  winner: PlayerRole | null;
  winReason: WinReason | null;
  createdAt: number;
  updatedAt: number;
}

// クライアント用の駒情報（秘匿情報を隠す）
export interface GeisterClientPiece {
  id: string;
  owner: PlayerRole;
  position: Position;
  type?: PieceType; // 自分の駒のみtypeが見える
  captured: boolean;
  escaped: boolean;
}

export interface GeisterClientState {
  gameId: string;
  status: GameStatus;
  board: (GeisterClientPiece | null)[][]; // 視点変換済みの盤面
  currentTurn: PlayerRole;
  myRole: PlayerRole;
  myPlayerId: string;
  isMyTurn: boolean;
  canOperate: boolean; // 操作可能か
  myPieces: GeisterPiece[];
  opponentPiecesCount: {
    total: number;
    captured: number;
  };
  capturedCounts: {
    myGood: number;
    myBad: number;
    opponentGood: number;
    opponentBad: number;
  };
  setupReady: {
    player1: boolean;
    player2: boolean;
  };
  winner: PlayerRole | null;
  winReason: WinReason | null;
}

export interface PieceSetup {
  pieceId: string;
  position: Position;
  type: PieceType;
}

export interface MoveData {
  pieceId: string;
  to: Position;
}
