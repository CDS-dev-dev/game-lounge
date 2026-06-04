'use client';

import { GameHeader } from '@/components/layout/GameHeader';
import { ModeUnavailable } from '@/components/game/ModeUnavailable';

export default function TigerDragonOnlinePage() {
  return (
    <>
      <GameHeader
        title="タイガー&ドラゴン オンライン対戦"
        backUrl="/games/tiger-dragon"
        backLabel="モード選択"
      />
      <div className="min-h-screen app-bg board-pattern pt-16 sm:pt-20">
        <ModeUnavailable
          gameName="タイガー&ドラゴン"
          modeLabel="オンライン対戦"
          backHref="/games/tiger-dragon"
          alternatives={[
            { href: '/games/tiger-dragon/cpu', label: 'CPU対戦を始める', type: 'cpu' },
            { href: '/games/tiger-dragon/local', label: 'ローカル対戦を始める', type: 'local' },
          ]}
        />
      </div>
    </>
  );
}
