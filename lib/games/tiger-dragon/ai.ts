// タイガー＆ドラゴンのAI実装

import type { TigerDragonState, Tile, TileType } from './types';
import { getDefendableTiles, canDefendWith } from './engine';
import { TILE_COUNTS, EVEN_TILES, ODD_TILES } from './constants';

// 既出の牌を記録
interface TileTracker {
  [key: string]: number; // TileType -> 既出枚数
}

// 既出の牌を追跡
function trackPlayedTiles(state: TigerDragonState): TileTracker {
  const tracker: TileTracker = {};

  // 全プレイヤーの手牌以外の牌をカウント
  const allTiles = Object.keys(TILE_COUNTS);
  allTiles.forEach((type) => {
    tracker[type] = 0;
  });

  // 攻め列の牌
  if (state.attackColumn.attackTile) {
    const type = state.attackColumn.attackTile.type.toString();
    tracker[type] = (tracker[type] || 0) + 1;
  }

  // 受け列の牌
  state.defendColumn.forEach((tile) => {
    const type = tile.type.toString();
    tracker[type] = (tracker[type] || 0) + 1;
  });

  // 上がったプレイヤーの上がり牌
  state.players.forEach((player) => {
    if (player.finishTile) {
      const type = player.finishTile.type.toString();
      tracker[type] = (tracker[type] || 0) + 1;
    }
  });

  return tracker;
}

// 手牌の残り枚数から相手の手牌を推測
function estimateOpponentHands(
  state: TigerDragonState,
  playerId: string
): { [playerId: string]: number } {
  const result: { [playerId: string]: number } = {};

  state.players.forEach((player) => {
    if (player.id !== playerId && !player.hasFinished) {
      result[player.id] = player.hand.length;
    }
  });

  return result;
}

// AIの行動を決定（Easy）
export function getAIActionEasy(state: TigerDragonState, playerId: string): {
  action: 'attack' | 'defend' | 'pass';
  tileId?: string;
} {
  const player = state.players.find((p) => p.id === playerId);
  if (!player || player.hasFinished) {
    throw new Error('プレイヤーが見つかりません');
  }

  // 攻め番の場合
  if (state.currentPlayerId === playerId && !state.attackColumn.attackTile) {
    // ランダムに牌を選ぶ
    const randomIndex = Math.floor(Math.random() * player.hand.length);
    const tile = player.hand[randomIndex];
    return { action: 'attack', tileId: tile.id };
  }

  // 受け番の場合
  if (
    state.attackColumn.currentDefenderId === playerId &&
    state.attackColumn.attackTile
  ) {
    const defendableTiles = getDefendableTiles(
      state.attackColumn.attackTile,
      player.hand
    );

    // 受けられる牌があれば50%の確率で受ける
    if (defendableTiles.length > 0 && Math.random() < 0.5) {
      const randomIndex = Math.floor(Math.random() * defendableTiles.length);
      return { action: 'defend', tileId: defendableTiles[randomIndex].id };
    }

    // パス
    return { action: 'pass' };
  }

  throw new Error('AIの行動を決定できません');
}

