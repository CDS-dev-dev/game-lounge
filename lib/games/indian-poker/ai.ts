// インディアンポーカーのAI実装

import type {
  IndianPokerState,
  BettingAction,
  Difficulty,
  Card,
} from './types';
import { RANK_VALUES } from './types';
import { getAvailableActions } from './engine';

// AIの行動を決定
export function decideAIAction(
  state: IndianPokerState,
  playerId: string
): BettingAction {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    throw new Error('プレイヤーが見つかりません');
  }

  const player = state.players[playerIndex];
  if (!player.difficulty) {
    throw new Error('AIの難易度が設定されていません');
  }

  const availableActions = getAvailableActions(state, playerId);

  switch (player.difficulty) {
    case 'easy':
      return decideEasyAction(state, playerIndex, availableActions);
    case 'medium':
      return decideMediumAction(state, playerIndex, availableActions);
    case 'hard':
      return decideHardAction(state, playerIndex, availableActions);
    default:
      return { type: 'fold' };
  }
}

// Easy AI: ランダム行動
function decideEasyAction(
  state: IndianPokerState,
  playerIndex: number,
  availableActions: BettingAction['type'][]
): BettingAction {
  // フォールドを除いたアクションをランダムに選ぶ
  const nonFoldActions = availableActions.filter(a => a !== 'fold');

  if (nonFoldActions.length === 0) {
    return { type: 'fold' };
  }

  // 80%の確率でフォールド以外を選ぶ
  if (Math.random() < 0.8 && nonFoldActions.length > 0) {
    const action = nonFoldActions[Math.floor(Math.random() * nonFoldActions.length)];

    if (action === 'raise') {
      const player = state.players[playerIndex];
      const callAmount = state.currentBet - player.currentBet;
      const maxRaise = player.chips - callAmount;
      const raiseAmount = Math.max(
        state.minRaise,
        Math.floor(Math.random() * Math.min(maxRaise, state.pot / 2))
      );
      return { type: 'raise', amount: raiseAmount };
    }

    return { type: action };
  }

  return { type: 'fold' };
}

// Medium AI: 他のプレイヤーのカードから自分のカードを推測
function decideMediumAction(
  state: IndianPokerState,
  playerIndex: number,
  availableActions: BettingAction['type'][]
): BettingAction {
  const player = state.players[playerIndex];

  // 他のプレイヤーのカードから自分のカードの強さを推測
  const otherCards = state.players
    .filter((p, i) => i !== playerIndex && p.isActive && p.card)
    .map(p => p.card!);

  if (otherCards.length === 0) {
    // 情報がない場合は慎重に
    return { type: 'check' in availableActions ? 'check' : 'call' };
  }

  // 他のプレイヤーのカードの平均値
  const avgValue = otherCards.reduce((sum, card) => sum + RANK_VALUES[card.rank], 0) / otherCards.length;

  // 最大値
  const maxValue = Math.max(...otherCards.map(card => RANK_VALUES[card.rank]));

  // 推測される自分のカードの期待値（全カードの平均 - 見えているカードの影響）
  const allCardsAvg = 7.5; // 2〜14の平均
  const estimatedMyValue = allCardsAvg;

  // 勝率を計算
  const winProbability = calculateWinProbability(estimatedMyValue, maxValue);

  const callAmount = state.currentBet - player.currentBet;
  const potOdds = callAmount / (state.pot + callAmount);

  // ポットオッズと勝率を比較
  if (winProbability > potOdds * 1.2) {
    // 有利な場合
    if (availableActions.includes('raise') && winProbability > 0.6) {
      const raiseAmount = Math.min(
        state.minRaise * 2,
        Math.floor(player.chips / 3)
      );
      return { type: 'raise', amount: raiseAmount };
    }
    if (availableActions.includes('call')) {
      return { type: 'call' };
    }
    if (availableActions.includes('check')) {
      return { type: 'check' };
    }
  } else if (winProbability > potOdds * 0.8) {
    // まあまあの場合
    if (availableActions.includes('check')) {
      return { type: 'check' };
    }
    if (availableActions.includes('call') && callAmount <= player.chips / 4) {
      return { type: 'call' };
    }
  }

  return { type: 'fold' };
}

