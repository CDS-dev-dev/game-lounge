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

      const pos: Position3D = { x: 0, y: 0, z: 0 };
      state = placePiece(state, PLAYER1_ID, pos);

      // board[z][y][x]の順
      expect(state.board[0][0][0]).not.toBe(null);
      expect(state.currentTurn).toBe('player2');
    });

    it('既に駒がある場所には配置できない', () => {
      let state = createInitialState(GAME_ID, PLAYER1_ID);
      state = joinPlayer2(state, PLAYER2_ID);

      const pos: Position3D = { x: 0, y: 0, z: 0 };
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

      // プレイヤー1が横に4つ配置する想定で、交互に配置
      // y=0の行を使う: player1は(0,0), (1,0), (2,0), (3,0)
      // player2は(0,1), (1,1), (2,1)に配置
      state = placePiece(state, PLAYER1_ID, { x: 0, y: 0, z: 0 });
      state = placePiece(state, PLAYER2_ID, { x: 0, y: 1, z: 0 });
      state = placePiece(state, PLAYER1_ID, { x: 1, y: 0, z: 0 });
      state = placePiece(state, PLAYER2_ID, { x: 1, y: 1, z: 0 });
      state = placePiece(state, PLAYER1_ID, { x: 2, y: 0, z: 0 });
      state = placePiece(state, PLAYER2_ID, { x: 2, y: 1, z: 0 });
      state = placePiece(state, PLAYER1_ID, { x: 3, y: 0, z: 0 });

      const lastPos: Position3D = { x: 3, y: 0, z: 0 };
      const result = checkWinner(state, lastPos);

      // 横4つなので勝利
      expect(result.winner).toBe('player1');
      expect(result.winningLine).toHaveLength(4);
    });

    it('勝者がいない場合はnull', () => {
      let state = createInitialState(GAME_ID, PLAYER1_ID);
      state = joinPlayer2(state, PLAYER2_ID);

      const pos: Position3D = { x: 0, y: 0, z: 0 };
      const result = checkWinner(state, pos);

      expect(result.winner).toBe(null);
      expect(result.winningLine).toBe(null);
    });
  });

  describe('getAvailablePositions', () => {
    it('初期状態は底面のマスのみ配置可能', () => {
      let state = createInitialState(GAME_ID, PLAYER1_ID);
      state = joinPlayer2(state, PLAYER2_ID);

      const available = getAvailablePositions(state);
      // 底面（z=0）の16マスのみ配置可能
      expect(available).toHaveLength(16); // 4x4 = 16
      expect(available.every(pos => pos.z === 0)).toBe(true);
    });

    it('駒が配置された場所は除外され、その上が配置可能になる', () => {
      let state = createInitialState(GAME_ID, PLAYER1_ID);
      state = joinPlayer2(state, PLAYER2_ID);

      const pos: Position3D = { x: 0, y: 0, z: 0 };
      state = placePiece(state, PLAYER1_ID, pos);

      const available = getAvailablePositions(state);
      // 底面-1 + その上+1 = 16マス（変わらず）
      expect(available).toHaveLength(16);
      // (0,0,1)が配置可能になっている
      expect(available.some(p => p.x === 0 && p.y === 0 && p.z === 1)).toBe(true);
    });
  });
});
