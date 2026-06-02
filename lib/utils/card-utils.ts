// カードユーティリティ

/**
 * トランプカードのスート（マーク）
 */
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades' | 'joker';

/**
 * トランプカードのランク（数字）
 */
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'Joker';

/**
 * トランプカードの型定義
 */
export interface Card {
  suit: Suit;
  rank: Rank;
  id: string; // カードの一意識別子
}

/**
 * スートの表示名を取得
 */
export function getSuitDisplay(suit: Suit): string {
  const suitMap: Record<Suit, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
    joker: '🃏',
  };
  return suitMap[suit];
}

/**
 * スートの色を取得
 */
export function getSuitColor(suit: Suit): 'red' | 'black' {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
}

/**
 * ランクの数値を取得（A=1, J=11, Q=12, K=13, Joker=0）
 */
export function getRankValue(rank: Rank): number {
  if (rank === 'Joker') return 0;
  if (rank === 'A') return 1;
  if (rank === 'J') return 11;
  if (rank === 'Q') return 12;
  if (rank === 'K') return 13;
  return parseInt(rank, 10);
}

/**
 * 標準的な52枚デッキを生成（ジョーカーなし）
 */
export function createStandardDeck(): Card[] {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const deck: Card[] = [];

  try {
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({
          suit,
          rank,
          id: `${suit}-${rank}`,
        });
      }
    }

    if (deck.length !== 52) {
      console.error('[createStandardDeck] デッキの枚数が不正です:', deck.length);
      throw new Error('デッキの生成に失敗しました');
    }

    return deck;
  } catch (error) {
    console.error('[createStandardDeck] デッキ生成エラー:', error);
    throw error;
  }
}

/**
 * ジョーカーを含む54枚デッキを生成
 */
export function createDeckWithJokers(): Card[] {
  try {
    const deck = createStandardDeck();

    // ジョーカーを2枚追加
    deck.push({
      suit: 'joker',
      rank: 'Joker',
      id: 'joker-1',
    });
    deck.push({
      suit: 'joker',
      rank: 'Joker',
      id: 'joker-2',
    });

    if (deck.length !== 54) {
      console.error('[createDeckWithJokers] デッキの枚数が不正です:', deck.length);
      throw new Error('ジョーカー入りデッキの生成に失敗しました');
    }

    return deck;
  } catch (error) {
    console.error('[createDeckWithJokers] デッキ生成エラー:', error);
    throw error;
  }
}

/**
 * Fisher-Yatesアルゴリズムでデッキをシャッフル
 * @param deck シャッフル対象のデッキ
 * @returns シャッフル済みの新しいデッキ（元の配列は変更しない）
 */
export function shuffleDeck(deck: Card[]): Card[] {
  try {
    if (!deck || deck.length === 0) {
      console.error('[shuffleDeck] 空のデッキが渡されました');
      throw new Error('シャッフルするデッキが空です');
    }

    // 元の配列を変更しないようにコピー
    const shuffled = [...deck];

    // Fisher-Yatesシャッフル
    for (let i = shuffled.length - 1; i > 0; i--) {
      // 暗号学的に安全な乱数を使用
      const randomBuffer = new Uint32Array(1);
      crypto.getRandomValues(randomBuffer);
      const j = randomBuffer[0] % (i + 1);

      // スワップ
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    console.log('[shuffleDeck] デッキをシャッフルしました:', shuffled.length, '枚');
    return shuffled;
  } catch (error) {
    console.error('[shuffleDeck] シャッフルエラー:', error);
    throw error;
  }
}

/**
 * デッキから指定枚数のカードを引く
 * @param deck 引く元のデッキ
 * @param count 引く枚数
 * @returns 引いたカードの配列と残りのデッキ
 */
export function drawCards(deck: Card[], count: number): { drawn: Card[]; remaining: Card[] } {
  try {
    if (!deck || deck.length === 0) {
      console.error('[drawCards] 空のデッキが渡されました');
      throw new Error('デッキが空です');
    }

    if (count < 0) {
      console.error('[drawCards] 負の枚数が指定されました:', count);
      throw new Error('引く枚数は0以上である必要があります');
    }

    if (count > deck.length) {
      console.error('[drawCards] デッキの枚数を超えています。要求:', count, '残り:', deck.length);
      throw new Error('デッキの枚数が不足しています');
    }

    const drawn = deck.slice(0, count);
    const remaining = deck.slice(count);

    console.log('[drawCards] カードを引きました:', count, '枚。残り:', remaining.length, '枚');

    return { drawn, remaining };
  } catch (error) {
    console.error('[drawCards] カード引きエラー:', error);
    throw error;
  }
}

/**
 * カードを比較（ゲームルールに応じて使用）
 * ランクの強さで比較（A=1 < 2 < ... < K=13）
 */
export function compareCards(card1: Card, card2: Card): number {
  const value1 = getRankValue(card1.rank);
  const value2 = getRankValue(card2.rank);
  return value1 - value2;
}

/**
 * カードの表示用文字列を取得
 */
export function getCardDisplayString(card: Card): string {
  if (card.rank === 'Joker') {
    return 'JOKER';
  }
  return `${getSuitDisplay(card.suit)}${card.rank}`;
}
