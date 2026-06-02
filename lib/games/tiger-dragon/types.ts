// タイガー＆ドラゴンゲームの型定義

export type TileType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 'tiger' | 'dragon';
export type GameStatus = 'waiting' | 'playing' | 'roundEnd' | 'finished';

// 牌の定義
export interface Tile {
  id: string; // ユニークID
  type: TileType; // 牌の種類（数字1-8、tiger、dragon）
  isFaceUp: boolean; // 表向きかどうか（1周ボーナスで使用）
}

// プレイヤーの状態
export interface TigerDragonPlayer {
  id: string;
  name: string;
  hand: Tile[]; // 手牌
  score: number; // 得点チップ
  roundBonusCount: number; // 現在のラウンドでの1周ボーナス数
  hasFinished: boolean; // 上がったかどうか（現在のラウンド）
  finishTile: Tile | null; // 上がり牌
  isCpu: boolean; // CPU対戦かどうか
  cpuDifficulty?: 'easy' | 'medium' | 'hard'; // CPU難易度
}

// 戦場カードの種類
export type BattlefieldCardType =
  | 'even' // 偶数（2,4,6,8）で上がり → 2点
  | 'odd' // 奇数（1,3,5,7）で上がり → 2点
  | 'small' // 小さい数（1,2,3,4）で上がり → 2点
  | 'large' // 大きい数（5,6,7,8）で上がり → 2点
  | 'secret' // 奥義（タイガー/ドラゴン）で上がり → 3点
  | 'any'; // 何で上がっても → 1点

// 戦場カード
export interface BattlefieldCard {
  type: BattlefieldCardType;
  name: string;
  description: string;
  points: number;
}

// アクションの種類
export type ActionType = 'attack' | 'defend' | 'pass';

// ゲームアクション
export interface GameAction {
  type: ActionType;
  playerId: string;
  tile?: Tile; // 出した牌（攻めまたは受け）
  timestamp: number;
}

// 攻め列の状態
export interface AttackColumn {
  attackTile: Tile | null; // 現在の攻め牌
  attackerId: string | null; // 攻め側のプレイヤーID
  passedPlayerIds: string[]; // パスしたプレイヤーのID
  currentDefenderId: string | null; // 現在受けを試みているプレイヤーID
}

// ゲームの状態
export interface TigerDragonState {
  gameId: string;
  status: GameStatus;
  players: TigerDragonPlayer[];
  currentRound: number; // 現在のラウンド数
  targetScore: number; // 目標得点（デフォルト10点）
  battlefieldCard: BattlefieldCard; // 現在の戦場カード
  attackColumn: AttackColumn; // 攻め列の状態
  defendColumn: Tile[]; // 受け列（受けた牌の履歴）
  currentPlayerId: string | null; // 現在のプレイヤーID
  startPlayerId: string; // スタートプレイヤーID
  winner: string | null; // 勝者のプレイヤーID
  playerCount: number; // プレイヤー人数（2-5人）
  actionHistory: GameAction[]; // アクション履歴
  createdAt: number;
  updatedAt: number;
}

// クライアント用の状態（手牌が見えないプレイヤーの情報を隠す）
export interface TigerDragonClientState {
  gameId: string;
  status: GameStatus;
  players: {
    id: string;
    name: string;
    handCount: number; // 手牌の枚数のみ表示
    hand: Tile[]; // 自分の手牌のみ見える
    score: number;
    roundBonusCount: number;
    hasFinished: boolean;
    finishTile: Tile | null;
    isCpu: boolean;
  }[];
  myPlayerId: string;
  myPlayer: TigerDragonPlayer | null;
  currentRound: number;
  targetScore: number;
  battlefieldCard: BattlefieldCard;
  attackColumn: AttackColumn;
  defendColumn: Tile[];
  currentPlayerId: string | null;
  startPlayerId: string;
  winner: string | null;
  playerCount: number;
  canAttack: boolean; // 自分が攻めできるか
  canDefend: boolean; // 自分が受けできるか
  canPass: boolean; // 自分がパスできるか
  defendableTiles: Tile[]; // 自分が受けられる牌
}
