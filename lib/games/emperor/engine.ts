// エンペラーゲーム（カイジのEカード）エンジン

import type {
  EmperorState,
  EmperorPlayer,
  ECard,
  CardType,
  PlayerSide,
  BattleResult,
  EmperorClientState,
} from './types';
import {
  MAX_SETS,
  INITIAL_HAND,
  POINTS,
  MAX_BATTLES_PER_SET,
} from './constants';

const PLAYER_ID = 'player';
const CPU_ID = 'cpu';

/**
 * 初期手札を生成
 */
function createInitialHand(side: PlayerSide): ECard[] {
  const hand: ECard[] = [];

  // 皇帝側の場合
  if (side === 'emperor') {
    // 皇帝カード1枚
    hand.push({ id: `emperor-0`, type: 'emperor' });
    // 市民カード4枚
    for (let i = 0; i < 4; i++) {
      hand.push({ id: `citizen-e-${i}`, type: 'citizen' });
    }
  }
  // 奴隷側の場合
  else {
    // 奴隷カード1枚
    hand.push({ id: `slave-0`, type: 'slave' });
    // 市民カード4枚
    for (let i = 0; i < 4; i++) {
      hand.push({ id: `citizen-s-${i}`, type: 'citizen' });
    }
  }

  return hand;
}

/**
 * 初期状態を作成
 */
