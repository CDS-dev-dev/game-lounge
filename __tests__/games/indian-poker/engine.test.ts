import { createInitialState, startRound } from '@/lib/games/indian-poker/engine';

describe('Indian Poker engine', () => {
  it('creates all local human players when cpuCount is zero', () => {
    const state = createInitialState('local', 3, 'player-0', 0);

    expect(state.players).toHaveLength(3);
    expect(state.players.every((player) => !player.isCPU)).toBe(true);
  });

  it('starts a local round with multiple active players', () => {
    const state = startRound(createInitialState('local', 3, 'player-0', 0));

    expect(state.status).toBe('betting');
    expect(state.players.filter((player) => player.isActive)).toHaveLength(3);
    expect(state.pot).toBeGreaterThan(0);
  });
});
