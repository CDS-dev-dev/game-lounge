'use client';

import { GameHeader } from '@/components/layout/GameHeader';
import { ModeUnavailable } from '@/components/game/ModeUnavailable';

export default function EmperorOnlinePage() {
  return (
    <>
      <GameHeader
        title="エンペラー オンライン対戦"
        backUrl="/games/emperor"
        backLabel="モード選択"
      />
      <div className="min-h-screen app-bg board-pattern pt-16 sm:pt-20">
        <ModeUnavailable
          gameName="エンペラー"
          modeLabel="オンライン対戦"
          backHref="/games/emperor"
          alternatives={[
            { href: '/games/emperor/cpu', label: 'CPU対戦を始める', type: 'cpu' },
          ]}
        />
      </div>
    </>
  );
}