export function createInitialState(
  gameId: string,
  cpuDifficulty: 'easy' | 'medium' | 'hard' = 'medium'
): EmperorState {
  // セット1: プレイヤーが皇帝側
  const playerSide: PlayerSide = 'emperor';
  const cpuSide: PlayerSide = 'slave';

  const players: EmperorPlayer[] = [
    {
      id: PLAYER_ID,
      name: 'あなた',
      side: playerSide,
      hand: createInitialHand(playerSide),
      score: 0,
      isCpu: false,
    },
    {
      id: CPU_ID,
      name: 'CPU',
      side: cpuSide,
      hand: createInitialHand(cpuSide),
      score: 0,
      isCpu: true,
      cpuDifficulty,
    },
  ];

  return {
    gameId,
    status: 'ready',
    players,
    currentSet: 1,
    maxSets: MAX_SETS,
    currentBattle: 0,
    battleHistory: [],
    playerCard: null,
    cpuCard: null,
    lastBattleResult: null,
    winner: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * セットを開始
 */
export function startSet(state: EmperorState): EmperorState {
  // サイドを決定（奇数セット: プレイヤー=皇帝側、偶数セット: プレイヤー=奴隷側）
  const playerSide: PlayerSide = state.currentSet % 2 === 1 ? 'emperor' : 'slave';
  const cpuSide: PlayerSide = playerSide === 'emperor' ? 'slave' : 'emperor';

  const newPlayers = state.players.map((p) => {
    if (p.id === PLAYER_ID) {
      return {
        ...p,
        side: playerSide,
        hand: createInitialHand(playerSide),
      };
    } else {
      return {
        ...p,
        side: cpuSide,
        hand: createInitialHand(cpuSide),
      };
    }
  });

  return {
    ...state,
    status: 'playing',
    players: newPlayers,
    currentBattle: 0,
    battleHistory: [],
    playerCard: null,
    cpuCard: null,
    lastBattleResult: null,
    updatedAt: Date.now(),
  };
}

/**
 * カードの強弱を判定
 * @returns 'player' | 'cpu' | 'draw'
 */
function judgeCards(playerCard: ECard, cpuCard: ECard): 'player' | 'cpu' | 'draw' {
  const playerType = playerCard.type;
  const cpuType = cpuCard.type;

  // 同じカード = 引き分け
  if (playerType === cpuType) {
    return 'draw';
  }

  // 皇帝 vs 市民 → 皇帝の勝ち
  if (playerType === 'emperor' && cpuType === 'citizen') return 'player';
  if (cpuType === 'emperor' && playerType === 'citizen') return 'cpu';

  // 市民 vs 奴隷 → 市民の勝ち
  if (playerType === 'citizen' && cpuType === 'slave') return 'player';
  if (cpuType === 'citizen' && playerType === 'slave') return 'cpu';

  // 奴隷 vs 皇帝 → 奴隷の勝ち
  if (playerType === 'slave' && cpuType === 'emperor') return 'player';
  if (cpuType === 'slave' && playerType === 'emperor') return 'cpu';

  return 'draw';
}

/**
 * プレイヤーがカードを選択
 */
export function selectPlayerCard(state: EmperorState, cardId: string): EmperorState {
  if (state.status !== 'playing') {
    throw new Error('ゲーム中ではありません');
  }

  const player = state.players.find((p) => p.id === PLAYER_ID);
  if (!player) {
    throw new Error('プレイヤーが見つかりません');
  }

  const card = player.hand.find((c) => c.id === cardId);
  if (!card) {
    throw new Error('カードが見つかりません');
  }

  return {
    ...state,
    playerCard: card,
    updatedAt: Date.now(),
  };
}

/**
 * CPUがカードを選択
 */
export function selectCpuCard(state: EmperorState): EmperorState {
  const cpu = state.players.find((p) => p.id === CPU_ID);
  if (!cpu || cpu.hand.length === 0) {
    throw new Error('CPUの手札がありません');
  }

  // ランダムに選択（AI実装は後で改善）
  const randomIndex = Math.floor(Math.random() * cpu.hand.length);
  const selectedCard = cpu.hand[randomIndex];

  return {
    ...state,
    cpuCard: selectedCard,
    updatedAt: Date.now(),
  };
}

/**
 * 勝負を実行
 */
export function executeBattle(state: EmperorState): EmperorState {
  if (!state.playerCard || !state.cpuCard) {
    throw new Error('両方のカードが選択されていません');
  }

  const player = state.players.find((p) => p.id === PLAYER_ID)!;
  const cpu = state.players.find((p) => p.id === CPU_ID)!;

  // 勝敗判定
  const winner = judgeCards(state.playerCard, state.cpuCard);

  // 得点計算
  let playerPoints = 0;
  let cpuPoints = 0;

  if (winner === 'player') {
    // プレイヤーが勝った場合
    if (player.side === 'emperor') {
      playerPoints = POINTS.emperorWin;
    } else {
      playerPoints = POINTS.slaveWin;
    }
  } else if (winner === 'cpu') {
    // CPUが勝った場合
    if (cpu.side === 'emperor') {
      cpuPoints = POINTS.emperorWin;
    } else {
      cpuPoints = POINTS.slaveWin;
    }
  }

  const battleResult: BattleResult = {
    playerCard: state.playerCard,
    cpuCard: state.cpuCard,
    winner,
    playerPoints,
    cpuPoints,
  };

  // 手札からカードを削除
  const newPlayers = state.players.map((p) => {
    if (p.id === PLAYER_ID) {
      return {
        ...p,
        hand: p.hand.filter((c) => c.id !== state.playerCard!.id),
        score: p.score + playerPoints,
      };
    } else if (p.id === CPU_ID) {
      return {
        ...p,
        hand: p.hand.filter((c) => c.id !== state.cpuCard!.id),
        score: p.score + cpuPoints,
      };
    }
    return p;
  });

  const newBattleHistory = [...state.battleHistory, battleResult];
  const newCurrentBattle = state.currentBattle + 1;

  // セット終了判定
  let newStatus = state.status;
  if (winner !== 'draw' || newCurrentBattle >= MAX_BATTLES_PER_SET) {
    newStatus = 'roundEnd';
  }

  return {
    ...state,
    status: newStatus,
    players: newPlayers,
    currentBattle: newCurrentBattle,
    battleHistory: newBattleHistory,
    lastBattleResult: battleResult,
    playerCard: null,
    cpuCard: null,
    updatedAt: Date.now(),
  };
}

/**
 * 次のセットへ進む
 */
export function nextSet(state: EmperorState): EmperorState {
  if (state.status !== 'roundEnd') {
    throw new Error('セット終了状態ではありません');
  }

  const nextSetNumber = state.currentSet + 1;

  // 全セット終了判定
  if (nextSetNumber > MAX_SETS) {
    const player = state.players.find((p) => p.id === PLAYER_ID)!;
    const cpu = state.players.find((p) => p.id === CPU_ID)!;

    const winner = player.score > cpu.score ? PLAYER_ID : cpu.score > player.score ? CPU_ID : null;

    return {
      ...state,
      status: 'finished',
      winner,
      updatedAt: Date.now(),
    };
  }

  // 次のセットを開始
  const newState = {
    ...state,
    currentSet: nextSetNumber,
    updatedAt: Date.now(),
  };

  return startSet(newState);
}

/**
 * クライアント用状態に変換
 */
export function toClientState(state: EmperorState, playerId: string): EmperorClientState {
  const myPlayer = state.players.find((p) => p.id === playerId) || null;
  const opponentPlayer = state.players.find((p) => p.id !== playerId) || null;

  return {
    gameId: state.gameId,
    status: state.status,
    myPlayerId: playerId,
    myPlayer,
    opponentPlayer,
    currentSet: state.currentSet,
    maxSets: state.maxSets,
    currentBattle: state.currentBattle,
    battleHistory: state.battleHistory,
    playerCard: state.playerCard,
    cpuCard: state.cpuCard,
    lastBattleResult: state.lastBattleResult,
    winner: state.winner,
  };
}
