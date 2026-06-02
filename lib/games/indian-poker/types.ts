// インディアンポーカーの型定義

import type { Card } from '@/lib/utils/card-utils';

export type PlayerAction = 'waiting' | 'fold' | 'call' | 'raise' | null;
export type GameStatus = 'waiting' | 'betting' | 'showdown' | 'finished';
export type Difficulty = 'easy' | 'medium' | 'hard';

// カードの数値化（強さ比較用）- インディアンポーカーではAが最強
export const RANK_VALUES: Record<string, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14, // Aは最強
};

// Card型は@/lib/utils/card-utilsから再エクスポート
export type { Card };

export interface IndianPokerPlayer {
  id: string;
  name: string;
  card: Card | null; // 他人には見える、自分には見えない
  chips: number; // 所持チップ
  currentBet: number; // 今ラウンドのベット額
  action: PlayerAction; // 最後の行動
  isActive: boolean; // フォールドせずにラウンドに参加中
  isCPU?: boolean; // CPU判定
  difficulty?: Difficulty; // CPUの難易度
}

export interface IndianPokerState {
  gameId: string;
  status: GameStatus;
  players: IndianPokerPlayer[];
  currentTurn: number; // プレイヤーインデックス
  pot: number; // 賭け金総額
  currentBet: number; // 現在のベット額
  minRaise: number; // 最小レイズ額
  deck: Card[];
  round: number; // ラウンド数
  dealerIndex: number; // ディーラー位置
  bettingStartIndex: number; // ベッティング開始位置
  consecutiveCalls: number; // 連続コール数（全員がコールしたらショーダウン）
  createdAt: number;
  updatedAt: number;
}

// クライアント用の状態（自分のカードを隠す）
export interface IndianPokerClientState {
  gameId: string;
  status: GameStatus;
  players: IndianPokerClientPlayer[];
  currentTurn: number;
  myIndex: number; // 自分のプレイヤーインデックス
  isMyTurn: boolean;
  canOperate: boolean;
  pot: number;
  currentBet: number;
  minRaise: number;
  round: number;
  myChips: number;
  myCurrentBet: number;
  callAmount: number; // コールに必要な額
  canRaise: boolean; // レイズ可能か
  canCheck: boolean; // チェック可能か（ベット0の時）
}

export interface IndianPokerClientPlayer {
  id: string;
  name: string;
  card: Card | null; // 自分以外は見える
  chips: number;
  currentBet: number;
  action: PlayerAction;
  isActive: boolean;
  isCPU?: boolean;
}

// アクションの種類
export interface BettingAction {
  type: 'fold' | 'call' | 'check' | 'raise' | 'allin';
  amount?: number; // レイズ額（raiseの場合）
}

// ショーダウン結果
export interface ShowdownResult {
  winners: number[]; // 勝者のプレイヤーインデックス配列（引き分けあり）
  winningHand: Card;
  potShare: number; // 各勝者の取り分
}
