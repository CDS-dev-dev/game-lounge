// 中国象棋のルール検証テスト

console.log('🎮 中国象棋 ルール検証テスト開始...\n');

// ルール定義書との整合性確認
const rules = {
  boardSize: { cols: 9, rows: 10 },
  pieces: {
    king: { count: 1, name: '帥/将', movement: '九宮内で縦横1マス' },
    advisor: { count: 2, name: '仕/士', movement: '九宮内で斜め1マス' },
    elephant: { count: 2, name: '相/象', movement: '斜め2マス（塞象眼あり）、川を渡れない' },
    horse: { count: 2, name: '馬', movement: '日の字型（蹩馬腿あり）' },
    chariot: { count: 2, name: '車', movement: '縦横に何マスでも' },
    cannon: { count: 2, name: '炮/砲', movement: '縦横に何マスでも、攻撃時は1駒飛び越え' },
    soldier: { count: 5, name: '兵/卒', movement: '川渡り前は前のみ、渡り後は前・左・右' },
  },
  specialRules: [
    '王の対面禁止',
    '塞象眼（象の移動経路に駒があると移動不可）',
    '蹩馬腿（馬の最初の1マスに駒があると移動不可）',
    '炮の飛び越え攻撃',
    '兵の川渡り後の横移動',
    '相/象の川渡り禁止',
    '将/士の九宮制限',
  ],
  winConditions: [
    '将死（チェックメイト）',
    '困毙（ステイルメイト＝負け）',
  ],
};

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    testsFailed++;
  }
}

// ========================================
// 1. 定数定義の確認
// ========================================
console.log('=== 1. 定数定義確認 ===');

test('ボードサイズが9×10', () => {
  const { BOARD_COLS, BOARD_ROWS } = require('./lib/games/xiangqi/constants');
  if (BOARD_COLS !== 9) throw new Error(`列数が${BOARD_COLS}（9であるべき）`);
  if (BOARD_ROWS !== 10) throw new Error(`行数が${BOARD_ROWS}（10であるべき）`);
});

test('楚河漢界の定義', () => {
  const { RIVER_ROW_TOP, RIVER_ROW_BOTTOM } = require('./lib/games/xiangqi/constants');
  if (RIVER_ROW_TOP !== 4) throw new Error('楚河の位置が不正');
  if (RIVER_ROW_BOTTOM !== 5) throw new Error('漢界の位置が不正');
});

test('九宮の範囲定義', () => {
  const { PALACE_COLS, PALACE_ROWS_RED, PALACE_ROWS_BLACK } = require('./lib/games/xiangqi/constants');
  if (PALACE_COLS.min !== 3 || PALACE_COLS.max !== 5) {
    throw new Error('九宮の列範囲が不正');
  }
  if (PALACE_ROWS_RED.min !== 0 || PALACE_ROWS_RED.max !== 2) {
    throw new Error('紅九宮の行範囲が不正');
  }
  if (PALACE_ROWS_BLACK.min !== 7 || PALACE_ROWS_BLACK.max !== 9) {
    throw new Error('黒九宮の行範囲が不正');
  }
});

test('駒の種類が7種類', () => {
  const { PIECE_NAMES } = require('./lib/games/xiangqi/constants');
  const redTypes = Object.keys(PIECE_NAMES.red);
  if (redTypes.length !== 7) {
    throw new Error(`駒の種類が${redTypes.length}種類（7種類であるべき）`);
  }
});

test('初期配置の駒数が正しい', () => {
  const { INITIAL_POSITIONS } = require('./lib/games/xiangqi/constants');

  // 紅の駒数確認
  let redCount = 0;
  for (const positions of Object.values(INITIAL_POSITIONS.red)) {
    redCount += positions.length;
  }
  if (redCount !== 16) {
    throw new Error(`紅の駒数が${redCount}（16であるべき）`);
  }

  // 黒の駒数確認
  let blackCount = 0;
  for (const positions of Object.values(INITIAL_POSITIONS.black)) {
    blackCount += positions.length;
  }
  if (blackCount !== 16) {
    throw new Error(`黒の駒数が${blackCount}（16であるべき）`);
  }
});

