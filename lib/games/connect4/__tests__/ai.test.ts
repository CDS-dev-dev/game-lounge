import { calculateCpuMove } from '../ai';
import { BOARD_SIZE } from '../constants';
import { createInitialState, joinPlayer2, placePiece } from '../engine';
import type { Connect4State, Piece, Position3D, PlayerRole } from '../types';

describe('Connect4 AI', () => {
  let gameState: Connect4State;

  beforeEach(() => {
    gameState = createInitialState('test-game', 'player1');
    gameState = joinPlayer2(gameState, 'player2');
  });

  function expectInsideBoard(move: Position3D) {
    expect(move.x).toBeGreaterThanOrEqual(0);
    expect(move.x).toBeLessThan(BOARD_SIZE);
    expect(move.y).toBeGreaterThanOrEqual(0);
    expect(move.y).toBeLessThan(BOARD_SIZE);
    expect(move.z).toBeGreaterThanOrEqual(0);
    expect(move.z).toBeLessThan(BOARD_SIZE);
  }

  function createFilledPiece(x: number, y: number, z: number): Piece {
    const owner: PlayerRole = (x + y + z) % 2 === 0 ? 'player1' : 'player2';

    return {
      id: `filled-${x}-${y}-${z}`,
      owner,
      position: { x, y, z },
    };
  }

  describe('calculateCpuMove', () => {
    it('returns a legal move in the initial state', () => {
      const move = calculateCpuMove(gameState, 'player1', 'easy');

      expectInsideBoard(move);
      expect(move.z).toBe(0);
      expect(() => placePiece(gameState, 'player1', move)).not.toThrow();
    });

    it('works for each difficulty level', () => {
      for (const difficulty of ['easy', 'medium', 'hard'] as const) {
        const move = calculateCpuMove(gameState, 'player1', difficulty);
        expectInsideBoard(move);
      }
    });

    it('works for player2 after player1 has moved', () => {
      gameState = placePiece(gameState, 'player1', { x: 0, y: 0, z: 0 });

      const move = calculateCpuMove(gameState, 'player2', 'medium');

      expectInsideBoard(move);
      expect(() => placePiece(gameState, 'player2', move)).not.toThrow();
    });

    it('returns a safe fallback when the board is full', () => {
      const fullBoard = Array.from({ length: BOARD_SIZE }, (_, z) =>
        Array.from({ length: BOARD_SIZE }, (_, y) =>
          Array.from({ length: BOARD_SIZE }, (_, x) => createFilledPiece(x, y, z))
        )
      );

      gameState = {
        ...gameState,
        board: fullBoard,
        pieces: {
          player1: [],
          player2: [],
        },
      };

      const move = calculateCpuMove(gameState, gameState.currentTurn, 'easy');

      expect(move).toEqual({ x: 2, y: 2, z: 0 });
    });

    it('finds a usable move in a near-win position', () => {
      gameState = placePiece(gameState, 'player1', { x: 0, y: 0, z: 0 });
      gameState = placePiece(gameState, 'player2', { x: 0, y: 1, z: 0 });
      gameState = placePiece(gameState, 'player1', { x: 1, y: 0, z: 0 });
      gameState = placePiece(gameState, 'player2', { x: 1, y: 1, z: 0 });
      gameState = placePiece(gameState, 'player1', { x: 2, y: 0, z: 0 });
      gameState = placePiece(gameState, 'player2', { x: 2, y: 1, z: 0 });

      const move = calculateCpuMove(gameState, 'player1', 'hard');

      expectInsideBoard(move);
      expect(() => placePiece(gameState, 'player1', move)).not.toThrow();
    });

    it('can continue automatic play without throwing early', () => {
      let moveCount = 0;

      while (moveCount < 32 && !gameState.winner) {
        const currentRole = gameState.currentTurn;
        const playerId = currentRole === 'player1' ? 'player1' : 'player2';
        const move = calculateCpuMove(gameState, currentRole, 'easy');

        gameState = placePiece(gameState, playerId, move);
        moveCount++;
      }

      expect(moveCount).toBeGreaterThan(10);
    });
  });
});
