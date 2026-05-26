// ガイスターのゲームエンジン（完全作り直し版）

import type {
  GeisterState,
  GeisterPiece,
  GeisterClientState,
  Position,
  PieceSetup,
  PlayerRole,
  PieceType,
} from './types';
import {
  BOARD_SIZE,
  DIRECTIONS,
  PLAYER1_SETUP_ROWS,
  PLAYER2_SETUP_ROWS,
  SETUP_COLS,
  PLAYER1_ESCAPE_POSITIONS,
  PLAYER2_ESCAPE_POSITIONS,
  GOOD_PIECES_COUNT,
  BAD_PIECES_COUNT,
} from './constants';

// 空の盤面を作成
function createEmptyBoard(): (GeisterPiece | null)[][] {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));
}

// pieces配列からboardを生成
function generateBoard(pieces: GeisterPiece[]): (GeisterPiece | null)[][] {
  const board = createEmptyBoard();
  for (const piece of pieces) {
    if (!piece.captured && !piece.escaped) {
      board[piece.position.y][piece.position.x] = piece;
    }
  }
  return board;
}

// 初期状態作成
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

  const goodCount = setup.filter((s) => s.type === 'good').length;
  const badCount = setup.filter((s) => s.type === 'bad').length;

  if (goodCount !== GOOD_PIECES_COUNT || badCount !== BAD_PIECES_COUNT) {
    throw new Error('good 4個、bad 4個を配置してください');
  }

  // 配置可能範囲の確認
  const allowedRows = player === 'player1' ? PLAYER1_SETUP_ROWS : PLAYER2_SETUP_ROWS;
  for (const s of setup) {
    if (!allowedRows.includes(s.position.y) || !SETUP_COLS.includes(s.position.x)) {
      throw new Error('配置範囲外です（中央4列×2行に配置）');
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
    type: s.type,
    position: s.position,
    owner: player,
    captured: false,
    escaped: false,
  }));

  const newPieces = {
    ...state.pieces,
    [player]: pieces,
  };

  const allPieces = [...newPieces.player1, ...newPieces.player2];
  const newBoard = generateBoard(allPieces);

  return {
    ...state,
    board: newBoard,
    pieces: newPieces,
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

// 脱出口かどうかチェック
function isEscapePosition(pos: Position, player: PlayerRole): boolean {
  const escapePositions =
    player === 'player1' ? PLAYER1_ESCAPE_POSITIONS : PLAYER2_ESCAPE_POSITIONS;
  return escapePositions.some((ep) => ep.x === pos.x && ep.y === pos.y);
}

// 駒が移動可能かチェック
export function canMovePiece(
  state: GeisterState,
  pieceId: string,
  to: Position
): boolean {
  // セットアップが完了しているか
  if (!state.setupComplete.player1 || !state.setupComplete.player2) {
    return false;
  }

  // ゲームが終了していないか
  if (state.isFinished) {
    return false;
  }

  // 駒を取得
  const allPieces = [...state.pieces.player1, ...state.pieces.player2];
  const piece = allPieces.find((p) => p.id === pieceId);
  if (!piece) {
    return false;
  }

  // 自分の駒か
  if (piece.owner !== state.currentPlayer) {
    return false;
  }

  // 捕獲または脱出済みでないか
  if (piece.captured || piece.escaped) {
    return false;
  }

  // 移動先が盤面内か、または脱出口か
  const isWithinBoard = isValidPosition(to);
  const isEscape = isEscapePosition(piece.position, piece.owner);

  // 脱出口にいる場合、脱出方向への移動（盤外）を許可
  if (isEscape && piece.type === 'good') {
    const dy = to.y - piece.position.y;
    const dx = to.x - piece.position.x;

    // 脱出方向の判定
    if (piece.owner === 'player1') {
      // player1は下方向（y+1）への脱出
      if (dy === 1 && dx === 0 && to.y === BOARD_SIZE) {
        return true;
      }
    } else {
      // player2は上方向（y-1）への脱出
      if (dy === -1 && dx === 0 && to.y === -1) {
        return true;
      }
    }
  }

  if (!isWithinBoard) {
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

// 駒を移動
export function movePiece(
  state: GeisterState,
  pieceId: string,
  to: Position
): GeisterState {
  if (!canMovePiece(state, pieceId, to)) {
    throw new Error('無効な移動です');
  }

  const allPieces = [...state.pieces.player1, ...state.pieces.player2];
  const piece = allPieces.find((p) => p.id === pieceId);
  if (!piece) {
    throw new Error('駒が見つかりません');
  }

  const newPieces = {
    player1: state.pieces.player1.map((p) => ({ ...p })),
    player2: state.pieces.player2.map((p) => ({ ...p })),
  };

  // 脱出判定（盤外への移動）
  if (!isValidPosition(to)) {
    const pieceIndex = newPieces[piece.owner].findIndex((p) => p.id === pieceId);
    if (pieceIndex !== -1) {
      newPieces[piece.owner][pieceIndex].escaped = true;
    }

    const allNewPieces = [...newPieces.player1, ...newPieces.player2];
    const newBoard = generateBoard(allNewPieces);

    const newState: GeisterState = {
      ...state,
      board: newBoard,
      pieces: newPieces,
    };

    // 勝者判定
    const winResult = checkWinner(newState);
    if (winResult.winner) {
      return {
        ...newState,
        winner: winResult.winner,
        winReason: winResult.reason,
        isFinished: true,
      };
    }

    // ターン交代
    return switchTurn(newState);
  }

  // 移動先に相手の駒がある場合は捕獲
  const targetPiece = state.board[to.y][to.x];
  if (targetPiece) {
    const targetPlayer = targetPiece.owner;
    const targetIndex = newPieces[targetPlayer].findIndex((p) => p.id === targetPiece.id);
    if (targetIndex !== -1) {
      newPieces[targetPlayer][targetIndex].captured = true;
    }
  }

  // 駒を移動
  const pieceIndex = newPieces[piece.owner].findIndex((p) => p.id === pieceId);
  if (pieceIndex !== -1) {
    newPieces[piece.owner][pieceIndex].position = to;
  }

  const allNewPieces = [...newPieces.player1, ...newPieces.player2];
  const newBoard = generateBoard(allNewPieces);

  const newState: GeisterState = {
    ...state,
    board: newBoard,
    pieces: newPieces,
  };

  // 勝者判定
  const winResult = checkWinner(newState);
  if (winResult.winner) {
    return {
      ...newState,
      winner: winResult.winner,
      winReason: winResult.reason,
      isFinished: true,
    };
  }

  // ターン交代
  return switchTurn(newState);
}

// ターン交代
function switchTurn(state: GeisterState): GeisterState {
  return {
    ...state,
    currentPlayer: state.currentPlayer === 'player1' ? 'player2' : 'player1',
  };
}

// 勝者判定
export function checkWinner(state: GeisterState): {
  winner: PlayerRole | null;
  reason: 'escape' | 'captureAllGood' | 'loseAllBad' | null;
} {
  // 1. 脱出勝ち: good駒が脱出した
  for (const player of ['player1', 'player2'] as PlayerRole[]) {
    const escapedGood = state.pieces[player].some((p) => p.type === 'good' && p.escaped);
    if (escapedGood) {
      return { winner: player, reason: 'escape' };
    }
  }

  // 2. 相手のgood駒を4個すべて取ったら勝ち
  const player1GoodRemaining = state.pieces.player1.filter(
    (p) => p.type === 'good' && !p.captured && !p.escaped
  ).length;
  const player2GoodRemaining = state.pieces.player2.filter(
    (p) => p.type === 'good' && !p.captured && !p.escaped
  ).length;

  if (player1GoodRemaining === 0) {
    return { winner: 'player2', reason: 'captureAllGood' };
  }
  if (player2GoodRemaining === 0) {
    return { winner: 'player1', reason: 'captureAllGood' };
  }

  // 3. 自分のbad駒を4個すべて相手に取らせたら勝ち
  const player1BadCaptured = state.pieces.player1.filter(
    (p) => p.type === 'bad' && p.captured
  ).length;
  const player2BadCaptured = state.pieces.player2.filter(
    (p) => p.type === 'bad' && p.captured
  ).length;

  if (player1BadCaptured === BAD_PIECES_COUNT) {
    return { winner: 'player1', reason: 'loseAllBad' };
  }
  if (player2BadCaptured === BAD_PIECES_COUNT) {
    return { winner: 'player2', reason: 'loseAllBad' };
  }

  return { winner: null, reason: null };
}

// クライアント用状態に変換（秘匿情報を隠す）
export function toClientState(
  state: GeisterState,
  playerId: PlayerRole
): GeisterClientState {
  const opponentId = playerId === 'player1' ? 'player2' : 'player1';

  // 盤面を変換（相手の駒のtypeを隠す）
  const clientBoard = state.board.map((row) =>
    row.map((piece) => {
      if (!piece) return null;
      return {
        id: piece.id,
        owner: piece.owner,
        position: piece.position,
        type: piece.owner === playerId ? piece.type : undefined, // 自分の駒のみtypeが見える
        captured: piece.captured,
        escaped: piece.escaped,
      };
    })
  );

  const opponentPieces = state.pieces[opponentId];
  const opponentCaptured = opponentPieces.filter((p) => p.captured).length;

  // 捕獲されたgood/badの数を計算
  const myCapturedGood = state.pieces[playerId].filter(
    (p) => p.type === 'good' && p.captured
  ).length;
  const myCapturedBad = state.pieces[playerId].filter((p) => p.type === 'bad' && p.captured)
    .length;
  const opponentCapturedGood = opponentPieces.filter(
    (p) => p.type === 'good' && p.captured
  ).length;
  const opponentCapturedBad = opponentPieces.filter((p) => p.type === 'bad' && p.captured)
    .length;

  return {
    board: clientBoard,
    currentPlayer: state.currentPlayer,
    myRole: playerId,
    myPieces: state.pieces[playerId],
    opponentPiecesCount: {
      total: opponentPieces.length,
      captured: opponentCaptured,
    },
    capturedCounts: {
      myGood: myCapturedGood,
      myBad: myCapturedBad,
      opponentGood: opponentCapturedGood,
      opponentBad: opponentCapturedBad,
    },
    winner: state.winner,
    winReason: state.winReason,
    isFinished: state.isFinished,
    setupComplete: state.setupComplete,
  };
}

// 移動可能な位置を取得
export function getValidMoves(state: GeisterState, pieceId: string): Position[] {
  const validMoves: Position[] = [];

  const allPieces = [...state.pieces.player1, ...state.pieces.player2];
  const piece = allPieces.find((p) => p.id === pieceId);
  if (!piece) return validMoves;

  // 通常の上下左右移動
  for (const dir of DIRECTIONS) {
    const newPos = {
      x: piece.position.x + dir.x,
      y: piece.position.y + dir.y,
    };

    if (canMovePiece(state, pieceId, newPos)) {
      validMoves.push(newPos);
    }
  }

  // 脱出判定
  if (
    piece.type === 'good' &&
    isEscapePosition(piece.position, piece.owner)
  ) {
    if (piece.owner === 'player1') {
      const escapePos = { x: piece.position.x, y: BOARD_SIZE };
      if (canMovePiece(state, pieceId, escapePos)) {
        validMoves.push(escapePos);
      }
    } else {
      const escapePos = { x: piece.position.x, y: -1 };
      if (canMovePiece(state, pieceId, escapePos)) {
        validMoves.push(escapePos);
      }
    }
  }

  return validMoves;
}
