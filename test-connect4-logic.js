// 立体四目並べ ゲームロジック詳細テスト

const {
  createInitialState,
  joinPlayer2,
  placePiece,
  checkWinner,
  getAvailablePositions,
  canPlacePiece
} = require('./lib/games/connect4/engine');

const { calculateCpuMove } = require('./lib/games/connect4/ai');

console.log('🎮 立体四目並べ ゲームロジックテスト開始...\n');

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
// 1. 初期状態テスト
// ========================================
console.log('=== 1. 初期状態テスト ===');

test('初期状態作成', () => {
  const state = createInitialState('test-game', 'player1');
  if (state.status !== 'waiting') throw new Error('初期状態がwaitingでない');
  if (state.currentTurn !== 'player1') throw new Error('初期ターンがplayer1でない');
  if (state.board.length !== 4) throw new Error('ボードの高さが4でない');
});

test('プレイヤー2参加', () => {
  let state = createInitialState('test-game', 'player1');
  state = joinPlayer2(state, 'player2');
  if (state.status !== 'playing') throw new Error('状態がplayingにならない');
  if (!state.players.player2) throw new Error('player2が登録されない');
});

console.log('');

// ========================================
// 2. 配置ルールテスト
// ========================================
console.log('=== 2. 配置ルールテスト ===');

test('レベル1に配置可能', () => {
  let state = createInitialState('test-game', 'player1');
  state = joinPlayer2(state, 'player2');
  if (!canPlacePiece(state, { x: 0, y: 0, z: 0 })) {
    throw new Error('レベル1に配置できない');
  }
});

test('空中には配置不可', () => {
  let state = createInitialState('test-game', 'player1');
  state = joinPlayer2(state, 'player2');
  if (canPlacePiece(state, { x: 0, y: 0, z: 2 })) {
    throw new Error('空中に配置できてしまう');
  }
});

test('駒の上には配置可能', () => {
  let state = createInitialState('test-game', 'player1');
  state = joinPlayer2(state, 'player2');
  state = placePiece(state, 'player1', { x: 0, y: 0, z: 0 });
  if (!canPlacePiece(state, { x: 0, y: 0, z: 1 })) {
    throw new Error('駒の上に配置できない');
  }
});

test('既に駒がある場所には配置不可', () => {
  let state = createInitialState('test-game', 'player1');
  state = joinPlayer2(state, 'player2');
  state = placePiece(state, 'player1', { x: 0, y: 0, z: 0 });
  if (canPlacePiece(state, { x: 0, y: 0, z: 0 })) {
    throw new Error('既に駒がある場所に配置できてしまう');
  }
});

console.log('');

// ========================================
// 3. ターン管理テスト
// ========================================
console.log('=== 3. ターン管理テスト ===');

test('配置後にターンが交代', () => {
  let state = createInitialState('test-game', 'player1');
  state = joinPlayer2(state, 'player2');
  state = placePiece(state, 'player1', { x: 0, y: 0, z: 0 });
  if (state.currentTurn !== 'player2') {
    throw new Error('ターンが交代しない');
  }
});

test('相手のターンには配置不可', () => {
  let state = createInitialState('test-game', 'player1');
  state = joinPlayer2(state, 'player2');
  try {
    state = placePiece(state, 'player2', { x: 0, y: 0, z: 0 });
    throw new Error('相手のターンに配置できてしまった');
  } catch (error) {
    if (!error.message.includes('ターン')) {
      throw new Error('エラーメッセージが不適切');
    }
  }
});

console.log('');

// ========================================
// 4. 勝利判定テスト
// ========================================
console.log('=== 4. 勝利判定テスト ===');

test('水平方向（X軸）で4つ揃える', () => {
  let state = createInitialState('test-game', 'player1');
  state = joinPlayer2(state, 'player2');

  // Player1: (0,0,0), (1,0,0), (2,0,0), (3,0,0)
  state = placePiece(state, 'player1', { x: 0, y: 0, z: 0 });
  state = placePiece(state, 'player2', { x: 0, y: 1, z: 0 });
  state = placePiece(state, 'player1', { x: 1, y: 0, z: 0 });
  state = placePiece(state, 'player2', { x: 1, y: 1, z: 0 });
  state = placePiece(state, 'player1', { x: 2, y: 0, z: 0 });
  state = placePiece(state, 'player2', { x: 2, y: 1, z: 0 });
  state = placePiece(state, 'player1', { x: 3, y: 0, z: 0 });

  const result = checkWinner(state);
  if (result.winner !== 'player1') {
    throw new Error('水平方向の勝利判定が動作しない');
  }
});

test('垂直方向（Z軸）で4つ揃える', () => {
  let state = createInitialState('test-game', 'player1');
  state = joinPlayer2(state, 'player2');

  // Player1: (0,0,0), (0,0,1), (0,0,2), (0,0,3)
  state = placePiece(state, 'player1', { x: 0, y: 0, z: 0 });
  state = placePiece(state, 'player2', { x: 1, y: 0, z: 0 });
  state = placePiece(state, 'player1', { x: 0, y: 0, z: 1 });
  state = placePiece(state, 'player2', { x: 1, y: 0, z: 1 });
  state = placePiece(state, 'player1', { x: 0, y: 0, z: 2 });
  state = placePiece(state, 'player2', { x: 1, y: 0, z: 2 });
  state = placePiece(state, 'player1', { x: 0, y: 0, z: 3 });

  const result = checkWinner(state);
  if (result.winner !== 'player1') {
    throw new Error('垂直方向の勝利判定が動作しない');
  }
});

