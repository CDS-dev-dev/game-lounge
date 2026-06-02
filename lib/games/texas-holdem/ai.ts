// テキサスホールデムのAI

import type { TexasHoldemState, Card, PlayerAction } from './types';
import { RANK_VALUES } from './constants';
import { evaluateHand } from './poker-hands';

/**
 * ハンドレンジ評価（プリフロップ）
 * スターティングハンドの強さを0-100でスコア化
 */
function evaluateStartingHand(cards: [Card, Card]): number {
  const [card1, card2] = cards;
  const rank1 = RANK_VALUES[card1.rank];
  const rank2 = RANK_VALUES[card2.rank];
  const suited = card1.suit === card2.suit;
  const paired = rank1 === rank2;

  let score = 0;

  // ペアの評価
  if (paired) {
    score = 50 + rank1 * 3; // AA=92, KK=89, ...
  } else {
    // 高いランクほど高スコア
    score = (rank1 + rank2) * 1.5;

    // スーテッド（同じスート）はボーナス
    if (suited) {
      score += 10;
    }

    // コネクター（連続したランク）はボーナス
    if (Math.abs(rank1 - rank2) === 1) {
      score += 5;
    }
  }

  return Math.min(100, score);
}

/**
 * ポットオッズ計算
 * @returns コールするのに必要な勝率
 */
function calculatePotOdds(callAmount: number, potSize: number): number {
  if (callAmount === 0) return 0;
  return callAmount / (potSize + callAmount);
}

/**
 * ハンドエクイティの推定（勝率）
 * 現在のハンドとボードから勝率を推定
 */
function estimateEquity(
  holeCards: [Card, Card],
  communityCards: Card[],
  opponentCount: number
): number {
  // 簡易実装：現在の役の強さに基づいた勝率推定
  if (communityCards.length === 0) {
    // プリフロップ：スターティングハンドスコアベース
    const handScore = evaluateStartingHand(holeCards);
    // 相手が多いほど勝率が下がる
    return (handScore / 100) * Math.pow(0.85, opponentCount - 1);
  }

  // ポストフロップ：現在の役を評価
  const currentHand = evaluateHand(holeCards, communityCards);

  // 役の強さから勝率を推定（簡易）
  let baseEquity = 0;
  switch (currentHand.hand) {
    case 9: // Royal Flush
      baseEquity = 1.0;
      break;
    case 8: // Straight Flush
      baseEquity = 0.99;
      break;
    case 7: // Four of a Kind
      baseEquity = 0.95;
      break;
    case 6: // Full House
      baseEquity = 0.9;
      break;
    case 5: // Flush
      baseEquity = 0.8;
      break;
    case 4: // Straight
      baseEquity = 0.7;
      break;
    case 3: // Three of a Kind
      baseEquity = 0.6;
      break;
    case 2: // Two Pair
      baseEquity = 0.5;
      break;
    case 1: // One Pair
      baseEquity = 0.35;
      break;
    case 0: // High Card
      baseEquity = 0.2;
      break;
  }

  // 相手が多いほど勝率が下がる
  return baseEquity * Math.pow(0.9, opponentCount - 1);
}

/**
 * AIの意思決定（難易度別）
 */
