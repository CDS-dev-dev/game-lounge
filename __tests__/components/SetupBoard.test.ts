import { generateRandomSetup } from '@/components/game/SetupBoard';

describe('generateRandomSetup', () => {
  it('creates unique piece ids for all auto-placed good and bad pieces', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1234567890);

    const setup = generateRandomSetup([], 'player1');
    const ids = setup.map((piece) => piece.pieceId);

    expect(setup).toHaveLength(8);
    expect(new Set(ids).size).toBe(8);
    expect(setup.filter((piece) => piece.type === 'good')).toHaveLength(4);
    expect(setup.filter((piece) => piece.type === 'bad')).toHaveLength(4);

    jest.restoreAllMocks();
  });
});