console.log('');

// ========================================
// 2. 駒の移動ルール確認
// ========================================
console.log('=== 2. 駒の移動ルール確認 ===');

test('帥/将は九宮内で縦横1マス', () => {
  const { isValidKingMove } = require('./lib/games/xiangqi/piece-rules');
  const dummyState = { board: Array(10).fill(null).map(() => Array(9).fill(null)) };

  // 有効な移動
  if (!isValidKingMove(dummyState, { col: 4, row: 0 }, { col: 4, row: 1 }, 'red')) {
    throw new Error('縦1マス移動が不可');
  }
  if (!isValidKingMove(dummyState, { col: 4, row: 0 }, { col: 5, row: 0 }, 'red')) {
    throw new Error('横1マス移動が不可');
  }

  // 無効な移動（九宮外）
  if (isValidKingMove(dummyState, { col: 4, row: 0 }, { col: 2, row: 0 }, 'red')) {
    throw new Error('九宮外への移動が可能になっている');
  }

  // 無効な移動（斜め）
  if (isValidKingMove(dummyState, { col: 4, row: 0 }, { col: 5, row: 1 }, 'red')) {
    throw new Error('斜め移動が可能になっている');
  }
});

test('仕/士は九宮内で斜め1マス', () => {
  const { isValidAdvisorMove } = require('./lib/games/xiangqi/piece-rules');
  const dummyState = { board: Array(10).fill(null).map(() => Array(9).fill(null)) };

  // 有効な移動
  if (!isValidAdvisorMove(dummyState, { col: 3, row: 0 }, { col: 4, row: 1 }, 'red')) {
    throw new Error('斜め1マス移動が不可');
  }

  // 無効な移動（縦横）
  if (isValidAdvisorMove(dummyState, { col: 3, row: 0 }, { col: 4, row: 0 }, 'red')) {
    throw new Error('縦横移動が可能になっている');
  }

  // 無効な移動（九宮外）
  if (isValidAdvisorMove(dummyState, { col: 3, row: 0 }, { col: 2, row: 1 }, 'red')) {
    throw new Error('九宮外への移動が可能になっている');
  }
});

test('相/象は斜め2マス、川を渡れない', () => {
  const { isValidElephantMove } = require('./lib/games/xiangqi/piece-rules');
  const board = Array(10).fill(null).map(() => Array(9).fill(null));
  const dummyState = { board };

  // 有効な移動（自陣内）
  if (!isValidElephantMove(dummyState, { col: 2, row: 0 }, { col: 4, row: 2 }, 'red')) {
    throw new Error('斜め2マス移動が不可');
  }

  // 無効な移動（川を渡る）
  if (isValidElephantMove(dummyState, { col: 2, row: 2 }, { col: 4, row: 6 }, 'red')) {
    throw new Error('川を渡る移動が可能になっている');
  }

  // 塞象眼チェック
  board[1][3] = { type: 'soldier', owner: 'red' }; // 中間に駒を配置
  if (isValidElephantMove(dummyState, { col: 2, row: 0 }, { col: 4, row: 2 }, 'red')) {
    throw new Error('塞象眼が機能していない');
  }
});

test('馬は日の字型、蹩馬腿あり', () => {
  const { isValidHorseMove } = require('./lib/games/xiangqi/piece-rules');
  const board = Array(10).fill(null).map(() => Array(9).fill(null));
  const dummyState = { board };

  // 有効な移動
  if (!isValidHorseMove(dummyState, { col: 1, row: 0 }, { col: 2, row: 2 })) {
    throw new Error('日の字型移動が不可');
  }

  // 蹩馬腿チェック
  board[1][1] = { type: 'soldier', owner: 'red' }; // 最初の1マスに駒を配置
  if (isValidHorseMove(dummyState, { col: 1, row: 0 }, { col: 2, row: 2 })) {
    throw new Error('蹩馬腿が機能していない');
  }
});

