// タイガー＆ドラゴンゲームのエンジン

import type {
  TigerDragonState,
  TigerDragonPlayer,
  Tile,
  TileType,
  BattlefieldCard,
  TigerDragonClientState,
  AttackColumn,
  GameStatus,
} from './types';
import {
  MIN_PLAYERS,
  MAX_PLAYERS,
  PLAYER_HAND_COUNT,
  START_PLAYER_BONUS,
  TARGET_SCORE,
  TILE_COUNTS,
  BATTLEFIELD_CARDS,
  EVEN_TILES,
  ODD_TILES,
  SMALL_TILES,
  LARGE_TILES,
  SECRET_TILES,
  ONE_ROUND_BONUS_POINTS,
} from './constants';

// デッキを作成（42枚の牌）
function createDeck(): Tile[] {
  const deck: Tile[] = [];
  let idCounter = 0;

  Object.entries(TILE_COUNTS).forEach(([type, count]) => {
    for (let i = 0; i < count; i++) {
      deck.push({
        id: `tile-${type}-${idCounter++}`,
        type: type as TileType,
        isFaceUp: true,
      });
    }
  });

  return deck;
}

// デッキをシャッフル
function shuffleDeck(deck: Tile[]): Tile[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ランダムに戦場カードを選択
function selectBattlefieldCard(): BattlefieldCard {
  const index = Math.floor(Math.random() * BATTLEFIELD_CARDS.length);
  return BATTLEFIELD_CARDS[index];
}

// 次のプレイヤーIDを取得
function getNextPlayerId(
  currentPlayerId: string,
  players: TigerDragonPlayer[]
): string {
  const activePlayers = players.filter((p) => !p.hasFinished);
  const currentIndex = activePlayers.findIndex((p) => p.id === currentPlayerId);
  const nextIndex = (currentIndex + 1) % activePlayers.length;
  return activePlayers[nextIndex].id;
}

// 初期状態を作成
export function createInitialState(
  gameId: string,
  playerIds: string[],
  playerNames: string[],
  cpuFlags: boolean[],
  cpuDifficulties?: ('easy' | 'medium' | 'hard')[]
): TigerDragonState {
  const playerCount = playerIds.length;

  if (playerCount < MIN_PLAYERS || playerCount > MAX_PLAYERS) {
    throw new Error(`プレイヤー人数は${MIN_PLAYERS}〜${MAX_PLAYERS}人である必要があります`);
  }

  const players: TigerDragonPlayer[] = playerIds.map((id, index) => ({
    id,
    name: playerNames[index] || `Player ${index + 1}`,
    hand: [],
    score: 0,
    roundBonusCount: 0,
    hasFinished: false,
    finishTile: null,
    isCpu: cpuFlags[index] || false,
    cpuDifficulty: cpuDifficulties?.[index] || 'medium',
  }));

  // スタートプレイヤーはランダムに決定
  const startPlayerIndex = Math.floor(Math.random() * playerCount);
  const startPlayerId = playerIds[startPlayerIndex];

  return {
    gameId,
    status: 'waiting',
    players,
    currentRound: 0,
    targetScore: TARGET_SCORE,
    battlefieldCard: selectBattlefieldCard(),
    attackColumn: {
      attackTile: null,
      attackerId: null,
      passedPlayerIds: [],
      currentDefenderId: null,
    },
    defendColumn: [],
    currentPlayerId: startPlayerId,
    startPlayerId,
    winner: null,
    playerCount,
    actionHistory: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ゲームを開始（牌を配る）
export function startRound(state: TigerDragonState): TigerDragonState {
  if (state.status !== 'waiting') {
    throw new Error('ゲームを開始できる状態ではありません');
  }

  // デッキを作成してシャッフル
  const deck = shuffleDeck(createDeck());

  // 各プレイヤーに牌を配る
  const handCount = PLAYER_HAND_COUNT[state.playerCount];
  const newPlayers = state.players.map((player) => {
    const isStartPlayer = player.id === state.startPlayerId;
    const count = handCount + (isStartPlayer ? START_PLAYER_BONUS : 0);
    const hand = deck.splice(0, count);

    return {
      ...player,
      hand,
      roundBonusCount: 0,
      hasFinished: false,
      finishTile: null,
    };
  });

  // 戦場カードを選択（ラウンド開始時のみ）
  const battlefieldCard =
    state.currentRound === 0 ? state.battlefieldCard : selectBattlefieldCard();

  return {
    ...state,
    status: 'playing',
    players: newPlayers,
    currentRound: state.currentRound + 1,
    battlefieldCard,
    attackColumn: {
      attackTile: null,
      attackerId: null,
      passedPlayerIds: [],
      currentDefenderId: null,
    },
    defendColumn: [],
    currentPlayerId: state.startPlayerId,
    actionHistory: [],
    updatedAt: Date.now(),
  };
}

// 牌が受けられるかチェック
export function canDefendWith(attackTile: Tile, defendTile: Tile): boolean {
  const attackType = attackTile.type;
  const defendType = defendTile.type;

  // 同じ数字なら受けられる
  if (attackType === defendType) {
    return true;
  }

  // タイガー奥義で受ける場合：偶数全て受けられる
  if (defendType === 'tiger' && typeof attackType === 'number' && EVEN_TILES.includes(attackType)) {
    return true;
  }

  // ドラゴン奥義で受ける場合：奇数全て受けられる
  if (defendType === 'dragon' && typeof attackType === 'number' && ODD_TILES.includes(attackType)) {
    return true;
  }

  return false;
}

// 攻め牌が受けられる牌のリスト
export function getDefendableTiles(attackTile: Tile, hand: Tile[]): Tile[] {
  return hand.filter((tile) => canDefendWith(attackTile, tile));
}

// 攻めアクション
export function attack(
  state: TigerDragonState,
  playerId: string,
  tileId: string
): TigerDragonState {
  if (state.status !== 'playing') {
    throw new Error('プレイ中ではありません');
  }

  if (state.currentPlayerId !== playerId) {
    throw new Error('あなたのターンではありません');
  }

  if (state.attackColumn.attackTile !== null) {
    throw new Error('既に攻め牌があります');
  }

  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    throw new Error('プレイヤーが見つかりません');
  }

  if (player.hasFinished) {
    throw new Error('既に上がっています');
  }

  const tile = player.hand.find((t) => t.id === tileId);
  if (!tile) {
    throw new Error('その牌は持っていません');
  }

  // 手牌から牌を削除
  const newHand = player.hand.filter((t) => t.id !== tileId);

  // 攻め牌を設定
  const newAttackColumn: AttackColumn = {
    attackTile: tile,
    attackerId: playerId,
    passedPlayerIds: [],
    currentDefenderId: getNextPlayerId(playerId, state.players),
  };

  const newPlayers = state.players.map((p) => {
    if (p.id === playerId) {
      return { ...p, hand: newHand };
    }
    return p;
  });

  // 手牌が0枚になったら上がり
  let newStatus: GameStatus = state.status;
  let roundEndPlayer: TigerDragonPlayer | null = null;

  if (newHand.length === 0) {
    newStatus = 'roundEnd';
    roundEndPlayer = { ...player, hand: newHand, hasFinished: true, finishTile: tile };
  }

  return {
    ...state,
    status: newStatus,
    players: roundEndPlayer
      ? newPlayers.map((p) => (p.id === playerId ? roundEndPlayer! : p))
      : newPlayers,
    attackColumn: newAttackColumn,
    currentPlayerId: newAttackColumn.currentDefenderId,
    actionHistory: [
      ...state.actionHistory,
      { type: 'attack', playerId, tile, timestamp: Date.now() },
    ],
    updatedAt: Date.now(),
  };
}

// 受けアクション
export function defend(
  state: TigerDragonState,
  playerId: string,
  tileId: string
): TigerDragonState {
  if (state.status !== 'playing') {
    throw new Error('プレイ中ではありません');
  }

  if (state.attackColumn.currentDefenderId !== playerId) {
    throw new Error('あなたの受けターンではありません');
  }

  if (!state.attackColumn.attackTile) {
    throw new Error('攻め牌がありません');
  }

  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    throw new Error('プレイヤーが見つかりません');
  }

  if (player.hasFinished) {
    throw new Error('既に上がっています');
  }

  const tile = player.hand.find((t) => t.id === tileId);
  if (!tile) {
    throw new Error('その牌は持っていません');
  }

  // 受けられるかチェック
  if (!canDefendWith(state.attackColumn.attackTile, tile)) {
    throw new Error('その牌では受けられません');
  }

  // 手牌から牌を削除
  const newHand = player.hand.filter((t) => t.id !== tileId);

  // 受け列に追加
  const newDefendColumn = [...state.defendColumn, state.attackColumn.attackTile, tile];

  // 攻め列をリセット
  const newAttackColumn: AttackColumn = {
    attackTile: null,
    attackerId: null,
    passedPlayerIds: [],
    currentDefenderId: null,
  };

  const newPlayers = state.players.map((p) => {
    if (p.id === playerId) {
      return { ...p, hand: newHand };
    }
    return p;
  });

  // 手牌が0枚になったら上がり
  let newStatus: GameStatus = state.status;
  let roundEndPlayer: TigerDragonPlayer | null = null;

  if (newHand.length === 0) {
    newStatus = 'roundEnd';
    roundEndPlayer = { ...player, hand: newHand, hasFinished: true, finishTile: tile };
  }

  return {
    ...state,
    status: newStatus,
    players: roundEndPlayer
      ? newPlayers.map((p) => (p.id === playerId ? roundEndPlayer! : p))
      : newPlayers,
    attackColumn: newAttackColumn,
    defendColumn: newDefendColumn,
    currentPlayerId: playerId, // 受けたプレイヤーが次の攻め番
    actionHistory: [
      ...state.actionHistory,
      { type: 'defend', playerId, tile, timestamp: Date.now() },
    ],
    updatedAt: Date.now(),
  };
}

// パスアクション
export function pass(state: TigerDragonState, playerId: string): TigerDragonState {
  if (state.status !== 'playing') {
    throw new Error('プレイ中ではありません');
  }

  if (state.attackColumn.currentDefenderId !== playerId) {
    throw new Error('あなたの受けターンではありません');
  }

  if (!state.attackColumn.attackTile) {
    throw new Error('攻め牌がありません');
  }

  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    throw new Error('プレイヤーが見つかりません');
  }

  if (player.hasFinished) {
    throw new Error('既に上がっています');
  }

  // パスしたプレイヤーを記録
  const newPassedPlayerIds = [...state.attackColumn.passedPlayerIds, playerId];

  // 全員がパスしたかチェック
  const activePlayers = state.players.filter((p) => !p.hasFinished);
  const allPassed =
    newPassedPlayerIds.length === activePlayers.length - 1; // 攻め側以外全員パス

  if (allPassed) {
    // 1周ボーナス！攻め側が裏向きの牌を1枚出せる
    const attacker = state.players.find((p) => p.id === state.attackColumn.attackerId);
    if (!attacker) {
      throw new Error('攻め側プレイヤーが見つかりません');
    }

    // 受け列に攻め牌を追加（裏向き）
    const bonusTile: Tile = { ...state.attackColumn.attackTile!, isFaceUp: false };
    const newDefendColumn = [...state.defendColumn, bonusTile];

    // 1周ボーナスカウントを増やす
    const newPlayers = state.players.map((p) => {
      if (p.id === attacker.id) {
        return { ...p, roundBonusCount: p.roundBonusCount + 1 };
      }
      return p;
    });

    // 攻め列をリセット
    const newAttackColumn: AttackColumn = {
      attackTile: null,
      attackerId: null,
      passedPlayerIds: [],
      currentDefenderId: null,
    };

    return {
      ...state,
      players: newPlayers,
      attackColumn: newAttackColumn,
      defendColumn: newDefendColumn,
      currentPlayerId: attacker.id, // 攻め側が再び攻め番
      actionHistory: [
        ...state.actionHistory,
        { type: 'pass', playerId, timestamp: Date.now() },
      ],
      updatedAt: Date.now(),
    };
  }

  // 次の受け側へ
  const nextDefenderId = getNextPlayerId(playerId, state.players);

  // 攻め側に戻ったらスキップ（全員パス判定は上でしている）
  const finalDefenderId =
    nextDefenderId === state.attackColumn.attackerId
      ? getNextPlayerId(nextDefenderId, state.players)
      : nextDefenderId;

  const newAttackColumn: AttackColumn = {
    ...state.attackColumn,
    passedPlayerIds: newPassedPlayerIds,
    currentDefenderId: finalDefenderId,
  };

  return {
    ...state,
    attackColumn: newAttackColumn,
    currentPlayerId: finalDefenderId,
    actionHistory: [
      ...state.actionHistory,
      { type: 'pass', playerId, timestamp: Date.now() },
    ],
    updatedAt: Date.now(),
  };
}

