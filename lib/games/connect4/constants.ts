// 立体四目並べの定数

// 盤面サイズ
export const BOARD_SIZE = 4; // 4×4×4

// 勝利条件
export const WIN_COUNT = 4; // 4つ揃えたら勝ち

// プレイヤーカラー
export const PLAYER_COLORS = {
  player1: {
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-400',
    textColor: 'text-blue-500',
    emoji: '🔵',
    name: 'プレイヤー1（青）',
  },
  player2: {
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-400',
    textColor: 'text-red-500',
    emoji: '🔴',
    name: 'プレイヤー2（赤）',
  },
} as const;

// 勝利判定用の方向ベクトル
// [dx, dy, dz]の形式
export const WIN_DIRECTIONS = [
  // 水平方向（x軸）
  { dx: 1, dy: 0, dz: 0 },
  // 水平方向（y軸）
  { dx: 0, dy: 1, dz: 0 },
  // 垂直方向（z軸）
  { dx: 0, dy: 0, dz: 1 },
  // xy平面の斜め
  { dx: 1, dy: 1, dz: 0 },
  { dx: 1, dy: -1, dz: 0 },
  // xz平面の斜め
  { dx: 1, dy: 0, dz: 1 },
  { dx: 1, dy: 0, dz: -1 },
  // yz平面の斜め
  { dx: 0, dy: 1, dz: 1 },
  { dx: 0, dy: 1, dz: -1 },
  // 3次元の斜め（4方向）
  { dx: 1, dy: 1, dz: 1 },
  { dx: 1, dy: 1, dz: -1 },
  { dx: 1, dy: -1, dz: 1 },
  { dx: 1, dy: -1, dz: -1 },
] as const;
