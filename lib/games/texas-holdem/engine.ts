// テキサスホールデムのゲームエンジン

import type {
  Card,
  TexasHoldemState,
  TexasHoldemPlayer,
  TexasHoldemClientState,
  GameStatus,
  Rank,
  Suit,
  PlayerAction,
} from './types';
import {
  SUITS,
  RANKS,
  DEFAULT_SMALL_BLIND,
  DEFAULT_BIG_BLIND,
  DEFAULT_STARTING_CHIPS,
  MIN_PLAYERS,
  MAX_PLAYERS,
} from './constants';
import { evaluateHand, compareHands } from './poker-hands';

/**
 * デッキを生成
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        id: `${suit}-${rank}`,
      });
    }
  }
  return deck;
}

/**
 * デッキをシャッフル（Fisher-Yates）
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 初期状態を作成
 */
export function createInitialState(
  gameId: string,
  playerCount: number,
  playerNames: string[],
  cpuPositions: boolean[] = []
): TexasHoldemState {
  if (playerCount < MIN_PLAYERS || playerCount > MAX_PLAYERS) {
    throw new Error(`プレイヤー人数は${MIN_PLAYERS}～${MAX_PLAYERS}人である必要があります`);
  }

  if (playerNames.length !== playerCount) {
    throw new Error('プレイヤー名の数が一致しません');
  }

  // プレイヤーを作成
  const players: TexasHoldemPlayer[] = playerNames.map((name, index) => ({
    id: `player-${index}`,
    name,
    chips: DEFAULT_STARTING_CHIPS,
    holeCards: null,
    currentBet: 0,
    totalBet: 0,
    action: null,
    isActive: true,
    isAllin: false,
    position: index,
    isCpu: cpuPositions[index] || false,
  }));

  const deck = shuffleDeck(createDeck());

  return {
    gameId,
    status: 'waiting',
    players,
    communityCards: [],
    deck,
    pot: 0,
    currentBet: 0,
    minRaise: DEFAULT_BIG_BLIND,
    dealerButton: 0,
    currentTurn: 0,
    smallBlind: DEFAULT_SMALL_BLIND,
    bigBlind: DEFAULT_BIG_BLIND,
    round: 0,
    winners: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * ゲームを開始（ブラインドとカード配布）
 */
export function startGame(state: TexasHoldemState): TexasHoldemState {
  if (state.status !== 'waiting') {
    throw new Error('ゲームは既に開始されています');
  }

  // アクティブなプレイヤー数を確認
  const activePlayers = state.players.filter(p => p.isActive && p.chips > 0);
  if (activePlayers.length < MIN_PLAYERS) {
    throw new Error(`ゲームを開始するには${MIN_PLAYERS}人以上のプレイヤーが必要です`);
  }

  let newState = { ...state };

  // デッキをシャッフル
  newState.deck = shuffleDeck(createDeck());

  // ブラインドを配置
  newState = postBlinds(newState);

  // カードを配布（各プレイヤーに2枚）
  newState = dealHoleCards(newState);

  // プリフロップ開始
  newState.status = 'preflop';

  // ビッグブラインドの次のプレイヤーからアクション開始
  const bigBlindPos = (newState.dealerButton + 2) % newState.players.length;
  newState.currentTurn = getNextActivePlayer(newState, bigBlindPos);

  newState.updatedAt = Date.now();

  return newState;
}

/**
 * ブラインドを配置
 */
function postBlinds(state: TexasHoldemState): TexasHoldemState {
  const newState = { ...state };
  const players = [...newState.players];

  // スモールブラインド（ディーラーの次）
  const sbPos = (newState.dealerButton + 1) % players.length;
  const sbPlayer = players[sbPos];
  const sbAmount = Math.min(sbPlayer.chips, newState.smallBlind);
  sbPlayer.chips -= sbAmount;
  sbPlayer.currentBet = sbAmount;
  sbPlayer.totalBet = sbAmount;
  sbPlayer.action = 'call';
  if (sbPlayer.chips === 0) sbPlayer.isAllin = true;

  // ビッグブラインド（スモールブラインドの次）
  const bbPos = (newState.dealerButton + 2) % players.length;
  const bbPlayer = players[bbPos];
  const bbAmount = Math.min(bbPlayer.chips, newState.bigBlind);
  bbPlayer.chips -= bbAmount;
  bbPlayer.currentBet = bbAmount;
  bbPlayer.totalBet = bbAmount;
  bbPlayer.action = 'call';
  if (bbPlayer.chips === 0) bbPlayer.isAllin = true;

  newState.pot = sbAmount + bbAmount;
  newState.currentBet = bbAmount;
  newState.players = players;

  return newState;
}

/**
 * ホールカードを配布
 */
function dealHoleCards(state: TexasHoldemState): TexasHoldemState {
  const newState = { ...state };
  const deck = [...newState.deck];
  const players = [...newState.players];

  for (const player of players) {
    if (player.isActive && player.chips > 0) {
      player.holeCards = [deck.pop()!, deck.pop()!];
    }
  }

  newState.deck = deck;
  newState.players = players;

  return newState;
}

/**
 * プレイヤーのアクションを処理
 */
export function playerAction(
  state: TexasHoldemState,
  playerId: string,
  action: PlayerAction,
  raiseAmount?: number
): TexasHoldemState {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    throw new Error('プレイヤーが見つかりません');
  }

  if (state.currentTurn !== playerIndex) {
    throw new Error('あなたのターンではありません');
  }

  const player = state.players[playerIndex];

  if (!player.isActive) {
    throw new Error('このプレイヤーは既にフォールドしています');
  }

  let newState = { ...state };
  const players = [...newState.players];
  const currentPlayer = { ...players[playerIndex] };

  switch (action) {
    case 'fold':
      currentPlayer.isActive = false;
      currentPlayer.action = 'fold';
      break;

    case 'check':
      if (currentPlayer.currentBet < newState.currentBet) {
        throw new Error('チェックできません（ベットが必要です）');
      }
      currentPlayer.action = 'check';
      break;

    case 'call':
      const callAmount = Math.min(
        newState.currentBet - currentPlayer.currentBet,
        currentPlayer.chips
      );
      currentPlayer.chips -= callAmount;
      currentPlayer.currentBet += callAmount;
      currentPlayer.totalBet += callAmount;
      newState.pot += callAmount;
      currentPlayer.action = 'call';
      if (currentPlayer.chips === 0) {
        currentPlayer.isAllin = true;
      }
      break;

    case 'raise':
      if (!raiseAmount || raiseAmount < newState.minRaise) {
        throw new Error(`最低${newState.minRaise}チップのレイズが必要です`);
      }
      const totalRaiseAmount = newState.currentBet - currentPlayer.currentBet + raiseAmount;
      if (totalRaiseAmount > currentPlayer.chips) {
        throw new Error('チップが不足しています');
      }
      currentPlayer.chips -= totalRaiseAmount;
      currentPlayer.currentBet += totalRaiseAmount;
      currentPlayer.totalBet += totalRaiseAmount;
      newState.pot += totalRaiseAmount;
      newState.currentBet = currentPlayer.currentBet;
      newState.minRaise = raiseAmount;
      currentPlayer.action = 'raise';
      if (currentPlayer.chips === 0) {
        currentPlayer.isAllin = true;
      }
      break;

    case 'allin':
      const allinAmount = currentPlayer.chips;
      currentPlayer.chips = 0;
      currentPlayer.currentBet += allinAmount;
      currentPlayer.totalBet += allinAmount;
      newState.pot += allinAmount;
      if (currentPlayer.currentBet > newState.currentBet) {
        newState.currentBet = currentPlayer.currentBet;
      }
      currentPlayer.isAllin = true;
      currentPlayer.action = 'allin';
      break;

    default:
      throw new Error('無効なアクションです');
  }

  players[playerIndex] = currentPlayer;
  newState.players = players;

  // 次のプレイヤーへ
  newState.currentTurn = getNextActivePlayer(newState, playerIndex);

  // ベッティングラウンド終了チェック
  if (isBettingRoundComplete(newState)) {
    newState = advanceToNextPhase(newState);
  }

  newState.updatedAt = Date.now();

  return newState;
}

/**
 * 次のアクティブなプレイヤーを取得
 */
function getNextActivePlayer(state: TexasHoldemState, currentIndex: number): number {
  let nextIndex = (currentIndex + 1) % state.players.length;
  let count = 0;

  while (count < state.players.length) {
    const player = state.players[nextIndex];
    if (player.isActive && !player.isAllin) {
      return nextIndex;
    }
    nextIndex = (nextIndex + 1) % state.players.length;
    count++;
  }

  // 全員オールインまたはフォールドの場合
  return currentIndex;
}

/**
 * ベッティングラウンドが完了したか判定
 */
function isBettingRoundComplete(state: TexasHoldemState): boolean {
  const activePlayers = state.players.filter(p => p.isActive && !p.isAllin);

  // アクティブなプレイヤーが0または1人の場合、ラウンド終了
  if (activePlayers.length <= 1) {
    return true;
  }

  // 全員がアクション済みで、ベット額が揃っているか
  const allActioned = activePlayers.every(p => p.action !== null);
  const betsEqual = activePlayers.every(p => p.currentBet === state.currentBet);

  return allActioned && betsEqual;
}

/**
 * 次のフェーズに進む
 */
function advanceToNextPhase(state: TexasHoldemState): TexasHoldemState {
  let newState = { ...state };

  // 全プレイヤーのアクションをリセット
  const players = newState.players.map(p => ({
    ...p,
    currentBet: 0,
    action: null,
  }));
  newState.players = players;
  newState.currentBet = 0;
  newState.minRaise = newState.bigBlind;

  const deck = [...newState.deck];

  switch (newState.status) {
    case 'preflop':
      // フロップ（3枚）
      deck.pop(); // バーンカード
      newState.communityCards = [deck.pop()!, deck.pop()!, deck.pop()!];
      newState.status = 'flop';
      break;

    case 'flop':
      // ターン（1枚）
      deck.pop(); // バーンカード
      newState.communityCards.push(deck.pop()!);
      newState.status = 'turn';
      break;

    case 'turn':
      // リバー（1枚）
      deck.pop(); // バーンカード
      newState.communityCards.push(deck.pop()!);
      newState.status = 'river';
      break;

    case 'river':
      // ショーダウン
      newState = performShowdown(newState);
      newState.status = 'showdown';
      break;

    default:
      break;
  }

  newState.deck = deck;

  // ディーラーボタンの次のプレイヤーからアクション開始
  newState.currentTurn = getNextActivePlayer(newState, newState.dealerButton);

  return newState;
}

/**
 * ショーダウン（勝者判定）
 */
function performShowdown(state: TexasHoldemState): TexasHoldemState {
  const newState = { ...state };

  // アクティブなプレイヤーの役を評価
  const evaluations = newState.players
    .filter(p => p.isActive && p.holeCards)
    .map(p => ({
      player: p,
      evaluation: evaluateHand(p.holeCards!, newState.communityCards),
    }));

  // 最強の役を持つプレイヤーを特定
  evaluations.sort((a, b) => compareHands(b.evaluation, a.evaluation));

  const winners = [];
  const bestRank = evaluations[0].evaluation.rank;

  for (const { player, evaluation } of evaluations) {
    if (evaluation.rank === bestRank) {
      winners.push({
        playerId: player.id,
        amount: 0, // 後で分配
        hand: evaluation,
      });
    }
  }

  // ポットを分配
  const amountPerWinner = Math.floor(newState.pot / winners.length);
  for (const winner of winners) {
    winner.amount = amountPerWinner;
    const player = newState.players.find(p => p.id === winner.playerId);
    if (player) {
      player.chips += amountPerWinner;
    }
  }

  newState.winners = winners;
  newState.pot = 0;

  return newState;
}

/**
 * 次のラウンドを開始
 */
export function startNextRound(state: TexasHoldemState): TexasHoldemState {
  if (state.status !== 'showdown') {
    throw new Error('ショーダウン後にのみ次のラウンドを開始できます');
  }

  // チップがあるプレイヤーのみアクティブ化
  const players = state.players.map(p => ({
    ...p,
    isActive: p.chips > 0,
    isAllin: false,
    holeCards: null,
    currentBet: 0,
    totalBet: 0,
    action: null,
  }));

  const activePlayers = players.filter(p => p.isActive);
  if (activePlayers.length < MIN_PLAYERS) {
    // ゲーム終了
    return {
      ...state,
      status: 'finished',
      players,
      updatedAt: Date.now(),
    };
  }

  // ディーラーボタンを移動
  const dealerButton = (state.dealerButton + 1) % players.length;

  const newState: TexasHoldemState = {
    ...state,
    status: 'waiting',
    players,
    communityCards: [],
    deck: shuffleDeck(createDeck()),
    pot: 0,
    currentBet: 0,
    minRaise: state.bigBlind,
    dealerButton,
    currentTurn: 0,
    round: state.round + 1,
    winners: [],
    updatedAt: Date.now(),
  };

  return startGame(newState);
}

/**
 * クライアント用の状態に変換
 */
export function toClientState(
  state: TexasHoldemState,
  playerId: string
): TexasHoldemClientState {
  const player = state.players.find(p => p.id === playerId);
  if (!player) {
    throw new Error('プレイヤーが見つかりません');
  }

  const isMyTurn = state.currentTurn === player.position;
  const callAmount = Math.max(0, state.currentBet - player.currentBet);
  const canCheck = player.currentBet === state.currentBet;
  const canCall = callAmount > 0 && callAmount <= player.chips;
  const canRaise = player.chips > callAmount + state.minRaise;
  const canFold = state.currentBet > player.currentBet;

  return {
    gameId: state.gameId,
    status: state.status,
    players: state.players,
    communityCards: state.communityCards,
    pot: state.pot,
    currentBet: state.currentBet,
    minRaise: state.minRaise,
    currentTurn: state.currentTurn,
    dealerButton: state.dealerButton,
    smallBlind: state.smallBlind,
    bigBlind: state.bigBlind,
    myPlayerId: playerId,
    myPosition: player.position,
    myChips: player.chips,
    myCards: player.holeCards,
    isMyTurn,
    canCheck,
    canCall,
    canRaise,
    canFold,
    callAmount,
    winners: state.winners,
  };
}
