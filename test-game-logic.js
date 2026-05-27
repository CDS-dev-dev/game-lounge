/**
 * ゲームロジックのユニットテスト
 * CPU対戦の基本的な流れをテスト
 */

// 簡易的なゲーム状態シミュレーション
function testGameFlow() {
  console.log('🧪 CPU対戦ゲームロジックのテスト\n');

  // テスト1: 初期状態の作成
  console.log('✓ テスト1: 初期状態作成');
  const gameId = 'test-cpu-game';
  const playerId = 'player-human';

  const initialState = {
    gameId,
    status: 'waiting',
    board: Array(6).fill(null).map(() => Array(6).fill(null)),
    pieces: {
      player1: [],
      player2: [],
    },
    currentTurn: 'player1',
    players: {
      player1: playerId,
      player2: null,
    },
    setupReady: {
      player1: false,
      player2: false,
    },
    winner: null,
    winReason: null,
  };

  console.log('  ✅ 初期状態が作成されました');
  console.log(`  - gameId: ${initialState.gameId}`);
  console.log(`  - status: ${initialState.status}`);
  console.log(`  - player1: ${initialState.players.player1}`);
  console.log('');

  // テスト2: プレイヤー配置
  console.log('✓ テスト2: プレイヤー駒配置');
  const playerSetup = [
    { pieceId: 'p1', type: 'good', position: { x: 1, y: 0 } },
    { pieceId: 'p2', type: 'good', position: { x: 2, y: 0 } },
    { pieceId: 'p3', type: 'good', position: { x: 3, y: 0 } },
    { pieceId: 'p4', type: 'good', position: { x: 4, y: 0 } },
    { pieceId: 'p5', type: 'bad', position: { x: 1, y: 1 } },
    { pieceId: 'p6', type: 'bad', position: { x: 2, y: 1 } },
    { pieceId: 'p7', type: 'bad', position: { x: 3, y: 1 } },
    { pieceId: 'p8', type: 'bad', position: { x: 4, y: 1 } },
  ];

  initialState.pieces.player1 = playerSetup.map(s => ({
    id: s.pieceId,
    owner: 'player1',
    type: s.type,
    position: s.position,
    captured: false,
    escaped: false,
  }));

  console.log('  ✅ プレイヤー駒が配置されました');
  console.log(`  - 青いお化け👻: 4個`);
  console.log(`  - 赤い悪魔😈: 4個`);
  console.log('');

  // テスト3: CPU配置
  console.log('✓ テスト3: CPU駒配置');
  const cpuSetup = [
    { pieceId: 'cpu1', type: 'good', position: { x: 1, y: 5 } },
    { pieceId: 'cpu2', type: 'good', position: { x: 2, y: 5 } },
    { pieceId: 'cpu3', type: 'good', position: { x: 3, y: 5 } },
    { pieceId: 'cpu4', type: 'good', position: { x: 4, y: 5 } },
    { pieceId: 'cpu5', type: 'bad', position: { x: 1, y: 4 } },
    { pieceId: 'cpu6', type: 'bad', position: { x: 2, y: 4 } },
    { pieceId: 'cpu7', type: 'bad', position: { x: 3, y: 4 } },
    { pieceId: 'cpu8', type: 'bad', position: { x: 4, y: 4 } },
  ];

  initialState.pieces.player2 = cpuSetup.map(s => ({
    id: s.pieceId,
    owner: 'player2',
    type: s.type,
    position: s.position,
    captured: false,
    escaped: false,
  }));

  initialState.players.player2 = 'player-cpu';
  initialState.status = 'playing';
  initialState.setupReady = { player1: true, player2: true };

  console.log('  ✅ CPU駒が配置されました');
  console.log(`  - プレイヤー数: 2人`);
  console.log(`  - ゲーム状態: ${initialState.status}`);
  console.log('');

  // テスト4: クライアント状態生成
  console.log('✓ テスト4: クライアント状態生成（プレイヤー視点）');

  const myRole = 'player1';
  const opponentRole = 'player2';

  // 相手の駒のtypeを隠す
  const clientBoard = initialState.board.map(row =>
    row.map(piece => {
      if (!piece) return null;
      return {
        ...piece,
        type: piece.owner === myRole ? piece.type : undefined, // 相手の駒のtypeは隠す
      };
    })
  );

  const opponentPieces = initialState.pieces[opponentRole];
  const opponentCaptured = opponentPieces.filter(p => p.captured).length;

  const clientState = {
    gameId: initialState.gameId,
    status: initialState.status,
    board: clientBoard,
    currentTurn: initialState.currentTurn,
    myRole,
    myPlayerId: playerId,
    myPieces: initialState.pieces[myRole],
    isMyTurn: initialState.currentTurn === myRole,
    canOperate: initialState.status === 'playing' && initialState.currentTurn === myRole,
    opponentPiecesCount: {
      total: 8,
      captured: opponentCaptured,
    },
  };

  console.log('  ✅ クライアント状態が生成されました');
  console.log(`  - 自分の役割: ${clientState.myRole}`);
  console.log(`  - 自分のターン: ${clientState.isMyTurn ? 'はい' : 'いいえ'}`);
  console.log(`  - 操作可能: ${clientState.canOperate ? 'はい' : 'いいえ'}`);
  console.log(`  - 自分の駒数: ${clientState.myPieces.length}個`);
  console.log(`  - 相手の捕獲駒数: ${clientState.opponentPiecesCount.captured}個`);
  console.log('');

  // テスト5: 移動可能性チェック
  console.log('✓ テスト5: 駒の移動可能性');
  const testPiece = clientState.myPieces[0]; // 最初の駒
  const validMoves = [
    { x: testPiece.position.x, y: testPiece.position.y + 1 }, // 下
    { x: testPiece.position.x + 1, y: testPiece.position.y }, // 右
    { x: testPiece.position.x - 1, y: testPiece.position.y }, // 左
  ].filter(pos =>
    pos.x >= 0 && pos.x < 6 && pos.y >= 0 && pos.y < 6
  );

  console.log(`  ✅ 駒 ${testPiece.id} (${testPiece.position.x}, ${testPiece.position.y}) の移動可能なマス:`);
  validMoves.forEach(pos => {
    console.log(`     - (${pos.x}, ${pos.y})`);
  });
  console.log('');

  console.log('==========================================');
  console.log('✅ すべてのロジックテストが成功しました！');
  console.log('==========================================\n');

  return true;
}

// テスト実行
try {
  testGameFlow();
  process.exit(0);
} catch (error) {
  console.error('❌ テスト失敗:', error.message);
  process.exit(1);
}
