// 中国象棋（シャンチー）のゲームエンジン

import type {
  XiangqiState,
  XiangqiClientState,
  Piece,
  Position,
  PlayerRole,
  PieceType,
  Move,
} from './types';
import {
  BOARD_COLS,
  BOARD_ROWS,
  INITIAL_POSITIONS,
  PALACE_COLS,
  PALACE_ROWS_RED,
  PALACE_ROWS_BLACK,
  RIVER_ROW_TOP,
  RIVER_ROW_BOTTOM,
} from './constants';

// 空の盤面を作成
function createEmptyBoard(): (Piece | null)[][] {
  return Array(BOARD_ROWS)
    .fill(null)
    .map(() => Array(BOARD_COLS).fill(null));
}

// 初期状態を作成
export function createInitialState(gameId: string, redPlayerId: string): XiangqiState {
  const board = createEmptyBoard();
  const pieces: { red: Piece[]; black: Piece[] } = { red: [], black: [] };

  // 駒を配置
  for (const role of ['red', 'black'] as PlayerRole[]) {
    for (const [type, positions] of Object.entries(INITIAL_POSITIONS[role])) {
      for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        const piece: Piece = {
          id: `${role}-${type}-${i}`,
          type: type as PieceType,
          owner: role,
          position: pos,
          hasCrossedRiver: false,
        };
        board[pos.row][pos.col] = piece;
        pieces[role].push(piece);
      }
    }
  }

  return {
    gameId,
    status: 'waiting',
    board,
    pieces,
    currentTurn: 'red',
    players: {
      red: redPlayerId,
      black: null,
    },
    moveHistory: [],
    winner: null,
    inCheck: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// プレイヤー2が参加
export function joinBlackPlayer(state: XiangqiState, blackPlayerId: string): XiangqiState {
  if (state.players.black) {
    throw new Error('既に2人揃っています');
  }

  return {
    ...state,
    status: 'playing',
    players: {
      ...state.players,
      black: blackPlayerId,
    },
    updatedAt: Date.now(),
  };
}

// 位置が有効か
function isValidPosition(pos: Position): boolean {
  return pos.col >= 0 && pos.col < BOARD_COLS && pos.row >= 0 && pos.row < BOARD_ROWS;
}

// 九宮内か判定
function isInPalace(pos: Position, role: PlayerRole): boolean {
  const rows = role === 'red' ? PALACE_ROWS_RED : PALACE_ROWS_BLACK;
  return (
    pos.col >= PALACE_COLS.min &&
    pos.col <= PALACE_COLS.max &&
    pos.row >= rows.min &&
    pos.row <= rows.max
  );
}

// 川を渡っているか判定
function hasCrossedRiver(pos: Position, role: PlayerRole): boolean {
  if (role === 'red') {
    return pos.row >= RIVER_ROW_BOTTOM;
  } else {
    return pos.row <= RIVER_ROW_TOP;
  }
}

// 2つの位置間に何個の駒があるか（縦横のみ、炮用）
function countPiecesBetween(
  state: XiangqiState,
  from: Position,
  to: Position
): number {
  let count = 0;

  // 同じ列（縦移動）
  if (from.col === to.col) {
    const minRow = Math.min(from.row, to.row);
    const maxRow = Math.max(from.row, to.row);
    for (let row = minRow + 1; row < maxRow; row++) {
      if (state.board[row][from.col] !== null) {
        count++;
      }
    }
  }
  // 同じ行（横移動）
  else if (from.row === to.row) {
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

// 王が対面しているかチェック
function areKingsFacing(state: XiangqiState): boolean {
  // 両方の王を見つける
  let redKing: Position | null = null;
  let blackKing: Position | null = null;

  for (const piece of state.pieces.red) {
    if (piece.type === 'king') {
      redKing = piece.position;
      break;
    }
  }

  for (const piece of state.pieces.black) {
    if (piece.type === 'king') {
      blackKing = piece.position;
      break;
    }
  }

  if (!redKing || !blackKing) return false;

  // 同じ列にいるか
  if (redKing.col !== blackKing.col) return false;

  // 間に駒があるかチェック
  const between = countPiecesBetween(state, redKing, blackKing);
  return between === 0;
}

// 駒の移動が合法かチェック（詳細ルールは別ファイルで実装予定）
export function isValidMove(
  state: XiangqiState,
  playerId: string,
  from: Position,
  to: Position
): boolean {
  // 基本チェック
  if (!isValidPosition(from) || !isValidPosition(to)) return false;
  if (from.col === to.col && from.row === to.row) return false;

  const piece = state.board[from.row][from.col];
  if (!piece) return false;

  // プレイヤー確認
  const role: PlayerRole | null =
    state.players.red === playerId
      ? 'red'
      : state.players.black === playerId
      ? 'black'
      : null;
  if (!role || piece.owner !== role) return false;

  // ターン確認
  if (state.currentTurn !== role) return false;

  // 移動先に自分の駒がないか
  const targetPiece = state.board[to.row][to.col];
  if (targetPiece && targetPiece.owner === role) return false;

  // 各駒の移動ルール詳細チェック
  const { isValidPieceMove } = require('./piece-rules');
  return isValidPieceMove(state, from, to, piece.type, role, piece.hasCrossedRiver);
}

// 駒を移動
export function movePiece(
  state: XiangqiState,
  playerId: string,
  from: Position,
  to: Position
): XiangqiState {
  const piece = state.board[from.row][from.col];

  if (!isValidMove(state, playerId, from, to)) {
    // より詳細なエラーメッセージ
    if (!piece) {
      throw new Error('その位置に駒がありません');
    }

    const role: PlayerRole | null =
      state.players.red === playerId ? 'red' : state.players.black === playerId ? 'black' : null;

    if (role && state.currentTurn !== role) {
      throw new Error('あなたのターンではありません');
    }

    if (role && piece.owner !== role) {
      throw new Error('相手の駒は動かせません');
    }

    const targetPiece = state.board[to.row][to.col];
    if (targetPiece && targetPiece.owner === role) {
      throw new Error('自分の駒がいる場所には移動できません');
    }

    throw new Error('その駒はそこには移動できません');
  }

  if (!piece) {
    throw new Error('その位置に駒がありません');
  }

  const capturedPiece = state.board[to.row][to.col];

  // 盤面更新
  const newBoard = state.board.map((row) => [...row]);
  newBoard[from.row][from.col] = null;
  newBoard[to.row][to.col] = { ...piece, position: to };

  // 兵/卒の川渡りチェック
  const crossed = hasCrossedRiver(to, piece.owner);
  if (piece.type === 'soldier' && crossed && !piece.hasCrossedRiver) {
    newBoard[to.row][to.col]!.hasCrossedRiver = true;
  }

  // 駒リスト更新
  const newPieces = {
    red: state.pieces.red.map((p) =>
      p.id === piece.id ? { ...p, position: to, hasCrossedRiver: crossed } : p
    ),
    black: state.pieces.black.map((p) =>
      p.id === piece.id ? { ...p, position: to, hasCrossedRiver: crossed } : p
    ),
  };

  // 捕獲された駒を削除
  if (capturedPiece) {
    newPieces[capturedPiece.owner] = newPieces[capturedPiece.owner].filter(
      (p) => p.id !== capturedPiece.id
    );
  }

  // 移動履歴
  const move: Move = { from, to, capturedPiece: capturedPiece || undefined };
  const newHistory = [...state.moveHistory, move];

  // ターン交代
  const nextTurn: PlayerRole = state.currentTurn === 'red' ? 'black' : 'red';

  const newState: XiangqiState = {
    ...state,
    board: newBoard,
    pieces: newPieces,
    currentTurn: nextTurn,
    moveHistory: newHistory,
    updatedAt: Date.now(),
  };

  // 王対面チェック
  if (areKingsFacing(newState)) {
    throw new Error('王を対面させることはできません');
  }

  return newState;
}

// 勝敗判定
export function checkWinner(state: XiangqiState): {
  winner: PlayerRole | null;
  status: 'checkmate' | 'stalemate' | null;
} {
  // 王が取られたかチェック
  const redHasKing = state.pieces.red.some((p) => p.type === 'king');
  const blackHasKing = state.pieces.black.some((p) => p.type === 'king');

  if (!redHasKing) {
    return { winner: 'black', status: 'checkmate' };
  }
  if (!blackHasKing) {
    return { winner: 'red', status: 'checkmate' };
  }

  // TODO: 詰み判定、ステイルメイト判定（合法手なし）

  return { winner: null, status: null };
}

// ゲーム終了
export function finishGame(
  state: XiangqiState,
  winner: PlayerRole | null
): XiangqiState {
  return {
    ...state,
    status: winner ? 'checkmate' : 'draw',
    winner,
    updatedAt: Date.now(),
  };
}

// クライアント用状態に変換
export function toClientState(
  state: XiangqiState,
  playerId: string
): XiangqiClientState {
  const myRole: PlayerRole | null =
    state.players.red === playerId
      ? 'red'
      : state.players.black === playerId
      ? 'black'
      : null;

  if (!myRole) {
    throw new Error('このゲームの参加者ではありません');
  }

  const opponentRole: PlayerRole = myRole === 'red' ? 'black' : 'red';
  const isMyTurn = state.currentTurn === myRole;
  const canOperate = state.status === 'playing' && isMyTurn;

  return {
    gameId: state.gameId,
    status: state.status,
    board: state.board,
    currentTurn: state.currentTurn,
    myRole,
    myPlayerId: playerId,
    isMyTurn,
    canOperate,
    myPiecesCount: state.pieces[myRole].length,
    opponentPiecesCount: state.pieces[opponentRole].length,
    winner: state.winner,
    inCheck: state.inCheck,
    lastMove: state.moveHistory[state.moveHistory.length - 1] || null,
  };
}

// 指定駒の合法手を取得
export function getValidMoves(
  state: XiangqiState,
  playerId: string,
  pieceId: string
): Position[] {
  const piece = [...state.pieces.red, ...state.pieces.black].find((p) => p.id === pieceId);
  if (!piece) return [];

  // プレイヤー確認
  const role: PlayerRole | null =
    state.players.red === playerId ? 'red' : state.players.black === playerId ? 'black' : null;
  if (!role || piece.owner !== role || state.currentTurn !== role) return [];

  const { getAllValidMoves } = require('./piece-rules');
  return getAllValidMoves(state, piece.position);
}
