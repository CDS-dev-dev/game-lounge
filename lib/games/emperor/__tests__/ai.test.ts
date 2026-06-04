import { calculateCpuCard } from '../ai';
import { createInitialState, startSet } from '../engine';

describe('Emperor AI', () => {
  const GAME_ID = 'test-game';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns one of the current CPU hand cards for each difficulty', () => {
    const state = startSet(createInitialState(GAME_ID));
    const cpuHand = state.players.find((player) => player.isCpu)?.hand ?? [];

    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      const card = calculateCpuCard(state, difficulty);
      expect(cpuHand).toContainEqual(card);
    }
  });

  it('uses a simple opening preference on medium difficulty', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    const state = startSet(createInitialState(GAME_ID));
    const card = calculateCpuCard(state, 'medium');

    expect(card.type).toBe('citizen');
  });

  it('throws when the CPU has no cards left', () => {
    const state = startSet(createInitialState(GAME_ID));
    const emptyCpuHand = {
      ...state,
      players: state.players.map((player) =>
        player.isCpu ? { ...player, hand: [] } : player
      ),
    };

    expect(() => calculateCpuCard(emptyCpuHand)).toThrow();
  });
});