// AIの行動を決定（Medium）
export function getAIActionMedium(state: TigerDragonState, playerId: string): {
  action: 'attack' | 'defend' | 'pass';
  tileId?: string;
} {
  const player = state.players.find((p) => p.id === playerId);
  if (!player || player.hasFinished) {
    throw new Error('プレイヤーが見つかりません');
  }

  // 攻め番の場合
  if (state.currentPlayerId === playerId && !state.attackColumn.attackTile) {
    // 手牌が1枚なら出して上がる
    if (player.hand.length === 1) {
      return { action: 'attack', tileId: player.hand[0].id };
    }

    // 奥義牌は優先的に出す（受けられやすいので早めに処理）
    const secretTile = player.hand.find(
      (t) => t.type === 'tiger' || t.type === 'dragon'
    );
    if (secretTile) {
      return { action: 'attack', tileId: secretTile.id };
    }

    // 偶数・奇数のバランスを考えて出す
    const evenCount = player.hand.filter((t) =>
      typeof t.type === 'number' && EVEN_TILES.includes(t.type)
    ).length;
    const oddCount = player.hand.filter((t) =>
      typeof t.type === 'number' && ODD_TILES.includes(t.type)
    ).length;

    // 多い方を優先的に出す
    if (evenCount > oddCount) {
      const evenTile = player.hand.find(
        (t) => typeof t.type === 'number' && EVEN_TILES.includes(t.type)
      );
      if (evenTile) {
        return { action: 'attack', tileId: evenTile.id };
      }
    } else {
      const oddTile = player.hand.find(
        (t) => typeof t.type === 'number' && ODD_TILES.includes(t.type)
      );
      if (oddTile) {
        return { action: 'attack', tileId: oddTile.id };
      }
    }

    // ランダムに選ぶ
    const randomIndex = Math.floor(Math.random() * player.hand.length);
    return { action: 'attack', tileId: player.hand[randomIndex].id };
  }

  // 受け番の場合
  if (
    state.attackColumn.currentDefenderId === playerId &&
    state.attackColumn.attackTile
  ) {
    const defendableTiles = getDefendableTiles(
      state.attackColumn.attackTile,
      player.hand
    );

    // 受けられる牌がない場合はパス
    if (defendableTiles.length === 0) {
      return { action: 'pass' };
    }

    // 手牌が少ない場合は積極的に受ける（攻め番を取る）
    if (player.hand.length <= 3) {
      return { action: 'defend', tileId: defendableTiles[0].id };
    }

    // 受けられる牌が1枚しかない場合は80%の確率で受ける
    if (defendableTiles.length === 1 && Math.random() < 0.8) {
      return { action: 'defend', tileId: defendableTiles[0].id };
    }

    // 受けられる牌が複数ある場合は70%の確率で受ける
    if (defendableTiles.length > 1 && Math.random() < 0.7) {
      const randomIndex = Math.floor(Math.random() * defendableTiles.length);
      return { action: 'defend', tileId: defendableTiles[randomIndex].id };
    }

    // パス
    return { action: 'pass' };
  }

  throw new Error('AIの行動を決定できません');
}

