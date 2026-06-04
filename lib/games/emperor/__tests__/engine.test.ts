import {
  createInitialState,
  executeBattle,
  nextSet,
  selectPlayerCard,
  startSet,
  toClientState,
} from '../engine';
import { MAX_SETS, POINTS } from '../constants';

describe('Emperor Engine', () => {
  const GAME_ID = 'test-game';

  describe('createInitialState', () => {
    it('creates the current player-vs-cpu setup', () => {
      const state = createInitialState(GAME_ID, 'hard');

      expect(state.gameId).toBe(GAME_ID);
      expect(state.status).toBe('ready');
      expect(state.players).toHaveLength(2);
      expect(state.currentSet).toBe(1);
      expect(state.currentBattle).toBe(0);
      expect(state.players[0]).toMatchObject({
        id: 'player',
        isCpu: false,
        side: 'emperor',
        score: 0,
      });
      expect(state.players[1]).toMatchObject({
        id: 'cpu',
        isCpu: true,
        side: 'slave',
        cpuDifficulty: 'hard',
        score: 0,
      });
    });
  });

  describe('startSet', () => {
    it('starts play and alternates sides by set number', () => {
      const firstSet = startSet(createInitialState(GAME_ID));

      expect(firstSet.status).toBe('playing');
      expect(firstSet.players[0].side).toBe('emperor');
      expect(firstSet.players[1].side).toBe('slave');
      expect(firstSet.players[0].hand.map((card) => card.type)).toEqual([
        'emperor',
        'citizen',
        'citizen',
        'citizen',
        'citizen',
      ]);

      const secondSet = startSet({ ...firstSet, currentSet: 2 });

      expect(secondSet.players[0].side).toBe('slave');
      expect(secondSet.players[1].side).toBe('emperor');
      expect(secondSet.currentBattle).toBe(0);
      expect(secondSet.battleHistory).toHaveLength(0);
    });
  });

  describe('selectPlayerCard', () => {
    it('requires a playing set', () => {
      const state = createInitialState(GAME_ID);

      expect(() => selectPlayerCard(state, 'emperor-0')).toThrow();
    });

    it('stores the selected player card', () => {
      const state = startSet(createInitialState(GAME_ID));
      const nextState = selectPlayerCard(state, 'emperor-0');

      expect(nextState.playerCard).toEqual({ id: 'emperor-0', type: 'emperor' });
    });
  });

  describe('executeBattle', () => {
    it('scores a decisive emperor win and ends the round', () => {
      let state = startSet(createInitialState(GAME_ID));
      state = selectPlayerCard(state, 'emperor-0');
      state = {
        ...state,
        cpuCard: { id: 'citizen-s-0', type: 'citizen' },
      };

      const nextState = executeBattle(state);
      const player = nextState.players.find((p) => p.id === 'player');

      expect(nextState.status).toBe('roundEnd');
      expect(nextState.currentBattle).toBe(1);
      expect(nextState.lastBattleResult).toMatchObject({
        winner: 'player',
        playerPoints: POINTS.emperorWin,
        cpuPoints: 0,
      });
      expect(player?.score).toBe(POINTS.emperorWin);
      expect(nextState.playerCard).toBeNull();
      expect(nextState.cpuCard).toBeNull();
    });

    it('keeps the set playing after a draw while cards remain', () => {
      let state = startSet(createInitialState(GAME_ID));
      state = selectPlayerCard(state, 'citizen-e-0');
      state = {
        ...state,
        cpuCard: { id: 'citizen-s-0', type: 'citizen' },
      };

      const nextState = executeBattle(state);

      expect(nextState.status).toBe('playing');
      expect(nextState.lastBattleResult?.winner).toBe('draw');
      expect(nextState.players[0].score).toBe(0);
      expect(nextState.players[1].score).toBe(0);
    });
  });

  describe('nextSet', () => {
    it('advances to the next set and resets battle state', () => {
      let state = startSet(createInitialState(GAME_ID));
      state = selectPlayerCard(state, 'emperor-0');
      state = executeBattle({
        ...state,
        cpuCard: { id: 'citizen-s-0', type: 'citizen' },
      });

      const nextState = nextSet(state);

      expect(nextState.status).toBe('playing');
      expect(nextState.currentSet).toBe(2);
      expect(nextState.currentBattle).toBe(0);
      expect(nextState.battleHistory).toHaveLength(0);
      expect(nextState.players[0].side).toBe('slave');
    });

    it('finishes the game after the final set', () => {
      const baseState = createInitialState(GAME_ID);
      const state = {
        ...baseState,
        status: 'roundEnd' as const,
        currentSet: MAX_SETS,
        players: [
          { ...baseState.players[0], score: 4 },
          { ...baseState.players[1], score: 2 },
        ],
      };

      const nextState = nextSet(state);

      expect(nextState.status).toBe('finished');
      expect(nextState.winner).toBe('player');
    });
  });

  describe('toClientState', () => {
    it('maps internal state to the player-facing shape', () => {
      const state = startSet(createInitialState(GAME_ID));
      const clientState = toClientState(state, 'player');

      expect(clientState.myPlayerId).toBe('player');
      expect(clientState.myPlayer?.id).toBe('player');
      expect(clientState.opponentPlayer?.id).toBe('cpu');
      expect(clientState.currentSet).toBe(state.currentSet);
    });
  });
});
