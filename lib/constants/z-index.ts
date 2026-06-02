// z-index階層定義
// アプリ全体で一貫したz-indexを使用するための定数

export const Z_INDEX = {
  /** ゲームヘッダー（常に最上位に表示） */
  HEADER: 1000,

  /** モーダルダイアログ（ルール説明、確認ダイアログなど） */
  MODAL: 900,

  /** オーバーレイ（CPU思考中、ローディングなど） */
  OVERLAY: 800,

  /** トースト通知 */
  TOAST: 700,

  /** フローティングボタン（キーボードヘルプなど） */
  FLOATING: 600,
} as const;

export type ZIndexKey = keyof typeof Z_INDEX;
