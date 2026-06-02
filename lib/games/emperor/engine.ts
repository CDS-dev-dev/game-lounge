// エンペラーゲームのエンジン

import type {
  EmperorState,
  EmperorPlayer,
  EmperorCard,
  EmperorClientState,
  CardRank,
  RankType,
} from './types';
import {
  MIN_PLAYERS,
  MAX_PLAYERS,
  INITIAL_COINS,
  TRANSFER_COINS,
  MAX_ROUNDS,
  CARD_RANK_VALUES,
  CARD_TO_RANK,
} from './constants';

// デッキを作成（プレイヤー人数分のカードを生成）
function createDeck(playerCount: number): EmperorCard[] {
  const ranks: CardRank[] = ['K', 'Q', 'J'];
  const deck: EmperorCard[] = [];

  // 皇帝1枚、奴隷1枚、残りは市民
  deck.push({ id: 'card-emperor', rank: 'K' });
  deck.push({ id: 'card-slave', rank: 'J' });

  for (let i = 0; i < playerCount - 2; i++) {
    deck.push({ id: `card-citizen-${i}`, rank: 'Q' });
  }

  return deck;
}

// デッキをシャッフル
function shuffleDeck(deck: EmperorCard[]): EmperorCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 初期状態を作成
export function createInitialState(
  gameId: string,
  playerIds: string[],
  playerNames: string[],
  cpuFlags: boolean[]
): EmperorState {
  const playerCount = playerIds.length;

  if (playerCount < MIN_PLAYERS || playerCount > MAX_PLAYERS) {
    throw new Error(`プレイヤー人数は${MIN_PLAYERS}〜${MAX_PLAYERS}人である必要があります`);
  }

  const players: EmperorPlayer[] = playerIds.map((id, index) => ({
    id,
    name: playerNames[index] || `Player ${index + 1}`,
    coins: INITIAL_COINS,
    role: null,
    card: null,
    isActive: true,
    isCpu: cpuFlags[index] || false,
  }));

  return {
    gameId,
    status: 'waiting',
    players,
    currentRound: 0,
    maxRounds: MAX_ROUNDS,
    deck: [],
    transferAmount: TRANSFER_COINS,
    lastTransfer: null,
    winner: null,
    playerCount,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ゲームを開始（カードを配る）
export function startGame(state: EmperorState): EmperorState {
  if (state.status !== 'waiting' && state.status !== 'transfer') {
    throw new Error('ゲームを開始できる状態ではありません');
  }

  // アクティブなプレイヤーのみ対象
  const activePlayers = state.players.filter((p) => p.isActive);
  if (activePlayers.length < MIN_PLAYERS) {
    throw new Error('アクティブなプレイヤーが不足しています');
  }

  // デッキを作成してシャッフル
  const deck = shuffleDeck(createDeck(activePlayers.length));

  // 各プレイヤーにカードを配る
  const newPlayers = state.players.map((player) => {
    if (!player.isActive) {
      return player;
    }
    const card = deck.shift()!;
    const role = CARD_TO_RANK[card.rank];
    return {
      ...player,
      card,
      role,
    };
  });

  return {
    ...state,
    status: 'dealing',
    players: newPlayers,
    deck,
    currentRound: state.currentRound + 1,
    lastTransfer: null,
    updatedAt: Date.now(),
  };
}

// カードを公開
export function revealCards(state: EmperorState): EmperorState {
  if (state.status !== 'dealing') {
    throw new Error('カードを公開できる状態ではありません');
  }

  return {
    ...state,
    status: 'reveal',
    updatedAt: Date.now(),
  };
}

// コイン移動（奴隷→皇帝）
export function transferCoins(state: EmperorState): EmperorState {
  if (state.status !== 'reveal') {
    throw new Error('コイン移動できる状態ではありません');
  }

  // 皇帝と奴隷を見つける
  const emperor = state.players.find((p) => p.role === 'emperor' && p.isActive);
  const slave = state.players.find((p) => p.role === 'slave' && p.isActive);

  if (!emperor || !slave) {
    throw new Error('皇帝または奴隷が見つかりません');
  }

  // コインを移動
  const transferAmount = Math.min(slave.coins, state.transferAmount);

  const newPlayers = state.players.map((player) => {
    if (player.id === emperor.id) {
      return {
        ...player,
        coins: player.coins + transferAmount,
      };
    }
    if (player.id === slave.id) {
      return {
        ...player,
        coins: player.coins - transferAmount,
      };
    }
    return player;
  });

  // 破産チェック
  const bankruptPlayers = newPlayers.filter((p) => p.coins <= 0 && p.isActive);
  const finalPlayers = newPlayers.map((p) => {
    if (bankruptPlayers.some((bp) => bp.id === p.id)) {
      return { ...p, isActive: false };
    }
    return p;
  });

  // 勝者判定
  const activePlayers = finalPlayers.filter((p) => p.isActive);
  let winner: string | null = null;
  let newStatus: EmperorState['status'] = 'transfer';

  if (activePlayers.length === 1) {
    winner = activePlayers[0].id;
    newStatus = 'finished';
  } else if (state.currentRound >= state.maxRounds) {
    // 最大ラウンド到達時、最もコインが多いプレイヤーが勝者
    const maxCoins = Math.max(...activePlayers.map((p) => p.coins));
    winner = activePlayers.find((p) => p.coins === maxCoins)!.id;
    newStatus = 'finished';
  }

  return {
    ...state,
    status: newStatus,
    players: finalPlayers,
    lastTransfer: { from: slave.id, to: emperor.id, amount: transferAmount },
    winner,
    updatedAt: Date.now(),
  };
}

// 次のラウンドへ
export function nextRound(state: EmperorState): EmperorState {
  if (state.status !== 'transfer') {
    throw new Error('次のラウンドに進めません');
  }

  // カードとロールをリセット
  const newPlayers = state.players.map((player) => ({
    ...player,
    card: null,
    role: null,
  }));

  return {
    ...state,
    status: 'waiting',
    players: newPlayers,
    updatedAt: Date.now(),
  };
}

// クライアント用の状態に変換
export function toClientState(state: EmperorState, playerId: string): EmperorClientState {
  const myPlayer = state.players.find((p) => p.id === playerId) || null;

  // カードの表示制御: dealing状態では自分のカードのみ見える、reveal以降は全員見える
  const players = state.players.map((player) => ({
    id: player.id,
    name: player.name,
    coins: player.coins,
    role: player.role,
    hasCard: player.card !== null,
    card:
      state.status === 'reveal' || state.status === 'transfer' || state.status === 'finished'
        ? player.card
        : player.id === playerId
        ? player.card
        : null,
    isActive: player.isActive,
    isCpu: player.isCpu,
  }));

  return {
    gameId: state.gameId,
    status: state.status,
    players,
    myPlayerId: playerId,
    myPlayer,
    currentRound: state.currentRound,
    maxRounds: state.maxRounds,
    transferAmount: state.transferAmount,
    lastTransfer: state.lastTransfer,
    winner: state.winner,
    playerCount: state.playerCount,
  };
}

// ゲーム全体のフロー制御
export function progressGame(state: EmperorState): EmperorState {
  switch (state.status) {
    case 'waiting':
      return startGame(state);
    case 'dealing':
      return revealCards(state);
    case 'reveal':
      return transferCoins(state);
    case 'transfer':
      return nextRound(state);
    default:
      return state;
  }
}
