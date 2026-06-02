// ポーカーの役判定ロジック

import type { Card, HandEvaluation, Rank } from './types';
import { PokerHand } from './types';
import { RANK_VALUES, HAND_NAMES, RANK_NAMES } from './constants';

/**
 * 7枚のカード（手札2枚+コミュニティ5枚）から最強の5枚を評価
 */
export function evaluateHand(holeCards: [Card, Card], communityCards: Card[]): HandEvaluation {
  const allCards = [...holeCards, ...communityCards];

  // 7枚全体で役を判定し、最強の5枚を選択
  return evaluateSevenCards(allCards);
}

/**
 * 7枚のカードから最強の役を評価
 */
function evaluateSevenCards(allCards: Card[]): HandEvaluation {
  // カードをランクでソート（降順）
  const sortedCards = [...allCards].sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]);

  // 各役判定を高い順に実行（7枚のカードから適切な5枚を選択）
  const royalFlush = checkRoyalFlush(sortedCards);
  if (royalFlush) return royalFlush;

  const straightFlush = checkStraightFlush(sortedCards);
  if (straightFlush) return straightFlush;

  const fourOfAKind = checkFourOfAKind(sortedCards);
  if (fourOfAKind) return fourOfAKind;

  const fullHouse = checkFullHouse(sortedCards);
  if (fullHouse) return fullHouse;

  const flush = checkFlush(sortedCards);
  if (flush) return flush;

  const straight = checkStraight(sortedCards);
  if (straight) return straight;

  const threeOfAKind = checkThreeOfAKind(sortedCards);
  if (threeOfAKind) return threeOfAKind;

  const twoPair = checkTwoPair(sortedCards);
  if (twoPair) return twoPair;

  const onePair = checkOnePair(sortedCards);
  if (onePair) return onePair;

  return checkHighCard(sortedCards);
}

/**
 * ロイヤルフラッシュ判定（10-J-Q-K-Aの同スート）
 */
function checkRoyalFlush(cards: Card[]): HandEvaluation | null {
  const straightFlush = checkStraightFlush(cards);
  if (straightFlush && straightFlush.cards[0].rank === 'A' && straightFlush.cards[1].rank === 'K') {
    return {
      hand: PokerHand.RoyalFlush,
      rank: 10000000000, // 最強
      description: HAND_NAMES[PokerHand.RoyalFlush],
      cards: straightFlush.cards,
    };
  }
  return null;
}

/**
 * ストレートフラッシュ判定
 */
function checkStraightFlush(cards: Card[]): HandEvaluation | null {
  // 各スートごとにカードを集計
  const suitGroups: Record<string, Card[]> = {};
  for (const card of cards) {
    if (!suitGroups[card.suit]) {
      suitGroups[card.suit] = [];
    }
    suitGroups[card.suit].push(card);
  }

  // 5枚以上の同じスートがある場合、ストレートを探す
  for (const suit in suitGroups) {
    const suitCards = suitGroups[suit];
    if (suitCards.length >= 5) {
      const straight = checkStraight(suitCards);
      if (straight) {
        // ストレートフラッシュのランクは最高カードで決まる
        const rank = 9000000000 + straight.rank % 1000000000;

        return {
          hand: PokerHand.StraightFlush,
          rank,
          description: HAND_NAMES[PokerHand.StraightFlush],
          cards: straight.cards,
        };
      }
    }
  }

  return null;
}

/**
 * フォーカード判定
 */
function checkFourOfAKind(cards: Card[]): HandEvaluation | null {
  const rankCounts = countRanks(cards);
  const fourRank = Object.entries(rankCounts).find(([_, count]) => count === 4)?.[0] as Rank | undefined;

  if (!fourRank) return null;

  const fourCards = cards.filter(card => card.rank === fourRank).slice(0, 4);
  const kickerCandidate = cards.filter(card => card.rank !== fourRank).sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]);

  if (kickerCandidate.length === 0) return null;
  const kicker = kickerCandidate[0];

  // ランク計算：4枚のランク * 10^6 + キッカーのランク
  const rank = 8000000000 + RANK_VALUES[fourRank] * 1000000 + RANK_VALUES[kicker.rank];

  return {
    hand: PokerHand.FourOfAKind,
    rank,
    description: `${HAND_NAMES[PokerHand.FourOfAKind]}（${RANK_NAMES[fourRank]}）`,
    cards: [...fourCards, kicker],
  };
}

/**
 * フルハウス判定
 */
