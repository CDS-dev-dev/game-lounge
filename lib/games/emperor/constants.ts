// エンペラーゲームの定数定義

// プレイヤー人数
export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 6;

// 初期コイン数
export const INITIAL_COINS = 10;

// 奴隷が皇帝に渡すコイン数
export const TRANSFER_COINS = 3;

// 最大ラウンド数（破産者が出たら終了するので、実質的には無限）
export const MAX_ROUNDS = 50;

// カードのランクと階級の対応
// K = 皇帝（最も強い）
// Q = 市民（中間）
// J = 奴隷（最も弱い）
export const CARD_RANK_VALUES: Record<string, number> = {
  K: 3, // 皇帝
  Q: 2, // 市民
  J: 1, // 奴隷
};

// 階級の表示名
export const RANK_NAMES: Record<string, string> = {
  emperor: '皇帝',
  citizen: '市民',
  slave: '奴隷',
};

// 階級の色
export const RANK_COLORS: Record<string, string> = {
  emperor: 'text-yellow-500 bg-yellow-50 border-yellow-500',
  citizen: 'text-blue-500 bg-blue-50 border-blue-500',
  slave: 'text-gray-500 bg-gray-50 border-gray-500',
};

// 階級の絵文字
export const RANK_EMOJIS: Record<string, string> = {
  emperor: '👑',
  citizen: '🧑',
  slave: '⛓️',
};

// カードランクと階級の対応
export const CARD_TO_RANK: Record<string, RankType> = {
  K: 'emperor',
  Q: 'citizen',
  J: 'slave',
};

import type { RankType } from './types';
