// ガイスターのゲームエンジン（オンライン対戦版）

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

// 視点変換：player2から見た場合、盤面を180度回転
function rotateBoardForPlayer2(board: (GeisterPiece | null)[][]): (GeisterPiece | null)[][] {
  const rotated = createEmptyBoard();
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const piece = board[y][x];
      if (piece) {
        // 座標を180度回転
        const newY = BOARD_SIZE - 1 - y;
        const newX = BOARD_SIZE - 1 - x;
        rotated[newY][newX] = {
          ...piece,
          position: { x: newX, y: newY },
        };
      }
    }
  }
  return rotated;
}

// 初期状態作成
export function createInitialState(gameId: string, player1Id: string): GeisterState {
  return {
    gameId,
    status: 'setup',
    board: createEmptyBoard(),
    pieces: {
      player1: [],
      player2: [],
    },
    currentTurn: 'player1',
    players: {
      player1: player1Id,
      player2: null,
    },
    setupReady: {
      player1: false,
      player2: false,
    },
    winner: null,
    winReason: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// プレイヤー2が参加
export function joinPlayer2(state: GeisterState, player2Id: string): GeisterState {
  if (state.players.player2) {
    throw new Error('既に2人揃っています');
  }

  return {
    ...state,
    players: {
      ...state.players,
      player2: player2Id,
    },
    updatedAt: Date.now(),
  };
}

// 駒の初期配置を設定
export function setupPieces(
  state: GeisterState,
  playerId: string,
  setup: PieceSetup[]
): GeisterState {
  // プレイヤーのロール判定
  const playerRole: PlayerRole | null =
    state.players.player1 === playerId
      ? 'player1'
      : state.players.player2 === playerId
      ? 'player2'
      : null;

  if (!playerRole) {
    throw new Error('このゲームの参加者ではありません');
  }

  if (state.setupReady[playerRole]) {
    throw new Error('既に配置完了しています');
  }

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
  const allowedRows = playerRole === 'player1' ? PLAYER1_SETUP_ROWS : PLAYER2_SETUP_ROWS;
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
    owner: playerRole,
    captured: false,
    escaped: false,
  }));

  const newPieces = {
    ...state.pieces,
    [playerRole]: pieces,
  };

  const allPieces = [...newPieces.player1, ...newPieces.player2];
  const newBoard = generateBoard(allPieces);

  const newSetupReady = {
    ...state.setupReady,
    [playerRole]: true,
  };

  // 両者が配置完了したらゲーム開始
  const newStatus =
    newSetupReady.player1 && newSetupReady.player2 ? 'playing' : 'setup';

  return {
    ...state,
    board: newBoard,
    pieces: newPieces,
    setupReady: newSetupReady,
    status: newStatus,
    updatedAt: Date.now(),
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
  playerId: string,
  pieceId: string,
  to: Position
): boolean {
  // ゲームが進行中か
  if (state.status !== 'playing') {
    return false;
  }

  // プレイヤーのロール判定
  const playerRole: PlayerRole | null =
    state.players.player1 === playerId
      ? 'player1'
      : state.players.player2 === playerId
      ? 'player2'
      : null;

  if (!playerRole) {
    return false;
  }

  // 自分のターンか
  if (state.currentTurn !== playerRole) {
    return false;
  }

  // 駒を取得
  const allPieces = [...state.pieces.player1, ...state.pieces.player2];
  const piece = allPieces.find((p) => p.id === pieceId);
  if (!piece) {
    return false;
  }

  // 自分の駒か
  if (piece.owner !== playerRole) {
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
  playerId: string,
  pieceId: string,
  to: Position
): GeisterState {
  if (!canMovePiece(state, playerId, pieceId, to)) {
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
      updatedAt: Date.now(),
    };

    // 勝者判定
    const winResult = checkWinner(newState);
    if (winResult.winner) {
      return {
        ...newState,
        winner: winResult.winner,
        winReason: winResult.reason,
        status: 'finished',
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
    updatedAt: Date.now(),
  };

  // 勝者判定
  const winResult = checkWinner(newState);
  if (winResult.winner) {
    return {
      ...newState,
      winner: winResult.winner,
      winReason: winResult.reason,
      status: 'finished',
    };
  }

  // ターン交代
  return switchTurn(newState);
}

// ターン交代
function switchTurn(state: GeisterState): GeisterState {
  return {
    ...state,
    currentTurn: state.currentTurn === 'player1' ? 'player2' : 'player1',
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

// クライアント用状態に変換（秘匿情報を隠す＋視点変換）
export function toClientState(
  state: GeisterState,
  playerId: string
): GeisterClientState {
  // プレイヤーのロール判定
  const myRole: PlayerRole | null =
    state.players.player1 === playerId
      ? 'player1'
      : state.players.player2 === playerId
      ? 'player2'
      : null;

  if (!myRole) {
    throw new Error('このゲームの参加者ではありません');
  }

  const opponentRole = myRole === 'player1' ? 'player2' : 'player1';

  // 盤面を視点変換
  let viewBoard = state.board;
  if (myRole === 'player2') {
    viewBoard = rotateBoardForPlayer2(state.board);
  }

  // 盤面を変換（相手の駒のtypeを隠す）
  const clientBoard = viewBoard.map((row) =>
    row.map((piece) => {
      if (!piece) return null;
      return {
        id: piece.id,
        owner: piece.owner,
        position: piece.position,
        type: piece.owner === myRole ? piece.type : undefined,
        captured: piece.captured,
        escaped: piece.escaped,
      };
    })
  );

  const opponentPieces = state.pieces[opponentRole];
  const opponentCaptured = opponentPieces.filter((p) => p.captured).length;

  const myCapturedGood = state.pieces[myRole].filter(
    (p) => p.type === 'good' && p.captured
  ).length;
  const myCapturedBad = state.pieces[myRole].filter((p) => p.type === 'bad' && p.captured)
    .length;
  const opponentCapturedGood = opponentPieces.filter(
    (p) => p.type === 'good' && p.captured
  ).length;
  const opponentCapturedBad = opponentPieces.filter((p) => p.type === 'bad' && p.captured)
    .length;

  const isMyTurn = state.currentTurn === myRole;
  const canOperate = state.status === 'playing' && isMyTurn;

  return {
    gameId: state.gameId,
    status: state.status,
    board: clientBoard,
    currentTurn: state.currentTurn,
    myRole,
    myPlayerId: playerId,
    isMyTurn,
    canOperate,
    myPieces: state.pieces[myRole],
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
    setupReady: state.setupReady,
    winner: state.winner,
    winReason: state.winReason,
  };
}

// 移動可能な位置を取得（視点変換考慮）
export function getValidMoves(
  state: GeisterState,
  playerId: string,
  pieceId: string
): Position[] {
  const validMoves: Position[] = [];

  // プレイヤーのロール判定
  const myRole: PlayerRole | null =
    state.players.player1 === playerId
      ? 'player1'
      : state.players.player2 === playerId
      ? 'player2'
      : null;

  if (!myRole) return validMoves;

  const allPieces = [...state.pieces.player1, ...state.pieces.player2];
  const piece = allPieces.find((p) => p.id === pieceId);
  if (!piece) return validMoves;

  // 通常の上下左右移動（内部座標）
  for (const dir of DIRECTIONS) {
    const newPos = {
      x: piece.position.x + dir.x,
      y: piece.position.y + dir.y,
    };

    if (canMovePiece(state, playerId, pieceId, newPos)) {
      // player2の場合は表示座標に変換
      if (myRole === 'player2') {
        validMoves.push({
          x: BOARD_SIZE - 1 - newPos.x,
          y: BOARD_SIZE - 1 - newPos.y,
        });
      } else {
        validMoves.push(newPos);
      }
    }
  }

  // 脱出判定
  if (
    piece.type === 'good' &&
    isEscapePosition(piece.position, piece.owner)
  ) {
    if (piece.owner === 'player1') {
      const escapePos = { x: piece.position.x, y: BOARD_SIZE };
      if (canMovePiece(state, playerId, pieceId, escapePos)) {
        // player2の視点では上方向への脱出に見える
        validMoves.push(
          myRole === 'player2'
            ? { x: BOARD_SIZE - 1 - escapePos.x, y: -1 }
            : escapePos
        );
      }
    } else {
      const escapePos = { x: piece.position.x, y: -1 };
      if (canMovePiece(state, playerId, pieceId, escapePos)) {
        validMoves.push(
          myRole === 'player2'
            ? { x: BOARD_SIZE - 1 - escapePos.x, y: BOARD_SIZE }
            : escapePos
        );
      }
    }
  }

  return validMoves;
}
