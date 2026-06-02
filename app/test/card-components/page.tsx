// カードコンポーネントのテストページ

'use client';

import React, { useState } from 'react';
import { PlayingCard, Deck, DiscardPile, Hand } from '@/components/game/card';
import {
  createStandardDeck,
  createDeckWithJokers,
  shuffleDeck,
  drawCards,
  Card as CardType,
} from '@/lib/utils/card-utils';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { logger } from '@/lib/utils/logger';

/**
 * カードコンポーネントのデモ・テストページ
 */
export default function CardComponentsTestPage() {
  const [deck, setDeck] = useState<CardType[]>([]);
  const [hand, setHand] = useState<CardType[]>([]);
  const [discardPile, setDiscardPile] = useState<CardType[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [layout, setLayout] = useState<'spread' | 'stack' | 'fan'>('spread');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');

  // デッキ初期化
  const initializeDeck = (withJokers: boolean) => {
    try {
      const newDeck = withJokers ? createDeckWithJokers() : createStandardDeck();
      const shuffled = shuffleDeck(newDeck);
      setDeck(shuffled);
      setHand([]);
      setDiscardPile([]);
      setSelectedIndices([]);
      logger.log('デッキを初期化しました:', shuffled.length, '枚');
    } catch (error) {
      logger.error('デッキ初期化エラー:', error);
      alert('デッキの初期化に失敗しました');
    }
  };

  // カードを引く
  const handleDraw = (count: number) => {
    try {
      if (deck.length < count) {
        alert(`デッキの残り枚数が不足しています（残り: ${deck.length}枚）`);
        return;
      }

      const { drawn, remaining } = drawCards(deck, count);
      setHand([...hand, ...drawn]);
      setDeck(remaining);
      logger.log(`${count}枚引きました。残り:`, remaining.length, '枚');
    } catch (error) {
      logger.error('カード引きエラー:', error);
      alert('カードを引くことができませんでした');
    }
  };

  // カードを捨てる
  const handleDiscard = () => {
    try {
      if (selectedIndices.length === 0) {
        alert('捨てるカードを選択してください');
        return;
      }

      const discarded = selectedIndices.map((i) => hand[i]);
      const newHand = hand.filter((_, i) => !selectedIndices.includes(i));

      setHand(newHand);
      setDiscardPile([...discardPile, ...discarded]);
      setSelectedIndices([]);
      logger.log(`${discarded.length}枚捨てました`);
    } catch (error) {
      logger.error('カード廃棄エラー:', error);
      alert('カードを捨てることができませんでした');
    }
  };

  // 手札のカードをクリック
  const handleCardClick = (card: CardType, index: number) => {
    setSelectedIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">カードコンポーネント テスト</h1>

        {/* 初期化ボタン */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">デッキ初期化</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => initializeDeck(false)}>52枚デッキ作成</Button>
              <Button onClick={() => initializeDeck(true)}>54枚デッキ作成（ジョーカー入り）</Button>
              <Button onClick={() => setDeck(shuffleDeck(deck))} disabled={deck.length === 0}>
                シャッフル
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* サイズ・レイアウト選択 */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">表示設定</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">カードサイズ</label>
                <div className="flex gap-2">
                  <Button size="sm" variant={size === 'small' ? 'primary' : 'secondary'} onClick={() => setSize('small')}>
                    Small
                  </Button>
                  <Button size="sm" variant={size === 'medium' ? 'primary' : 'secondary'} onClick={() => setSize('medium')}>
                    Medium
                  </Button>
                  <Button size="sm" variant={size === 'large' ? 'primary' : 'secondary'} onClick={() => setSize('large')}>
                    Large
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">手札レイアウト</label>
                <div className="flex gap-2">
                  <Button size="sm" variant={layout === 'spread' ? 'primary' : 'secondary'} onClick={() => setLayout('spread')}>
                    Spread
                  </Button>
                  <Button size="sm" variant={layout === 'stack' ? 'primary' : 'secondary'} onClick={() => setLayout('stack')}>
                    Stack
                  </Button>
                  <Button size="sm" variant={layout === 'fan' ? 'primary' : 'secondary'} onClick={() => setLayout('fan')}>
                    Fan
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* デッキと捨て札 */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">デッキ・捨て札エリア</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-8 items-start justify-center">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-2">デッキ（{deck.length}枚）</p>
                <Deck cardCount={deck.length} size={size} onDraw={() => handleDraw(1)} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-2">捨て札（{discardPile.length}枚）</p>
                <DiscardPile topCard={discardPile[discardPile.length - 1]} cardCount={discardPile.length} size={size} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <Button onClick={() => handleDraw(1)} disabled={deck.length === 0}>
                1枚引く
              </Button>
              <Button onClick={() => handleDraw(5)} disabled={deck.length < 5}>
                5枚引く
              </Button>
              <Button onClick={() => handleDraw(10)} disabled={deck.length < 10}>
                10枚引く
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 手札エリア */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">手札エリア（{hand.length}枚）</h2>
            <p className="text-sm text-gray-600 mt-1">カードをクリックして選択・解除</p>
          </CardHeader>
          <CardContent>
            <div className="min-h-[200px] flex items-center justify-center">
              {hand.length > 0 ? (
                <Hand
                  cards={hand}
                  size={size}
                  layout={layout}
                  onCardClick={handleCardClick}
                  selectedIndices={selectedIndices}
                />
              ) : (
                <p className="text-gray-400">手札がありません</p>
              )}
            </div>
            <div className="flex gap-2 justify-center mt-4">
              <Button onClick={handleDiscard} disabled={selectedIndices.length === 0} variant="danger">
                選択したカードを捨てる（{selectedIndices.length}枚）
              </Button>
              <Button
                onClick={() => setSelectedIndices([])}
                disabled={selectedIndices.length === 0}
                variant="secondary"
              >
                選択解除
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 単体カード表示サンプル */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">単体カード表示サンプル</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 justify-center items-end">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2">表面</p>
                <PlayingCard
                  card={{ suit: 'hearts', rank: 'A', id: 'sample-1' }}
                  size={size}
                />
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2">裏面</p>
                <PlayingCard
                  card={{ suit: 'spades', rank: 'K', id: 'sample-2' }}
                  faceDown
                  size={size}
                />
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2">ジョーカー</p>
                <PlayingCard
                  card={{ suit: 'joker', rank: 'Joker', id: 'sample-3' }}
                  size={size}
                />
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2">空スロット</p>
                <PlayingCard card={null} size={size} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