// AIの行動を決定（Hard）
export function getAIActionHard(state: TigerDragonState, playerId: string): {
  action: 'attack' | 'defend' | 'pass';
  tileId?: string;
} {
  const player = state.players.find((p) => p.id === playerId);
  if (!player || player.hasFinished) {
    throw new Error('プレイヤーが見つかりません');
  }

  const tracker = trackPlayedTiles(state);
  const opponentHands = estimateOpponentHands(state, playerId);

  // 攻め番の場合
  if (state.currentPlayerId === playerId && !state.attackColumn.attackTile) {
    // 手牌が1枚なら出して上がる
    if (player.hand.length === 1) {
      return { action: 'attack', tileId: player.hand[0].id };
    }

    // 戦場カードの条件を考慮して上がり牌を選ぶ
    if (player.hand.length <= 2) {
      const battlefieldType = state.battlefieldCard.type;
      let preferredTile: Tile | undefined;

      if (battlefieldType === 'even') {
        preferredTile = player.hand.find(
          (t) => typeof t.type === 'number' && EVEN_TILES.includes(t.type)
        );
      } else if (battlefieldType === 'odd') {
        preferredTile = player.hand.find(
          (t) => typeof t.type === 'number' && ODD_TILES.includes(t.type)
        );
      } else if (battlefieldType === 'secret') {
        preferredTile = player.hand.find(
          (t) => t.type === 'tiger' || t.type === 'dragon'
        );
      }

      if (preferredTile) {
        return { action: 'attack', tileId: preferredTile.id };
      }
    }

    // 既出の牌が多い数字を優先的に出す（受けられにくい）
    const tilesWithPlayedCount = player.hand.map((tile) => ({
      tile,
      playedCount: tracker[tile.type.toString()] || 0,
      totalCount: TILE_COUNTS[tile.type] || 1,
    }));

    // 受けられる確率が低い牌を優先
    tilesWithPlayedCount.sort((a, b) => {
      const aRemaining = a.totalCount - a.playedCount;
      const bRemaining = b.totalCount - b.playedCount;
      return aRemaining - bRemaining; // 残り枚数が少ない方を優先
    });

    // 奥義牌は早めに出す（受けられやすいので）
    const secretTile = player.hand.find(
      (t) => t.type === 'tiger' || t.type === 'dragon'
    );
    if (secretTile && player.hand.length > 3) {
      return { action: 'attack', tileId: secretTile.id };
    }

    return { action: 'attack', tileId: tilesWithPlayedCount[0].tile.id };
  }

  // 受け番の場合
  if (
    state.attackColumn.currentDefenderId === playerId &&
    state.attackColumn.attackTile
  ) {
    const defendableTiles = getDefendableTiles(
      state.attackColumn.attackTile,
      player.hand
    );

    // 受けられる牌がない場合はパス
    if (defendableTiles.length === 0) {
      return { action: 'pass' };
    }

    // 手牌が少ない場合は積極的に受ける（攻め番を取る）
    if (player.hand.length <= 2) {
      // 戦場カードの条件に合う牌で受ける
      const battlefieldType = state.battlefieldCard.type;
      let preferredTile: Tile | undefined;

      if (battlefieldType === 'even') {
        preferredTile = defendableTiles.find(
          (t) => typeof t.type === 'number' && EVEN_TILES.includes(t.type)
        );
      } else if (battlefieldType === 'odd') {
        preferredTile = defendableTiles.find(
          (t) => typeof t.type === 'number' && ODD_TILES.includes(t.type)
        );
      } else if (battlefieldType === 'secret') {
        preferredTile = defendableTiles.find(
          (t) => t.type === 'tiger' || t.type === 'dragon'
        );
      }

      if (preferredTile) {
        return { action: 'defend', tileId: preferredTile.id };
      }

      return { action: 'defend', tileId: defendableTiles[0].id };
    }

    // 複数の相手が手牌少ない場合は、攻め番を取るために受ける
    const lowHandCountOpponents = Object.values(opponentHands).filter((c) => c <= 3)
      .length;
    if (lowHandCountOpponents >= 2) {
      return { action: 'defend', tileId: defendableTiles[0].id };
    }

    // 受けられる牌が1枚で、それが重要な牌の場合は受ける
    if (defendableTiles.length === 1) {
      const tile = defendableTiles[0];
      const playedCount = tracker[tile.type.toString()] || 0;
      const totalCount = TILE_COUNTS[tile.type] || 1;

      // 残り枚数が少ない牌なら受ける
      if (totalCount - playedCount <= 2) {
        return { action: 'defend', tileId: tile.id };
      }
    }

    // 受けられる牌が複数ある場合は、使いにくい牌を優先
    if (defendableTiles.length > 1) {
      // 奥義牌があれば優先的に使う
      const secretTile = defendableTiles.find(
        (t) => t.type === 'tiger' || t.type === 'dragon'
      );
      if (secretTile) {
        return { action: 'defend', tileId: secretTile.id };
      }

      // 既出が多い牌を使う
      const tilesWithPlayedCount = defendableTiles.map((tile) => ({
        tile,
        playedCount: tracker[tile.type.toString()] || 0,
      }));
      tilesWithPlayedCount.sort((a, b) => b.playedCount - a.playedCount);

      if (Math.random() < 0.85) {
        return { action: 'defend', tileId: tilesWithPlayedCount[0].tile.id };
      }
    }

    // パス（約15%の確率）
    return { action: 'pass' };
  }

  throw new Error('AIの行動を決定できません');
}

// 難易度に応じたAI行動
export function getAIAction(
  state: TigerDragonState,
  playerId: string,
  difficulty: 'easy' | 'medium' | 'hard'
): {
  action: 'attack' | 'defend' | 'pass';
  tileId?: string;
} {
  switch (difficulty) {
    case 'easy':
      return getAIActionEasy(state, playerId);
    case 'medium':
      return getAIActionMedium(state, playerId);
    case 'hard':
      return getAIActionHard(state, playerId);
    default:
      return getAIActionMedium(state, playerId);
  }
}
