// ポーカー役判定のテスト

import { describe, it, expect } from '@jest/globals';
import { evaluateHand, compareHands } from '../poker-hands';
import { PokerHand } from '../types';
import type { Card } from '../types';

describe('ポーカー役判定', () => {
  // テスト用カード生成ヘルパー
  const createCard = (rank: string, suit: string): Card => ({
    rank: rank as any,
    suit: suit as any,
    id: `${suit}-${rank}`,
  });

  describe('ロイヤルフラッシュ', () => {
    it('A-K-Q-J-10の同スートでロイヤルフラッシュ', () => {
      const holeCards: [Card, Card] = [
        createCard('A', 'hearts'),
        createCard('K', 'hearts'),
      ];
      const communityCards: Card[] = [
        createCard('Q', 'hearts'),
        createCard('J', 'hearts'),
        createCard('10', 'hearts'),
        createCard('2', 'clubs'),
        createCard('3', 'diamonds'),
      ];

      const result = evaluateHand(holeCards, communityCards);
      expect(result.hand).toBe(PokerHand.RoyalFlush);
    });
  });

  describe('ストレートフラッシュ', () => {
    it('9-8-7-6-5の同スートでストレートフラッシュ', () => {
      const holeCards: [Card, Card] = [
        createCard('9', 'spades'),
        createCard('8', 'spades'),
      ];
      const communityCards: Card[] = [
        createCard('7', 'spades'),
        createCard('6', 'spades'),
        createCard('5', 'spades'),
        createCard('A', 'hearts'),
        createCard('K', 'diamonds'),
      ];

      const result = evaluateHand(holeCards, communityCards);
      expect(result.hand).toBe(PokerHand.StraightFlush);
    });

    it('A-2-3-4-5の同スートでストレートフラッシュ（ローストレート）', () => {
      const holeCards: [Card, Card] = [
        createCard('A', 'clubs'),
        createCard('2', 'clubs'),
      ];
      const communityCards: Card[] = [
        createCard('3', 'clubs'),
        createCard('4', 'clubs'),
        createCard('5', 'clubs'),
        createCard('K', 'hearts'),
        createCard('Q', 'diamonds'),
      ];

      const result = evaluateHand(holeCards, communityCards);
      expect(result.hand).toBe(PokerHand.StraightFlush);
    });
  });

  describe('フォーカード', () => {
    it('同じランクが4枚でフォーカード', () => {
      const holeCards: [Card, Card] = [
        createCard('K', 'hearts'),
        createCard('K', 'diamonds'),
      ];
      const communityCards: Card[] = [
        createCard('K', 'clubs'),
        createCard('K', 'spades'),
        createCard('A', 'hearts'),
        createCard('2', 'clubs'),
        createCard('3', 'diamonds'),
      ];

      const result = evaluateHand(holeCards, communityCards);
      expect(result.hand).toBe(PokerHand.FourOfAKind);
    });
  });

  describe('フルハウス', () => {
    it('スリーカード+ペアでフルハウス', () => {
      const holeCards: [Card, Card] = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
      ];
      const communityCards: Card[] = [
        createCard('A', 'clubs'),
        createCard('K', 'hearts'),
        createCard('K', 'spades'),
        createCard('2', 'clubs'),
        createCard('3', 'diamonds'),
      ];

      const result = evaluateHand(holeCards, communityCards);
      expect(result.hand).toBe(PokerHand.FullHouse);
    });
  });

  describe('フラッシュ', () => {
    it('5枚が同じスートでフラッシュ', () => {
      const holeCards: [Card, Card] = [
        createCard('A', 'hearts'),
        createCard('J', 'hearts'),
      ];
      const communityCards: Card[] = [
        createCard('9', 'hearts'),
        createCard('5', 'hearts'),
        createCard('3', 'hearts'),
        createCard('K', 'clubs'),
        createCard('Q', 'diamonds'),
      ];

      const result = evaluateHand(holeCards, communityCards);
      expect(result.hand).toBe(PokerHand.Flush);
    });
  });

  describe('ストレート', () => {
    it('連続する5枚でストレート', () => {
      const holeCards: [Card, Card] = [
        createCard('9', 'hearts'),
        createCard('8', 'diamonds'),
      ];
      const communityCards: Card[] = [
        createCard('7', 'clubs'),
        createCard('6', 'spades'),
        createCard('5', 'hearts'),
        createCard('A', 'clubs'),
        createCard('K', 'diamonds'),
      ];

      const result = evaluateHand(holeCards, communityCards);
      expect(result.hand).toBe(PokerHand.Straight);
    });

    it('A-2-3-4-5でストレート（ローストレート）', () => {
      const holeCards: [Card, Card] = [
        createCard('A', 'hearts'),
        createCard('2', 'diamonds'),
      ];
      const communityCards: Card[] = [
        createCard('3', 'clubs'),
        createCard('4', 'spades'),
        createCard('5', 'hearts'),
        createCard('K', 'clubs'),
        createCard('Q', 'diamonds'),
      ];

      const result = evaluateHand(holeCards, communityCards);
      expect(result.hand).toBe(PokerHand.Straight);
    });
  });

  describe('スリーカード', () => {
    it('同じランクが3枚でスリーカード', () => {
      const holeCards: [Card, Card] = [
        createCard('Q', 'hearts'),
        createCard('Q', 'diamonds'),
      ];
      const communityCards: Card[] = [
        createCard('Q', 'clubs'),
        createCard('A', 'spades'),
        createCard('K', 'hearts'),
        createCard('2', 'clubs'),
        createCard('3', 'diamonds'),
      ];

      const result = evaluateHand(holeCards, communityCards);
      expect(result.hand).toBe(PokerHand.ThreeOfAKind);
    });
  });

  describe('ツーペア', () => {
    it('2つのペアでツーペア', () => {
      const holeCards: [Card, Card] = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
      ];
      const communityCards: Card[] = [
        createCard('K', 'clubs'),
        createCard('K', 'spades'),
        createCard('Q', 'hearts'),
        createCard('2', 'clubs'),
        createCard('3', 'diamonds'),
      ];

      const result = evaluateHand(holeCards, communityCards);
      expect(result.hand).toBe(PokerHand.TwoPair);
    });
  });

  describe('ワンペア', () => {
    it('1つのペアでワンペア', () => {
      const holeCards: [Card, Card] = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
      ];
      const communityCards: Card[] = [
        createCard('K', 'clubs'),
        createCard('Q', 'spades'),
        createCard('J', 'hearts'),
        createCard('2', 'clubs'),
        createCard('3', 'diamonds'),
      ];

      const result = evaluateHand(holeCards, communityCards);
      expect(result.hand).toBe(PokerHand.OnePair);
    });
  });

  describe('ハイカード', () => {
    it('役なしでハイカード', () => {
      const holeCards: [Card, Card] = [
        createCard('A', 'hearts'),
        createCard('K', 'diamonds'),
      ];
      const communityCards: Card[] = [
        createCard('Q', 'clubs'),
        createCard('J', 'spades'),
        createCard('9', 'hearts'),
        createCard('2', 'clubs'),
        createCard('3', 'diamonds'),
      ];

      const result = evaluateHand(holeCards, communityCards);
      expect(result.hand).toBe(PokerHand.HighCard);
    });
  });

  describe('役の強さ比較', () => {
    it('フルハウスはフラッシュより強い', () => {
      const fullHouse: [Card, Card] = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
      ];
      const fullHouseCommunity: Card[] = [
        createCard('A', 'clubs'),
        createCard('K', 'hearts'),
        createCard('K', 'spades'),
        createCard('2', 'clubs'),
        createCard('3', 'diamonds'),
      ];

      const flush: [Card, Card] = [
        createCard('A', 'hearts'),
        createCard('J', 'hearts'),
      ];
      const flushCommunity: Card[] = [
        createCard('9', 'hearts'),
        createCard('5', 'hearts'),
        createCard('3', 'hearts'),
        createCard('K', 'clubs'),
        createCard('Q', 'diamonds'),
      ];

      const fullHouseResult = evaluateHand(fullHouse, fullHouseCommunity);
      const flushResult = evaluateHand(flush, flushCommunity);

      expect(compareHands(fullHouseResult, flushResult)).toBe(1);
    });

    it('同じワンペアでもキッカーで判定', () => {
      const pair1: [Card, Card] = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
      ];
      const pair1Community: Card[] = [
        createCard('K', 'clubs'),
        createCard('Q', 'spades'),
        createCard('J', 'hearts'),
        createCard('2', 'clubs'),
        createCard('3', 'diamonds'),
      ];

      const pair2: [Card, Card] = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
      ];
      const pair2Community: Card[] = [
        createCard('K', 'clubs'),
        createCard('Q', 'spades'),
        createCard('10', 'hearts'),
        createCard('2', 'clubs'),
        createCard('3', 'diamonds'),
      ];

      const pair1Result = evaluateHand(pair1, pair1Community);
      const pair2Result = evaluateHand(pair2, pair2Community);

      // pair1の方がキッカー（J）が強い
      expect(compareHands(pair1Result, pair2Result)).toBe(1);
    });
  });
});
