import { fireEvent, render, screen } from '@testing-library/react';
import { GeisterBoard } from '@/components/game/GeisterBoard';
import type { GeisterClientState, PlayerRole } from '@/lib/games/geister/types';

jest.mock('@/components/ui/KeyboardHelpModal', () => ({
  KeyboardHelpModal: () => null,
}));

function createClientState(myRole: PlayerRole): GeisterClientState {
  const board = Array.from({ length: 6 }, () => Array(6).fill(null));
  const myPiece = {
    id: `${myRole}-target`,
    owner: myRole,
    position: myRole === 'player1' ? { x: 2, y: 0 } : { x: 3, y: 5 },
    type: 'good' as const,
    captured: false,
    escaped: false,
  };
  const opponentRole = myRole === 'player1' ? 'player2' : 'player1';
  const opponentPiece = {
    id: `${opponentRole}-hidden`,
    owner: opponentRole,
    position: myRole === 'player1' ? { x: 2, y: 5 } : { x: 3, y: 0 },
    captured: false,
    escaped: false,
  };

  board[myPiece.position.y][myPiece.position.x] = myPiece;
  board[opponentPiece.position.y][opponentPiece.position.x] = opponentPiece;

  return {
    gameId: 'test',
    status: 'playing',
    board,
    currentTurn: myRole,
    myRole,
    myPlayerId: 'me',
    isMyTurn: true,
    canOperate: true,
    myPieces: [myPiece],
    opponentPiecesCount: {
      total: 8,
      captured: 0,
    },
    capturedCounts: {
      myGood: 0,
      myBad: 0,
      opponentGood: 0,
      opponentBad: 0,
    },
    setupReady: {
      player1: true,
      player2: true,
    },
    winner: null,
    winReason: null,
    lastMove: null,
  };
}

describe('GeisterBoard', () => {
  it('selects the exact player1 piece in the tapped internal cell after flipped rendering', () => {
    const onPieceClick = jest.fn();
    const { container } = render(
      <GeisterBoard gameState={createClientState('player1')} onPieceClick={onPieceClick} />
    );

    const cell = container.querySelector('[data-position="2,0"]');
    expect(cell).toHaveAttribute('data-piece-id', 'player1-target');

    fireEvent.click(cell as Element);

    expect(onPieceClick).toHaveBeenCalledWith('player1-target');
  });

  it('selects the exact player2 piece in the tapped internal cell without flipped rendering', () => {
    const onPieceClick = jest.fn();
    const { container } = render(
      <GeisterBoard gameState={createClientState('player2')} onPieceClick={onPieceClick} />
    );

    const cell = container.querySelector('[data-position="3,5"]');
    expect(cell).toHaveAttribute('data-piece-id', 'player2-target');

    fireEvent.touchEnd(cell as Element);

    expect(onPieceClick).toHaveBeenCalledWith('player2-target');
  });

  it('moves to the tapped internal coordinate when a piece is already selected', () => {
    const onCellClick = jest.fn();
    const { container } = render(
      <GeisterBoard
        gameState={createClientState('player1')}
        onCellClick={onCellClick}
        selectedPieceId="player1-target"
        validMoves={[{ x: 2, y: 1 }]}
      />
    );

    fireEvent.click(container.querySelector('[data-position="2,1"]') as Element);

    expect(onCellClick).toHaveBeenCalledWith({ x: 2, y: 1 });
    expect(screen.getByLabelText('C2, 移動可能')).toBeInTheDocument();
  });
});
