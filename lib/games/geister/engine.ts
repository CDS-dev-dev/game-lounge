// ガイスターのゲームエンジン

import type {
  GeisterState,
  GeisterPiece,
  GeisterClientState,
  Position,
  PieceSetup,
  PlayerRole,
  PieceColor,
} from './types';
import {
  BOARD_SIZE,
  GOAL_POSITIONS,
  DIRECTIONS,
  PLAYER1_SETUP_ROWS,
  PLAYER2_SETUP_ROWS,
} from './constants';

// 空の盤面を作成
function createEmptyBoard(): (GeisterPiece | null)[][] {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));
}

// 初期状態作成（駒配置は各プレイヤーが後で設定）
export function createInitialState(): GeisterState {
  return {
    board: createEmptyBoard(),
    pieces: {
      player1: [],
      player2: [],
    },
    currentPlayer: 'player1',
    winner: null,
    winReason: null,
    isFinished: false,
    setupComplete: {
      player1: false,
      player2: false,
    },
  };
}

// 駒の初期配置を設定
export function setupPieces(
  state: GeisterState,
  player: PlayerRole,
  setup: PieceSetup[]
): GeisterState {
  // セットアップのバリデーション
  if (setup.length !== 8) {
    throw new Error('8個の駒を配置してください');
  }

  const blueCount = setup.filter((s) => s.color === 'blue').length;
  const redCount = setup.filter((s) => s.color === 'red').length;

  if (blueCount !== 4 || redCount !== 4) {
    throw new Error('青4個、赤4個を配置してください');
  }

  // 配置可能範囲の確認
  const allowedRows = player === 'player1' ? PLAYER1_SETUP_ROWS : PLAYER2_SETUP_ROWS;
  for (const s of setup) {
    if (!allowedRows.includes(s.position.y) || s.position.x < 0 || s.position.x >= BOARD_SIZE) {
      throw new Error('配置範囲外です');
    }
  }

  // 重複チェック
  const positions = setup.map((s) => `${s.position.x},${s.position.y}`);
  if (new Set(positions).size !== positions.length) {
    throw new Error('駒が重複しています');
  }

  // 駒を作成
  const pieces: GeisterPiece[] = setup.map((s) => ({
    id: s.pieceId,
    color: s.color,
    position: s.position,
    owner: player,
    captured: false,
  }));

  // 盤面に配置
  const newBoard = state.board.map((row) => row.slice());
  for (const piece of pieces) {
    newBoard[piece.position.y][piece.position.x] = piece;
  }

  return {
    ...state,
    board: newBoard,
    pieces: {
      ...state.pieces,
      [player]: pieces,
    },
    setupComplete: {
      ...state.setupComplete,
      [player]: true,
    },
  };
}

// 座標が盤面内かチェック
function isValidPosition(pos: Position): boolean {
  return pos.x >= 0 && pos.x < BOARD_SIZE && pos.y >= 0 && pos.y < BOARD_SIZE;
}

// 移動の検証
export function validateMove(state: GeisterState, pieceId: string, to: Position): boolean {
  // セットアップが完了しているか
  if (!state.setupComplete.player1 || !state.setupComplete.player2) {
    return false;
  }

  // ゲームが終了していないか
  if (state.isFinished) {
    return false;
  }

  // 駒を取得
  const piece = [...state.pieces.player1, ...state.pieces.player2].find((p) => p.id === pieceId);
  if (!piece) {
    return false;
  }

  // 自分の駒か
  if (piece.owner !== state.currentPlayer) {
    return false;
  }

  // 捕獲されていないか
  if (piece.captured) {
    return false;
  }

  // 移動先が盤面内か
  if (!isValidPosition(to)) {
    return false;
  }

  // 上下左右1マスの移動か
  const dx = to.x - piece.position.x;
  const dy = to.y - piece.position.y;
  const isOneStep = DIRECTIONS.some((dir) => dir.x === dx && dir.y === dy);
  if (!isOneStep) {
    return false;
  }

  // 移動先に自分の駒がないか
  const targetPiece = state.board[to.y][to.x];
  if (targetPiece && targetPiece.owner === piece.owner) {
    return false;
  }

  return true;
}

