// ガイスターAIテスト

import { calculateCpuMove, generateCpuSetup } from '../ai';
import { createInitialState, setupPieces, movePiece, getValidMoves } from '../engine';
import type { GeisterState, PieceSetup } from '../types';

describe('Geister AI', () => {
  let gameState: GeisterState;
  const PLAYER_ID = 'player-human';
  const CPU_ID = 'player-cpu';

  beforeEach(() => {
    gameState = createInitialState('test-game', PLAYER_ID);
    gameState = {
      ...gameState,
      status: 'setup',
      players: {
        player1: PLAYER_ID,
        player2: CPU_ID,
      },
    };

    // プレイヤーとCPUの配置を設定（移動可能なように配置）
    const playerSetup: PieceSetup[] = [
      { pieceId: 'p1', type: 'good', position: { x: 1, y: 1 } },
      { pieceId: 'p2', type: 'good', position: { x: 2, y: 1 } },
      { pieceId: 'p3', type: 'good', position: { x: 3, y: 1 } },
      { pieceId: 'p4', type: 'good', position: { x: 4, y: 1 } },
      { pieceId: 'p5', type: 'bad', position: { x: 1, y: 0 } },
      { pieceId: 'p6', type: 'bad', position: { x: 2, y: 0 } },
      { pieceId: 'p7', type: 'bad', position: { x: 3, y: 0 } },
      { pieceId: 'p8', type: 'bad', position: { x: 4, y: 0 } },
    ];
    gameState = setupPieces(gameState, PLAYER_ID, playerSetup);

    const cpuSetup: PieceSetup[] = [
      { pieceId: 'c1', type: 'good', position: { x: 1, y: 4 } },
      { pieceId: 'c2', type: 'good', position: { x: 2, y: 4 } },
      { pieceId: 'c3', type: 'good', position: { x: 3, y: 4 } },
      { pieceId: 'c4', type: 'good', position: { x: 4, y: 4 } },
      { pieceId: 'c5', type: 'bad', position: { x: 1, y: 5 } },
      { pieceId: 'c6', type: 'bad', position: { x: 2, y: 5 } },
      { pieceId: 'c7', type: 'bad', position: { x: 3, y: 5 } },
      { pieceId: 'c8', type: 'bad', position: { x: 4, y: 5 } },
    ];
    gameState = setupPieces(gameState, CPU_ID, cpuSetup);
  });

  describe('calculateCpuMove', () => {
    test('初期状態で合法手を返す（player1がCPU）', () => {
      // player1がCPUの場合
      let cpuState = createInitialState('test-game', CPU_ID);
      cpuState = {
        ...cpuState,
        status: 'setup',
        players: {
          player1: CPU_ID,
          player2: PLAYER_ID,
        },
      };

      const cpuSetup: PieceSetup[] = [
        { pieceId: 'c1', type: 'good', position: { x: 1, y: 0 } },
        { pieceId: 'c2', type: 'good', position: { x: 2, y: 0 } },
        { pieceId: 'c3', type: 'good', position: { x: 3, y: 0 } },
        { pieceId: 'c4', type: 'good', position: { x: 4, y: 0 } },
        { pieceId: 'c5', type: 'bad', position: { x: 1, y: 1 } },
        { pieceId: 'c6', type: 'bad', position: { x: 2, y: 1 } },
        { pieceId: 'c7', type: 'bad', position: { x: 3, y: 1 } },
        { pieceId: 'c8', type: 'bad', position: { x: 4, y: 1 } },
      ];
      cpuState = setupPieces(cpuState, CPU_ID, cpuSetup);

      const playerSetup: PieceSetup[] = [
        { pieceId: 'p1', type: 'good', position: { x: 1, y: 4 } },
        { pieceId: 'p2', type: 'good', position: { x: 2, y: 4 } },
        { pieceId: 'p3', type: 'good', position: { x: 3, y: 4 } },
        { pieceId: 'p4', type: 'good', position: { x: 4, y: 4 } },
        { pieceId: 'p5', type: 'bad', position: { x: 1, y: 5 } },
        { pieceId: 'p6', type: 'bad', position: { x: 2, y: 5 } },
        { pieceId: 'p7', type: 'bad', position: { x: 3, y: 5 } },
        { pieceId: 'p8', type: 'bad', position: { x: 4, y: 5 } },
      ];
      cpuState = setupPieces(cpuState, PLAYER_ID, playerSetup);

      expect(cpuState.status).toBe('playing');
      expect(cpuState.currentTurn).toBe('player1');

      const move = calculateCpuMove(cpuState, CPU_ID);

      expect(move).toBeDefined();
      expect(move.pieceId).toBeDefined();
      expect(move.to).toBeDefined();
      expect(move.to.x).toBeGreaterThanOrEqual(0);
      expect(move.to.x).toBeLessThanOrEqual(5);
      expect(move.to.y).toBeGreaterThanOrEqual(0);
      expect(move.to.y).toBeLessThanOrEqual(5);
    });

    test('初期状態で合法手を返す（player2がCPU）', () => {
      expect(gameState.status).toBe('playing');
      expect(gameState.currentTurn).toBe('player1');

      // player1の駒を動かす
      const moves = getValidMoves(gameState, PLAYER_ID, 'p1');
      expect(moves.length).toBeGreaterThan(0);

      const newState = movePiece(gameState, PLAYER_ID, 'p1', moves[0]);
      expect(newState.currentTurn).toBe('player2');

      const move = calculateCpuMove(newState, CPU_ID);

      expect(move).toBeDefined();
      expect(move.pieceId).toBeDefined();
      expect(move.to).toBeDefined();
    });

    test('CPUが実際に移動できる手を返す', () => {
      expect(gameState.status).toBe('playing');

      // player1の駒を動かす
      gameState = movePiece(gameState, PLAYER_ID, 'p1', { x: 1, y: 2 });

      const move = calculateCpuMove(gameState, CPU_ID);

      // CPUの手を実行してエラーが出ないことを確認
      expect(() => {
        movePiece(gameState, CPU_ID, move.pieceId, move.to);
      }).not.toThrow();
    });

    test('連続で30手実行してもエラーが出ない', () => {
      let moveCount = 0;

      while (moveCount < 30 && !gameState.winner) {
        try {
          if (gameState.currentTurn === 'player2') {
            // CPUのターン
            const cpuMove = calculateCpuMove(gameState, CPU_ID);
            gameState = movePiece(gameState, CPU_ID, cpuMove.pieceId, cpuMove.to);
          } else {
            // プレイヤーのターン（最初の動ける駒を動かす）
            const myPieces = gameState.pieces.player1.filter(p => !p.captured && !p.escaped);
            if (myPieces.length === 0) break;

            let foundMove = false;
            for (const p of myPieces) {
              const moves = getValidMoves(gameState, PLAYER_ID, p.id);
              if (moves.length > 0) {
                gameState = movePiece(gameState, PLAYER_ID, p.id, moves[0]);
                foundMove = true;
                break;
              }
            }
            if (!foundMove) {
              // どの駒も動けない = ゲーム終了
              break;
            }
          }

          moveCount++;
        } catch (error) {
          console.error('Move error at turn', moveCount, ':', error);
          throw error;
        }
      }

      expect(moveCount).toBeGreaterThan(5);
    });
  });

  describe('generateCpuSetup', () => {
    test('player1用の配置を生成', () => {
      const setup = generateCpuSetup('player1');

      expect(setup).toHaveLength(8);
      expect(setup.filter(s => s.type === 'good')).toHaveLength(4);
      expect(setup.filter(s => s.type === 'bad')).toHaveLength(4);

      // 配置位置がplayer1の領域内
      for (const s of setup) {
        expect(s.position.y).toBeGreaterThanOrEqual(0);
        expect(s.position.y).toBeLessThanOrEqual(1);
        expect(s.position.x).toBeGreaterThanOrEqual(1);
        expect(s.position.x).toBeLessThanOrEqual(4);
      }
    });

    test('player2用の配置を生成', () => {
      const setup = generateCpuSetup('player2');

      expect(setup).toHaveLength(8);
      expect(setup.filter(s => s.type === 'good')).toHaveLength(4);
      expect(setup.filter(s => s.type === 'bad')).toHaveLength(4);

      // 配置位置がplayer2の領域内
      for (const s of setup) {
        expect(s.position.y).toBeGreaterThanOrEqual(4);
        expect(s.position.y).toBeLessThanOrEqual(5);
        expect(s.position.x).toBeGreaterThanOrEqual(1);
        expect(s.position.x).toBeLessThanOrEqual(4);
      }
    });
  });
});
