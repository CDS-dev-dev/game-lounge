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

export interface GeisterState {
  board: (GeisterPiece | null)[][];
  pieces: {
    player1: GeisterPiece[];
    player2: GeisterPiece[];
  };
  currentPlayer: PlayerRole;
  winner: PlayerRole | 'draw' | null;
  winReason: WinReason | null;
  isFinished: boolean;
  setupComplete: {
    player1: boolean;
    player2: boolean;
  };
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
  board: (GeisterClientPiece | null)[][];
  currentPlayer: PlayerRole;
  myRole: PlayerRole;
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
  winner: PlayerRole | 'draw' | null;
  winReason: WinReason | null;
  isFinished: boolean;
  setupComplete: {
    player1: boolean;
    player2: boolean;
  };
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
