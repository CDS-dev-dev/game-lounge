// ガイスターの型定義

export type PieceColor = 'blue' | 'red';
export type PlayerRole = 'player1' | 'player2';
export type WinReason = 'escape' | 'captureBlue' | 'captureRed' | 'surrender';

export interface Position {
  x: number;
  y: number;
}

export interface GeisterPiece {
  id: string;
  color: PieceColor;
  position: Position;
  owner: PlayerRole;
  captured: boolean;
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

// クライアント用の状態（秘匿情報を隠す）
export interface GeisterClientPiece {
  id: string;
  owner: PlayerRole;
  position: Position;
  color?: PieceColor; // 自分の駒のみ色が見える
  captured: boolean;
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
  color: PieceColor;
}

export interface MoveData {
  pieceId: string;
  to: Position;
}
