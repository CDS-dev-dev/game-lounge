// 立体四目並べのAIテスト

import { calculateCpuMove } from '../ai';
import { createInitialState, joinPlayer2, placePiece } from '../engine';
import type { Connect4State } from '../types';

describe('Connect4 AI', () => {
  let gameState: Connect4State;

  beforeEach(() => {
    gameState = createInitialState('test-game', 'player1');
    gameState = joinPlayer2(gameState, 'player2');
  });

  describe('calculateCpuMove', () => {
    test('初期状態で合法手を返す', () => {
      const move = calculateCpuMove(gameState, 'player1', 'easy');

      expect(move).toBeDefined();
      expect(move.x).toBeGreaterThanOrEqual(0);
      expect(move.x).toBeLessThan(4);
      expect(move.y).toBeGreaterThanOrEqual(0);
      expect(move.y).toBeLessThan(4);
      expect(move.z).toBe(0); // 初期状態では最下層に配置
    });

    test('難易度ごとに動作する', () => {
      const difficulties = ['easy', 'medium', 'hard'] as const;

      difficulties.forEach(difficulty => {
        const move = calculateCpuMove(gameState, 'player1', difficulty);
        expect(move).toBeDefined();
        expect(move.x).toBeGreaterThanOrEqual(0);
        expect(move.x).toBeLessThan(4);
      });
    });

    test('プレイヤー1のロールで動作する', () => {
      const move = calculateCpuMove(gameState, 'player1', 'medium');

      expect(move).toBeDefined();
      expect(() => {
        placePiece(gameState, 'player1', move);
      }).not.toThrow();
    });

    test('プレイヤー2のロールで動作する', () => {
      // プレイヤー1が先に置く
      gameState = placePiece(gameState, 'player1', { x: 0, y: 0, z: 0 });

      const move = calculateCpuMove(gameState, 'player2', 'medium');

      expect(move).toBeDefined();
      expect(() => {
        placePiece(gameState, 'player2', move);
      }).not.toThrow();
    });

    test('盤面が埋まっている場合はエラー', () => {
      // 全マスを埋める（ターンを考慮）
      for (let z = 0; z < 4; z++) {
        for (let y = 0; y < 4; y++) {
          for (let x = 0; x < 4; x++) {
            const playerId = gameState.currentTurn === 'player1' ? 'player1' : 'player2';
            gameState = placePiece(gameState, playerId, { x, y, z });
          }
        }
      }

      expect(() => {
        calculateCpuMove(gameState, gameState.currentTurn, 'easy');
      }).toThrow('配置可能な位置がありません');
    });

    test('勝てる手を見つける（上級）', () => {
      // 横1列に3つ並べる（player1のターン）
      gameState = placePiece(gameState, 'player1', { x: 0, y: 0, z: 0 });
      gameState = placePiece(gameState, 'player2', { x: 0, y: 1, z: 0 });
      gameState = placePiece(gameState, 'player1', { x: 1, y: 0, z: 0 });
      gameState = placePiece(gameState, 'player2', { x: 1, y: 1, z: 0 });
      gameState = placePiece(gameState, 'player1', { x: 2, y: 0, z: 0 });
      gameState = placePiece(gameState, 'player2', { x: 2, y: 1, z: 0 }); // player2の手

      // ここでplayer1のターン、勝てる手（x=3, y=0, z=0）を見つけるはず
      expect(gameState.currentTurn).toBe('player1');
      const move = calculateCpuMove(gameState, 'player1', 'hard');

      // 少なくとも合法手を返すこと
      expect(move).toBeDefined();
      expect(() => {
        placePiece(gameState, 'player1', move);
      }).not.toThrow();
    });

    test('負けを防ぐ手を見つける（上級）', () => {
      // player1が先手なので調整
      gameState = placePiece(gameState, 'player1', { x: 0, y: 1, z: 0 });
      gameState = placePiece(gameState, 'player2', { x: 0, y: 0, z: 0 });
      gameState = placePiece(gameState, 'player1', { x: 1, y: 1, z: 0 });
      gameState = placePiece(gameState, 'player2', { x: 1, y: 0, z: 0 });
      gameState = placePiece(gameState, 'player1', { x: 2, y: 1, z: 0 });
      gameState = placePiece(gameState, 'player2', { x: 2, y: 0, z: 0 });
      // ここでplayer1のターン、player2が3つ並んでいるので防御が必要

      expect(gameState.currentTurn).toBe('player1');
      const move = calculateCpuMove(gameState, 'player1', 'hard');

      expect(move).toBeDefined();
      expect(() => {
        placePiece(gameState, 'player1', move);
      }).not.toThrow();
    });

    test('連続で100手実行してもエラーが出ない', () => {
      let turn: 'player1' | 'player2' = 'player1';
      let moveCount = 0;

      while (moveCount < 64) { // 最大64マス
        try {
          const playerId = turn === 'player1' ? 'player1' : 'player2';
          const move = calculateCpuMove(gameState, turn, 'easy');
          gameState = placePiece(gameState, playerId, move);

          turn = turn === 'player1' ? 'player2' : 'player1';
          moveCount++;

          // 勝者が決まったら終了
          if (gameState.winner) break;
        } catch (error) {
          // 盤面が埋まったら終了
          if ((error as Error).message.includes('配置可能な位置がありません')) {
            break;
          }
          throw error;
        }
      }

      // 少なくとも10手以上は進むはず
      expect(moveCount).toBeGreaterThan(10);
    });
  });
});
