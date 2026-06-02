// UI/UXスケール定義（システムワイド統一）

/**
 * スペーシングスケール
 * gap、padding、marginで使用
 */
export const SPACING = {
  xs: '2',   // 8px  - 最小間隔
  sm: '3',   // 12px - 小間隔
  md: '4',   // 16px - 標準間隔
  lg: '6',   // 24px - 大間隔
  xl: '8',   // 32px - 特大間隔
} as const;

/**
 * テキストサイズスケール
 * 最小12px（text-xs）を保証
 */
export const TEXT_SIZE = {
  caption: 'text-xs',              // 12px - 補足テキスト
  label: 'text-sm',                // 14px - ラベル
  body: 'text-base',               // 16px - 本文
  title: 'text-lg',                // 18px - 小見出し
  heading3: 'text-xl',             // 20px - 見出し3
  heading2: 'text-xl sm:text-2xl', // 20px/24px - 見出し2
  heading1: 'text-2xl sm:text-3xl',// 24px/30px - 見出し1
  hero: 'text-3xl sm:text-4xl',    // 30px/36px - ヒーロー
} as const;

/**
 * レスポンシブスペーシング
 */
export const RESPONSIVE_SPACING = {
  xs: 'gap-2 sm:gap-3',           // 8px → 12px
  sm: 'gap-3 sm:gap-4',           // 12px → 16px
  md: 'gap-4 sm:gap-6',           // 16px → 24px
} as const;

/**
 * パディングスケール（タップ領域確保）
 */
export const PADDING = {
  xs: 'p-2',                       // 8px
  sm: 'p-3 sm:p-4',                // 12px → 16px
  md: 'p-4 sm:p-6',                // 16px → 24px
  button: 'py-3 px-4',             // ボタン用（最小48px高さ）
  card: 'p-4 sm:p-6',              // カード用
} as const;

/**
 * 最大幅スケール
 */
export const MAX_WIDTH = {
  sm: 'max-w-2xl',    // 672px
  md: 'max-w-3xl',    // 768px - 標準
  lg: 'max-w-4xl',    // 896px
  xl: 'max-w-5xl',    // 1024px
} as const;

/**
 * カード背景色（統一）
 */
export const CARD_BG = 'bg-white/95' as const;

/**
 * ホバー効果（統一）
 */
export const HOVER_SCALE = 'hover:scale-105 transition-all active:scale-95' as const;

/**
 * フォーカススタイル（アクセシビリティ）
 */
export const FOCUS_RING = 'focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2' as const;

/**
 * 最小タップ領域（スマホ対応）
 */
export const MIN_TAP_AREA = 'min-h-[48px] min-w-[48px]' as const;
