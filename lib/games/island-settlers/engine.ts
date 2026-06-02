// アイランドセトラーズのゲームエンジン

import type {
  IslandSettlersState,
  IslandSettlersClientState,
  Player,
  Position,
  Road,
  ResourceType,
} from './types';
import {
  WIN_SCORE,
  INITIAL_VILLAGES,
  INITIAL_ROADS,
  MAX_VILLAGES,
  MAX_TOWNS,
  MAX_ROADS,
  INITIAL_RESOURCES,
  BUILD_COSTS,
  BUILDING_SCORES,
  PLAYER_COLORS,
  DICE_MIN,
  DICE_MAX,
  TERRAIN_RESOURCES,
  TRADE_RATE,
} from './constants';
import { generateBoard, getTile, isAdjacent, isSamePosition } from './board-generator';

/**
 * 初期状態を作成
 */
export function createInitialState(
  gameId: string,
  player1Id: string,
  maxPlayers: number = 3
): IslandSettlersState {
  if (maxPlayers < 3 || maxPlayers > 4) {
    throw new Error('プレイヤー数は3-4人である必要があります');
  }

  // プレイヤー1のみ作成
  const player1: Player = {
    id: player1Id,
    name: 'プレイヤー1',
    color: PLAYER_COLORS[0],
    resources: { ...INITIAL_RESOURCES },
    buildings: {
      villages: MAX_VILLAGES - INITIAL_VILLAGES,
      towns: MAX_TOWNS,
      roads: MAX_ROADS - INITIAL_ROADS,
    },
    score: INITIAL_VILLAGES * BUILDING_SCORES.village,
    isActive: true,
  };

  const board = generateBoard();

  // 初期配置（プレイヤー1の村と道を配置）
  // 対角の位置に配置
  board[1][1].hasVillage = player1Id;
  board[4][4].hasVillage = player1Id;

  const initialRoads: Road[] = [
    {
      id: `road-${player1Id}-0`,
      owner: player1Id,
      from: { x: 1, y: 1 },
      to: { x: 2, y: 1 },
    },
    {
      id: `road-${player1Id}-1`,
      owner: player1Id,
      from: { x: 4, y: 4 },
      to: { x: 4, y: 3 },
    },
  ];

  return {
    gameId,
    status: 'waiting',
    players: [player1],
    board,
    roads: initialRoads,
    currentTurn: 0,
    diceValue: 0,
    round: 0,
    maxPlayers,
    winner: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * プレイヤーを追加
 */
export function addPlayer(state: IslandSettlersState, playerId: string): IslandSettlersState {
  if (state.status !== 'waiting') {
    throw new Error('ゲームが既に開始されています');
  }

  if (state.players.length >= state.maxPlayers) {
    throw new Error('プレイヤー数が上限に達しています');
  }

  const playerIndex = state.players.length;
  const newPlayer: Player = {
    id: playerId,
    name: `プレイヤー${playerIndex + 1}`,
    color: PLAYER_COLORS[playerIndex],
    resources: { ...INITIAL_RESOURCES },
    buildings: {
      villages: MAX_VILLAGES - INITIAL_VILLAGES,
      towns: MAX_TOWNS,
      roads: MAX_ROADS - INITIAL_ROADS,
    },
    score: INITIAL_VILLAGES * BUILDING_SCORES.village,
    isActive: true,
  };

  const newBoard = state.board.map((row) => row.map((tile) => ({ ...tile })));

  // 初期配置位置（プレイヤーごとに異なる）
  const initialPositions: Array<[Position, Position]> = [
    [
      { x: 1, y: 1 },
      { x: 4, y: 4 },
    ],
    [
      { x: 4, y: 1 },
      { x: 1, y: 4 },
    ],
    [
      { x: 1, y: 2 },
      { x: 4, y: 3 },
    ],
    [
      { x: 2, y: 1 },
      { x: 3, y: 4 },
    ],
  ];

  const [pos1, pos2] = initialPositions[playerIndex];
  newBoard[pos1.y][pos1.x].hasVillage = playerId;
  newBoard[pos2.y][pos2.x].hasVillage = playerId;

  // 初期道路
  const newRoads: Road[] = [
    ...state.roads,
    {
      id: `road-${playerId}-0`,
      owner: playerId,
      from: pos1,
      to: { x: pos1.x + 1, y: pos1.y },
    },
    {
      id: `road-${playerId}-1`,
      owner: playerId,
      from: pos2,
      to: { x: pos2.x, y: pos2.y - 1 },
    },
  ];

  const newPlayers = [...state.players, newPlayer];

  // 全員揃ったらゲーム開始
  const newStatus = newPlayers.length === state.maxPlayers ? 'playing' : 'waiting';

  return {
    ...state,
    status: newStatus,
    players: newPlayers,
    board: newBoard,
    roads: newRoads,
    updatedAt: Date.now(),
  };
}

/**
 * サイコロを振る
 */
export function rollDice(state: IslandSettlersState, playerId: string): IslandSettlersState {
  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex !== state.currentTurn) {
    throw new Error('あなたのターンではありません');
  }

  if (state.status !== 'playing') {
    throw new Error('ゲームが開始されていません');
  }

  // サイコロを振る
  const diceValue = Math.floor(Math.random() * DICE_MAX) + DICE_MIN;

  // 資源を配分
  const newPlayers = distributeResources(state, diceValue);

  return {
    ...state,
    players: newPlayers,
    diceValue,
    updatedAt: Date.now(),
  };
}

/**
 * サイコロの目に応じて資源を配分
 */
function distributeResources(state: IslandSettlersState, diceValue: number): Player[] {
  const newPlayers = state.players.map((player) => ({ ...player, resources: { ...player.resources } }));

  // 各タイルをチェック
  for (const row of state.board) {
    for (const tile of row) {
      if (tile.diceNumber === diceValue) {
        const resourceType = TERRAIN_RESOURCES[tile.terrain];
        if (!resourceType) continue;

        // 村がある場合：1資源
        if (tile.hasVillage) {
          const playerIndex = newPlayers.findIndex((p) => p.id === tile.hasVillage);
          if (playerIndex >= 0) {
            newPlayers[playerIndex].resources[resourceType as ResourceType] += 1;
          }
        }

        // 町がある場合：2資源
        if (tile.hasTown) {
          const playerIndex = newPlayers.findIndex((p) => p.id === tile.hasTown);
          if (playerIndex >= 0) {
            newPlayers[playerIndex].resources[resourceType as ResourceType] += 2;
          }
        }
      }
    }
  }

  return newPlayers;
}

/**
 * 道を建設できるかチェック
 */
export function canBuildRoad(state: IslandSettlersState, playerId: string, from: Position, to: Position): boolean {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return false;

  // 資源チェック
  if (
    player.resources.wood < BUILD_COSTS.road.wood ||
    player.resources.food < BUILD_COSTS.road.food
  ) {
    return false;
  }

  // 残り建設数チェック
  if (player.buildings.roads <= 0) {
    return false;
  }

  // 隣接チェック
  if (!isAdjacent(from, to)) {
    return false;
  }

  // 既存の道と重複していないかチェック
  const roadExists = state.roads.some(
    (road) =>
      (isSamePosition(road.from, from) && isSamePosition(road.to, to)) ||
      (isSamePosition(road.from, to) && isSamePosition(road.to, from))
  );

  if (roadExists) {
    return false;
  }

  // 接続チェック：自分の村/町/道に接続している必要がある
  const hasConnection = checkRoadConnection(state, playerId, from, to);

  return hasConnection;
}

/**
 * 道が自分の建設物に接続しているかチェック
 */
function checkRoadConnection(state: IslandSettlersState, playerId: string, from: Position, to: Position): boolean {
  // fromまたはtoに自分の村/町がある
  const fromTile = getTile(state.board, from);
  const toTile = getTile(state.board, to);

  if ((fromTile?.hasVillage === playerId || fromTile?.hasTown === playerId) ||
      (toTile?.hasVillage === playerId || toTile?.hasTown === playerId)) {
    return true;
  }

  // fromまたはtoに自分の道が接続している
  const hasRoadConnection = state.roads.some(
    (road) =>
      road.owner === playerId &&
      (isSamePosition(road.from, from) ||
        isSamePosition(road.to, from) ||
        isSamePosition(road.from, to) ||
        isSamePosition(road.to, to))
  );

  return hasRoadConnection;
}

/**
 * 道を建設
 */
export function buildRoad(
  state: IslandSettlersState,
  playerId: string,
  from: Position,
  to: Position
): IslandSettlersState {
  if (!canBuildRoad(state, playerId, from, to)) {
    throw new Error('道を建設できません');
  }

  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  const newPlayers = [...state.players];
  const player = { ...newPlayers[playerIndex], resources: { ...newPlayers[playerIndex].resources } };

  // 資源を消費
  player.resources.wood -= BUILD_COSTS.road.wood;
  player.resources.food -= BUILD_COSTS.road.food;
  player.buildings.roads -= 1;

  newPlayers[playerIndex] = player;

  // 道を追加
  const newRoad: Road = {
    id: `road-${playerId}-${Date.now()}`,
    owner: playerId,
    from,
    to,
  };

  return {
    ...state,
    players: newPlayers,
    roads: [...state.roads, newRoad],
    updatedAt: Date.now(),
  };
}

/**
 * 村を建設できるかチェック
 */
export function canBuildVillage(state: IslandSettlersState, playerId: string, position: Position): boolean {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return false;

  // 資源チェック
  const cost = BUILD_COSTS.village;
  if (
    player.resources.wood < cost.wood ||
    player.resources.stone < cost.stone ||
    player.resources.food < cost.food ||
    player.resources.gold < cost.gold
  ) {
    return false;
  }

  // 残り建設数チェック
  if (player.buildings.villages <= 0) {
    return false;
  }

  // タイルチェック
  const tile = getTile(state.board, position);
  if (!tile || tile.hasVillage || tile.hasTown) {
    return false;
  }

  // 砂漠には建設不可
  if (tile.terrain === 'desert') {
    return false;
  }

  // 自分の道に接続している必要がある
  const hasRoadConnection = state.roads.some(
    (road) =>
      road.owner === playerId &&
      (isSamePosition(road.from, position) || isSamePosition(road.to, position))
  );

  return hasRoadConnection;
}

/**
 * 村を建設
 */
export function buildVillage(
  state: IslandSettlersState,
  playerId: string,
  position: Position
): IslandSettlersState {
  if (!canBuildVillage(state, playerId, position)) {
    throw new Error('村を建設できません');
  }

  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  const newPlayers = [...state.players];
  const player = { ...newPlayers[playerIndex], resources: { ...newPlayers[playerIndex].resources } };

  // 資源を消費
  const cost = BUILD_COSTS.village;
  player.resources.wood -= cost.wood;
  player.resources.stone -= cost.stone;
  player.resources.food -= cost.food;
  player.resources.gold -= cost.gold;
  player.buildings.villages -= 1;
  player.score += BUILDING_SCORES.village;

  newPlayers[playerIndex] = player;

  // ボードを更新
  const newBoard = state.board.map((row) =>
    row.map((tile) => {
      if (isSamePosition(tile.position, position)) {
        return { ...tile, hasVillage: playerId };
      }
      return tile;
    })
  );

  return {
    ...state,
    players: newPlayers,
    board: newBoard,
    updatedAt: Date.now(),
  };
}

/**
 * 町を建設（村をアップグレード）できるかチェック
 */
export function canBuildTown(state: IslandSettlersState, playerId: string, position: Position): boolean {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return false;

  // 資源チェック
  const cost = BUILD_COSTS.town;
  if (
    player.resources.stone < cost.stone ||
    player.resources.gold < cost.gold
  ) {
    return false;
  }

  // 残り建設数チェック
  if (player.buildings.towns <= 0) {
    return false;
  }

  // タイルチェック：自分の村がある必要がある
  const tile = getTile(state.board, position);
  if (!tile || tile.hasVillage !== playerId || tile.hasTown) {
    return false;
  }

  return true;
}

/**
 * 町を建設（村をアップグレード）
 */
export function buildTown(
  state: IslandSettlersState,
  playerId: string,
  position: Position
): IslandSettlersState {
  if (!canBuildTown(state, playerId, position)) {
    throw new Error('町を建設できません');
  }

  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  const newPlayers = [...state.players];
  const player = { ...newPlayers[playerIndex], resources: { ...newPlayers[playerIndex].resources } };

  // 資源を消費
  const cost = BUILD_COSTS.town;
  player.resources.stone -= cost.stone;
  player.resources.gold -= cost.gold;
  player.buildings.towns -= 1;
  player.buildings.villages += 1; // 村を回収
  player.score += BUILDING_SCORES.town; // +1点（村の1点は既にある）

  newPlayers[playerIndex] = player;

  // ボードを更新
  const newBoard = state.board.map((row) =>
    row.map((tile) => {
      if (isSamePosition(tile.position, position)) {
        return { ...tile, hasVillage: null, hasTown: playerId };
      }
      return tile;
    })
  );

  return {
    ...state,
    players: newPlayers,
    board: newBoard,
    updatedAt: Date.now(),
  };
}

/**
 * 交易（4:1の固定レート）
 */
export function trade(
  state: IslandSettlersState,
  playerId: string,
  giveResource: ResourceType,
  receiveResource: ResourceType
): IslandSettlersState {
  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex < 0) {
    throw new Error('プレイヤーが見つかりません');
  }

  const player = state.players[playerIndex];

  // 資源チェック
  if (player.resources[giveResource] < TRADE_RATE) {
    throw new Error('交易に必要な資源が不足しています');
  }

  const newPlayers = [...state.players];
  const newPlayer = { ...newPlayers[playerIndex], resources: { ...newPlayers[playerIndex].resources } };

  newPlayer.resources[giveResource] -= TRADE_RATE;
  newPlayer.resources[receiveResource] += 1;

  newPlayers[playerIndex] = newPlayer;

  return {
    ...state,
    players: newPlayers,
    updatedAt: Date.now(),
  };
}

