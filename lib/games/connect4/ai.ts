// 立体四目並べのAI

import type { Connect4State, Position3D, PlayerRole } from './types';
import { getAvailablePositions, placePiece, checkWinner } from './engine';
import { BOARD_SIZE, WIN_COUNT, WIN_DIRECTIONS } from './constants';

// 評価値の定数
const SCORE_WIN = 10000;
const SCORE_FOUR = 1000;
const SCORE_THREE = 100;
const SCORE_TWO = 10;
const SCORE_ONE = 1;

/**
 * 盤面の評価値を計算
 */
function evaluateBoard(state: Connect4State, aiRole: PlayerRole): number {
  const opponentRole: PlayerRole = aiRole === 'player1' ? 'player2' : 'player1';
  let score = 0;

  // 勝敗が決まっている場合
  const { winner } = checkWinner(state);
  if (winner === aiRole) {
    return SCORE_WIN;
  } else if (winner === opponentRole) {
    return -SCORE_WIN;
  }

  // 各ラインの評価
  score += evaluateLines(state, aiRole);

  return score;
}

/**
 * 全てのラインを評価
 */
function evaluateLines(state: Connect4State, aiRole: PlayerRole): number {
  const opponentRole: PlayerRole = aiRole === 'player1' ? 'player2' : 'player1';
  let score = 0;

  // 全ての開始位置から、各方向のラインを評価
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let z = 0; z < BOARD_SIZE; z++) {
        const startPos: Position3D = { x, y, z };

        for (const dir of WIN_DIRECTIONS) {
          const lineScore = evaluateLine(state, startPos, dir, aiRole);
          score += lineScore;

          // 相手のラインは減点
          const opponentLineScore = evaluateLine(state, startPos, dir, opponentRole);
          score -= opponentLineScore;
        }
      }
    }
  }

  return score;
}

/**
 * 1つのラインを評価
 */
function evaluateLine(
  state: Connect4State,
  startPos: Position3D,
  dir: { dx: number; dy: number; dz: number },
  role: PlayerRole
): number {
  let myCount = 0;
  let emptyCount = 0;
  const positions: Position3D[] = [];

  for (let i = 0; i < WIN_COUNT; i++) {
    const pos: Position3D = {
      x: startPos.x + dir.dx * i,
      y: startPos.y + dir.dy * i,
      z: startPos.z + dir.dz * i,
    };

    // 範囲外
    if (
      pos.x < 0 ||
      pos.x >= BOARD_SIZE ||
      pos.y < 0 ||
      pos.y >= BOARD_SIZE ||
      pos.z < 0 ||
      pos.z >= BOARD_SIZE
    ) {
      return 0;
    }

    positions.push(pos);
    const piece = state.board[pos.z][pos.y][pos.x];

    if (piece === null) {
      emptyCount++;
    } else if (piece.owner === role) {
      myCount++;
    } else {
      // 相手の駒があるので、このラインは無効
      return 0;
    }
  }

  // 相手の駒がないラインのみスコア化
  if (myCount === 4) {
    return SCORE_FOUR;
  } else if (myCount === 3 && emptyCount === 1) {
    return SCORE_THREE;
  } else if (myCount === 2 && emptyCount === 2) {
    return SCORE_TWO;
  } else if (myCount === 1 && emptyCount === 3) {
    return SCORE_ONE;
  }

  return 0;
}

/**
 * ミニマックス法（アルファベータ枝刈り付き）
 */
function minimax(
  state: Connect4State,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiRole: PlayerRole
): number {
  // 終了条件
  const { winner } = checkWinner(state);
  if (winner !== null || depth === 0) {
    return evaluateBoard(state, aiRole);
  }

  const availablePositions = getAvailablePositions(state);

  if (availablePositions.length === 0) {
    // 引き分け
    return 0;
  }

  if (isMaximizing) {
    let maxEval = -Infinity;

    for (const pos of availablePositions) {
      try {
        // 現在のターンのプレイヤーIDを取得
        const currentRole = state.currentTurn;
        const playerId = state.players[currentRole];
        if (!playerId) continue;

        const newState = placePiece(state, playerId, pos);
        const evalScore = minimax(newState, depth - 1, alpha, beta, false, aiRole);

        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);

        if (beta <= alpha) {
          break; // ベータカット
        }
      } catch (error) {
        // エラーをログに出力して問題を追跡
        console.error('minimax error (maximizing):', error);
        continue;
      }
    }

    return maxEval === -Infinity ? 0 : maxEval;
  } else {
    let minEval = Infinity;

    for (const pos of availablePositions) {
      try {
        // 現在のターンのプレイヤーIDを取得
        const currentRole = state.currentTurn;
        const playerId = state.players[currentRole];
        if (!playerId) continue;

        const newState = placePiece(state, playerId, pos);
        const evalScore = minimax(newState, depth - 1, alpha, beta, true, aiRole);

        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);

        if (beta <= alpha) {
          break; // アルファカット
        }
      } catch (error) {
        // エラーをログに出力して問題を追跡
        console.error('minimax error (minimizing):', error);
        continue;
      }
    }

    return minEval === Infinity ? 0 : minEval;
  }
}

/**
 * CPUの最善手を計算
 */
export function calculateCpuMove(
  state: Connect4State,
  cpuRole: PlayerRole,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Position3D {
  const availablePositions = getAvailablePositions(state);

  if (availablePositions.length === 0) {
    throw new Error('配置可能な位置がありません');
  }

  const playerId = state.players[cpuRole];
  if (!playerId) {
    throw new Error('CPUプレイヤーが見つかりません');
  }

  // デバッグ: ターンとロールの一致確認
  if (state.currentTurn !== cpuRole) {
    console.error('Turn mismatch:', {
      currentTurn: state.currentTurn,
      cpuRole,
      players: state.players,
    });
    throw new Error(`CPUのターンではありません（現在: ${state.currentTurn}, CPU: ${cpuRole}）`);
  }

  // 難易度に応じた深さ
  const depths = {
    easy: 1,
    medium: 2,
    hard: 3,
  };

  const depth = depths[difficulty];

  // 簡易モード：ランダム要素を追加
  if (difficulty === 'easy' && Math.random() < 0.3) {
    return availablePositions[Math.floor(Math.random() * availablePositions.length)];
  }

  let bestMove = availablePositions[0];
  let bestScore = -Infinity;

  for (const pos of availablePositions) {
    try {
      const newState = placePiece(state, playerId, pos);
      const score = minimax(newState, depth, -Infinity, Infinity, false, cpuRole);

      if (score > bestScore) {
        bestScore = score;
        bestMove = pos;
      }
    } catch (error) {
      console.error('Move evaluation error:', error);
      continue;
    }
  }

  return bestMove;
}
