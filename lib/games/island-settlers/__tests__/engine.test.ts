// ゲームエンジンのテスト

import { describe, it, expect } from '@jest/globals';
import {
  createInitialState,
  addPlayer,
  rollDice,
  buildRoad,
  buildVillage,
  buildTown,
  trade,
  endTurn,
  canBuildVillage,
} from '../engine';

describe('Island Settlers Engine', () => {
  describe('createInitialState', () => {
    it('初期状態を正しく作成する', () => {
      const state = createInitialState('game1', 'player1', 3);
      expect(state.gameId).toBe('game1');
      expect(state.status).toBe('waiting');
      expect(state.players.length).toBe(1);
      expect(state.players[0].id).toBe('player1');
      expect(state.maxPlayers).toBe(3);
      expect(state.board.length).toBe(6);
    });

    it('プレイヤー数の範囲外でエラーを投げる', () => {
      expect(() => createInitialState('game1', 'player1', 2)).toThrow();
      expect(() => createInitialState('game1', 'player1', 5)).toThrow();
    });
  });

  describe('addPlayer', () => {
    it('プレイヤーを追加できる', () => {
      let state = createInitialState('game1', 'player1', 3);
      state = addPlayer(state, 'player2');
      expect(state.players.length).toBe(2);
      expect(state.status).toBe('waiting');
    });

    it('全員揃ったらゲームが開始される', () => {
      let state = createInitialState('game1', 'player1', 3);
      state = addPlayer(state, 'player2');
      state = addPlayer(state, 'player3');
      expect(state.players.length).toBe(3);
      expect(state.status).toBe('playing');
    });

    it('上限を超えてプレイヤーを追加するとエラー', () => {
      let state = createInitialState('game1', 'player1', 3);
      state = addPlayer(state, 'player2');
      state = addPlayer(state, 'player3');
      expect(() => addPlayer(state, 'player4')).toThrow();
    });
  });

  describe('rollDice', () => {
    it('サイコロを振れる', () => {
      let state = createInitialState('game1', 'player1', 3);
      state = addPlayer(state, 'player2');
      state = addPlayer(state, 'player3');
      state = rollDice(state, 'player1');
      expect(state.diceValue).toBeGreaterThanOrEqual(1);
      expect(state.diceValue).toBeLessThanOrEqual(6);
    });

    it('自分のターンでないとエラー', () => {
      let state = createInitialState('game1', 'player1', 3);
      state = addPlayer(state, 'player2');
      state = addPlayer(state, 'player3');
      expect(() => rollDice(state, 'player2')).toThrow();
    });
  });

  describe('buildRoad', () => {
    it('道を建設できる', () => {
      let state = createInitialState('game1', 'player1', 3);
      state = addPlayer(state, 'player2');
      state = addPlayer(state, 'player3');

      // 初期村の隣に道を建設
      const from = { x: 1, y: 1 };
      const to = { x: 1, y: 2 };

      const initialRoads = state.roads.length;
      state = buildRoad(state, 'player1', from, to);

      expect(state.roads.length).toBe(initialRoads + 1);
      expect(state.players[0].resources.wood).toBeLessThan(2); // 消費された
    });

    it('隣接していない位置には建設できない', () => {
      let state = createInitialState('game1', 'player1', 3);
      state = addPlayer(state, 'player2');
      state = addPlayer(state, 'player3');

      expect(() => buildRoad(state, 'player1', { x: 0, y: 0 }, { x: 2, y: 2 })).toThrow();
    });
  });

  describe('buildVillage', () => {
    it('村を建設できる', () => {
      let state = createInitialState('game1', 'player1', 3);
      state = addPlayer(state, 'player2');
      state = addPlayer(state, 'player3');

      // まず初期道の先に道を建設
      state = buildRoad(state, 'player1', { x: 2, y: 1 }, { x: 2, y: 2 });

      // 建設可能な位置を探す（砂漠でない場所）
      let position = { x: 2, y: 2 };
      const tile = state.board[position.y][position.x];

      // 砂漠だったらスキップ
      if (tile.terrain === 'desert') {
        // 別の道を建設
        state = buildRoad(state, 'player1', { x: 2, y: 1 }, { x: 3, y: 1 });
        position = { x: 3, y: 1 };
      }

      const initialScore = state.players[0].score;

      // 砂漠でなければ建設できるはず
      if (state.board[position.y][position.x].terrain !== 'desert') {
        state = buildVillage(state, 'player1', position);

        const resultTile = state.board[position.y][position.x];
        expect(resultTile.hasVillage).toBe('player1');
        expect(state.players[0].score).toBeGreaterThan(initialScore);
      }
    });

    it('砂漠には建設できない', () => {
      let state = createInitialState('game1', 'player1', 3);
      state = addPlayer(state, 'player2');
      state = addPlayer(state, 'player3');

      // 砂漠タイルを探す
      let desertPos = null;
      for (const row of state.board) {
        for (const tile of row) {
          if (tile.terrain === 'desert') {
            desertPos = tile.position;
            break;
          }
        }
        if (desertPos) break;
      }

      if (desertPos) {
        // 道を無理やり配置
        state.roads.push({
          id: 'test-road',
          owner: 'player1',
          from: { x: 1, y: 1 },
          to: desertPos,
        });

        expect(canBuildVillage(state, 'player1', desertPos)).toBe(false);
      }
    });
  });

  describe('buildTown', () => {
    it('村を町にアップグレードできる', () => {
      let state = createInitialState('game1', 'player1', 3);
      state = addPlayer(state, 'player2');
      state = addPlayer(state, 'player3');

      // 初期村の位置
      const villagePos = { x: 1, y: 1 };

      // 資源を追加
      state.players[0].resources.stone = 5;
      state.players[0].resources.gold = 5;

      const initialScore = state.players[0].score;
      state = buildTown(state, 'player1', villagePos);

      const tile = state.board[villagePos.y][villagePos.x];
      expect(tile.hasVillage).toBeNull();
      expect(tile.hasTown).toBe('player1');
      expect(state.players[0].score).toBeGreaterThan(initialScore);
    });

    it('村がない場所には建設できない', () => {
      let state = createInitialState('game1', 'player1', 3);
      state = addPlayer(state, 'player2');
      state = addPlayer(state, 'player3');

      state.players[0].resources.stone = 5;
      state.players[0].resources.gold = 5;

      expect(() => buildTown(state, 'player1', { x: 0, y: 0 })).toThrow();
    });
  });

  describe('trade', () => {
    it('4:1レートで交易できる', () => {
      let state = createInitialState('game1', 'player1', 3);
      state = addPlayer(state, 'player2');
      state = addPlayer(state, 'player3');

      state.players[0].resources.wood = 5;
      state.players[0].resources.gold = 0;

      state = trade(state, 'player1', 'wood', 'gold');

      expect(state.players[0].resources.wood).toBe(1);
      expect(state.players[0].resources.gold).toBe(1);
    });

    it('資源が不足していると交易できない', () => {
      let state = createInitialState('game1', 'player1', 3);
      state = addPlayer(state, 'player2');
      state = addPlayer(state, 'player3');

      state.players[0].resources.wood = 2;

      expect(() => trade(state, 'player1', 'wood', 'gold')).toThrow();
    });
  });

  describe('endTurn', () => {
    it('ターンが次のプレイヤーに移る', () => {
      let state = createInitialState('game1', 'player1', 3);
      state = addPlayer(state, 'player2');
      state = addPlayer(state, 'player3');

      expect(state.currentTurn).toBe(0);
      state = endTurn(state);
      expect(state.currentTurn).toBe(1);
    });

    it('最後のプレイヤーの次は最初のプレイヤーに戻る', () => {
      let state = createInitialState('game1', 'player1', 3);
      state = addPlayer(state, 'player2');
      state = addPlayer(state, 'player3');

      state.currentTurn = 2;
      state = endTurn(state);
      expect(state.currentTurn).toBe(0);
      expect(state.round).toBe(1);
    });

    it('勝利条件を満たすとゲームが終了する', () => {
      let state = createInitialState('game1', 'player1', 3);
      state = addPlayer(state, 'player2');
      state = addPlayer(state, 'player3');

      state.players[0].score = 8;
      state = endTurn(state);

      expect(state.status).toBe('finished');
      expect(state.winner).toBe('player1');
    });
  });
});
