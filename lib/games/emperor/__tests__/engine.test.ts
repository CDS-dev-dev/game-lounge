/**
 * Emperor ゲームエンジンのテスト
 */
import { createInitialState, startGame, revealCards, transferCoins, progressGame } from '../engine';
import { INITIAL_COINS, TRANSFER_COINS } from '../constants';

describe('Emperor Engine', () => {
  const GAME_ID = 'test-game';
  const PLAYER_IDS = ['player1', 'player2', 'player3', 'player4'];
  const PLAYER_NAMES = ['Alice', 'Bob', 'Charlie', 'Dave'];
  const CPU_FLAGS = [false, false, false, true];

  describe('createInitialState', () => {
    it('初期状態を正しく作成する', () => {
      const state = createInitialState(GAME_ID, PLAYER_IDS, PLAYER_NAMES, CPU_FLAGS);

      expect(state.gameId).toBe(GAME_ID);
      expect(state.status).toBe('waiting');
      expect(state.players).toHaveLength(4);
      expect(state.currentRound).toBe(0);
      expect(state.players[0].coins).toBe(INITIAL_COINS);
      expect(state.players[3].isCpu).toBe(true);
    });

    it('3人プレイヤーでも作成できる', () => {
      const state = createInitialState(GAME_ID, PLAYER_IDS.slice(0, 3), PLAYER_NAMES.slice(0, 3), [
        false,
        false,
        false,
      ]);

      expect(state.players).toHaveLength(3);
    });

    it('プレイヤー数が不正な場合エラーを投げる', () => {
      expect(() =>
        createInitialState(GAME_ID, ['player1', 'player2'], ['Alice', 'Bob'], [false, false])
      ).toThrow();

      expect(() =>
        createInitialState(
          GAME_ID,
          ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'],
          ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
          [false, false, false, false, false, false, false]
        )
      ).toThrow();
    });
  });

  describe('startGame', () => {
    it('カードを配り、ラウンドを開始する', () => {
      let state = createInitialState(GAME_ID, PLAYER_IDS, PLAYER_NAMES, CPU_FLAGS);
      state = startGame(state);

      expect(state.status).toBe('dealing');
      expect(state.currentRound).toBe(1);
      expect(state.players.every((p) => p.card !== null)).toBe(true);
      expect(state.players.every((p) => p.role !== null)).toBe(true);

      // 皇帝1人、奴隷1人、市民2人
      const emperor = state.players.filter((p) => p.role === 'emperor');
      const slave = state.players.filter((p) => p.role === 'slave');
      const citizens = state.players.filter((p) => p.role === 'citizen');

      expect(emperor).toHaveLength(1);
      expect(slave).toHaveLength(1);
      expect(citizens).toHaveLength(2);
    });
  });

  describe('revealCards', () => {
    it('カードを公開する', () => {
      let state = createInitialState(GAME_ID, PLAYER_IDS, PLAYER_NAMES, CPU_FLAGS);
      state = startGame(state);
      state = revealCards(state);

      expect(state.status).toBe('reveal');
    });

    it('dealing状態以外ではエラーを投げる', () => {
      const state = createInitialState(GAME_ID, PLAYER_IDS, PLAYER_NAMES, CPU_FLAGS);
      expect(() => revealCards(state)).toThrow();
    });
  });

  describe('transferCoins', () => {
    it('奴隷から皇帝にコインを移動する', () => {
      let state = createInitialState(GAME_ID, PLAYER_IDS, PLAYER_NAMES, CPU_FLAGS);
      state = startGame(state);
      state = revealCards(state);

      const emperorBefore = state.players.find((p) => p.role === 'emperor')!;
      const slaveBefore = state.players.find((p) => p.role === 'slave')!;

      state = transferCoins(state);

      const emperorAfter = state.players.find((p) => p.id === emperorBefore.id)!;
      const slaveAfter = state.players.find((p) => p.id === slaveBefore.id)!;

      expect(emperorAfter.coins).toBe(emperorBefore.coins + TRANSFER_COINS);
      expect(slaveAfter.coins).toBe(slaveBefore.coins - TRANSFER_COINS);
      expect(state.lastTransfer).not.toBeNull();
      expect(state.lastTransfer?.from).toBe(slaveBefore.id);
      expect(state.lastTransfer?.to).toBe(emperorBefore.id);
    });

    it('破産したプレイヤーは非アクティブになる', () => {
      let state = createInitialState(GAME_ID, PLAYER_IDS, PLAYER_NAMES, CPU_FLAGS);

      // 奴隷のコインを強制的に減らす
      state.players[0].coins = 2; // 破産寸前

      state = startGame(state);

      // 奴隷が破産する状況を作る
      const slaveIndex = state.players.findIndex((p) => p.role === 'slave');
      state.players[slaveIndex].coins = 2; // 3コイン払うと破産

      state = revealCards(state);
      state = transferCoins(state);

      const slave = state.players[slaveIndex];
      expect(slave.isActive).toBe(false);
      expect(slave.coins).toBeLessThanOrEqual(0);
    });
  });

  describe('progressGame', () => {
    it('ゲーム全体の流れを自動進行する', () => {
      let state = createInitialState(GAME_ID, PLAYER_IDS, PLAYER_NAMES, CPU_FLAGS);

      // waiting → dealing
      state = progressGame(state);
      expect(state.status).toBe('dealing');

      // dealing → reveal
      state = progressGame(state);
      expect(state.status).toBe('reveal');

      // reveal → transfer
      state = progressGame(state);
      expect(state.status).toBe('transfer');

      // transfer → waiting（次のラウンド）
      state = progressGame(state);
      expect(state.status).toBe('waiting');
      expect(state.currentRound).toBe(1);
    });
  });
});
