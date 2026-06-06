'use client';

type GameVisualKey =
  | 'texas'
  | 'indian'
  | 'tiger'
  | 'geister'
  | 'connect4'
  | 'xiangqi'
  | 'emperor'
  | 'island'
  | 'lobby';

const positions: Record<GameVisualKey, string> = {
  texas: '0% 0%',
  indian: '50% 0%',
  tiger: '100% 0%',
  geister: '0% 50%',
  connect4: '50% 50%',
  xiangqi: '100% 50%',
  emperor: '0% 100%',
  island: '50% 100%',
  lobby: '100% 100%',
};

export function GameVisualIcon({
  game,
  label,
  className = '',
}: {
  game: GameVisualKey;
  label: string;
  className?: string;
}) {
  return (
    <span
      aria-label={label}
      role="img"
      className={`block shrink-0 overflow-hidden rounded-lg border border-white/40 bg-neutral-900 shadow-sm ${className}`}
    >
      <span
        className="block h-full w-full"
        style={{
          backgroundImage: 'url(/generated/game-lounge-icons.webp)',
          backgroundPosition: positions[game],
          backgroundSize: '300% 300%',
        }}
      />
    </span>
  );
}