// Hard AI: 高度な確率計算と相手の行動予測
function decideHardAction(
  state: IndianPokerState,
  playerIndex: number,
  availableActions: BettingAction['type'][]
): BettingAction {
  const player = state.players[playerIndex];

  // 他のプレイヤーのカードと行動を分析
  const activeOpponents = state.players
    .map((p, i) => ({ player: p, index: i }))
    .filter(({ player, index }) => index !== playerIndex && player.isActive);

  const visibleCards = activeOpponents
    .filter(({ player }) => player.card)
    .map(({ player }) => player.card!);

  if (visibleCards.length === 0) {
    // 情報がない場合は慎重にプレイ
    if (availableActions.includes('check')) {
      return { type: 'check' };
    }
    return { type: 'fold' };
  }

  // 詳細な確率計算
  const { winProbability, expectedValue } = calculateAdvancedProbability(
    state,
    playerIndex,
    visibleCards
  );

  const callAmount = state.currentBet - player.currentBet;
  const potOdds = callAmount / (state.pot + callAmount);

  // 期待値ベースの判断
  if (expectedValue > callAmount * 1.5) {
    // 非常に有利な場合はレイズ
    if (availableActions.includes('raise') && winProbability > 0.7) {
      const raiseAmount = calculateOptimalRaise(state, playerIndex, winProbability);
      return { type: 'raise', amount: raiseAmount };
    }
    if (availableActions.includes('call')) {
      return { type: 'call' };
    }
  } else if (expectedValue > callAmount) {
    // 有利な場合
    if (availableActions.includes('call')) {
      return { type: 'call' };
    }
    if (availableActions.includes('check')) {
      return { type: 'check' };
    }
  } else if (winProbability > potOdds) {
    // ポットオッズが合う場合
    if (availableActions.includes('check')) {
      return { type: 'check' };
    }
    if (availableActions.includes('call') && callAmount <= player.chips / 5) {
      return { type: 'call' };
    }
  }

  // ブラフの判定（低確率で強気に）
  if (Math.random() < 0.15 && availableActions.includes('raise') && player.chips > callAmount * 3) {
    const bluffAmount = Math.min(
      state.minRaise * 3,
      Math.floor(player.chips / 2)
    );
    return { type: 'raise', amount: bluffAmount };
  }

  return { type: 'fold' };
}

// 勝率を計算（簡易版）
function calculateWinProbability(estimatedMyValue: number, maxOpponentValue: number): number {
  // 自分のカードが相手より強い確率を推定
  const diff = estimatedMyValue - maxOpponentValue;

  if (diff > 3) return 0.8;
  if (diff > 1) return 0.65;
  if (diff > 0) return 0.55;
  if (diff > -2) return 0.4;
  if (diff > -4) return 0.25;
  return 0.1;
}

// 高度な確率計算
function calculateAdvancedProbability(
  state: IndianPokerState,
  playerIndex: number,
  visibleCards: Card[]
): { winProbability: number; expectedValue: number } {
  // 見えているカードの値
  const visibleValues = visibleCards.map(c => RANK_VALUES[c.rank]);
  const maxVisible = Math.max(...visibleValues);

  // 残りのカードから自分が持つ可能性のあるカードを計算
  const totalCards = 52;
  const knownCards = visibleCards.length + 1; // 見えているカード + 自分のカード
  const unknownCards = totalCards - knownCards;

  // 自分のカードが各ランクである確率（一様分布と仮定）
  let winCount = 0;
  let totalCount = 0;

  for (const rank of Object.keys(RANK_VALUES)) {
    const value = RANK_VALUES[rank as keyof typeof RANK_VALUES];
    const isVisible = visibleCards.some(c => c.rank === rank);

    // 見えていないカードである確率
    if (!isVisible) {
      totalCount += 4; // 各ランクは4枚
      if (value > maxVisible) {
        winCount += 4;
      }
    }
  }

  const winProbability = totalCount > 0 ? winCount / totalCount : 0.5;
  const expectedValue = state.pot * winProbability;

  return { winProbability, expectedValue };
}

// 最適なレイズ額を計算
function calculateOptimalRaise(
  state: IndianPokerState,
  playerIndex: number,
  winProbability: number
): number {
  const player = state.players[playerIndex];
  const callAmount = state.currentBet - player.currentBet;
  const availableChips = player.chips - callAmount;

  // 勝率に応じたレイズ額
  if (winProbability > 0.8) {
    // 非常に強い場合は大きくレイズ
    return Math.min(
      Math.floor(state.pot * 0.75),
      Math.floor(availableChips * 0.5)
    );
  } else if (winProbability > 0.65) {
    // 強い場合は中程度のレイズ
    return Math.min(
      Math.floor(state.pot * 0.5),
      Math.floor(availableChips * 0.3)
    );
  } else {
    // それ以外は最小レイズ
    return state.minRaise;
  }
}
