// ガイスターCPU AIロジック

import type { GeisterState, PlayerRole, Position, GeisterPiece } from './types';
import { getValidMoves, movePiece, checkWinner } from './engine';

export interface CpuMove {
  pieceId: string;
  to: Position;
  score: number; // 評価値
}

/**
 * CPUの最適な手を計算
 */
export function calculateCpuMove(
  state: GeisterState,
  cpuPlayerId: string
): CpuMove {
  const cpuRole: PlayerRole = state.players.player1 === cpuPlayerId ? 'player1' : 'player2';

  // ターンの確認
  if (state.currentTurn !== cpuRole) {
    console.error('Turn mismatch:', {
      currentTurn: state.currentTurn,
      cpuRole,
      players: state.players,
    });
    throw new Error(`CPUのターンではありません（現在: ${state.currentTurn}, CPU: ${cpuRole}）`);
  }

  const myPieces = state.pieces[cpuRole].filter(p => !p.captured && !p.escaped);

  // 全ての合法手を生成
  const allMoves: CpuMove[] = [];
  for (const piece of myPieces) {
    const validMoves = getValidMoves(state, cpuPlayerId, piece.id);
    for (const move of validMoves) {
      // 各手を評価
      const score = evaluateMove(state, cpuRole, piece, move);
      allMoves.push({
        pieceId: piece.id,
        to: move,
        score,
      });
    }
  }

  if (allMoves.length === 0) {
    // 各駒の合法手を詳細に出力
    const debugInfo = myPieces.map(p => {
      const moves = getValidMoves(state, cpuPlayerId, p.id);
      return {
        id: p.id,
        pos: `(${p.position.x},${p.position.y})`,
        type: p.type,
        validMovesCount: moves.length,
        validMoves: moves.map(m => `(${m.x},${m.y})`),
      };
    });

    console.error('合法手が見つかりません - 詳細デバッグ:', {
      cpuRole,
      currentTurn: state.currentTurn,
      status: state.status,
      myPiecesCount: myPieces.length,
      boardState: state.board.map((row, y) =>
        row.map((cell, x) => cell ? `${cell.owner[6]}${cell.type[0]}` : '  ').join('|')
      ).join('\n'),
      piecesDetail: debugInfo,
    });
    throw new Error('合法手が見つかりません');
  }

  // 最高評価の手を選択（同点ならランダム）
  allMoves.sort((a, b) => b.score - a.score);
  const bestScore = allMoves[0].score;
  const bestMoves = allMoves.filter(m => m.score === bestScore);
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

/**
 * 手の評価関数
 */
function evaluateMove(
  state: GeisterState,
  cpuRole: PlayerRole,
  piece: GeisterPiece,
  to: Position
): number {
  let score = 0;
  const opponentRole: PlayerRole = cpuRole === 'player1' ? 'player2' : 'player1';

  // 1. 脱出判定（最優先）
  if (piece.type === 'good' && isEscapeMove(to, cpuRole)) {
    return 10000; // 即座に勝てる手
  }

  // 2. 相手の駒を取る場合の評価
  const targetPiece = state.board[to.y]?.[to.x];
  if (targetPiece && targetPiece.owner === opponentRole) {
    // 相手のgood駒を取る（高評価）
    // 実際には相手の駒の種類は不明だが、位置や動きから推測
    score += 50; // 基本的に駒を取るのは良い

    // 盤面中央や脱出口付近の駒は重要
    if (isNearEscape(targetPiece.position, opponentRole)) {
      score += 30; // 脱出を狙っている可能性が高い = good駒の可能性
    }
  }

  // 3. bad駒を相手に取らせる位置に移動（囮戦略）
  if (piece.type === 'bad') {
    // 相手の駒の隣に移動
    const enemyAdjacent = isAdjacentToEnemy(to, state, opponentRole);
    if (enemyAdjacent) {
      score += 40; // bad駒を取らせる戦略
    }

    // 前進させる（相手の陣地に近づく）
    const forwardScore = getForwardScore(piece.position, to, cpuRole);
    score += forwardScore * 5;
  }

  // 4. good駒の戦略
  if (piece.type === 'good') {
    // 脱出口に近づく
    const escapeDistance = getDistanceToEscape(to, cpuRole);
    score += (10 - escapeDistance) * 10; // 脱出口に近いほど高評価

    // 敵から離れる（取られにくい）
    const enemyDistance = getMinDistanceToEnemy(to, state, opponentRole);
    score += enemyDistance * 5;

    // 中央を避ける（取られやすい）
    if (isCenterPosition(to)) {
      score -= 10;
    }
  }

  // 5. 相手の駒を4個取っている場合、積極的に攻める
  const opponentCaptured = state.pieces[opponentRole].filter(p => p.captured).length;
  if (opponentCaptured >= 3 && targetPiece) {
    score += 100; // 相手の駒が少ない時は積極的に取る
  }

  // 6. 自分のbad駒が4個取られている場合、勝ちなので積極的に
  const myBadCaptured = state.pieces[cpuRole].filter(p => p.type === 'bad' && p.captured).length;
  if (myBadCaptured === 4) {
    score += 1000; // すでに勝っている状態
  }

  return score;
}

/**
 * 脱出可能な移動か判定
 */
function isEscapeMove(to: Position, role: PlayerRole): boolean {
  if (role === 'player1') {
    return to.y === 6; // 盤外（下方向）
  } else {
    return to.y === -1; // 盤外（上方向）
  }
}

/**
 * 脱出口の近くか判定
 */
function isNearEscape(pos: Position, role: PlayerRole): boolean {
  if (role === 'player1') {
    // 下側の脱出口 (0, 5) と (5, 5)
    return pos.y === 5 && (pos.x === 0 || pos.x === 5);
  } else {
    // 上側の脱出口 (0, 0) と (5, 0)
    return pos.y === 0 && (pos.x === 0 || pos.x === 5);
  }
}

/**
 * 脱出口までの距離を計算
 */
function getDistanceToEscape(pos: Position, role: PlayerRole): number {
  if (role === 'player1') {
    // 下側の脱出口2つへの最短距離
    const dist1 = Math.abs(pos.x - 0) + Math.abs(pos.y - 5);
    const dist2 = Math.abs(pos.x - 5) + Math.abs(pos.y - 5);
    return Math.min(dist1, dist2);
  } else {
    // 上側の脱出口2つへの最短距離
    const dist1 = Math.abs(pos.x - 0) + Math.abs(pos.y - 0);
    const dist2 = Math.abs(pos.x - 5) + Math.abs(pos.y - 0);
    return Math.min(dist1, dist2);
  }
}

/**
 * 敵の駒との最短距離
 */
function getMinDistanceToEnemy(
  pos: Position,
  state: GeisterState,
  enemyRole: PlayerRole
): number {
  const enemyPieces = state.pieces[enemyRole].filter(p => !p.captured && !p.escaped);
  let minDist = 999;

  for (const enemy of enemyPieces) {
    const dist = Math.abs(pos.x - enemy.position.x) + Math.abs(pos.y - enemy.position.y);
    minDist = Math.min(minDist, dist);
  }

  return minDist;
}

/**
 * 敵の駒の隣にいるか
 */
function isAdjacentToEnemy(
  pos: Position,
  state: GeisterState,
  enemyRole: PlayerRole
): boolean {
  const enemyPieces = state.pieces[enemyRole].filter(p => !p.captured && !p.escaped);

  for (const enemy of enemyPieces) {
    const dist = Math.abs(pos.x - enemy.position.x) + Math.abs(pos.y - enemy.position.y);
    if (dist === 1) {
      return true;
    }
  }

  return false;
}

/**
 * 前進スコアを計算
 */
function getForwardScore(from: Position, to: Position, role: PlayerRole): number {
  if (role === 'player1') {
    return to.y - from.y; // 下方向が前進
  } else {
    return from.y - to.y; // 上方向が前進
  }
}

/**
 * 中央付近か判定
 */
function isCenterPosition(pos: Position): boolean {
  return pos.x >= 2 && pos.x <= 3 && pos.y >= 2 && pos.y <= 3;
}

/**
 * CPU用の初期配置を生成（ランダムだが戦略的）
 */
export function generateCpuSetup(role: PlayerRole): {
  position: Position;
  type: 'good' | 'bad';
}[] {
  const setupY = role === 'player1' ? [0, 1] : [4, 5];
  const setupX = [1, 2, 3, 4]; // 中央4列

  // 8個の配置位置
  const positions: Position[] = [];
  for (const y of setupY) {
    for (const x of setupX) {
      positions.push({ x, y });
    }
  }

  // ランダムにシャッフル
  const shuffled = positions.sort(() => Math.random() - 0.5);

  // good 4個、bad 4個をランダム配置
  const setup = shuffled.map((pos, i) => ({
    position: pos,
    type: (i < 4 ? 'good' : 'bad') as 'good' | 'bad',
  }));

  return setup;
}