/**
 * ターン終了
 */
export function endTurn(state: IslandSettlersState): IslandSettlersState {
  // 勝利条件チェック
  const winner = state.players.find((p) => p.score >= WIN_SCORE);

  if (winner) {
    return {
      ...state,
      status: 'finished',
      winner: winner.id,
      updatedAt: Date.now(),
    };
  }

  // 次のプレイヤーへ
  const nextTurn = (state.currentTurn + 1) % state.players.length;
  const newRound = nextTurn === 0 ? state.round + 1 : state.round;

  return {
    ...state,
    currentTurn: nextTurn,
    round: newRound,
    diceValue: 0, // サイコロをリセット
    updatedAt: Date.now(),
  };
}

/**
 * クライアント用の状態に変換
 */
export function toClientState(
  state: IslandSettlersState,
  playerId: string
): IslandSettlersClientState {
  const myPlayerIndex = state.players.findIndex((p) => p.id === playerId);

  if (myPlayerIndex < 0) {
    throw new Error('このゲームの参加者ではありません');
  }

  const isMyTurn = state.currentTurn === myPlayerIndex;
  const canOperate = state.status === 'playing' && isMyTurn;

  return {
    gameId: state.gameId,
    status: state.status,
    players: state.players,
    board: state.board,
    roads: state.roads,
    currentTurn: state.currentTurn,
    diceValue: state.diceValue,
    round: state.round,
    myPlayerId: playerId,
    myPlayerIndex,
    isMyTurn,
    canOperate,
    winner: state.winner,
  };
}