// 上がり牌が戦場カードの条件を満たすかチェック
function checkBattlefieldCardMatch(
  finishTile: Tile,
  battlefieldCard: BattlefieldCard
): boolean {
  const tileType = finishTile.type;

  switch (battlefieldCard.type) {
    case 'even':
      return typeof tileType === 'number' && EVEN_TILES.includes(tileType);
    case 'odd':
      return typeof tileType === 'number' && ODD_TILES.includes(tileType);
    case 'small':
      return typeof tileType === 'number' && SMALL_TILES.includes(tileType);
    case 'large':
      return typeof tileType === 'number' && LARGE_TILES.includes(tileType);
    case 'secret':
      return SECRET_TILES.includes(tileType as 'tiger' | 'dragon');
    case 'any':
      return true;
    default:
      return false;
  }
}

// ラウンド終了処理（得点計算）
export function endRound(state: TigerDragonState): TigerDragonState {
  if (state.status !== 'roundEnd') {
    throw new Error('ラウンド終了状態ではありません');
  }

  // 上がったプレイヤーを見つける
  const finishedPlayer = state.players.find((p) => p.hasFinished);
  if (!finishedPlayer || !finishedPlayer.finishTile) {
    throw new Error('上がったプレイヤーが見つかりません');
  }

  // 得点計算
  let points = 0;

  // 戦場カードの条件を満たすか
  if (checkBattlefieldCardMatch(finishedPlayer.finishTile, state.battlefieldCard)) {
    points += state.battlefieldCard.points;
  }

  // 1周ボーナスの追加得点
  points += finishedPlayer.roundBonusCount * ONE_ROUND_BONUS_POINTS;

  // 得点を加算
  const newPlayers = state.players.map((p) => {
    if (p.id === finishedPlayer.id) {
      return { ...p, score: p.score + points };
    }
    return p;
  });

  // 勝利判定
  const winner = newPlayers.find((p) => p.score >= state.targetScore);
  let newStatus: TigerDragonState['status'] = 'waiting';
  let winnerId: string | null = null;

  if (winner) {
    newStatus = 'finished';
    winnerId = winner.id;
  }

  // 次のラウンドのスタートプレイヤーは時計回りで次の人
  const nextStartPlayerId = getNextPlayerId(state.startPlayerId, state.players);

  return {
    ...state,
    status: newStatus,
    players: newPlayers,
    startPlayerId: nextStartPlayerId,
    winner: winnerId,
    updatedAt: Date.now(),
  };
}