test('車は縦横に何マスでも', () => {
  const { isValidChariotMove } = require('./lib/games/xiangqi/piece-rules');
  const board = Array(10).fill(null).map(() => Array(9).fill(null));
  const dummyState = { board };

  // 有効な移動（縦）
  if (!isValidChariotMove(dummyState, { col: 0, row: 0 }, { col: 0, row: 9 })) {
    throw new Error('縦の直線移動が不可');
  }

  // 有効な移動（横）
  if (!isValidChariotMove(dummyState, { col: 0, row: 0 }, { col: 8, row: 0 })) {
    throw new Error('横の直線移動が不可');
  }

  // 無効な移動（斜め）
  if (isValidChariotMove(dummyState, { col: 0, row: 0 }, { col: 1, row: 1 })) {
    throw new Error('斜め移動が可能になっている');
  }

  // 間に駒があると移動不可
  board[5][0] = { type: 'soldier', owner: 'red' };
  if (isValidChariotMove(dummyState, { col: 0, row: 0 }, { col: 0, row: 9 })) {
    throw new Error('間に駒がある時の移動制限が機能していない');
  }
});

test('炮は飛び越え攻撃', () => {
  const { isValidCannonMove } = require('./lib/games/xiangqi/piece-rules');
  const board = Array(10).fill(null).map(() => Array(9).fill(null));
  const dummyState = { board };

  // 移動（間に駒なし）
  if (!isValidCannonMove(dummyState, { col: 1, row: 2 }, { col: 1, row: 5 })) {
    throw new Error('通常の移動が不可');
  }

  // 攻撃（1つ飛び越え）
  board[4][1] = { type: 'soldier', owner: 'red' }; // 台駒
  board[5][1] = { type: 'soldier', owner: 'black' }; // 敵駒
  if (!isValidCannonMove(dummyState, { col: 1, row: 2 }, { col: 1, row: 5 })) {
    throw new Error('飛び越え攻撃が不可');
  }

  // 無効（2つ飛び越え）
  board[3][1] = { type: 'soldier', owner: 'red' };
  if (isValidCannonMove(dummyState, { col: 1, row: 2 }, { col: 1, row: 5 })) {
    throw new Error('2つ飛び越える攻撃が可能になっている');
  }
});

test('兵/卒は川渡り前後で移動が変わる', () => {
  const { isValidSoldierMove } = require('./lib/games/xiangqi/piece-rules');
  const dummyState = { board: Array(10).fill(null).map(() => Array(9).fill(null)) };

  // 川渡り前（前のみ）
  if (!isValidSoldierMove(dummyState, { col: 0, row: 3 }, { col: 0, row: 4 }, 'red', false)) {
    throw new Error('前への移動が不可');
  }
  if (isValidSoldierMove(dummyState, { col: 0, row: 3 }, { col: 1, row: 3 }, 'red', false)) {
    throw new Error('川渡り前の横移動が可能になっている');
  }

  // 川渡り後（前・左・右）
  if (!isValidSoldierMove(dummyState, { col: 0, row: 5 }, { col: 1, row: 5 }, 'red', true)) {
    throw new Error('川渡り後の横移動が不可');
  }

  // 後退禁止
  if (isValidSoldierMove(dummyState, { col: 0, row: 5 }, { col: 0, row: 4 }, 'red', true)) {
    throw new Error('後退が可能になっている');
  }
});

console.log('');

// ========================================
// テスト結果サマリー
// ========================================
console.log('='.repeat(50));
console.log('📊 ルール検証テスト結果');
console.log('='.repeat(50));
console.log(`✅ 成功: ${testsPassed}`);
console.log(`❌ 失敗: ${testsFailed}`);
console.log(`合計: ${testsPassed + testsFailed}`);
console.log(`成功率: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
console.log('='.repeat(50));

if (testsFailed === 0) {
  console.log('\n🎉 全てのルール検証テストに合格しました！');
  console.log('\n✅ 検証項目：');
  console.log('  - ボードサイズ・楚河漢界・九宮の定義');
  console.log('  - 7種類の駒の正確な移動ルール');
  console.log('  - 特殊ルール（塞象眼、蹩馬腿、飛び越え攻撃）');
  console.log('  - 川渡りと九宮制限');
  process.exit(0);
} else {
  console.log('\n⚠️  一部のルールで問題が見つかりました。');
  process.exit(1);
}
