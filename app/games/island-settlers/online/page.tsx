'use client';

import { GameHeader } from '@/components/layout/GameHeader';
import { ModeUnavailable } from '@/components/game/ModeUnavailable';

export default function IslandSettlersOnlinePage() {
  return (
    <>
      <GameHeader
        title="アイランドセトラーズ オンライン対戦"
        backUrl="/games/island-settlers"
        backLabel="モード選択"
      />
      <div className="min-h-screen app-bg board-pattern pt-16 sm:pt-20">
        <ModeUnavailable
          gameName="アイランドセトラーズ"
          modeLabel="オンライン対戦"
          backHref="/games/island-settlers"
          alternatives={[
            { href: '/games/island-settlers/cpu', label: 'CPU対戦を始める', type: 'cpu' },
            { href: '/games/island-settlers/local', label: 'ローカル対戦を始める', type: 'local' },
          ]}
        />
      </div>
    </>
  );
}
