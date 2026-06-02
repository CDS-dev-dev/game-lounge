// デッキ表示コンポーネント

'use client';

import React from 'react';
import { Card as CardType } from '@/lib/utils/card-utils';
import { PlayingCard } from './Card';

export interface DeckProps {
  /** デッキ内のカード枚数 */
  cardCount: number;
  /** カードサイズ */
  size?: 'small' | 'medium' | 'large';
  /** 追加のクラス名 */
  className?: string;
  /** デッキをクリックした時のコールバック（カードを引く処理など） */
  onDraw?: () => void;
  /** 無効化状態 */
  disabled?: boolean;
  /** 最大表示枚数（視覚的な重なり表現用） */
  maxVisibleCards?: number;
}

/**
 * デッキ表示コンポーネント
 *
 * 特徴:
 * - 複数枚のカードを重ねて表示
 * - 残り枚数を表示
 * - クリックでカードを引く操作に対応
 */
export const Deck: React.FC<DeckProps> = ({
  cardCount,
  size = 'medium',
  className = '',
  onDraw,
  disabled = false,
  maxVisibleCards = 5,
}) => {
  // サイズに応じたオフセット量
  const offsetMap = {
    small: 1,
    medium: 2,
    large: 3,
  };
  const offset = offsetMap[size];

  // 表示するカード枚数（視覚的効果のため最大値を制限）
  const visibleCards = Math.min(cardCount, maxVisibleCards);

  // クリック可能かどうか
  const isClickable = onDraw && !disabled && cardCount > 0;

  try {
    // デッキが空の場合
    if (cardCount === 0) {
      return (
        <div className={`relative ${className}`}>
          <PlayingCard card={null} size={size} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs sm:text-sm text-gray-400 font-semibold">空</span>
          </div>
        </div>
      );
    }

    return (
      <div className={`relative inline-block ${className}`}>
        {/* 重なったカードを表示 */}
        {Array.from({ length: visibleCards }).map((_, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              top: `${index * offset}px`,
              left: `${index * offset}px`,
              zIndex: index,
            }}
          >
            <PlayingCard
              faceDown
              size={size}
              onClick={index === visibleCards - 1 && isClickable ? onDraw : undefined}
              disabled={disabled || index !== visibleCards - 1}
            />
          </div>
        ))}

        {/* 最前面のカード（クリック可能） */}
        <div
          style={{
            marginTop: `${(visibleCards - 1) * offset}px`,
            marginLeft: `${(visibleCards - 1) * offset}px`,
          }}
        >
          <PlayingCard faceDown size={size} onClick={isClickable ? onDraw : undefined} disabled={disabled} />
        </div>

        {/* 残り枚数表示 */}
        <div
          className="absolute bottom-0 right-0 bg-gray-900 text-white text-xs sm:text-sm font-bold px-2 py-1 rounded-tl-lg rounded-br-lg shadow-md"
          style={{
            marginBottom: `${(visibleCards - 1) * offset}px`,
            marginRight: `${(visibleCards - 1) * offset}px`,
          }}
        >
          {cardCount}
        </div>

        {/* クリック可能な場合のヒント */}
        {isClickable && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs text-gray-500">
            クリックして引く
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('[Deck] デッキ表示エラー:', error);
    return (
      <div
        className={`bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-600 text-sm ${className}`}
        role="alert"
      >
        デッキ表示エラー
      </div>
    );
  }
};

/**
 * 捨て札表示コンポーネント
 *
 * デッキと似ているが、一番上のカードが表向き
 */
export interface DiscardPileProps {
  /** 捨て札の一番上のカード */
  topCard?: CardType | null;
  /** 捨て札の枚数 */
  cardCount: number;
  /** カードサイズ */
  size?: 'small' | 'medium' | 'large';
  /** 追加のクラス名 */
  className?: string;
}

export const DiscardPile: React.FC<DiscardPileProps> = ({ topCard, cardCount, size = 'medium', className = '' }) => {
  // サイズに応じたオフセット量
  const offsetMap = {
    small: 1,
    medium: 2,
    large: 3,
  };
  const offset = offsetMap[size];

  try {
    // 捨て札が空の場合
    if (cardCount === 0 || !topCard) {
      return (
        <div className={`relative ${className}`}>
          <PlayingCard card={null} size={size} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs sm:text-sm text-gray-400 font-semibold">捨て札</span>
          </div>
        </div>
      );
    }

    return (
      <div className={`relative inline-block ${className}`}>
        {/* 下のカード（裏面）を数枚表示 */}
        {cardCount > 1 &&
          Array.from({ length: Math.min(cardCount - 1, 3) }).map((_, index) => (
            <div
              key={index}
              className="absolute"
              style={{
                top: `${index * offset}px`,
                left: `${index * offset}px`,
                zIndex: index,
              }}
            >
              <PlayingCard faceDown size={size} disabled />
            </div>
          ))}

        {/* 一番上のカード（表面） */}
        <div
          style={{
            marginTop: cardCount > 1 ? `${Math.min(cardCount - 1, 3) * offset}px` : 0,
            marginLeft: cardCount > 1 ? `${Math.min(cardCount - 1, 3) * offset}px` : 0,
          }}
        >
          <PlayingCard card={topCard} size={size} disabled />
        </div>

        {/* 枚数表示 */}
        {cardCount > 1 && (
          <div
            className="absolute bottom-0 right-0 bg-gray-900 text-white text-xs sm:text-sm font-bold px-2 py-1 rounded-tl-lg rounded-br-lg shadow-md"
            style={{
              marginBottom: cardCount > 1 ? `${Math.min(cardCount - 1, 3) * offset}px` : 0,
              marginRight: cardCount > 1 ? `${Math.min(cardCount - 1, 3) * offset}px` : 0,
            }}
          >
            {cardCount}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('[DiscardPile] 捨て札表示エラー:', error);
    return (
      <div
        className={`bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-600 text-sm ${className}`}
        role="alert"
      >
        捨て札表示エラー
      </div>
    );
  }
};
