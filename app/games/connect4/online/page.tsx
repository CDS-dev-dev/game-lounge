'use client';

import { GameHeader } from '@/components/layout/GameHeader';
import { ModeUnavailable } from '@/components/game/ModeUnavailable';

export default function Connect4OnlinePage() {
  return (
    <>
      <GameHeader
        title="立体四目並べ オンライン対戦"
        backUrl="/games/connect4"
        backLabel="モード選択"
      />
      <div className="min-h-screen app-bg board-pattern pt-16 sm:pt-20">
        <ModeUnavailable
          gameName="立体四目並べ"
          modeLabel="オンライン対戦"
          backHref="/games/connect4"
          alternatives={[
            { href: '/games/connect4/cpu', label: 'CPU対戦を始める', type: 'cpu' },
            { href: '/games/connect4/local', label: 'ローカル対戦を始める', type: 'local' },
          ]}
        />
      </div>
    </>
  );
}
