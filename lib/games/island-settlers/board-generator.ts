// アイランドセトラーズのボード生成ロジック

import type { BoardTile, Position, TerrainType } from './types';
import { BOARD_SIZE, TERRAIN_DISTRIBUTION, DICE_DISTRIBUTION } from './constants';

/**
 * Fisher-Yatesシャッフルアルゴリズム
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 地形タイプの配列を生成
 */
function generateTerrainArray(): TerrainType[] {
  const terrains: TerrainType[] = [];

  for (const { terrain, count } of TERRAIN_DISTRIBUTION) {
    for (let i = 0; i < count; i++) {
      terrains.push(terrain);
    }
  }

  return shuffle(terrains);
}

/**
 * サイコロ目の配列を生成
 */
function generateDiceArray(): number[] {
  return shuffle([...DICE_DISTRIBUTION]);
}

/**
 * 隣接タイルが同じ高価値の目を持っていないかチェック
 * （バランス調整：6や5が隣接しすぎないように）
 */
function hasHighValueNeighbor(
  board: BoardTile[][],
  x: number,
  y: number,
  value: number
): boolean {
  if (value < 5) return false; // 5と6のみチェック

  const neighbors = [
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
  ];

  for (const { dx, dy } of neighbors) {
    const nx = x + dx;
    const ny = y + dy;

    if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
      // 行がまだ存在しない場合はスキップ
      if (!board[ny]) continue;
      const neighborTile = board[ny][nx];
      if (neighborTile && neighborTile.diceNumber >= 5) {
        return true;
      }
    }
  }

  return false;
}

/**
 * ランダムなゲームボードを生成
 */
export function generateBoard(): BoardTile[][] {
  const terrains = generateTerrainArray();
  const diceNumbers = generateDiceArray();
  const board: BoardTile[][] = [];

  let terrainIndex = 0;
  let diceIndex = 0;

  // 6x6グリッドを生成
  for (let y = 0; y < BOARD_SIZE; y++) {
    const row: BoardTile[] = [];

    for (let x = 0; x < BOARD_SIZE; x++) {
      const position: Position = { x, y };
      const terrain = terrains[terrainIndex];
      terrainIndex++;

      let diceNumber = 0;

      // 砂漠以外の地形にはサイコロ目を割り当て
      if (terrain !== 'desert') {
        // 高価値の目が隣接しないように再試行（最大3回）
        let attempts = 0;
        let validNumber = false;

        while (!validNumber && attempts < 3) {
          diceNumber = diceNumbers[diceIndex % diceNumbers.length];

          if (!hasHighValueNeighbor(board, x, y, diceNumber)) {
            validNumber = true;
          } else {
            diceIndex++;
            attempts++;
          }
        }

        // 3回試してダメなら諦めて使う
        if (!validNumber) {
          diceNumber = diceNumbers[diceIndex % diceNumbers.length];
        }

        diceIndex++;
      }

      const tile: BoardTile = {
        position,
        terrain,
        diceNumber,
        hasVillage: null,
        hasTown: null,
      };

      row.push(tile);
    }

    board.push(row);
  }

  return board;
}

/**
 * 指定された位置のタイルを取得
 */
export function getTile(board: BoardTile[][], pos: Position): BoardTile | null {
  if (pos.y < 0 || pos.y >= BOARD_SIZE || pos.x < 0 || pos.x >= BOARD_SIZE) {
    return null;
  }
  return board[pos.y][pos.x];
}

/**
 * 2つの位置が隣接しているかチェック
 */
export function isAdjacent(pos1: Position, pos2: Position): boolean {
  const dx = Math.abs(pos1.x - pos2.x);
  const dy = Math.abs(pos1.y - pos2.y);

  // 上下左右のみ（斜めは隣接とみなさない）
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

/**
 * 指定位置の隣接タイルを取得
 */
export function getAdjacentPositions(pos: Position): Position[] {
  const adjacent: Position[] = [];
  const directions = [
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
  ];

  for (const { dx, dy } of directions) {
    const newPos: Position = {
      x: pos.x + dx,
      y: pos.y + dy,
    };

    if (newPos.x >= 0 && newPos.x < BOARD_SIZE && newPos.y >= 0 && newPos.y < BOARD_SIZE) {
      adjacent.push(newPos);
    }
  }

  return adjacent;
}

/**
 * 2つの位置が同じかチェック
 */
export function isSamePosition(pos1: Position, pos2: Position): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

/**
 * ボードのバランスをチェック（デバッグ用）
 */
export function validateBoard(board: BoardTile[][]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 地形の数をカウント
  const terrainCounts: Record<string, number> = {};
  const diceCounts: Record<number, number> = {};

  for (const row of board) {
    for (const tile of row) {
      terrainCounts[tile.terrain] = (terrainCounts[tile.terrain] || 0) + 1;

      if (tile.diceNumber > 0) {
        diceCounts[tile.diceNumber] = (diceCounts[tile.diceNumber] || 0) + 1;
      }
    }
  }

  // 期待される地形数と比較
  for (const { terrain, count } of TERRAIN_DISTRIBUTION) {
    if (terrainCounts[terrain] !== count) {
      errors.push(`${terrain}の数が不正: 期待=${count}, 実際=${terrainCounts[terrain] || 0}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
