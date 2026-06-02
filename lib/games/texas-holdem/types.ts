// テキサスホールデムの型定義

import type { Card as CommonCard } from '@/lib/utils/card-utils';

// カードのスート
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

// カードのランク（2-10, J, Q, K, A）
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

// カード
export interface Card {
  suit: Suit;
  rank: Rank;
  id: string; // ユニークID（デバッグ用）
}

// カード変換関数（共通型への変換）
export function toCommonCard(card: Card): CommonCard {
  return {
    suit: card.suit as CommonCard['suit'],
    rank: card.rank as CommonCard['rank'],
    id: card.id,
  };
}

// プレイヤーのアクション
export type PlayerAction = 'fold' | 'check' | 'call' | 'raise' | 'allin' | null;

// ゲームステータス
export type GameStatus = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'finished';

// プレイヤー情報
export interface TexasHoldemPlayer {
  id: string;
  name: string;
  chips: number; // 所持チップ
  holeCards: [Card, Card] | null; // 手札2枚（nullは未配布）
  currentBet: number; // 今ラウンドのベット額
  totalBet: number; // ゲーム全体でのベット額
  action: PlayerAction; // 最後に取ったアクション
  isActive: boolean; // ゲームに参加中か（フォールドしていない）
  isAllin: boolean; // オールインしているか
  position: number; // テーブル上の位置（0-8）
  isCpu: boolean; // CPUプレイヤーか
}

// ポーカーの役
export enum PokerHand {
  HighCard = 0,
  OnePair = 1,
  TwoPair = 2,
  ThreeOfAKind = 3,
  Straight = 4,
  Flush = 5,
  FullHouse = 6,
  FourOfAKind = 7,
  StraightFlush = 8,
  RoyalFlush = 9,
}

// 役の評価結果
export interface HandEvaluation {
  hand: PokerHand;
  rank: number; // 同じ役同士の強さ比較用（高いほど強い）
  description: string; // 役の説明（日本語）
  cards: Card[]; // 役を構成するカード5枚
}

// ゲーム状態
export interface TexasHoldemState {
  gameId: string;
  status: GameStatus;
  players: TexasHoldemPlayer[];
  communityCards: Card[]; // コミュニティカード（最大5枚）
  deck: Card[]; // 残りのデッキ
  pot: number; // ポット（賭け金総額）
  currentBet: number; // 現在のベット額（このラウンドでコールするのに必要な額）
  minRaise: number; // 最小レイズ額
  dealerButton: number; // ディーラーボタンの位置（プレイヤーインデックス）
  currentTurn: number; // 現在のターンのプレイヤーインデックス
  smallBlind: number; // スモールブラインド額
  bigBlind: number; // ビッグブラインド額
  round: number; // ラウンド番号
  winners: {
    playerId: string;
    amount: number;
    hand: HandEvaluation;
  }[]; // 勝者情報（ショーダウン後）
  createdAt: number;
  updatedAt: number;
}

// クライアント用のゲーム状態
export interface TexasHoldemClientState {
  gameId: string;
  status: GameStatus;
  players: TexasHoldemPlayer[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  minRaise: number;
  currentTurn: number;
  dealerButton: number;
  smallBlind: number;
  bigBlind: number;
  myPlayerId: string;
  myPosition: number;
  myChips: number;
  myCards: [Card, Card] | null;
  isMyTurn: boolean;
  canCheck: boolean;
  canCall: boolean;
  canRaise: boolean;
  canFold: boolean;
  callAmount: number; // コールに必要な額
  winners: {
    playerId: string;
    amount: number;
    hand: HandEvaluation;
  }[];
}
