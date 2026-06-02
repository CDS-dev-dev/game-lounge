// アイランドセトラーズの定数定義

import type { BuildCost, PlayerColor, TerrainType } from './types';

// ボードサイズ
export const BOARD_SIZE = 6;

// 勝利条件
export const WIN_SCORE = 8;

// 初期建設数
export const INITIAL_VILLAGES = 2;
export const INITIAL_ROADS = 2;

// 最大建設数
export const MAX_VILLAGES = 5;
export const MAX_TOWNS = 4;
export const MAX_ROADS = 15;

// 初期資源
export const INITIAL_RESOURCES = {
  wood: 2,
  stone: 2,
  food: 2,
  gold: 1,
};

// 建設コスト
export const BUILD_COSTS: Record<'road' | 'village' | 'town', BuildCost> = {
  road: {
    wood: 1,
    stone: 0,
    food: 1,
    gold: 0,
  },
  village: {
    wood: 1,
    stone: 1,
    food: 1,
    gold: 1,
  },
  town: {
    wood: 0,
    stone: 2,
    food: 0,
    gold: 3,
  },
};

// 建設物の得点
export const BUILDING_SCORES = {
  village: 1,
  town: 2, // townは村からのアップグレードなので+1点
  road: 0,
};

// 地形タイプと資源の対応
export const TERRAIN_RESOURCES: Record<TerrainType, string | null> = {
  forest: 'wood',
  mountain: 'stone',
  field: 'food',
  water: 'gold',
  desert: null,
};

// プレイヤーカラー
export const PLAYER_COLORS: PlayerColor[] = ['red', 'blue', 'yellow', 'green'];

// サイコロの目の分布（1-6）
export const DICE_MIN = 1;
export const DICE_MAX = 6;

// 交易レート（固定レート：4:1）
export const TRADE_RATE = 4; // 4つの同じ資源を1つの任意の資源と交換

// ボード生成時の地形分布
export const TERRAIN_DISTRIBUTION: Array<{ terrain: TerrainType; count: number; hasNumber: boolean }> = [
  { terrain: 'forest', count: 8, hasNumber: true },
  { terrain: 'mountain', count: 6, hasNumber: true },
  { terrain: 'field', count: 8, hasNumber: true },
  { terrain: 'water', count: 6, hasNumber: true },
  { terrain: 'desert', count: 8, hasNumber: false },
];

// サイコロ目の分布（バランスを取るため）
export const DICE_DISTRIBUTION = [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 1, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6];