function checkFullHouse(cards: Card[]): HandEvaluation | null {
  const rankCounts = countRanks(cards);
  const threeRank = Object.entries(rankCounts).find(([_, count]) => count >= 3)?.[0] as Rank | undefined;
  const pairRank = Object.entries(rankCounts).find(([rank, count]) => count >= 2 && rank !== threeRank)?.[0] as Rank | undefined;

  if (!threeRank || !pairRank) return null;

  const threeCards = cards.filter(card => card.rank === threeRank).slice(0, 3);
  const pairCards = cards.filter(card => card.rank === pairRank).slice(0, 2);

  // ランク計算：3枚のランク * 10^3 + ペアのランク
  const rank = 7000000000 + RANK_VALUES[threeRank] * 1000 + RANK_VALUES[pairRank];

  return {
    hand: PokerHand.FullHouse,
    rank,
    description: `${HAND_NAMES[PokerHand.FullHouse]}（${RANK_NAMES[threeRank]}と${RANK_NAMES[pairRank]}）`,
    cards: [...threeCards, ...pairCards],
  };
}

/**
 * フラッシュ判定
 */
function checkFlush(cards: Card[]): HandEvaluation | null {
  // 各スートごとにカードを集計
  const suitGroups: Record<string, Card[]> = {};
  for (const card of cards) {
    if (!suitGroups[card.suit]) {
      suitGroups[card.suit] = [];
    }
    suitGroups[card.suit].push(card);
  }

  // 5枚以上の同じスートがあるか
  for (const suit in suitGroups) {
    const suitCards = suitGroups[suit];
    if (suitCards.length >= 5) {
      // 上位5枚を選択
      const topFive = suitCards
        .sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank])
        .slice(0, 5);

      // フラッシュのランクは5枚のカードの強さで決まる
      let rank = 6000000000;
      for (let i = 0; i < 5; i++) {
        rank += RANK_VALUES[topFive[i].rank] * Math.pow(15, 4 - i);
      }

      return {
        hand: PokerHand.Flush,
        rank,
        description: HAND_NAMES[PokerHand.Flush],
        cards: topFive,
      };
    }
  }

  return null;
}

/**
 * ストレート判定
 */
function checkStraight(cards: Card[]): HandEvaluation | null {
  // ランクの重複を除去し、降順でソート
  const uniqueRanks = [...new Set(cards.map(c => c.rank))];
  const sortedRanks = uniqueRanks.sort((a, b) => RANK_VALUES[b] - RANK_VALUES[a]);

  // 連続する5つのランクを探す
  for (let i = 0; i <= sortedRanks.length - 5; i++) {
    const isConsecutive =
      RANK_VALUES[sortedRanks[i]] - RANK_VALUES[sortedRanks[i + 1]] === 1 &&
      RANK_VALUES[sortedRanks[i + 1]] - RANK_VALUES[sortedRanks[i + 2]] === 1 &&
      RANK_VALUES[sortedRanks[i + 2]] - RANK_VALUES[sortedRanks[i + 3]] === 1 &&
      RANK_VALUES[sortedRanks[i + 3]] - RANK_VALUES[sortedRanks[i + 4]] === 1;

    if (isConsecutive) {
      // ストレート成立：該当する5枚を選択
      const straightCards: Card[] = [];
      for (let j = 0; j < 5; j++) {
        const rankCard = cards.find(c => c.rank === sortedRanks[i + j])!;
        straightCards.push(rankCard);
      }

      const highCard = RANK_VALUES[sortedRanks[i]];
      const rank = 5000000000 + highCard;

      return {
        hand: PokerHand.Straight,
        rank,
        description: HAND_NAMES[PokerHand.Straight],
        cards: straightCards,
      };
    }
  }

  // A-2-3-4-5の特別なストレート（ローストレート）
  if (
    uniqueRanks.includes('A') &&
    uniqueRanks.includes('2') &&
    uniqueRanks.includes('3') &&
    uniqueRanks.includes('4') &&
    uniqueRanks.includes('5')
  ) {
    const straightCards: Card[] = [
      cards.find(c => c.rank === '5')!,
      cards.find(c => c.rank === '4')!,
      cards.find(c => c.rank === '3')!,
      cards.find(c => c.rank === '2')!,
      cards.find(c => c.rank === 'A')!,
    ];

    const rank = 5000000000 + 5; // ハイカードは5

    return {
      hand: PokerHand.Straight,
      rank,
      description: HAND_NAMES[PokerHand.Straight],
      cards: straightCards,
    };
  }

  return null;
}

/**
 * スリーカード判定
 */
