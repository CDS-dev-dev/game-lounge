// タイガー＆ドラゴンゲームの定数定義

import type { BattlefieldCard, TileType } from './types';

// プレイヤー人数
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 5;

// 初期手牌枚数（プレイヤー人数による）
export const PLAYER_HAND_COUNT: Record<number, number> = {
  2: 20, // 2人：各20枚
  3: 13, // 3人：各13枚
  4: 10, // 4人：各10枚
  5: 8, // 5人：各8枚
};

// スタートプレイヤーは+1枚
export const START_PLAYER_BONUS = 1;

// 目標得点
export const TARGET_SCORE = 10;

// 牌の構成
export const TILE_COUNTS: Record<TileType, number> = {
  1: 5,
  2: 5,
  3: 5,
  4: 5,
  5: 5,
  6: 5,
  7: 5,
  8: 5,
  tiger: 1,
  dragon: 1,
};

// 合計42枚
export const TOTAL_TILES = 42;

// 偶数牌
export const EVEN_TILES: TileType[] = [2, 4, 6, 8];

// 奇数牌
export const ODD_TILES: TileType[] = [1, 3, 5, 7];

// 小さい数牌
export const SMALL_TILES: TileType[] = [1, 2, 3, 4];

// 大きい数牌
export const LARGE_TILES: TileType[] = [5, 6, 7, 8];

// 奥義牌
export const SECRET_TILES: TileType[] = ['tiger', 'dragon'];

// 戦場カード一覧
export const BATTLEFIELD_CARDS: BattlefieldCard[] = [
  {
    type: 'even',
    name: '偶数の道',
    description: '偶数（2,4,6,8）で上がり → 2点',
    points: 2,
  },
  {
    type: 'odd',
    name: '奇数の道',
    description: '奇数（1,3,5,7）で上がり → 2点',
    points: 2,
  },
  {
    type: 'small',
    name: '小さき者の道',
    description: '小さい数（1,2,3,4）で上がり → 2点',
    points: 2,
  },
  {
    type: 'large',
    name: '大いなる道',
    description: '大きい数（5,6,7,8）で上がり → 2点',
    points: 2,
  },
  {
    type: 'secret',
    name: '奥義の道',
    description: '奥義（タイガー/ドラゴン）で上がり → 3点',
    points: 3,
  },
  {
    type: 'any',
    name: '万能の道',
    description: '何で上がっても → 1点',
    points: 1,
  },
];

// 牌の表示名
export const TILE_DISPLAY_NAMES: Record<TileType, string> = {
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  tiger: 'タイガー',
  dragon: 'ドラゴン',
};

// 牌の絵文字
export const TILE_EMOJIS: Record<TileType, string> = {
  1: '①',
  2: '②',
  3: '③',
  4: '④',
  5: '⑤',
  6: '⑥',
  7: '⑦',
  8: '⑧',
  tiger: '🐯',
  dragon: '🐉',
};

// 牌の色（偶数・奇数・奥義）
export const TILE_COLORS: Record<string, string> = {
  even: 'bg-blue-100 border-blue-500 text-blue-700',
  odd: 'bg-red-100 border-red-500 text-red-700',
  tiger: 'bg-orange-100 border-orange-500 text-orange-700',
  dragon: 'bg-purple-100 border-purple-500 text-purple-700',
};

// 戦場カードの色
export const BATTLEFIELD_CARD_COLORS: Record<string, string> = {
  even: 'bg-blue-50 border-blue-400',
  odd: 'bg-red-50 border-red-400',
  small: 'bg-green-50 border-green-400',
  large: 'bg-yellow-50 border-yellow-400',
  secret: 'bg-purple-50 border-purple-400',
  any: 'bg-gray-50 border-gray-400',
};

// 1周ボーナスの追加得点
export const ONE_ROUND_BONUS_POINTS = 1;
