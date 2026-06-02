// エンペラーゲーム（カイジのEカード）の定数定義

// セット数
export const MAX_SETS = 6;

// 初期手札構成
export const INITIAL_HAND = {
  emperor: { emperor: 1, citizen: 4 }, // 皇帝側: 皇帝1枚、市民4枚
  slave: { slave: 1, citizen: 4 }, // 奴隷側: 奴隷1枚、市民4枚
};

// 得点
export const POINTS = {
  emperorWin: 1, // 皇帝側が勝った場合
  slaveWin: 5, // 奴隷側が勝った場合
  draw: 0, // 引き分け
};

// 1セット内の最大勝負回数
export const MAX_BATTLES_PER_SET = 5;

// カードの表示名
export const CARD_NAMES: Record<string, string> = {
  emperor: '皇帝',
  citizen: '市民',
  slave: '奴隷',
};

// カードの絵文字
export const CARD_EMOJIS: Record<string, string> = {
  emperor: '👑',
  citizen: '🧑',
  slave: '⛓️',
};

// カードの色
export const CARD_COLORS: Record<string, string> = {
  emperor: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white border-yellow-700',
  citizen: 'bg-gradient-to-br from-blue-400 to-blue-600 text-white border-blue-700',
  slave: 'bg-gradient-to-br from-gray-400 to-gray-600 text-white border-gray-700',
};

// サイドの表示名
export const SIDE_NAMES: Record<string, string> = {
  emperor: '皇帝側',
  slave: '奴隷側',
};

// サイドの色
export const SIDE_COLORS: Record<string, string> = {
  emperor: 'text-yellow-500 bg-yellow-900/30 border-yellow-500',
  slave: 'text-gray-400 bg-gray-900/30 border-gray-500',
};
