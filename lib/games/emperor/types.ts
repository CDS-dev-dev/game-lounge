// エンペラーゲーム（カイジのEカード）の型定義

export type GameStatus = 'ready' | 'playing' | 'roundEnd' | 'finished';
export type CardType = 'emperor' | 'citizen' | 'slave';
export type PlayerSide = 'emperor' | 'slave';

// カード
export interface ECard {
  id: string;
  type: CardType;
}

// プレイヤー
export interface EmperorPlayer {
  id: string;
  name: string;
  side: PlayerSide; // 皇帝側か奴隷側か
  hand: ECard[]; // 現在の手札
  score: number; // 合計得点
  isCpu: boolean;
  cpuDifficulty?: 'easy' | 'medium' | 'hard';
}

// 1回の勝負の結果
export interface BattleResult {
  playerCard: ECard | null;
  cpuCard: ECard | null;
  winner: 'player' | 'cpu' | 'draw';
  playerPoints: number;
  cpuPoints: number;
}

// ゲーム状態
export interface EmperorState {
  gameId: string;
  status: GameStatus;
  players: EmperorPlayer[];
  currentSet: number; // 現在のセット（1-6）
  maxSets: number; // 最大セット数（6）
  currentBattle: number; // 現在のセット内での勝負回数（1-5）
  battleHistory: BattleResult[]; // セット内の勝負履歴
  playerCard: ECard | null; // プレイヤーが選択したカード
  cpuCard: ECard | null; // CPUが選択したカード
  lastBattleResult: BattleResult | null; // 最後の勝負結果
  winner: string | null; // ゲーム全体の勝者
  createdAt: number;
  updatedAt: number;
}

// クライアント用の状態
export interface EmperorClientState {
  gameId: string;
  status: GameStatus;
  myPlayerId: string;
  myPlayer: EmperorPlayer | null;
  opponentPlayer: EmperorPlayer | null;
  currentSet: number;
  maxSets: number;
  currentBattle: number;
  battleHistory: BattleResult[];
  playerCard: ECard | null;
  cpuCard: ECard | null;
  lastBattleResult: BattleResult | null;
  winner: string | null;
}
