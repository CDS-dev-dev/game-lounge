// アイランドセトラーズの型定義

export type GameStatus = 'waiting' | 'setup' | 'playing' | 'finished';
export type PlayerColor = 'red' | 'blue' | 'yellow' | 'green';

// 資源の種類
export type ResourceType = 'wood' | 'stone' | 'food' | 'gold';

// タイルの地形タイプ
export type TerrainType = 'forest' | 'mountain' | 'field' | 'water' | 'desert';

// 建設物の種類
export type BuildingType = 'road' | 'village' | 'town';

// 2次元座標
export interface Position {
  x: number; // 0-5
  y: number; // 0-5
}

// ボードのタイル
export interface BoardTile {
  position: Position;
  terrain: TerrainType;
  diceNumber: number; // 1-6 (desertは0)
  hasVillage: string | null; // プレイヤーID
  hasTown: string | null; // プレイヤーID
}

// 道路（2つの座標間の接続）
export interface Road {
  id: string;
  owner: string; // プレイヤーID
  from: Position;
  to: Position;
}

// プレイヤー情報
export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  resources: {
    wood: number;
    stone: number;
    food: number;
    gold: number;
  };
  buildings: {
    villages: number; // 残り建設可能数
    towns: number;
    roads: number;
  };
  score: number; // 勝利点
  isActive: boolean; // 破産していない
}

// ゲーム状態
export interface IslandSettlersState {
  gameId: string;
  status: GameStatus;
  players: Player[];
  board: BoardTile[][]; // 6x6グリッド [y][x]
  roads: Road[];
  currentTurn: number; // プレイヤーインデックス
  diceValue: number; // 最後に振ったサイコロの目
  round: number;
  maxPlayers: number; // 3 or 4
  winner: string | null; // 勝者のプレイヤーID
  createdAt: number;
  updatedAt: number;
}

// クライアント用のゲーム状態
export interface IslandSettlersClientState {
  gameId: string;
  status: GameStatus;
  players: Player[];
  board: BoardTile[][];
  roads: Road[];
  currentTurn: number;
  diceValue: number;
  round: number;
  myPlayerId: string;
  myPlayerIndex: number;
  isMyTurn: boolean;
  canOperate: boolean;
  winner: string | null;
}

// アクションの種類
export type ActionType =
  | 'roll-dice' // サイコロを振る
  | 'build-road' // 道を建設
  | 'build-village' // 村を建設
  | 'build-town' // 町を建設（村をアップグレード）
  | 'trade' // 交易
  | 'end-turn'; // ターン終了

// 建設コスト
export interface BuildCost {
  wood: number;
  stone: number;
  food: number;
  gold: number;
}

// 交易リクエスト
export interface TradeRequest {
  give: Partial<Record<ResourceType, number>>;
  receive: Partial<Record<ResourceType, number>>;
}
