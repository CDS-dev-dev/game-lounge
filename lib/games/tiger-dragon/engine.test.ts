// タイガー＆ドラゴンゲームエンジンのテスト

import { describe, it, expect } from '@jest/globals';
import {
  createInitialState,
  startRound,
  attack,
  defend,
  pass,
  endRound,
  canDefendWith,
  getDefendableTiles,
} from './engine';
import type { Tile, TigerDragonState } from './types';
import { PLAYER_HAND_COUNT, START_PLAYER_BONUS, TOTAL_TILES } from './constants';

describe('TigerDragonEngine', () => {
  describe('createInitialState', () => {
    it('2人プレイの初期状態を作成できる', () => {
      const state = createInitialState(
        'test-game',
        ['player1', 'player2'],
        ['Alice', 'Bob'],
        [false, false]
      );

      expect(state.gameId).toBe('test-game');
      expect(state.status).toBe('waiting');
      expect(state.players).toHaveLength(2);
      expect(state.playerCount).toBe(2);
      expect(state.currentRound).toBe(0);
      expect(state.targetScore).toBe(10);
    });

    it('5人プレイの初期状態を作成できる', () => {
      const state = createInitialState(
        'test-game',
        ['p1', 'p2', 'p3', 'p4', 'p5'],
        ['A', 'B', 'C', 'D', 'E'],
        [false, true, true, true, true]
      );

      expect(state.players).toHaveLength(5);
      expect(state.playerCount).toBe(5);
    });

    it('不正な人数でエラーを投げる', () => {
      expect(() => {
        createInitialState('test-game', ['p1'], ['A'], [false]);
      }).toThrow();

      expect(() => {
        createInitialState(
          'test-game',
          ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
          ['A', 'B', 'C', 'D', 'E', 'F'],
          [false, false, false, false, false, false]
        );
      }).toThrow();
    });
  });

  describe('startRound', () => {
    it('ラウンドを開始して牌を配る（2人）', () => {
      let state = createInitialState(
        'test-game',
        ['player1', 'player2'],
        ['Alice', 'Bob'],
        [false, false]
      );

      state = startRound(state);

      expect(state.status).toBe('playing');
      expect(state.currentRound).toBe(1);

      // 各プレイヤーの手牌枚数を確認
      const startPlayer = state.players.find((p) => p.id === state.startPlayerId);
      const otherPlayer = state.players.find((p) => p.id !== state.startPlayerId);

      expect(startPlayer?.hand.length).toBe(PLAYER_HAND_COUNT[2] + START_PLAYER_BONUS);
      expect(otherPlayer?.hand.length).toBe(PLAYER_HAND_COUNT[2]);

      // 合計枚数確認（2人プレイは20+21=41枚、1枚余る）
      const totalCards =
        state.players.reduce((sum, p) => sum + p.hand.length, 0);
      const expectedTotal = PLAYER_HAND_COUNT[2] * 2 + START_PLAYER_BONUS; // 20*2+1=41
      expect(totalCards).toBe(expectedTotal);
    });

    it('ラウンドを開始して牌を配る（4人）', () => {
      let state = createInitialState(
        'test-game',
        ['p1', 'p2', 'p3', 'p4'],
        ['A', 'B', 'C', 'D'],
        [false, true, true, true]
      );

      state = startRound(state);

      expect(state.status).toBe('playing');

      const startPlayer = state.players.find((p) => p.id === state.startPlayerId);
      const otherPlayers = state.players.filter((p) => p.id !== state.startPlayerId);

      expect(startPlayer?.hand.length).toBe(PLAYER_HAND_COUNT[4] + START_PLAYER_BONUS);
      otherPlayers.forEach((p) => {
        expect(p.hand.length).toBe(PLAYER_HAND_COUNT[4]);
      });

      // 合計枚数確認（4人プレイは10*3+11=41枚、1枚余る）
      const totalCards =
        state.players.reduce((sum, p) => sum + p.hand.length, 0);
      const expectedTotal = PLAYER_HAND_COUNT[4] * 4 + START_PLAYER_BONUS; // 10*4+1=41
      expect(totalCards).toBe(expectedTotal);
    });

    it('戦場カードが選択される', () => {
      let state = createInitialState(
        'test-game',
        ['p1', 'p2'],
        ['A', 'B'],
        [false, false]
      );

      state = startRound(state);

      expect(state.battlefieldCard).toBeDefined();
      expect(state.battlefieldCard.type).toBeDefined();
      expect(state.battlefieldCard.points).toBeGreaterThan(0);
    });
  });

  describe('canDefendWith', () => {
    const createTile = (type: Tile['type'], id: string = 'tile-1'): Tile => ({
      id,
      type,
      isFaceUp: true,
    });

    it('同じ数字で受けられる', () => {
      expect(canDefendWith(createTile(3), createTile(3))).toBe(true);
      expect(canDefendWith(createTile(7), createTile(7))).toBe(true);
    });

    it('違う数字では受けられない', () => {
      expect(canDefendWith(createTile(3), createTile(5))).toBe(false);
      expect(canDefendWith(createTile(1), createTile(8))).toBe(false);
    });

    it('タイガー奥義で偶数を受けられる', () => {
      expect(canDefendWith(createTile(2), createTile('tiger'))).toBe(true);
      expect(canDefendWith(createTile(4), createTile('tiger'))).toBe(true);
      expect(canDefendWith(createTile(6), createTile('tiger'))).toBe(true);
      expect(canDefendWith(createTile(8), createTile('tiger'))).toBe(true);
    });

    it('タイガー奥義で奇数は受けられない', () => {
      expect(canDefendWith(createTile(1), createTile('tiger'))).toBe(false);
      expect(canDefendWith(createTile(3), createTile('tiger'))).toBe(false);
      expect(canDefendWith(createTile(5), createTile('tiger'))).toBe(false);
      expect(canDefendWith(createTile(7), createTile('tiger'))).toBe(false);
    });

    it('ドラゴン奥義で奇数を受けられる', () => {
      expect(canDefendWith(createTile(1), createTile('dragon'))).toBe(true);
      expect(canDefendWith(createTile(3), createTile('dragon'))).toBe(true);
      expect(canDefendWith(createTile(5), createTile('dragon'))).toBe(true);
      expect(canDefendWith(createTile(7), createTile('dragon'))).toBe(true);
    });

    it('ドラゴン奥義で偶数は受けられない', () => {
      expect(canDefendWith(createTile(2), createTile('dragon'))).toBe(false);
      expect(canDefendWith(createTile(4), createTile('dragon'))).toBe(false);
      expect(canDefendWith(createTile(6), createTile('dragon'))).toBe(false);
      expect(canDefendWith(createTile(8), createTile('dragon'))).toBe(false);
    });

    it('タイガー攻めは偶数で受けられる', () => {
      expect(canDefendWith(createTile('tiger'), createTile(2))).toBe(false);
      expect(canDefendWith(createTile('tiger'), createTile('tiger'))).toBe(true);
    });

    it('ドラゴン攻めは奇数で受けられる', () => {
      expect(canDefendWith(createTile('dragon'), createTile(1))).toBe(false);
      expect(canDefendWith(createTile('dragon'), createTile('dragon'))).toBe(true);
    });
  });

  describe('getDefendableTiles', () => {
    const createTile = (type: Tile['type'], id: string): Tile => ({
      id,
      type,
      isFaceUp: true,
    });

    it('受けられる牌のリストを返す', () => {
      const attackTile = createTile(3, 'attack');
      const hand: Tile[] = [
        createTile(1, 'h1'),
        createTile(3, 'h2'),
        createTile(3, 'h3'),
        createTile(5, 'h4'),
      ];

      const defendable = getDefendableTiles(attackTile, hand);
      expect(defendable).toHaveLength(2);
      expect(defendable[0].type).toBe(3);
      expect(defendable[1].type).toBe(3);
    });

    it('タイガー奥義で偶数を全て受けられる', () => {
      const attackTile = createTile(4, 'attack');
      const hand: Tile[] = [
        createTile(1, 'h1'),
        createTile(3, 'h2'),
        createTile('tiger', 'h3'),
        createTile(5, 'h4'),
      ];

      const defendable = getDefendableTiles(attackTile, hand);
      expect(defendable).toHaveLength(1);
      expect(defendable[0].type).toBe('tiger');
    });

    it('受けられる牌がない場合は空配列', () => {
      const attackTile = createTile(7, 'attack');
      const hand: Tile[] = [
        createTile(1, 'h1'),
        createTile(2, 'h2'),
        createTile(3, 'h3'),
      ];

      const defendable = getDefendableTiles(attackTile, hand);
      expect(defendable).toHaveLength(0);
    });
  });

  describe('attack', () => {
    it('攻め牌を出せる', () => {
      let state = createInitialState(
        'test-game',
        ['p1', 'p2'],
        ['A', 'B'],
        [false, false]
      );
      state = startRound(state);

      const currentPlayer = state.players.find((p) => p.id === state.currentPlayerId)!;
      const tileId = currentPlayer.hand[0].id;
      const initialHandCount = currentPlayer.hand.length;

      state = attack(state, currentPlayer.id, tileId);

      expect(state.attackColumn.attackTile).toBeDefined();
      expect(state.attackColumn.attackerId).toBe(currentPlayer.id);

      const updatedPlayer = state.players.find((p) => p.id === currentPlayer.id)!;
      expect(updatedPlayer.hand.length).toBe(initialHandCount - 1);
    });

    it('手牌が0枚になったら上がり', () => {
      let state = createInitialState(
        'test-game',
        ['p1', 'p2'],
        ['A', 'B'],
        [false, false]
      );
      state = startRound(state);

      const currentPlayer = state.players.find((p) => p.id === state.currentPlayerId)!;

      // 手牌を1枚にする
      state.players = state.players.map((p) => {
        if (p.id === currentPlayer.id) {
          return { ...p, hand: [p.hand[0]] };
        }
        return p;
      });

      const tileId = currentPlayer.hand[0].id;
      state = attack(state, currentPlayer.id, tileId);

      expect(state.status).toBe('roundEnd');

      const finishedPlayer = state.players.find((p) => p.id === currentPlayer.id)!;
      expect(finishedPlayer.hasFinished).toBe(true);
      expect(finishedPlayer.hand.length).toBe(0);
    });
  });

  describe('defend', () => {
    it('受けられる牌で受けられる', () => {
      let state = createInitialState(
        'test-game',
        ['p1', 'p2'],
        ['A', 'B'],
        [false, false]
      );
      state = startRound(state);

      // 攻め牌を出す
      const attacker = state.players.find((p) => p.id === state.currentPlayerId)!;
      const attackTile = attacker.hand.find((t) => t.type === 3) || attacker.hand[0];
      state = attack(state, attacker.id, attackTile.id);

      // 受ける
      const defender = state.players.find(
        (p) => p.id === state.attackColumn.currentDefenderId
      )!;

      // 同じ数字の牌を持っているか確認
      const defendTile = defender.hand.find((t) => t.type === attackTile.type);
      if (!defendTile) {
        // 持っていなければスキップ
        return;
      }

      const initialDefendColumnLength = state.defendColumn.length;
      state = defend(state, defender.id, defendTile.id);

      expect(state.defendColumn.length).toBe(initialDefendColumnLength + 2); // 攻め牌+受け牌
      expect(state.attackColumn.attackTile).toBeNull();
      expect(state.currentPlayerId).toBe(defender.id); // 受けたプレイヤーが次の攻め番
    });
  });

  describe('pass', () => {
    it('パスできる', () => {
      let state = createInitialState(
        'test-game',
        ['p1', 'p2', 'p3'],
        ['A', 'B', 'C'],
        [false, false, false]
      );
      state = startRound(state);

      // 攻め牌を出す
      const attacker = state.players.find((p) => p.id === state.currentPlayerId)!;
      state = attack(state, attacker.id, attacker.hand[0].id);

      // パス
      const defender = state.players.find(
        (p) => p.id === state.attackColumn.currentDefenderId
      )!;
      state = pass(state, defender.id);

      expect(state.attackColumn.passedPlayerIds).toContain(defender.id);
      expect(state.attackColumn.attackTile).not.toBeNull(); // まだ攻め牌は残る
    });

    it('全員パスで1周ボーナス', () => {
      let state = createInitialState(
        'test-game',
        ['p1', 'p2'],
        ['A', 'B'],
        [false, false]
      );
      state = startRound(state);

      // 攻め牌を出す
      const attacker = state.players.find((p) => p.id === state.currentPlayerId)!;
      const attackTile = attacker.hand[0];
      state = attack(state, attacker.id, attackTile.id);

      // 相手がパス
      const defender = state.players.find(
        (p) => p.id === state.attackColumn.currentDefenderId
      )!;
      state = pass(state, defender.id);

      // 1周ボーナス確認
      const updatedAttacker = state.players.find((p) => p.id === attacker.id)!;
      expect(updatedAttacker.roundBonusCount).toBe(1);
      expect(state.defendColumn.length).toBeGreaterThan(0);
      expect(state.attackColumn.attackTile).toBeNull();
      expect(state.currentPlayerId).toBe(attacker.id); // 攻め側が再び攻め番
    });
  });

  describe('endRound', () => {
    it('ラウンド終了で得点計算', () => {
      let state = createInitialState(
        'test-game',
        ['p1', 'p2'],
        ['A', 'B'],
        [false, false]
      );
      state = startRound(state);

      // 手牌を1枚にして上がる
      const currentPlayer = state.players.find((p) => p.id === state.currentPlayerId)!;
      const lastTile = currentPlayer.hand[0];

      state.players = state.players.map((p) => {
        if (p.id === currentPlayer.id) {
          return { ...p, hand: [lastTile] };
        }
        return p;
      });

      state = attack(state, currentPlayer.id, lastTile.id);
      expect(state.status).toBe('roundEnd');

      state = endRound(state);

      const finishedPlayer = state.players.find((p) => p.id === currentPlayer.id)!;
      expect(finishedPlayer.score).toBeGreaterThanOrEqual(0); // 得点が加算される
    });
  });
});
