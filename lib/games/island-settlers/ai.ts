// アイランドセトラーズのAI実装

import type { IslandSettlersState, Position, ResourceType } from './types';
import {
  rollDice,
  buildRoad,
  buildVillage,
  buildTown,
  trade,
  endTurn,
  canBuildRoad,
  canBuildVillage,
  canBuildTown,
} from './engine';
import { getAdjacentPositions, getTile } from './board-generator';
import { BOARD_SIZE, TERRAIN_RESOURCES, WIN_SCORE } from './constants';

/**
 * 難易度設定
 */
type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * 位置の資源期待値を計算
 */
function calculatePositionValue(state: IslandSettlersState, position: Position): number {
  const tile = getTile(state.board, position);
  if (!tile || tile.terrain === 'desert') return 0;

  // サイコロの目の出現確率（1-6は均等）
  const probability = 1 / 6;

  // 資源の価値（金 > 食料 = 石材 = 木材）
  const resourceValues: Record<string, number> = {
    gold: 4,
    food: 3,
    stone: 3,
    wood: 3,
  };

  const resourceType = TERRAIN_RESOURCES[tile.terrain];
  if (!resourceType) return 0;

  const resourceValue = resourceValues[resourceType] || 1;

  // 期待値 = 確率 × 資源価値
  return probability * resourceValue;
}

/**
 * 村の建設候補を評価
 */
function evaluateVillagePosition(state: IslandSettlersState, playerId: string, position: Position): number {
  let score = 0;

  // 位置の資源期待値
  score += calculatePositionValue(state, position);

  // 隣接タイルの資源期待値も考慮
  const adjacentPositions = getAdjacentPositions(position);
  for (const adjPos of adjacentPositions) {
    score += calculatePositionValue(state, adjPos) * 0.5; // 隣接タイルは半分の重み
  }

  // 他プレイヤーとの距離（遠いほど良い）
  let minDistanceToOpponent = Infinity;
  for (const player of state.players) {
    if (player.id === playerId) continue;

    for (const row of state.board) {
      for (const tile of row) {
        if (tile.hasVillage === player.id || tile.hasTown === player.id) {
          const distance = Math.abs(tile.position.x - position.x) + Math.abs(tile.position.y - position.y);
          minDistanceToOpponent = Math.min(minDistanceToOpponent, distance);
        }
      }
    }
  }

  // 距離が遠いほどボーナス
  if (minDistanceToOpponent < Infinity) {
    score += minDistanceToOpponent * 0.3;
  }

  return score;
}

/**
 * 町のアップグレード候補を評価
 */
function evaluateTownUpgrade(state: IslandSettlersState, position: Position): number {
  // 町は資源生産量が2倍になるので、期待値も2倍
  return calculatePositionValue(state, position) * 2;
}

/**
 * 道の建設候補を評価
 */
function evaluateRoadPosition(
  state: IslandSettlersState,
  playerId: string,
  from: Position,
  to: Position
): number {
  let score = 0;

  // toの位置に村を建設できる可能性
  const toTile = getTile(state.board, to);
  if (toTile && !toTile.hasVillage && !toTile.hasTown && toTile.terrain !== 'desert') {
    score += evaluateVillagePosition(state, playerId, to);
  }

  // 拡張性（さらに道を伸ばせる方向が多い）
  const adjacentToTo = getAdjacentPositions(to);
  for (const adjPos of adjacentToTo) {
    const tile = getTile(state.board, adjPos);
    if (tile && !tile.hasVillage && !tile.hasTown) {
      score += 0.5;
    }
  }

  return score;
}

/**
 * 最も必要な資源を判定
 */
function getMostNeededResource(state: IslandSettlersState, playerId: string): ResourceType | null {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return null;

  const resources = player.resources;

  // 資源の不足度を計算
  const shortages: Array<{ type: ResourceType; shortage: number }> = [
    { type: 'wood', shortage: 4 - resources.wood },
    { type: 'stone', shortage: 4 - resources.stone },
    { type: 'food', shortage: 4 - resources.food },
    { type: 'gold', shortage: 4 - resources.gold },
  ];

  // 最も不足している資源
  const mostNeeded = shortages.reduce((prev, curr) => (curr.shortage > prev.shortage ? curr : prev));

  return mostNeeded.shortage > 0 ? mostNeeded.type : null;
}