export function calculateCpuAction(
  state: TexasHoldemState,
  cpuPlayerId: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): { action: PlayerAction; raiseAmount?: number } {
  const player = state.players.find(p => p.id === cpuPlayerId);
  if (!player || !player.holeCards) {
    throw new Error('CPUプレイヤーが見つかりません');
  }

  // アクティブな対戦相手の数
  const opponentCount = state.players.filter(p => p.isActive && p.id !== cpuPlayerId).length;

  // ポットオッズとエクイティを計算
  const callAmount = state.currentBet - player.currentBet;
  const potOdds = calculatePotOdds(callAmount, state.pot);
  const equity = estimateEquity(player.holeCards, state.communityCards, opponentCount);

  // 難易度による調整
  let equityThreshold = 0;
  let aggressionFactor = 0;
  let bluffChance = 0;

  switch (difficulty) {
    case 'easy':
      equityThreshold = potOdds + 0.2; // かなり保守的
      aggressionFactor = 0.3;
      bluffChance = 0.05;
      break;
    case 'medium':
      equityThreshold = potOdds + 0.1; // やや保守的
      aggressionFactor = 0.5;
      bluffChance = 0.1;
      break;
    case 'hard':
      equityThreshold = potOdds; // 理論値に近い
      aggressionFactor = 0.7;
      bluffChance = 0.15;
      break;
  }

  // チェックできる場合
  if (player.currentBet === state.currentBet) {
    // 強いハンドならベット/レイズ
    if (equity > 0.7 && Math.random() < aggressionFactor) {
      const raiseAmount = calculateRaiseAmount(state, player.chips, 'aggressive');
      if (raiseAmount && raiseAmount <= player.chips - callAmount) {
        return { action: 'raise', raiseAmount };
      }
    }

    // ブラフチャンス
    if (Math.random() < bluffChance && player.chips >= state.minRaise * 2) {
      const raiseAmount = calculateRaiseAmount(state, player.chips, 'bluff');
      if (raiseAmount) {
        return { action: 'raise', raiseAmount };
      }
    }

    // 通常はチェック
    return { action: 'check' };
  }

  // コールが必要な場合
  if (callAmount > 0) {
    // チップ不足ならオールイン
    if (callAmount >= player.chips) {
      // エクイティが高ければオールイン
      if (equity > equityThreshold * 1.2) {
        return { action: 'allin' };
      } else {
        return { action: 'fold' };
      }
    }

    // 非常に強いハンドならレイズ
    if (equity > 0.8) {
      const raiseAmount = calculateRaiseAmount(state, player.chips, 'aggressive');
      if (raiseAmount && raiseAmount <= player.chips - callAmount) {
        return { action: 'raise', raiseAmount };
      }
      return { action: 'call' };
    }

    // エクイティがポットオッズを上回ればコール
    if (equity > equityThreshold) {
      // ときどきレイズ（セミブラフ）
      if (equity > 0.6 && Math.random() < aggressionFactor * 0.5) {
        const raiseAmount = calculateRaiseAmount(state, player.chips, 'moderate');
        if (raiseAmount && raiseAmount <= player.chips - callAmount) {
          return { action: 'raise', raiseAmount };
        }
      }
      return { action: 'call' };
    }

    // エクイティが低ければフォールド
    return { action: 'fold' };
  }

  // デフォルトはチェック
  return { action: 'check' };
}

/**
 * レイズ額を計算
 */
function calculateRaiseAmount(
  state: TexasHoldemState,
  availableChips: number,
  style: 'bluff' | 'moderate' | 'aggressive'
): number | undefined {
  const potSize = state.pot;
  let raiseAmount = 0;

  switch (style) {
    case 'bluff':
      // ポットの1/3～1/2
      raiseAmount = Math.floor(potSize * (0.33 + Math.random() * 0.17));
      break;
    case 'moderate':
      // ポットの1/2～2/3
      raiseAmount = Math.floor(potSize * (0.5 + Math.random() * 0.17));
      break;
    case 'aggressive':
      // ポットの2/3～フルポット
      raiseAmount = Math.floor(potSize * (0.67 + Math.random() * 0.33));
      break;
  }

  // 最小レイズ額を保証
  raiseAmount = Math.max(raiseAmount, state.minRaise);

  // チップ不足の場合は調整
  if (raiseAmount > availableChips) {
    return undefined;
  }

  return raiseAmount;
}

/**
 * ハンドレンジ表（スターティングハンド）
 * プリフロップでプレイするべきハンドの判定用
 */
export function isPlayableHand(
  cards: [Card, Card],
  position: 'early' | 'middle' | 'late',
  difficulty: 'easy' | 'medium' | 'hard'
): boolean {
  const score = evaluateStartingHand(cards);

  // 難易度とポジションによる閾値
  const thresholds = {
    easy: { early: 70, middle: 60, late: 50 },
    medium: { early: 60, middle: 50, late: 40 },
    hard: { early: 55, middle: 45, late: 35 },
  };

  const threshold = thresholds[difficulty][position];
  return score >= threshold;
}

/**
 * ポジションを判定（アーリー、ミドル、レイト）
 */
export function determinePosition(
  playerIndex: number,
  dealerButton: number,
  playerCount: number
): 'early' | 'middle' | 'late' {
  const positionFromDealer = (playerIndex - dealerButton + playerCount) % playerCount;

  if (playerCount <= 6) {
    // ショートハンド
    if (positionFromDealer <= 2) return 'early';
    if (positionFromDealer <= 4) return 'middle';
    return 'late';
  } else {
    // フルリング
    if (positionFromDealer <= 3) return 'early';
    if (positionFromDealer <= 6) return 'middle';
    return 'late';
  }
}
