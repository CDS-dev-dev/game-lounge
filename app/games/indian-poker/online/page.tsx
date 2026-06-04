'use client';

import { GameHeader } from '@/components/layout/GameHeader';
import { ModeUnavailable } from '@/components/game/ModeUnavailable';

export default function IndianPokerOnlinePage() {
  return (
    <>
      <GameHeader
        title="インディアンポーカー オンライン対戦"
        backUrl="/games/indian-poker"
        backLabel="モード選択"
      />
      <div className="min-h-screen app-bg board-pattern pt-16 sm:pt-20">
        <ModeUnavailable
          gameName="インディアンポーカー"
          modeLabel="オンライン対戦"
          backHref="/games/indian-poker"
          alternatives={[
            { href: '/games/indian-poker/cpu', label: 'CPU対戦を始める', type: 'cpu' },
            { href: '/games/indian-poker/local', label: 'ローカル対戦を始める', type: 'local' },
          ]}
        />
      </div>
    </>
  );
}
