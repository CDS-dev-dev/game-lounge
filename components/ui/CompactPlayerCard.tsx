// コンパクトプレイヤーカードコンポーネント

'use client';

import React from 'react';
import { TEXT_SIZE } from '@/lib/constants/ui-scale';

interface CompactPlayerCardProps {
  name: string;
  chips: number;
  maxChips?: number; // プログレスバー表示用
  bet?: number;
  isActive?: boolean;
  isFolded?: boolean;
  isDealer?: boolean;
  avatar?: string; // 絵文字やアイコン
  position?: string; // SB, BB, BTN など
  className?: string;
}

export const CompactPlayerCard: React.FC<CompactPlayerCardProps> = ({
  name,
  chips,
  maxChips = 10000,
  bet,
  isActive = false,
  isFolded = false,
  isDealer = false,
  avatar = '👤',
  position,
  className = '',
}) => {
  const chipPercentage = Math.min((chips / maxChips) * 100, 100);

  // アクセシビリティ用のステータス説明
  const statusDescription = [
    isActive && 'アクティブ',
    isFolded && 'フォールド済み',
    isDealer && 'ディーラー',
    position && `ポジション${position}`,
  ].filter(Boolean).join(', ');

  const ariaLabel = `${name}, チップ${chips}枚${bet ? `, ベット${bet}枚` : ''}${statusDescription ? `, ${statusDescription}` : ''}`;

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`
        relative rounded-lg p-2 sm:p-3
        transition-all duration-200
        ${isActive ? 'ring-2 ring-green-500 bg-green-50' : 'bg-white'}
        ${isFolded ? 'opacity-50' : ''}
        ${className}
      `}
    >
      {/* ディーラーボタン */}
      {isDealer && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold shadow-md">
          <span aria-label="ディーラー">D</span>
        </div>
      )}

      {/* ポジション表示 */}
      {position && (
        <div className="absolute -top-2 -left-2 px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-md">
          {position}
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* アバター */}
        <div className="text-2xl flex-shrink-0" role="img" aria-hidden="true">{avatar}</div>

        <div className="flex-1 min-w-0">
          {/* 名前 */}
          <div className={`${TEXT_SIZE.label} font-bold text-slate-900 truncate`}>
            {name}
          </div>

          {/* チップス残量バー */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={chipPercentage} aria-valuemin={0} aria-valuemax={100} aria-label={`チップ残量${Math.round(chipPercentage)}%`}>
              <div
                className={`h-full transition-all duration-300 ${
                  chipPercentage > 50
                    ? 'bg-green-500'
                    : chipPercentage > 25
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${chipPercentage}%` }}
              />
            </div>
            <span className={`${TEXT_SIZE.caption} font-semibold text-slate-700 whitespace-nowrap`}>
              <span aria-hidden="true">💰</span>{chips.toLocaleString()}
            </span>
          </div>

          {/* ベット額 */}
          {bet !== undefined && bet > 0 && (
            <div className={`${TEXT_SIZE.caption} text-indigo-600 font-bold mt-1`}>
              ベット: {bet.toLocaleString()}
            </div>
          )}

          {/* フォールド表示 */}
          {isFolded && (
            <div className={`${TEXT_SIZE.caption} text-red-600 font-bold mt-1`}>
              フォールド
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 複数プレイヤー用のグリッドレイアウト
interface PlayerGridProps {
  players: Array<CompactPlayerCardProps & { id: string }>;
  className?: string;
}

export const PlayerGrid: React.FC<PlayerGridProps> = ({ players, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 ${className}`}>
      {players.map((player) => (
        <CompactPlayerCard key={player.id} {...player} />
      ))}
    </div>
  );
};
