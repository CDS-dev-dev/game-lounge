// インディアンポーカーのゲームエンジン

import type {
  IndianPokerState,
  IndianPokerPlayer,
  IndianPokerClientState,
  IndianPokerClientPlayer,
  Card,
  BettingAction,
  ShowdownResult,
  Difficulty,
} from './types';
import {
  MIN_PLAYERS,
  MAX_PLAYERS,
  INITIAL_CHIPS,
  ANTE,
  INITIAL_MIN_BET,
  MIN_RAISE_MULTIPLIER,
  CPU_NAMES,
} from './constants';
import { RANK_VALUES } from './types';
import { createStandardDeck, shuffleDeck } from '@/lib/utils/card-utils';

// 新しいデッキを生成
function createDeck(): Card[] {
  return shuffleDeck(createStandardDeck());
}

// 初期状態を作成
export function createInitialState(
  gameId: string,
  playerCount: number,
  humanPlayerId: string,
  cpuCount: number = 0,
  cpuDifficulty: Difficulty = 'medium'
): IndianPokerState {
  if (playerCount < MIN_PLAYERS || playerCount > MAX_PLAYERS) {
    throw new Error(`プレイヤー数は${MIN_PLAYERS}〜${MAX_PLAYERS}人である必要があります`);
  }

  const players: IndianPokerPlayer[] = [];

  // 人間プレイヤー
  players.push({
    id: humanPlayerId,
    name: 'あなた',
    card: null,
    chips: INITIAL_CHIPS,
    currentBet: 0,
    action: null,
    isActive: true,
    isCPU: false,
  });

  if (cpuCount === 0) {
    for (let i = 1; i < playerCount; i++) {
      players.push({
        id: `player-${i}`,
        name: `プレイヤー${i + 1}`,
        card: null,
        chips: INITIAL_CHIPS,
        currentBet: 0,
        action: null,
        isActive: true,
        isCPU: false,
      });
    }
  } else {
    // CPUプレイヤー
    for (let i = 0; i < cpuCount; i++) {
      players.push({
        id: `cpu-${i}`,
        name: CPU_NAMES[i % CPU_NAMES.length],
        card: null,
        chips: INITIAL_CHIPS,
        currentBet: 0,
        action: null,
        isActive: true,
        isCPU: true,
        difficulty: cpuDifficulty,
      });
    }
  }

  return {
    gameId,
    status: 'waiting',
    players,
    currentTurn: 0,
    pot: 0,
    currentBet: 0,
    minRaise: INITIAL_MIN_BET,
    deck: createDeck(),
    round: 0,
    dealerIndex: 0,
    bettingStartIndex: 1,
    consecutiveCalls: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ラウンド開始（カード配布）
export function startRound(state: IndianPokerState): IndianPokerState {
  // アクティブなプレイヤーのみ参加
  const activePlayers = state.players.filter(p => p.chips > 0);

  if (activePlayers.length < 2) {
    return {
      ...state,
      status: 'finished',
      updatedAt: Date.now(),
    };
  }

  // デッキをシャッフル
  const deck = createDeck();

  // 各プレイヤーに1枚ずつ配布
  const newPlayers = state.players.map((player, index) => {
    if (player.chips <= 0) {
      return {
        ...player,
        isActive: false,
        card: null,
        currentBet: 0,
        action: null,
      };
    }

    // アンティを支払う
    const ante = Math.min(ANTE, player.chips);

    return {
      ...player,
      card: deck[index],
      chips: player.chips - ante,
      currentBet: ante,
      action: null,
      isActive: true,
    };
  });

  const pot = newPlayers.reduce((sum, p) => sum + p.currentBet, 0);

  // ディーラー位置を更新
  const newDealerIndex = (state.dealerIndex + 1) % state.players.length;
  const bettingStartIndex = (newDealerIndex + 1) % state.players.length;

  return {
    ...state,
    status: 'betting',
    players: newPlayers,
    deck: deck.slice(state.players.length),
    pot,
    currentBet: ANTE,
    minRaise: INITIAL_MIN_BET,
    currentTurn: bettingStartIndex,
    dealerIndex: newDealerIndex,
    bettingStartIndex,
    consecutiveCalls: 0,
    round: state.round + 1,
    updatedAt: Date.now(),
  };
}

// プレイヤーのアクション実行
export function executeAction(
  state: IndianPokerState,
  playerId: string,
  action: BettingAction
): IndianPokerState {
  if (state.status !== 'betting') {
    throw new Error('ベッティングフェーズではありません');
  }

  const currentPlayer = state.players[state.currentTurn];
  if (!currentPlayer || currentPlayer.id !== playerId) {
    throw new Error('あなたのターンではありません');
  }

  if (!currentPlayer.isActive) {
    throw new Error('既にフォールドしています');
  }

  let newPlayers = [...state.players];
  let newPot = state.pot;
  let newCurrentBet = state.currentBet;
  let newMinRaise = state.minRaise;
  let consecutiveCalls = state.consecutiveCalls;

  const playerIndex = state.currentTurn;

  switch (action.type) {
    case 'fold':
      // フォールド
      newPlayers[playerIndex] = {
        ...currentPlayer,
        action: 'fold',
        isActive: false,
      };
      consecutiveCalls = 0;
      break;

    case 'call':
      // コール（現在のベットに合わせる）
      const callAmount = state.currentBet - currentPlayer.currentBet;
      const actualCallAmount = Math.min(callAmount, currentPlayer.chips);

      newPlayers[playerIndex] = {
        ...currentPlayer,
        chips: currentPlayer.chips - actualCallAmount,
        currentBet: currentPlayer.currentBet + actualCallAmount,
        action: 'call',
      };
      newPot += actualCallAmount;
      consecutiveCalls++;
      break;

    case 'check':
      // チェック（ベット0の場合のみ可能）
      if (currentPlayer.currentBet !== state.currentBet) {
        throw new Error('チェックできません');
      }
      newPlayers[playerIndex] = {
        ...currentPlayer,
        action: 'call',
      };
      consecutiveCalls++;
      break;

    case 'raise':
      // レイズ
      if (!action.amount || action.amount < state.minRaise) {
        throw new Error(`最低${state.minRaise}チップのレイズが必要です`);
      }

      const raiseTotal = state.currentBet + action.amount;
      const raiseCost = raiseTotal - currentPlayer.currentBet;
      const actualRaiseCost = Math.min(raiseCost, currentPlayer.chips);

      newPlayers[playerIndex] = {
        ...currentPlayer,
        chips: currentPlayer.chips - actualRaiseCost,
        currentBet: currentPlayer.currentBet + actualRaiseCost,
        action: 'raise',
      };
      newPot += actualRaiseCost;
      newCurrentBet = raiseTotal;
      newMinRaise = action.amount * MIN_RAISE_MULTIPLIER;
      consecutiveCalls = 0;
      break;

    case 'allin':
      // オールイン
      const allInAmount = currentPlayer.chips;
      newPlayers[playerIndex] = {
        ...currentPlayer,
        chips: 0,
        currentBet: currentPlayer.currentBet + allInAmount,
        action: 'raise',
      };
      newPot += allInAmount;
      if (currentPlayer.currentBet + allInAmount > state.currentBet) {
        newCurrentBet = currentPlayer.currentBet + allInAmount;
        consecutiveCalls = 0;
      } else {
        consecutiveCalls++;
      }
      break;

    default:
      throw new Error('不明なアクションです');
  }

  // 次のプレイヤーを決定
  let nextTurn = (state.currentTurn + 1) % state.players.length;
  let foundNextPlayer = false;

  for (let i = 0; i < state.players.length; i++) {
    if (newPlayers[nextTurn].isActive && newPlayers[nextTurn].chips > 0) {
      foundNextPlayer = true;
      break;
    }
    nextTurn = (nextTurn + 1) % state.players.length;
  }

  // アクティブなプレイヤー数を確認
  const activePlayers = newPlayers.filter(p => p.isActive);

  // 1人しか残っていない場合、その人が勝ち
  if (activePlayers.length === 1) {
    const winnerIndex = newPlayers.findIndex(p => p.isActive);
    newPlayers[winnerIndex].chips += newPot;

    return {
      ...state,
      players: newPlayers,
      pot: 0,
      status: 'finished',
      updatedAt: Date.now(),
    };
  }

  // 全員がコールした、またはチップがない場合はショーダウン
  const allPlayersMatched = activePlayers.every(
    p => p.currentBet === newCurrentBet || p.chips === 0
  );

  if (allPlayersMatched && consecutiveCalls >= activePlayers.length - 1) {
    return performShowdown({
      ...state,
      players: newPlayers,
      pot: newPot,
      currentBet: newCurrentBet,
      minRaise: newMinRaise,
      consecutiveCalls,
      updatedAt: Date.now(),
    });
  }

  return {
    ...state,
    players: newPlayers,
    pot: newPot,
    currentBet: newCurrentBet,
    minRaise: newMinRaise,
    currentTurn: foundNextPlayer ? nextTurn : state.currentTurn,
    consecutiveCalls,
    updatedAt: Date.now(),
  };
}

// ショーダウン（勝者決定）
function performShowdown(state: IndianPokerState): IndianPokerState {
  const activePlayers = state.players
    .map((p, index) => ({ player: p, index }))
    .filter(({ player }) => player.isActive);

  if (activePlayers.length === 0) {
    return {
      ...state,
      status: 'finished',
      updatedAt: Date.now(),
    };
  }

  // カードの強さを比較
  const maxValue = Math.max(
    ...activePlayers.map(({ player }) =>
      player.card ? RANK_VALUES[player.card.rank] : 0
    )
  );

  // 勝者を決定（複数の場合は引き分け）
  const winners = activePlayers.filter(
    ({ player }) => player.card && RANK_VALUES[player.card.rank] === maxValue
  );

  const potShare = Math.floor(state.pot / winners.length);

  const newPlayers = state.players.map((player, index) => {
    const isWinner = winners.some(w => w.index === index);
    if (isWinner) {
      return {
        ...player,
        chips: player.chips + potShare,
      };
    }
    return player;
  });

  return {
    ...state,
    players: newPlayers,
    pot: 0,
    status: 'showdown',
    updatedAt: Date.now(),
  };
}

// カードの強さを取得
export function getCardValue(card: Card | null): number {
  if (!card) return 0;
  return RANK_VALUES[card.rank];
}

// クライアント用の状態に変換（自分のカードを隠す）
export function toClientState(
  state: IndianPokerState,
  playerId: string
): IndianPokerClientState {
  const myIndex = state.players.findIndex(p => p.id === playerId);
  if (myIndex === -1) {
    throw new Error('プレイヤーが見つかりません');
  }

  const myPlayer = state.players[myIndex];
  const isMyTurn = state.currentTurn === myIndex;
  const canOperate = state.status === 'betting' && isMyTurn && myPlayer.isActive;

  // 自分のカードは見えないようにする
  const clientPlayers: IndianPokerClientPlayer[] = state.players.map((player, index) => ({
    id: player.id,
    name: player.name,
    card: index === myIndex ? null : player.card, // 自分のカードは隠す
    chips: player.chips,
    currentBet: player.currentBet,
    action: player.action,
    isActive: player.isActive,
    isCPU: player.isCPU,
  }));

  const callAmount = Math.max(0, state.currentBet - myPlayer.currentBet);
  const canRaise = myPlayer.chips > callAmount;
  const canCheck = myPlayer.currentBet === state.currentBet;

  return {
    gameId: state.gameId,
    status: state.status,
    players: clientPlayers,
    currentTurn: state.currentTurn,
    myIndex,
    isMyTurn,
    canOperate,
    pot: state.pot,
    currentBet: state.currentBet,
    minRaise: state.minRaise,
    round: state.round,
    myChips: myPlayer.chips,
    myCurrentBet: myPlayer.currentBet,
    callAmount,
    canRaise,
    canCheck,
  };
}

// 次のラウンドに進めるかチェック
export function canStartNextRound(state: IndianPokerState): boolean {
  if (state.status !== 'showdown') {
    return false;
  }

  const activePlayers = state.players.filter(p => p.chips > 0);
  return activePlayers.length >= 2;
}

// 移動可能なアクションを取得
export function getAvailableActions(
  state: IndianPokerState,
  playerId: string
): BettingAction['type'][] {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return [];

  const player = state.players[playerIndex];
  if (!player.isActive || state.status !== 'betting' || state.currentTurn !== playerIndex) {
    return [];
  }

  const actions: BettingAction['type'][] = ['fold'];

  const callAmount = state.currentBet - player.currentBet;

  if (callAmount === 0) {
    actions.push('check');
  } else if (player.chips >= callAmount) {
    actions.push('call');
  }

  if (player.chips > callAmount) {
    actions.push('raise');
  }

  if (player.chips > 0) {
    actions.push('allin');
  }

  return actions;
}