function checkThreeOfAKind(cards: Card[]): HandEvaluation | null {
  const rankCounts = countRanks(cards);
  const threeRank = Object.entries(rankCounts).find(([_, count]) => count === 3)?.[0] as Rank | undefined;

  if (!threeRank) return null;

  const threeCards = cards.filter(card => card.rank === threeRank).slice(0, 3);
  const kickers = cards.filter(card => card.rank !== threeRank).sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]).slice(0, 2);

  // キッカーが2枚未満の場合
  if (kickers.length < 2) return null;

  // ランク計算：3枚のランク * 10^6 + キッカー1 * 10^3 + キッカー2
  const rank =
    4000000000 +
    RANK_VALUES[threeRank] * 1000000 +
    RANK_VALUES[kickers[0].rank] * 1000 +
    RANK_VALUES[kickers[1].rank];

  return {
    hand: PokerHand.ThreeOfAKind,
    rank,
    description: `${HAND_NAMES[PokerHand.ThreeOfAKind]}（${RANK_NAMES[threeRank]}）`,
    cards: [...threeCards, ...kickers],
  };
}

/**
 * ツーペア判定
 */
function checkTwoPair(cards: Card[]): HandEvaluation | null {
  const rankCounts = countRanks(cards);
  const pairRanks = Object.entries(rankCounts)
    .filter(([_, count]) => count === 2)
    .map(([rank]) => rank as Rank)
    .sort((a, b) => RANK_VALUES[b] - RANK_VALUES[a]);

  if (pairRanks.length < 2) return null;

  const highPair = pairRanks[0];
  const lowPair = pairRanks[1];
  const pairCards = cards.filter(card => card.rank === highPair || card.rank === lowPair);
  const kickerCandidate = cards.filter(card => card.rank !== highPair && card.rank !== lowPair).sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]);

  if (kickerCandidate.length === 0) return null;
  const kicker = kickerCandidate[0];

  // ランク計算：ハイペア * 10^6 + ローペア * 10^3 + キッカー
  const rank =
    3000000000 +
    RANK_VALUES[highPair] * 1000000 +
    RANK_VALUES[lowPair] * 1000 +
    RANK_VALUES[kicker.rank];

  return {
    hand: PokerHand.TwoPair,
    rank,
    description: `${HAND_NAMES[PokerHand.TwoPair]}（${RANK_NAMES[highPair]}と${RANK_NAMES[lowPair]}）`,
    cards: [...pairCards, kicker],
  };
}

/**
 * ワンペア判定
 */
function checkOnePair(cards: Card[]): HandEvaluation | null {
  const rankCounts = countRanks(cards);
  const pairRank = Object.entries(rankCounts).find(([_, count]) => count === 2)?.[0] as Rank | undefined;

  if (!pairRank) return null;

  const pairCards = cards.filter(card => card.rank === pairRank);
  const kickers = cards.filter(card => card.rank !== pairRank).sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]).slice(0, 3);

  // キッカーが3枚未満の場合（7枚から5枚選ぶ際の不整合）
  if (kickers.length < 3) return null;

  // ランク計算：ペア * 10^9 + キッカー1 * 10^6 + キッカー2 * 10^3 + キッカー3
  const rank =
    2000000000 +
    RANK_VALUES[pairRank] * 1000000000 +
    RANK_VALUES[kickers[0].rank] * 1000000 +
    RANK_VALUES[kickers[1].rank] * 1000 +
    RANK_VALUES[kickers[2].rank];

  return {
    hand: PokerHand.OnePair,
    rank,
    description: `${HAND_NAMES[PokerHand.OnePair]}（${RANK_NAMES[pairRank]}）`,
    cards: [...pairCards, ...kickers],
  };
}

/**
 * ハイカード判定
 */
function checkHighCard(cards: Card[]): HandEvaluation {
  // 上位5枚を選択
  const topFive = cards.slice(0, 5);

  // ランク計算：5枚のカードの強さ
  let rank = 1000000000;
  for (let i = 0; i < 5; i++) {
    rank += RANK_VALUES[topFive[i].rank] * Math.pow(15, 4 - i);
  }

  return {
    hand: PokerHand.HighCard,
    rank,
    description: `${HAND_NAMES[PokerHand.HighCard]}（${RANK_NAMES[topFive[0].rank]}）`,
    cards: topFive,
  };
}

/**
 * 各ランクの出現回数をカウント
 */
function countRanks(cards: Card[]): Record<Rank, number> {
  const counts: Partial<Record<Rank, number>> = {};
  for (const card of cards) {
    counts[card.rank] = (counts[card.rank] || 0) + 1;
  }
  return counts as Record<Rank, number>;
}

/**
 * 2つの役を比較（勝者判定用）
 * @returns 1: hand1が強い、-1: hand2が強い、0: 引き分け
 */
export function compareHands(hand1: HandEvaluation, hand2: HandEvaluation): number {
  if (hand1.rank > hand2.rank) return 1;
  if (hand1.rank < hand2.rank) return -1;
  return 0;
}
