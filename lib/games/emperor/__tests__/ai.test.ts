/**
 * Emperor AI のテスト
 */
import { calculateExpectedValue, calculateBankruptcyRisk, analyzeGameState } from '../ai';
import { createInitialState, startGame } from '../engine';
import { TRANSFER_COINS } from '../constants';

describe('Emperor AI', () => {
  const GAME_ID = 'test-game';
  const PLAYER_IDS = ['player1', 'player2', 'player3', 'player4'];
  const PLAYER_NAMES = ['Alice', 'Bob', 'Charlie', 'Dave'];
  const CPU_FLAGS = [false, false, false, false];

  describe('calculateExpectedValue', () => {
    it('期待値を正しく計算する', () => {
      const state = createInitialState(GAME_ID, PLAYER_IDS, PLAYER_NAMES, CPU_FLAGS);
      const expected = calculateExpectedValue(state, 'player1');

      // 4人プレイの場合、各階級になる確率は1/4
      expect(expected.emperorProbability).toBe(0.25);
      expect(expected.slaveProbability).toBe(0.25);
      expect(expected.citizenProbability).toBe(0.5);

      // 期待値 = (1/4 * +3) + (1/4 * -3) + (1/2 * 0) = 0
      expect(expected.expectedCoins).toBe(10); // 初期コイン10から変動なし
    });

    it('3人プレイの期待値を計算する', () => {
      const state = createInitialState(
        GAME_ID,
        PLAYER_IDS.slice(0, 3),
        PLAYER_NAMES.slice(0, 3),
        [false, false, false]
      );
      const expected = calculateExpectedValue(state, 'player1');

      // 3人プレイの場合、各階級になる確率は1/3
      expect(expected.emperorProbability).toBeCloseTo(1 / 3);
      expect(expected.slaveProbability).toBeCloseTo(1 / 3);
      expect(expected.citizenProbability).toBeCloseTo(1 / 3);
    });
  });

  describe('calculateBankruptcyRisk', () => {
    it('コインが十分ある場合はリスク0', () => {
      const state = createInitialState(GAME_ID, PLAYER_IDS, PLAYER_NAMES, CPU_FLAGS);
      const risk = calculateBankruptcyRisk(state, 'player1');

      // 初期コイン10 > 移動コイン3なので破産リスクなし
      expect(risk).toBe(0);
    });

    it('コインが少ない場合はリスクが高い', () => {
      let state = createInitialState(GAME_ID, PLAYER_IDS, PLAYER_NAMES, CPU_FLAGS);

      // プレイヤーのコインを減らす
      state.players[0].coins = 2;

      const risk = calculateBankruptcyRisk(state, 'player1');

      // コイン2 < 移動コイン3なので破産リスクあり
      expect(risk).toBeGreaterThan(0);
    });

    it('破産済みプレイヤーのリスクは1.0', () => {
      let state = createInitialState(GAME_ID, PLAYER_IDS, PLAYER_NAMES, CPU_FLAGS);

      state.players[0].isActive = false;
      state.players[0].coins = 0;

      const risk = calculateBankruptcyRisk(state, 'player1');

      expect(risk).toBe(1.0);
    });
  });

  describe('analyzeGameState', () => {
    it('ゲーム状態を正しく分析する', () => {
      const state = createInitialState(GAME_ID, PLAYER_IDS, PLAYER_NAMES, CPU_FLAGS);
      const analysis = analyzeGameState(state);

      expect(analysis.activePlayersCount).toBe(4);
      expect(analysis.averageCoins).toBe(10);
      expect(analysis.maxCoins).toBe(10);
      expect(analysis.minCoins).toBe(10);
      expect(Object.keys(analysis.bankruptcyRisk)).toHaveLength(4);
    });

    it('破産後の状態を分析する', () => {
      let state = createInitialState(GAME_ID, PLAYER_IDS, PLAYER_NAMES, CPU_FLAGS);

      // 1人破産させる
      state.players[0].isActive = false;
      state.players[0].coins = 0;
      state.players[1].coins = 15;

      const analysis = analyzeGameState(state);

      expect(analysis.activePlayersCount).toBe(3);
      expect(analysis.maxCoins).toBe(15);
      expect(analysis.minCoins).toBe(10);
    });
  });
});
