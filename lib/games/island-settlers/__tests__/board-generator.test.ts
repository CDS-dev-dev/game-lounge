// ボード生成のテスト

import { describe, it, expect } from '@jest/globals';
import { generateBoard, validateBoard, getTile, isAdjacent, getAdjacentPositions } from '../board-generator';
import { BOARD_SIZE } from '../constants';

describe('Board Generator', () => {
  describe('generateBoard', () => {
    it('6x6のボードを生成する', () => {
      const board = generateBoard();
      expect(board.length).toBe(BOARD_SIZE);
      expect(board[0].length).toBe(BOARD_SIZE);
    });

    it('正しい地形の数を持つボードを生成する', () => {
      const board = generateBoard();
      const validation = validateBoard(board);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('砂漠以外のタイルにはサイコロの目がある', () => {
      const board = generateBoard();

      for (const row of board) {
        for (const tile of row) {
          if (tile.terrain === 'desert') {
            expect(tile.diceNumber).toBe(0);
          } else {
            expect(tile.diceNumber).toBeGreaterThanOrEqual(1);
            expect(tile.diceNumber).toBeLessThanOrEqual(6);
          }
        }
      }
    });

    it('複数回生成しても正しいボードを生成する', () => {
      for (let i = 0; i < 10; i++) {
        const board = generateBoard();
        const validation = validateBoard(board);
        expect(validation.valid).toBe(true);
      }
    });
  });

  describe('getTile', () => {
    it('正しい位置のタイルを取得する', () => {
      const board = generateBoard();
      const tile = getTile(board, { x: 0, y: 0 });
      expect(tile).not.toBeNull();
      expect(tile?.position.x).toBe(0);
      expect(tile?.position.y).toBe(0);
    });

    it('範囲外の位置ではnullを返す', () => {
      const board = generateBoard();
      expect(getTile(board, { x: -1, y: 0 })).toBeNull();
      expect(getTile(board, { x: 0, y: -1 })).toBeNull();
      expect(getTile(board, { x: BOARD_SIZE, y: 0 })).toBeNull();
      expect(getTile(board, { x: 0, y: BOARD_SIZE })).toBeNull();
    });
  });

  describe('isAdjacent', () => {
    it('隣接する位置を正しく判定する', () => {
      expect(isAdjacent({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(true);
      expect(isAdjacent({ x: 0, y: 0 }, { x: 0, y: 1 })).toBe(true);
      expect(isAdjacent({ x: 2, y: 3 }, { x: 2, y: 2 })).toBe(true);
      expect(isAdjacent({ x: 2, y: 3 }, { x: 3, y: 3 })).toBe(true);
    });

    it('斜めは隣接とみなさない', () => {
      expect(isAdjacent({ x: 0, y: 0 }, { x: 1, y: 1 })).toBe(false);
      expect(isAdjacent({ x: 2, y: 2 }, { x: 3, y: 3 })).toBe(false);
    });

    it('離れた位置は隣接でない', () => {
      expect(isAdjacent({ x: 0, y: 0 }, { x: 2, y: 0 })).toBe(false);
      expect(isAdjacent({ x: 0, y: 0 }, { x: 0, y: 2 })).toBe(false);
    });
  });

  describe('getAdjacentPositions', () => {
    it('中央の位置では4つの隣接位置を返す', () => {
      const adjacent = getAdjacentPositions({ x: 2, y: 2 });
      expect(adjacent.length).toBe(4);
    });

    it('角の位置では2つの隣接位置を返す', () => {
      const adjacent = getAdjacentPositions({ x: 0, y: 0 });
      expect(adjacent.length).toBe(2);
    });

    it('辺の位置では3つの隣接位置を返す', () => {
      const adjacent = getAdjacentPositions({ x: 0, y: 2 });
      expect(adjacent.length).toBe(3);
    });

    it('全ての隣接位置がボード内にある', () => {
      const adjacent = getAdjacentPositions({ x: 2, y: 2 });
      for (const pos of adjacent) {
        expect(pos.x).toBeGreaterThanOrEqual(0);
        expect(pos.x).toBeLessThan(BOARD_SIZE);
        expect(pos.y).toBeGreaterThanOrEqual(0);
        expect(pos.y).toBeLessThan(BOARD_SIZE);
      }
    });
  });
});
