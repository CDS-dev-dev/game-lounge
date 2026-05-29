// 立体四目並べのゲームエンジン

import type {
  Connect4State,
  Connect4ClientState,
  Position3D,
  Piece,
  PlayerRole,
} from './types';
import { BOARD_SIZE, WIN_COUNT, WIN_DIRECTIONS } from './constants';

// 空の盤面を作成
function createEmptyBoard(): (Piece | null)[][][] {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() =>
      Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(null))
    );
}

// 初期状態を作成
export function createInitialState(gameId: string, player1Id: string): Connect4State {
  return {
    gameId,
    status: 'waiting',
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
    winner: null,
    winningLine: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// プレイヤー2が参加
export function joinPlayer2(state: Connect4State, player2Id: string): Connect4State {
  if (state.players.player2) {
    throw new Error('既に2人揃っています');
  }

  return {
    ...state,
    status: 'playing',
    players: {
      ...state.players,
      player2: player2Id,
    },
    updatedAt: Date.now(),
  };
}

// 位置が有効か確認
function isValidPosition(pos: Position3D): boolean {
  return (
    pos.x >= 0 &&
    pos.x < BOARD_SIZE &&
    pos.y >= 0 &&
    pos.y < BOARD_SIZE &&
    pos.z >= 0 &&
    pos.z < BOARD_SIZE
  );
}

// 指定位置に駒を置けるか確認
export function canPlacePiece(state: Connect4State, pos: Position3D): boolean {
  // ゲームが進行中か
  if (state.status !== 'playing') {
    return false;
  }

  // 位置が有効か
  if (!isValidPosition(pos)) {
    return false;
  }

  // その位置が空いているか
  if (state.board[pos.z][pos.y][pos.x] !== null) {
    return false;
  }

  // 下に駒があるか（z=0は常にOK、それ以外は下に駒が必要）
  if (pos.z === 0) {
    return true;
  }

  return state.board[pos.z - 1][pos.y][pos.x] !== null;
}

// 駒を配置
export function placePiece(
  state: Connect4State,
  playerId: string,
  pos: Position3D
): Connect4State {
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

  // 自分のターンか
  if (state.currentTurn !== playerRole) {
    throw new Error('あなたのターンではありません');
  }

  // 配置可能か
  if (!canPlacePiece(state, pos)) {
    // より詳細なエラーメッセージ
    if (state.board[pos.z][pos.y][pos.x] !== null) {
      throw new Error('その位置には既に駒があります');
    }
    if (pos.z > 0 && state.board[pos.z - 1][pos.y][pos.x] === null) {
      throw new Error('下に駒がないため配置できません');
    }
    throw new Error('その位置には配置できません');
  }

  // 駒を作成
  const pieceId = `${playerRole}-${Date.now()}-${state.pieces[playerRole].length}`;
  const newPiece: Piece = {
    id: pieceId,
    owner: playerRole,
    position: pos,
  };

  // 盤面を更新
  const newBoard = state.board.map((layer, z) =>
    layer.map((row, y) =>
      row.map((cell, x) => {
        if (x === pos.x && y === pos.y && z === pos.z) {
          return newPiece;
        }
        return cell;
      })
    )
  );

  // 駒リストを更新
  const newPieces = {
    ...state.pieces,
    [playerRole]: [...state.pieces[playerRole], newPiece],
  };

  // ターンを交代
  const nextTurn: PlayerRole = playerRole === 'player1' ? 'player2' : 'player1';

  return {
    ...state,
    board: newBoard,
    pieces: newPieces,
    currentTurn: nextTurn,
    updatedAt: Date.now(),
  };
}

// 勝敗判定（最適化版：最後に置いた駒の位置のみチェック）
export function checkWinner(state: Connect4State, lastMove?: Position3D): {
  winner: PlayerRole | null;
  winningLine: Position3D[] | null;
} {
  // 最後の手がある場合は、その位置のみチェック（最適化）
  if (lastMove) {
    const piece = state.board[lastMove.z][lastMove.y][lastMove.x];
    if (piece) {
      const result = checkPositionForWin(state, lastMove, piece.owner);
      if (result.winner) {
        return result;
      }
    }
  } else {
    // 最後の手がない場合は全駒チェック（後方互換性）
    for (const role of ['player1', 'player2'] as PlayerRole[]) {
      for (const piece of state.pieces[role]) {
        const result = checkPositionForWin(state, piece.position, role);
        if (result.winner) {
          return result;
        }
      }
    }
  }

  // 引き分け判定（全マスが埋まった）
  const allFilled = state.board.every((layer) =>
    layer.every((row) => row.every((cell) => cell !== null))
  );

  if (allFilled) {
    return {
      winner: null, // 引き分け
      winningLine: null,
    };
  }

  return {
    winner: null,
    winningLine: null,
  };
}

// 特定の位置から勝利条件をチェック
function checkPositionForWin(
  state: Connect4State,
  pos: Position3D,
  role: PlayerRole
): {
  winner: PlayerRole | null;
  winningLine: Position3D[] | null;
} {
  // 各方向をチェック
  for (const dir of WIN_DIRECTIONS) {
    const line: Position3D[] = [];

    // 反対方向も含めてチェック（中心からの双方向）
    for (let i = -WIN_COUNT + 1; i < WIN_COUNT; i++) {
      const checkPos: Position3D = {
        x: pos.x + dir.dx * i,
        y: pos.y + dir.dy * i,
        z: pos.z + dir.dz * i,
      };

      if (!isValidPosition(checkPos)) {
        continue;
      }

      const checkPiece = state.board[checkPos.z][checkPos.y][checkPos.x];
      if (checkPiece && checkPiece.owner === role) {
        line.push(checkPos);

        // 4つ揃ったら勝利
        if (line.length === WIN_COUNT) {
          return {
            winner: role,
            winningLine: line,
          };
        }
      } else {
        // 連続が途切れたらリセット
        line.length = 0;
      }
    }
  }

  return {
    winner: null,
    winningLine: null,
  };
}

// ゲーム終了時の状態更新
export function finishGame(
  state: Connect4State,
  winner: PlayerRole | null,
  winningLine: Position3D[] | null
): Connect4State {
  return {
    ...state,
    status: 'finished',
    winner,
    winningLine,
    updatedAt: Date.now(),
  };
}

// クライアント用の状態に変換
export function toClientState(
  state: Connect4State,
  playerId: string
): Connect4ClientState {
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
    winningLine: state.winningLine,
  };
}

// 配置可能な位置を取得
export function getAvailablePositions(state: Connect4State): Position3D[] {
  const positions: Position3D[] = [];

  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      // 下から順に探す
      for (let z = 0; z < BOARD_SIZE; z++) {
        const pos: Position3D = { x, y, z };
        if (canPlacePiece(state, pos)) {
          positions.push(pos);
          break; // この(x,y)列では一番下の空きマスのみ
        }
      }
    }
  }

  return positions;
}