/**
 * 交易の実行可否を判定
 */
function shouldTrade(state: IslandSettlersState, playerId: string): {
  shouldTrade: boolean;
  give: ResourceType | null;
  receive: ResourceType | null;
} {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { shouldTrade: false, give: null, receive: null };

  const resources = player.resources;

  // 4個以上持っている資源を探す
  const abundantResources: ResourceType[] = [];
  for (const [type, count] of Object.entries(resources)) {
    if (count >= 4) {
      abundantResources.push(type as ResourceType);
    }
  }

  if (abundantResources.length === 0) {
    return { shouldTrade: false, give: null, receive: null };
  }

  // 最も必要な資源
  const neededResource = getMostNeededResource(state, playerId);
  if (!neededResource) {
    return { shouldTrade: false, give: null, receive: null };
  }

  // 交易実行
  return {
    shouldTrade: true,
    give: abundantResources[0],
    receive: neededResource,
  };
}

/**
 * CPUのターンを実行
 */
export async function executeCpuTurn(
  state: IslandSettlersState,
  cpuPlayerId: string,
  difficulty: Difficulty = 'medium'
): Promise<IslandSettlersState> {
  let currentState = state;

  // 1. サイコロを振る
  if (currentState.diceValue === 0) {
    currentState = rollDice(currentState, cpuPlayerId);
    console.log(`[AI] サイコロ: ${currentState.diceValue}`);
  }

  // 難易度による行動確率
  const actionProbability = {
    easy: 0.3,
    medium: 0.6,
    hard: 0.9,
  };

  const shouldAct = Math.random() < actionProbability[difficulty];

  if (shouldAct) {
    // 2. 建設アクション
    currentState = await attemptBuilding(currentState, cpuPlayerId, difficulty);

    // 3. 交易
    const tradeDecision = shouldTrade(currentState, cpuPlayerId);
    if (tradeDecision.shouldTrade && tradeDecision.give && tradeDecision.receive) {
      try {
        currentState = trade(currentState, cpuPlayerId, tradeDecision.give, tradeDecision.receive);
        console.log(`[AI] 交易: ${tradeDecision.give} -> ${tradeDecision.receive}`);
      } catch (error) {
        console.log('[AI] 交易失敗:', error);
      }
    }

    // 4. 再度建設を試みる（交易後）
    currentState = await attemptBuilding(currentState, cpuPlayerId, difficulty);
  }

  // 5. ターン終了
  currentState = endTurn(currentState);
  console.log('[AI] ターン終了');

  return currentState;
}

/**
 * 建設を試みる
 */
async function attemptBuilding(
  state: IslandSettlersState,
  cpuPlayerId: string,
  difficulty: Difficulty
): Promise<IslandSettlersState> {
  let currentState = state;
  const player = currentState.players.find((p) => p.id === cpuPlayerId);
  if (!player) return currentState;

  // 優先順位：町 > 村 > 道
  // 勝利が近い場合は得点効率を優先

  const isCloseToWin = player.score >= WIN_SCORE - 3;

  // 町の建設を試みる（得点効率が高い）
  if (isCloseToWin || difficulty === 'hard') {
    currentState = await attemptTownBuilding(currentState, cpuPlayerId);
  }

  // 村の建設を試みる
  currentState = await attemptVillageBuilding(currentState, cpuPlayerId);

  // 道の建設を試みる
  currentState = await attemptRoadBuilding(currentState, cpuPlayerId);

  // もう一度町を試みる（medium以下でも、資源があれば建設）
  if (!isCloseToWin && difficulty !== 'hard') {
    currentState = await attemptTownBuilding(currentState, cpuPlayerId);
  }

  return currentState;
}

/**
 * 町の建設を試みる
 */
async function attemptTownBuilding(
  state: IslandSettlersState,
  cpuPlayerId: string
): Promise<IslandSettlersState> {
  let currentState = state;

  // 自分の村を探す
  const villageCandidates: Array<{ position: Position; score: number }> = [];

  for (const row of currentState.board) {
    for (const tile of row) {
      if (tile.hasVillage === cpuPlayerId && canBuildTown(currentState, cpuPlayerId, tile.position)) {
        const score = evaluateTownUpgrade(currentState, tile.position);
        villageCandidates.push({ position: tile.position, score });
      }
    }
  }

  if (villageCandidates.length === 0) return currentState;

  // 評価が最も高い村を町にアップグレード
  villageCandidates.sort((a, b) => b.score - a.score);
  const bestVillage = villageCandidates[0];

  try {
    currentState = buildTown(currentState, cpuPlayerId, bestVillage.position);
    console.log(`[AI] 町を建設: (${bestVillage.position.x}, ${bestVillage.position.y})`);
  } catch (error) {
    console.log('[AI] 町建設失敗:', error);
  }

  return currentState;
}

