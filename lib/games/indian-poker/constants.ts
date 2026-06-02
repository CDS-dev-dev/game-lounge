// インディアンポーカーの定数定義

// プレイヤー人数制限
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 10;

// 初期チップ数
export const INITIAL_CHIPS = 1000;

// ベット設定
export const ANTE = 10; // アンティ（参加費）
export const INITIAL_MIN_BET = 10; // 初期最小ベット額
export const MIN_RAISE_MULTIPLIER = 2; // レイズは最低でも現在のベットの2倍

// AI思考時間（ミリ秒）
export const AI_THINKING_TIME = 1500;

// CPU名前リスト
export const CPU_NAMES = [
  'アリス',
  'ボブ',
  'キャロル',
  'デイブ',
  'イブ',
  'フランク',
  'グレース',
  'ヘンリー',
  'アイビー',
];

// プレイヤーカラー
export const PLAYER_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#6366f1', // indigo
];
