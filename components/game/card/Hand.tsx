// 手札表示コンポーネント

'use client';

import React from 'react';
import { Card as CardType } from '@/lib/utils/card-utils';
import { PlayingCard } from './Card';

export interface HandProps {
  /** 手札のカード配列 */
  cards: CardType[];
  /** カードサイズ */
  size?: 'small' | 'medium' | 'large';
  /** すべて裏向きにするか（他プレイヤーの手札表示用） */
  faceDown?: boolean;
  /** 追加のクラス名 */
  className?: string;
  /** カードクリック時のコールバック */
  onCardClick?: (card: CardType, index: number) => void;
  /** 選択されているカードのインデックス */
  selectedIndices?: number[];
  /** 無効化状態 */
  disabled?: boolean;
  /** レイアウトスタイル */
  layout?: 'spread' | 'stack' | 'fan';
  /** 最大表示枚数（省略表示用） */
  maxVisible?: number;
}

/**
 * 手札表示コンポーネント
 *
 * 特徴:
 * - 複数のカードを横並びまたは扇状に配置
 * - カードの選択状態管理
 * - レスポンシブデザイン
 * - 枚数が多い場合は重ねて表示
 */
export const Hand: React.FC<HandProps> = ({
  cards,
  size = 'medium',
  faceDown = false,
  className = '',
  onCardClick,
  selectedIndices = [],
  disabled = false,
  layout = 'spread',
  maxVisible,
}) => {
  try {
    // 手札が空の場合
    if (!cards || cards.length === 0) {
      return (
        <div className={`flex items-center justify-center p-4 ${className}`}>
          <span className="text-sm text-gray-400">手札なし</span>
        </div>
      );
    }

    // 表示するカード
    const displayCards = maxVisible && cards.length > maxVisible ? cards.slice(0, maxVisible) : cards;
    const hasMore = maxVisible && cards.length > maxVisible;

    // レイアウト別のスタイル
    if (layout === 'fan') {
      return <FanLayout {...{ cards: displayCards, size, faceDown, className, onCardClick, selectedIndices, disabled, hasMore, totalCards: cards.length }} />;
    }

    if (layout === 'stack') {
      return <StackLayout {...{ cards: displayCards, size, faceDown, className, onCardClick, selectedIndices, disabled, hasMore, totalCards: cards.length }} />;
    }

    // デフォルト: spread（横並び）
    return <SpreadLayout {...{ cards: displayCards, size, faceDown, className, onCardClick, selectedIndices, disabled, hasMore, totalCards: cards.length }} />;
  } catch (error) {
    console.error('[Hand] 手札表示エラー:', error);
    return (
      <div className={`bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-600 text-sm ${className}`} role="alert">
        手札表示エラー
      </div>
    );
  }
};

/**
 * 横並びレイアウト
 */
interface LayoutProps {
  cards: CardType[];
  size: 'small' | 'medium' | 'large';
  faceDown: boolean;
  className: string;
  onCardClick?: (card: CardType, index: number) => void;
  selectedIndices: number[];
  disabled: boolean;
  hasMore: boolean | number | undefined;
  totalCards: number;
}

const SpreadLayout: React.FC<LayoutProps> = ({ cards, size, faceDown, className, onCardClick, selectedIndices, disabled, hasMore, totalCards }) => {
  return (
    <div className={`flex flex-wrap gap-2 sm:gap-3 justify-center ${className}`} role="group" aria-label="手札">
      {cards.map((card, index) => (
        <div key={card.id} className="flex-shrink-0">
          <PlayingCard
            card={card}
            faceDown={faceDown}
            size={size}
            onClick={onCardClick ? () => onCardClick(card, index) : undefined}
            selected={selectedIndices.includes(index)}
            disabled={disabled}
          />
        </div>
      ))}
      {hasMore && (
        <div className="flex items-center justify-center text-gray-500 text-sm font-semibold">+{totalCards - cards.length}</div>
      )}
    </div>
  );
};

/**
 * 重ねて表示するレイアウト
 */
const StackLayout: React.FC<LayoutProps> = ({ cards, size, faceDown, className, onCardClick, selectedIndices, disabled, hasMore, totalCards }) => {
  const offsetMap = {
    small: 16,
    medium: 24,
    large: 32,
  };
  const offset = offsetMap[size];

  return (
    <div className={`relative inline-block ${className}`} role="group" aria-label="手札">
      {cards.map((card, index) => (
        <div
          key={card.id}
          className="absolute"
          style={{
            left: `${index * offset}px`,
            zIndex: selectedIndices.includes(index) ? 100 : index,
          }}
        >
          <PlayingCard
            card={card}
            faceDown={faceDown}
            size={size}
            onClick={onCardClick ? () => onCardClick(card, index) : undefined}
            selected={selectedIndices.includes(index)}
            disabled={disabled}
          />
        </div>
      ))}
      {/* 幅確保用のスペーサー */}
      <div style={{ marginLeft: `${(cards.length - 1) * offset}px` }}>
        <PlayingCard card={null} size={size} className="opacity-0" />
      </div>
      {hasMore && (
        <div
          className="absolute top-0 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded"
          style={{ left: `${cards.length * offset}px` }}
        >
          +{totalCards - cards.length}
        </div>
      )}
    </div>
  );
};

/**
 * 扇状に表示するレイアウト（高度な表現）
 */
const FanLayout: React.FC<LayoutProps> = ({ cards, size, faceDown, className, onCardClick, selectedIndices, disabled, hasMore, totalCards }) => {
  // カード間の角度
  const cardCount = cards.length;
  const maxAngle = Math.min(cardCount * 5, 30); // 最大30度
  const angleStep = cardCount > 1 ? maxAngle / (cardCount - 1) : 0;
  const startAngle = -maxAngle / 2;

  // カードサイズに応じた調整
  const sizeMap = {
    small: { offsetY: 40, offsetX: 10 },
    medium: { offsetY: 60, offsetX: 15 },
    large: { offsetY: 80, offsetX: 20 },
  };
  const { offsetY, offsetX } = sizeMap[size];

  return (
    <div className={`relative inline-flex justify-center items-end ${className}`} style={{ minHeight: `${offsetY * 1.5}px` }} role="group" aria-label="手札">
      {cards.map((card, index) => {
        const angle = startAngle + angleStep * index;
        const yOffset = Math.abs(angle) * 0.5; // 中央が前に出る

        return (
          <div
            key={card.id}
            className="absolute"
            style={{
              transform: `rotate(${angle}deg) translateY(${selectedIndices.includes(index) ? -20 : 0}px)`,
              bottom: `${yOffset}px`,
              left: `calc(50% + ${(index - (cardCount - 1) / 2) * offsetX}px)`,
              transformOrigin: 'bottom center',
              zIndex: selectedIndices.includes(index) ? 100 : index,
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <PlayingCard
              card={card}
              faceDown={faceDown}
              size={size}
              onClick={onCardClick ? () => onCardClick(card, index) : undefined}
              selected={selectedIndices.includes(index)}
              disabled={disabled}
            />
          </div>
        );
      })}
      {hasMore && (
        <div className="absolute -right-8 top-0 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded">
          +{totalCards - cards.length}
        </div>
      )}
    </div>
  );
};
