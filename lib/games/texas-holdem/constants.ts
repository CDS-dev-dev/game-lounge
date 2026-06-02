// テキサスホールデムの定数

import type { Rank, Suit } from './types';

// プレイヤー人数の制約
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 9;

// ブラインド
export const DEFAULT_SMALL_BLIND = 10;
export const DEFAULT_BIG_BLIND = 20;
export const DEFAULT_STARTING_CHIPS = 1000;

// カードのスート（定義順序）
export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

// カードのランク（強さ順、Aが最強）
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// ランクの数値変換（比較用）
export const RANK_VALUES: Record<Rank, number> = {
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
  'A': 14, // Aは最強（ストレートの場合は1にもなる）
};

// スートの表示名（日本語）
export const SUIT_NAMES: Record<Suit, string> = {
  hearts: 'ハート',
  diamonds: 'ダイヤ',
  clubs: 'クラブ',
  spades: 'スペード',
};

// ランクの表示名（日本語）
export const RANK_NAMES: Record<Rank, string> = {
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  'J': 'J',
  'Q': 'Q',
  'K': 'K',
  'A': 'A',
};

// 役の名前（日本語）
export const HAND_NAMES = [
  'ハイカード',
  'ワンペア',
  'ツーペア',
  'スリーカード',
  'ストレート',
  'フラッシュ',
  'フルハウス',
  'フォーカード',
  'ストレートフラッシュ',
  'ロイヤルフラッシュ',
] as const;
