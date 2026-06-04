'use client';

import { GameHeader } from '@/components/layout/GameHeader';
import { ModeUnavailable } from '@/components/game/ModeUnavailable';

export default function XiangqiOnlinePage() {
  return (
    <>
      <GameHeader
        title="中国象棋 オンライン対戦"
        backUrl="/games/xiangqi"
        backLabel="モード選択"
      />
      <div className="min-h-screen app-bg board-pattern pt-16 sm:pt-20">
        <ModeUnavailable
          gameName="中国象棋"
          modeLabel="オンライン対戦"
          backHref="/games/xiangqi"
          alternatives={[
            { href: '/games/xiangqi/cpu', label: 'CPU対戦を始める', type: 'cpu' },
            { href: '/games/xiangqi/local', label: 'ローカル対戦を始める', type: 'local' },
          ]}
        />
      </div>
    </>
  );
}
