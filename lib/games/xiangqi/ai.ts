// 中国象棋のAI

import type { XiangqiState, PlayerRole, Position, Move } from './types';
import { PIECE_VALUES } from './constants';
import { movePiece, checkWinner } from './engine';
import { getAllValidMoves } from './piece-rules';

// 評価値の定数
const SCORE_WIN = 100000;
const SCORE_CHECKMATE = 50000;

// 位置評価テーブル（簡易版）
const POSITION_BONUS = {
  king: 0, // 王は九宮内にいるべき
  advisor: 5,
  elephant: 5,
  horse: 10, // 馬は中央寄りが強い
  chariot: 5,
  cannon: 5,
  soldier: 15, // 兵は前進するほど価値が上がる
};

/**
 * 盤面の評価値を計算
 */
function evaluateBoard(state: XiangqiState, aiRole: PlayerRole): number {
  const opponentRole: PlayerRole = aiRole === 'red' ? 'black' : 'red';
  let score = 0;

  // 勝敗が決まっている場合
  const { winner } = checkWinner(state);
  if (winner === aiRole) {
    return SCORE_WIN;
  } else if (winner === opponentRole) {
    return -SCORE_WIN;
  }

  // 駒の価値評価
  for (const piece of state.pieces[aiRole]) {
    let value = PIECE_VALUES[piece.type];

    // 兵/卒は渡河後価値が上がる
    if (piece.type === 'soldier' && piece.hasCrossedRiver) {
      value += 100;
    }

    // 位置ボーナス（簡易）
    const centerBonus = POSITION_BONUS[piece.type];
    const centerDistance = Math.abs(piece.position.col - 4); // 中央からの距離
    const positionValue = centerBonus * (5 - centerDistance);

    score += value + positionValue;
  }

  // 相手の駒の価値を減算
  for (const piece of state.pieces[opponentRole]) {
    let value = PIECE_VALUES[piece.type];
    if (piece.type === 'soldier' && piece.hasCrossedRiver) {
      value += 100;
    }
    const centerBonus = POSITION_BONUS[piece.type];
    const centerDistance = Math.abs(piece.position.col - 4);
    const positionValue = centerBonus * (5 - centerDistance);

    score -= value + positionValue;
  }

  return score;
}

/**
 * 全ての合法手を取得
 */
function getAllPossibleMoves(state: XiangqiState, role: PlayerRole): Move[] {
  const moves: Move[] = [];

  for (const piece of state.pieces[role]) {
    const validMoves = getAllValidMoves(state, piece.position);
    for (const to of validMoves) {
      moves.push({
        from: piece.position,
        to,
      });
    }
  }

  return moves;
}

/**
 * ミニマックス法（アルファベータ枝刈り付き）
 */
function minimax(
  state: XiangqiState,
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

  const currentRole = isMaximizing ? aiRole : (aiRole === 'red' ? 'black' : 'red');
  const playerId = state.players[currentRole];
  if (!playerId) return 0;

  const possibleMoves = getAllPossibleMoves(state, currentRole);

  if (possibleMoves.length === 0) {
    // 合法手なし（ステイルメイト＝負け）
    return isMaximizing ? -SCORE_CHECKMATE : SCORE_CHECKMATE;
  }

  if (isMaximizing) {
    let maxEval = -Infinity;

    for (const move of possibleMoves) {
      try {
        const newState = movePiece(state, playerId, move.from, move.to);
        const evalScore = minimax(newState, depth - 1, alpha, beta, false, aiRole);

        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);

        if (beta <= alpha) {
          break; // ベータカット
        }
      } catch {
        continue;
      }
    }

    return maxEval;
  } else {
    let minEval = Infinity;

    for (const move of possibleMoves) {
      try {
        const newState = movePiece(state, playerId, move.from, move.to);
        const evalScore = minimax(newState, depth - 1, alpha, beta, true, aiRole);

        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);

        if (beta <= alpha) {
          break; // アルファカット
        }
      } catch {
        continue;
      }
    }

    return minEval;
  }
}

/**
 * CPUの最善手を計算
 */
export function calculateCpuMove(
  state: XiangqiState,
  cpuRole: PlayerRole,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Move {
  const playerId = state.players[cpuRole];
  if (!playerId) {
    throw new Error('CPUプレイヤーが登録されていません');
  }

  const possibleMoves = getAllPossibleMoves(state, cpuRole);

  if (possibleMoves.length === 0) {
    throw new Error('合法手がありません');
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
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  }

  let bestMove = possibleMoves[0];
  let bestScore = -Infinity;

  for (const move of possibleMoves) {
    try {
      const newState = movePiece(state, playerId, move.from, move.to);
      const score = minimax(newState, depth, -Infinity, Infinity, false, cpuRole);

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    } catch {
      continue;
    }
  }

  return bestMove;
}