// 移動の適用
export function applyMove(state: GeisterState, pieceId: string, to: Position): GeisterState {
  const piece = [...state.pieces.player1, ...state.pieces.player2].find((p) => p.id === pieceId);
  if (!piece) {
    throw new Error('駒が見つかりません');
  }

  const newBoard = state.board.map((row) => row.slice());
  const newPieces = {
    player1: state.pieces.player1.map((p) => ({ ...p })),
    player2: state.pieces.player2.map((p) => ({ ...p })),
  };

  // 移動先に相手の駒がある場合は捕獲
  const targetPiece = state.board[to.y][to.x];
  if (targetPiece) {
    const targetPlayer = targetPiece.owner;
    const targetIndex = newPieces[targetPlayer].findIndex((p) => p.id === targetPiece.id);
    if (targetIndex !== -1) {
      newPieces[targetPlayer][targetIndex].captured = true;
    }
    newBoard[to.y][to.x] = null;
  }

  // 元の位置をクリア
  newBoard[piece.position.y][piece.position.x] = null;

  // 駒を移動
  const movedPiece = { ...piece, position: to };
  const playerPieces = newPieces[piece.owner];
  const pieceIndex = playerPieces.findIndex((p) => p.id === pieceId);
  if (pieceIndex !== -1) {
    playerPieces[pieceIndex] = movedPiece;
  }

  // 新しい位置に配置
  newBoard[to.y][to.x] = movedPiece;

  // ターン交代
  const nextPlayer = state.currentPlayer === 'player1' ? 'player2' : 'player1';

  const newState: GeisterState = {
    ...state,
    board: newBoard,
    pieces: newPieces,
    currentPlayer: nextPlayer,
  };

  // 勝者判定
  const winResult = checkWinner(newState);
  return {
    ...newState,
    winner: winResult.winner,
    winReason: winResult.reason,
    isFinished: winResult.winner !== null,
  };
}

// 勝者判定
export function checkWinner(state: GeisterState): {
  winner: PlayerRole | 'draw' | null;
  reason: 'escape' | 'captureBlue' | 'captureRed' | null;
} {
  // 1. 脱出勝ち: 青オバケがゴールに到達
  for (const goalPos of GOAL_POSITIONS) {
    const piece = state.board[goalPos.y][goalPos.x];
    if (piece && piece.color === 'blue' && !piece.captured) {
      return { winner: piece.owner, reason: 'escape' };
    }
  }

  // 2. 駒取り勝ち: 相手の青オバケ4個すべてを取る
  const player1BlueCount = state.pieces.player1.filter(
    (p) => p.color === 'blue' && !p.captured
  ).length;
  const player2BlueCount = state.pieces.player2.filter(
    (p) => p.color === 'blue' && !p.captured
  ).length;

  if (player1BlueCount === 0) {
    return { winner: 'player2', reason: 'captureBlue' };
  }
  if (player2BlueCount === 0) {
    return { winner: 'player1', reason: 'captureBlue' };
  }

  // 3. 押し付け勝ち: 自分の赤オバケ4個すべてを相手に取らせる
  const player1RedCount = state.pieces.player1.filter(
    (p) => p.color === 'red' && !p.captured
  ).length;
  const player2RedCount = state.pieces.player2.filter(
    (p) => p.color === 'red' && !p.captured
  ).length;

  if (player1RedCount === 0 && player1BlueCount > 0) {
    return { winner: 'player1', reason: 'captureRed' };
  }
  if (player2RedCount === 0 && player2BlueCount > 0) {
    return { winner: 'player2', reason: 'captureRed' };
  }

  return { winner: null, reason: null };
}

// クライアント用状態に変換（秘匿情報を隠す）
export function toClientState(
  state: GeisterState,
  playerId: PlayerRole
): GeisterClientState {
  const opponentId = playerId === 'player1' ? 'player2' : 'player1';

  // 盤面を変換（相手の駒の色を隠す）
  const clientBoard = state.board.map((row) =>
    row.map((piece) => {
      if (!piece) return null;
      return {
        id: piece.id,
        owner: piece.owner,
        position: piece.position,
        color: piece.owner === playerId ? piece.color : undefined, // 自分の駒のみ色が見える
        captured: piece.captured,
      };
    })
  );

  const opponentPieces = state.pieces[opponentId];
  const opponentCaptured = opponentPieces.filter((p) => p.captured).length;

  return {
    board: clientBoard,
    currentPlayer: state.currentPlayer,
    myRole: playerId,
    myPieces: state.pieces[playerId],
    opponentPiecesCount: {
      total: opponentPieces.length,
      captured: opponentCaptured,
    },
    winner: state.winner,
    winReason: state.winReason,
    isFinished: state.isFinished,
    setupComplete: state.setupComplete,
  };
}