/**
 * 村の建設を試みる
 */
async function attemptVillageBuilding(
  state: IslandSettlersState,
  cpuPlayerId: string
): Promise<IslandSettlersState> {
  let currentState = state;

  // 建設可能な位置を探す
  const candidates: Array<{ position: Position; score: number }> = [];

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const position: Position = { x, y };
      if (canBuildVillage(currentState, cpuPlayerId, position)) {
        const score = evaluateVillagePosition(currentState, cpuPlayerId, position);
        candidates.push({ position, score });
      }
    }
  }

  if (candidates.length === 0) return currentState;

  // 評価が最も高い位置に建設
  candidates.sort((a, b) => b.score - a.score);
  const bestPosition = candidates[0];

  try {
    currentState = buildVillage(currentState, cpuPlayerId, bestPosition.position);
    console.log(`[AI] 村を建設: (${bestPosition.position.x}, ${bestPosition.position.y})`);
  } catch (error) {
    console.log('[AI] 村建設失敗:', error);
  }

  return currentState;
}

/**
 * 道の建設を試みる
 */
async function attemptRoadBuilding(
  state: IslandSettlersState,
  cpuPlayerId: string
): Promise<IslandSettlersState> {
  let currentState = state;

  // 建設可能な道を探す
  const candidates: Array<{ from: Position; to: Position; score: number }> = [];

  // 自分の村/町/道がある位置から隣接位置へ道を伸ばす
  const checkPositions: Position[] = [];

  // 村と町の位置
  for (const row of currentState.board) {
    for (const tile of row) {
      if (tile.hasVillage === cpuPlayerId || tile.hasTown === cpuPlayerId) {
        checkPositions.push(tile.position);
      }
    }
  }

  // 道の両端
  for (const road of currentState.roads) {
    if (road.owner === cpuPlayerId) {
      checkPositions.push(road.from, road.to);
    }
  }

  // 各位置から隣接位置へ道を建設できるかチェック
  for (const from of checkPositions) {
    const adjacentPositions = getAdjacentPositions(from);
    for (const to of adjacentPositions) {
      if (canBuildRoad(currentState, cpuPlayerId, from, to)) {
        const score = evaluateRoadPosition(currentState, cpuPlayerId, from, to);
        candidates.push({ from, to, score });
      }
    }
  }

  if (candidates.length === 0) return currentState;

  // 評価が最も高い道を建設
  candidates.sort((a, b) => b.score - a.score);
  const bestRoad = candidates[0];

  try {
    currentState = buildRoad(currentState, cpuPlayerId, bestRoad.from, bestRoad.to);
    console.log(`[AI] 道を建設: (${bestRoad.from.x}, ${bestRoad.from.y}) -> (${bestRoad.to.x}, ${bestRoad.to.y})`);
  } catch (error) {
    console.log('[AI] 道建設失敗:', error);
  }

  return currentState;
}

/**
 * 簡易AI（ランダム行動）
 */
export async function executeRandomCpuTurn(
  state: IslandSettlersState,
  cpuPlayerId: string
): Promise<IslandSettlersState> {
  let currentState = state;

  // サイコロを振る
  if (currentState.diceValue === 0) {
    currentState = rollDice(currentState, cpuPlayerId);
  }

  // ランダムで建設を試みる
  const actions = ['village', 'road', 'town', 'none'];
  const randomAction = actions[Math.floor(Math.random() * actions.length)];

  switch (randomAction) {
    case 'village':
      currentState = await attemptVillageBuilding(currentState, cpuPlayerId);
      break;
    case 'road':
      currentState = await attemptRoadBuilding(currentState, cpuPlayerId);
      break;
    case 'town':
      currentState = await attemptTownBuilding(currentState, cpuPlayerId);
      break;
  }

  // ターン終了
  currentState = endTurn(currentState);

  return currentState;
}