test('3次元斜め方向で4つ揃える', () => {
  let state = createInitialState('test-game', 'player1');
  state = joinPlayer2(state, 'player2');

  // Player1: (0,0,0), (1,1,1), (2,2,2), (3,3,3)
  state = placePiece(state, 'player1', { x: 0, y: 0, z: 0 });
  state = placePiece(state, 'player2', { x: 0, y: 1, z: 0 });

  state = placePiece(state, 'player1', { x: 1, y: 1, z: 0 });
  state = placePiece(state, 'player2', { x: 0, y: 2, z: 0 });
  state = placePiece(state, 'player1', { x: 1, y: 1, z: 1 });
  state = placePiece(state, 'player2', { x: 0, y: 3, z: 0 });

  state = placePiece(state, 'player1', { x: 2, y: 2, z: 0 });
  state = placePiece(state, 'player2', { x: 1, y: 0, z: 0 });
  state = placePiece(state, 'player1', { x: 2, y: 2, z: 1 });
  state = placePiece(state, 'player2', { x: 1, y: 2, z: 0 });
  state = placePiece(state, 'player1', { x: 2, y: 2, z: 2 });
  state = placePiece(state, 'player2', { x: 1, y: 3, z: 0 });

  state = placePiece(state, 'player1', { x: 3, y: 3, z: 0 });
  state = placePiece(state, 'player2', { x: 2, y: 0, z: 0 });
  state = placePiece(state, 'player1', { x: 3, y: 3, z: 1 });
  state = placePiece(state, 'player2', { x: 2, y: 1, z: 0 });
  state = placePiece(state, 'player1', { x: 3, y: 3, z: 2 });
  state = placePiece(state, 'player2', { x: 2, y: 3, z: 0 });
  state = placePiece(state, 'player1', { x: 3, y: 3, z: 3 });

  const result = checkWinner(state);
  if (result.winner !== 'player1') {
    throw new Error('3次元斜めの勝利判定が動作しない');
  }
});

console.log('');

// ========================================
// 5. 配置可能位置の取得テスト
// ========================================
console.log('=== 5. 配置可能位置テスト ===');

test('初期状態で16箇所配置可能', () => {
  let state = createInitialState('test-game', 'player1');
  state = joinPlayer2(state, 'player2');
  const available = getAvailablePositions(state);
  if (available.length !== 16) {
    throw new Error(`配置可能箇所が16でない（${available.length}）`);
  }
});

test('駒を配置すると上の層が配置可能に', () => {
  let state = createInitialState('test-game', 'player1');
  state = joinPlayer2(state, 'player2');
  state = placePiece(state, 'player1', { x: 0, y: 0, z: 0 });

  const available = getAvailablePositions(state);
  const hasUpperLayer = available.some(pos => pos.x === 0 && pos.y === 0 && pos.z === 1);
  if (!hasUpperLayer) {
    throw new Error('上の層が配置可能にならない');
  }
});

console.log('');

// ========================================
// 6. AI動作テスト
// ========================================
console.log('=== 6. AI動作テスト ===');

test('AI（初級）が手を返す', () => {
  let state = createInitialState('test-game', 'player1');
  state = joinPlayer2(state, 'player2');

  const move = calculateCpuMove(state, 'player2', 'easy');
  if (!move || typeof move.x !== 'number' || typeof move.y !== 'number' || typeof move.z !== 'number') {
    throw new Error('AIが有効な手を返さない');
  }
});

test('AI（中級）が手を返す', () => {
  let state = createInitialState('test-game', 'player1');
  state = joinPlayer2(state, 'player2');

  const move = calculateCpuMove(state, 'player2', 'medium');
  if (!move || typeof move.x !== 'number') {
    throw new Error('AI（中級）が有効な手を返さない');
  }
});

test('AI（上級）が手を返す', () => {
  let state = createInitialState('test-game', 'player1');
  state = joinPlayer2(state, 'player2');

  const move = calculateCpuMove(state, 'player2', 'hard');
  if (!move || typeof move.x !== 'number') {
    throw new Error('AI（上級）が有効な手を返さない');
  }
});

test('AIが配置可能な手のみを返す', () => {
  let state = createInitialState('test-game', 'player1');
  state = joinPlayer2(state, 'player2');

  const move = calculateCpuMove(state, 'player2', 'medium');
  if (!canPlacePiece(state, move)) {
    throw new Error('AIが配置不可能な手を返した');
  }
});

console.log('');

// ========================================
// テスト結果サマリー
// ========================================
console.log('='.repeat(50));
console.log('📊 ゲームロジックテスト結果');
console.log('='.repeat(50));
console.log(`✅ 成功: ${testsPassed}`);
console.log(`❌ 失敗: ${testsFailed}`);
console.log(`合計: ${testsPassed + testsFailed}`);
console.log(`成功率: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
console.log('='.repeat(50));

if (testsFailed === 0) {
  console.log('\n🎉 全てのゲームロジックテストに合格しました！');
  process.exit(0);
} else {
  console.log('\n⚠️  一部のテストで問題が見つかりました。');
  process.exit(1);
}
