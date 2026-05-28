/**
 * Geister ゲームエンジンのテスト
 */
import {
  createInitialState,
  setupPieces,
  movePiece,
  checkWinner,
  getValidMoves,
} from '../engine';
import { PieceSetup } from '../types';

describe('Geister Engine', () => {
  const GAME_ID = 'test-game';
  const PLAYER1_ID = 'player1';
  const PLAYER2_ID = 'player2';

  describe('createInitialState', () => {
    it('初期状態を正しく作成する', () => {
      const state = createInitialState(GAME_ID, PLAYER1_ID);

      expect(state.gameId).toBe(GAME_ID);
      expect(state.status).toBe('waiting');
      expect(state.players.player1).toBe(PLAYER1_ID);
      expect(state.players.player2).toBeNull();
      expect(state.currentTurn).toBe('player1');
      expect(state.moveCount).toBe(0);
    });
  });

  describe('setupPieces', () => {
    it('Player1の駒を正しく配置する', () => {
      const state = createInitialState(GAME_ID, PLAYER1_ID);

      const setup: PieceSetup[] = [
        { pieceId: 'p1-1', type: 'good', position: { x: 1, y: 0 } },
        { pieceId: 'p1-2', type: 'good', position: { x: 2, y: 0 } },
        { pieceId: 'p1-3', type: 'good', position: { x: 3, y: 0 } },
        { pieceId: 'p1-4', type: 'good', position: { x: 4, y: 0 } },
        { pieceId: 'p1-5', type: 'bad', position: { x: 1, y: 1 } },
        { pieceId: 'p1-6', type: 'bad', position: { x: 2, y: 1 } },
        { pieceId: 'p1-7', type: 'bad', position: { x: 3, y: 1 } },
        { pieceId: 'p1-8', type: 'bad', position: { x: 4, y: 1 } },
      ];

      const newState = setupPieces(state, PLAYER1_ID, setup);

      expect(newState.pieces.player1).toHaveLength(8);
      expect(newState.pieces.player1.filter(p => p.type === 'good')).toHaveLength(4);
      expect(newState.pieces.player1.filter(p => p.type === 'bad')).toHaveLength(4);
    });

    it('不正な配置でエラーを投げる', () => {
      const state = createInitialState(GAME_ID, PLAYER1_ID);

      // good が 5個、bad が 3個（不正）
      const invalidSetup: PieceSetup[] = [
        { pieceId: 'p1-1', type: 'good', position: { x: 1, y: 0 } },
        { pieceId: 'p1-2', type: 'good', position: { x: 2, y: 0 } },
        { pieceId: 'p1-3', type: 'good', position: { x: 3, y: 0 } },
        { pieceId: 'p1-4', type: 'good', position: { x: 4, y: 0 } },
        { pieceId: 'p1-5', type: 'good', position: { x: 1, y: 1 } },
        { pieceId: 'p1-6', type: 'bad', position: { x: 2, y: 1 } },
        { pieceId: 'p1-7', type: 'bad', position: { x: 3, y: 1 } },
        { pieceId: 'p1-8', type: 'bad', position: { x: 4, y: 1 } },
      ];

      expect(() => setupPieces(state, PLAYER1_ID, invalidSetup)).toThrow();
    });
  });

  describe('getValidMoves', () => {
    it('駒の有効な移動先を返す', () => {
      let state = createInitialState(GAME_ID, PLAYER1_ID);

      const setup: PieceSetup[] = [
        { pieceId: 'p1-1', type: 'good', position: { x: 2, y: 0 } },
        { pieceId: 'p1-2', type: 'good', position: { x: 3, y: 0 } },
        { pieceId: 'p1-3', type: 'good', position: { x: 2, y: 1 } },
        { pieceId: 'p1-4', type: 'good', position: { x: 3, y: 1 } },
        { pieceId: 'p1-5', type: 'bad', position: { x: 1, y: 0 } },
        { pieceId: 'p1-6', type: 'bad', position: { x: 4, y: 0 } },
        { pieceId: 'p1-7', type: 'bad', position: { x: 1, y: 1 } },
        { pieceId: 'p1-8', type: 'bad', position: { x: 4, y: 1 } },
      ];

      state = setupPieces(state, PLAYER1_ID, setup);

      // Player2 を追加
      state = {
        ...state,
        players: { ...state.players, player2: PLAYER2_ID },
      };

      // Player2 も配置（ゲーム開始のため）
      const setup2: PieceSetup[] = [
        { pieceId: 'p2-1', type: 'good', position: { x: 2, y: 5 } },
        { pieceId: 'p2-2', type: 'good', position: { x: 3, y: 5 } },
        { pieceId: 'p2-3', type: 'good', position: { x: 2, y: 4 } },
        { pieceId: 'p2-4', type: 'good', position: { x: 3, y: 4 } },
        { pieceId: 'p2-5', type: 'bad', position: { x: 1, y: 5 } },
        { pieceId: 'p2-6', type: 'bad', position: { x: 4, y: 5 } },
        { pieceId: 'p2-7', type: 'bad', position: { x: 1, y: 4 } },
        { pieceId: 'p2-8', type: 'bad', position: { x: 4, y: 4 } },
      ];

      state = setupPieces(state, PLAYER2_ID, setup2);

      // 中央の駒（x:2, y:1）の有効な移動先をチェック
      const moves = getValidMoves(state, PLAYER1_ID, 'p1-3');

      expect(moves.length).toBeGreaterThan(0);
      // 上下左右に移動可能
      expect(moves).toContainEqual({ x: 2, y: 2 }); // 下
    });
  });

  describe('checkWinner', () => {
    it('checkWinner 関数が正しく動作する', () => {
      const state = createInitialState(GAME_ID, PLAYER1_ID);
      const result = checkWinner(state);

      // winner と reason プロパティが存在することを確認
      expect(result).toHaveProperty('winner');
      expect(result).toHaveProperty('reason');
    });
  });
});
