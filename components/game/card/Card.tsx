// トランプカード表示コンポーネント

'use client';

import React from 'react';
import { Card as CardType, getSuitDisplay, getSuitColor } from '@/lib/utils/card-utils';

export interface PlayingCardProps {
  /** カード情報（nullの場合は空スロット） */
  card?: CardType | null;
  /** 裏面表示にするか */
  faceDown?: boolean;
  /** カードサイズ */
  size?: 'small' | 'medium' | 'large';
  /** 追加のクラス名 */
  className?: string;
  /** クリック時のコールバック */
  onClick?: () => void;
  /** 選択状態 */
  selected?: boolean;
  /** 無効化状態 */
  disabled?: boolean;
}

/**
 * トランプカードコンポーネント
 *
 * 特徴:
 * - 52枚 + ジョーカー対応
 * - 裏面表示対応
 * - サイズバリエーション
 * - レスポンシブデザイン
 */
export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  faceDown = false,
  size = 'medium',
  className = '',
  onClick,
  selected = false,
  disabled = false,
}) => {
  // サイズクラス定義
  const sizeClasses = {
    small: 'w-12 h-16 text-xs',
    medium: 'w-16 h-24 sm:w-20 sm:h-28 text-sm sm:text-base',
    large: 'w-20 h-28 sm:w-24 sm:h-36 text-base sm:text-lg',
  };

  // クリック可能かどうか
  const isClickable = onClick && !disabled;

  // 裏面表示
  if (faceDown) {
    return (
      <button
        type="button"
        onClick={isClickable ? onClick : undefined}
        disabled={disabled}
        className={`
          ${sizeClasses[size]}
          rounded-lg border-2 border-gray-700
          bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900
          shadow-md
          relative overflow-hidden
          ${isClickable ? 'cursor-pointer hover:shadow-lg hover:scale-105 transition-transform' : 'cursor-default'}
          ${selected ? 'ring-4 ring-yellow-400' : ''}
          ${disabled ? 'opacity-50' : ''}
          ${className}
        `}
        aria-label="裏向きのカード"
      >
        {/* 裏面パターン */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full p-2">
            <div className="w-full h-full border-4 border-white rounded-md opacity-40" />
          </div>
        </div>
      </button>
    );
  }

  // カードがない場合は空スロット
  if (!card) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 ${className}`}
        role="presentation"
      />
    );
  }

  // 表面表示
  try {
    const suitDisplay = getSuitDisplay(card.suit);
    const color = card.rank === 'Joker' ? 'black' : getSuitColor(card.suit);
    const colorClass = color === 'red' ? 'text-red-600' : 'text-gray-900';

    return (
      <button
        type="button"
        onClick={isClickable ? onClick : undefined}
        disabled={disabled}
        className={`
          ${sizeClasses[size]}
          rounded-lg border-2 border-gray-300
          bg-white
          shadow-md
          relative
          ${isClickable ? 'cursor-pointer hover:shadow-lg hover:scale-105 transition-transform' : 'cursor-default'}
          ${selected ? 'ring-4 ring-yellow-400' : ''}
          ${disabled ? 'opacity-50' : ''}
          ${className}
        `}
        aria-label={`${suitDisplay}${card.rank}`}
      >
        <div className={`absolute inset-0 p-1 sm:p-2 flex flex-col justify-between ${colorClass}`}>
          {/* 左上：ランクとスート */}
          <div className="flex flex-col items-center leading-none">
            <span className="font-bold">{card.rank}</span>
            <span className="text-lg sm:text-xl">{suitDisplay}</span>
          </div>

          {/* 中央：大きなスート（Joker以外） */}
          {card.rank !== 'Joker' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl sm:text-4xl opacity-60">{suitDisplay}</span>
            </div>
          )}

          {/* Jokerの場合 */}
          {card.rank === 'Joker' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl sm:text-3xl">🃏</span>
            </div>
          )}

          {/* 右下：ランクとスート（逆向き） */}
          <div className="flex flex-col items-center leading-none transform rotate-180">
            <span className="font-bold">{card.rank}</span>
            <span className="text-lg sm:text-xl">{suitDisplay}</span>
          </div>
        </div>
      </button>
    );
  } catch (error) {
    console.error('[PlayingCard] カード表示エラー:', error, card);
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg border-2 border-red-300 bg-red-50 flex items-center justify-center text-red-600 text-xs ${className}`}
        role="alert"
      >
        エラー
      </div>
    );
  }
};
