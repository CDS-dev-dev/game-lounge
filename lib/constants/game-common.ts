// ゲーム共通の定数

// プレイヤーID
export const PLAYER_HUMAN_ID = 'player-human';
export const PLAYER_CPU_ID = 'player-cpu';
export const PLAYER_1_ID = 'player1';
export const PLAYER_2_ID = 'player2';

// 共通のゲームフェーズ型
export type CommonGamePhase = 'setup' | 'playing' | 'finished';

// CPU思考時間（ミリ秒）
export const CPU_THINKING_DELAY = {
  MIN: 500,
  MAX: 1500,
  DEFAULT: 1000,
} as const;

// 難易度レベル
export type DifficultyLevel = 'easy' | 'normal' | 'hard';

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: '簡単',
  normal: '普通',
  hard: '難しい',
} as const;

export const DIFFICULTY_ICONS: Record<DifficultyLevel, string> = {
  easy: '🟢',
  normal: '🟡',
  hard: '🔴',
} as const;

// ターン制限
export const DEFAULT_MAX_TURNS = 100;

// アニメーション時間
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;