// クライアント用の状態に変換
export function toClientState(
  state: TigerDragonState,
  playerId: string
): TigerDragonClientState {
  const myPlayer = state.players.find((p) => p.id === playerId) || null;

  const players = state.players.map((player) => ({
    id: player.id,
    name: player.name,
    handCount: player.hand.length,
    hand: player.id === playerId ? player.hand : [], // 自分の手牌のみ見える
    score: player.score,
    roundBonusCount: player.roundBonusCount,
    hasFinished: player.hasFinished,
    finishTile: player.finishTile,
    isCpu: player.isCpu,
  }));

  // 自分が攻めできるか
  const canAttack =
    state.status === 'playing' &&
    state.currentPlayerId === playerId &&
    state.attackColumn.attackTile === null &&
    myPlayer !== null &&
    !myPlayer.hasFinished &&
    myPlayer.hand.length > 0;

  // 自分が受けできるか
  const canDefend =
    state.status === 'playing' &&
    state.attackColumn.currentDefenderId === playerId &&
    state.attackColumn.attackTile !== null &&
    myPlayer !== null &&
    !myPlayer.hasFinished;

  // 受けられる牌のリスト
  const defendableTiles =
    canDefend && state.attackColumn.attackTile && myPlayer
      ? getDefendableTiles(state.attackColumn.attackTile, myPlayer.hand)
      : [];

  // 自分がパスできるか
  const canPass = canDefend && defendableTiles.length >= 0; // パスは常に可能（受けられる牌があっても）

  return {
    gameId: state.gameId,
    status: state.status,
    players,
    myPlayerId: playerId,
    myPlayer,
    currentRound: state.currentRound,
    targetScore: state.targetScore,
    battlefieldCard: state.battlefieldCard,
    attackColumn: state.attackColumn,
    defendColumn: state.defendColumn,
    currentPlayerId: state.currentPlayerId,
    startPlayerId: state.startPlayerId,
    winner: state.winner,
    playerCount: state.playerCount,
    canAttack,
    canDefend,
    canPass,
    defendableTiles,
  };
}
