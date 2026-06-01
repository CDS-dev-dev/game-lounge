// Connect4エンジンのテスト

import {
  createInitialState,
  joinPlayer2,
  placePiece,
  checkWinner,
  getAvailablePositions,
} from '@/lib/games/connect4/engine';
import type { Position3D } from '@/lib/games/connect4/types';

describe('Connect4 Engine', () => {
  const GAME_ID = 'test-game';
  const PLAYER1_ID = 'player1';
  const PLAYER2_ID = 'player2';

  describe('createInitialState', () => {
    it('初期状態を正しく作成', () => {
      const state = createInitialState(GAME_ID, PLAYER1_ID);

      expect(state.gameId).toBe(GAME_ID);
      expect(state.status).toBe('waiting');
      expect(state.currentTurn).toBe('player1');
      expect(state.board).toHaveLength(4); // 4層
      expect(state.board[0]).toHaveLength(4); // 4x4
    });
  });

  describe('joinPlayer2', () => {
    it('プレイヤー2が参加できる', () => {
      let state = createInitialState(GAME_ID, PLAYER1_ID);
      state = joinPlayer2(state, PLAYER2_ID);

      expect(state.status).toBe('playing');
      expect(state.players.player2).toBe(PLAYER2_ID);
    });
  });

  describe('placePiece', () => {
    it('駒を配置できる', () => {
      let state = createInitialState(GAME_ID, PLAYER1_ID);
      state = joinPlayer2(state, PLAYER2_ID);

      const pos: Position3D = { layer: 0, row: 0, col: 0 };
      state = placePiece(state, PLAYER1_ID, pos);

      expect(state.board[0][0][0]).toBe('player1');
      expect(state.currentTurn).toBe('player2');
    });

    it('既に駒がある場所には配置できない', () => {
      let state = createInitialState(GAME_ID, PLAYER1_ID);
      state = joinPlayer2(state, PLAYER2_ID);

      const pos: Position3D = { layer: 0, row: 0, col: 0 };
      state = placePiece(state, PLAYER1_ID, pos);

      expect(() => {
        placePiece(state, PLAYER2_ID, pos);
      }).toThrow();
    });
  });

  describe('checkWinner', () => {
    it('横4つで勝利判定', () => {
      let state = createInitialState(GAME_ID, PLAYER1_ID);
      state = joinPlayer2(state, PLAYER2_ID);

      // 横に4つ配置
      for (let col = 0; col < 4; col++) {
        const pos: Position3D = { layer: 0, row: 0, col };
        state.board[0][0][col] = 'player1';
      }

      const lastPos: Position3D = { layer: 0, row: 0, col: 3 };
      const result = checkWinner(state, lastPos);

      expect(result.winner).toBe('player1');
      expect(result.winningLine).toHaveLength(4);
    });

    it('勝者がいない場合はnull', () => {
      let state = createInitialState(GAME_ID, PLAYER1_ID);
      state = joinPlayer2(state, PLAYER2_ID);

      const pos: Position3D = { layer: 0, row: 0, col: 0 };
      const result = checkWinner(state, pos);

      expect(result.winner).toBe(null);
      expect(result.winningLine).toBe(null);
    });
  });

  describe('getAvailablePositions', () => {
    it('初期状態は全マスが空き', () => {
      let state = createInitialState(GAME_ID, PLAYER1_ID);
      state = joinPlayer2(state, PLAYER2_ID);

      const available = getAvailablePositions(state);
      expect(available).toHaveLength(64); // 4x4x4 = 64
    });

    it('駒が配置された場所は除外', () => {
      let state = createInitialState(GAME_ID, PLAYER1_ID);
      state = joinPlayer2(state, PLAYER2_ID);

      const pos: Position3D = { layer: 0, row: 0, col: 0 };
      state = placePiece(state, PLAYER1_ID, pos);

      const available = getAvailablePositions(state);
      expect(available).toHaveLength(63);
    });
  });
});
