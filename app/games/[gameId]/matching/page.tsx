'use client';

import { useParams } from 'next/navigation';
import { GameHeader } from '@/components/layout/GameHeader';
import { ModeUnavailable } from '@/components/game/ModeUnavailable';

const knownGameIds = new Set([
  'connect4',
  'emperor',
  'geister',
  'indian-poker',
  'island-settlers',
  'texas-holdem',
  'tiger-dragon',
  'xiangqi',
]);

export default function MatchingPage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const backHref = knownGameIds.has(gameId) ? `/games/${gameId}` : '/games';

  return (
    <>
      <GameHeader title="オンライン対戦" backUrl={backHref} backLabel="モード選択" />
      <div className="min-h-screen app-bg board-pattern pt-16 sm:pt-20">
        <ModeUnavailable
          gameName="オンライン対戦"
          modeLabel="マッチング"
          backHref={backHref}
          alternatives={[
            { href: backHref, label: 'モード選択を開く', type: 'menu' },
          ]}
        />
      </div>
    </>
  );
}
