// 簡易的なゲーム状態管理（後でSupabase/WebSocketに置き換え）

import type { GeisterState } from './games/geister/types';

// ブラウザのlocalStorageを使った簡易実装
const STORAGE_KEY_PREFIX = 'geister_game_';

export function saveGameState(gameId: string, state: GeisterState): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_PREFIX + gameId, JSON.stringify(state));
  }
}

export function loadGameState(gameId: string): GeisterState | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEY_PREFIX + gameId);
    if (data) {
      return JSON.parse(data);
    }
  }
  return null;
}

export function generateGameId(): string {
  return 'game_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

export function generatePlayerId(): string {
  if (typeof window !== 'undefined') {
    let playerId = localStorage.getItem('player_id');
    if (!playerId) {
      playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('player_id', playerId);
    }
    return playerId;
  }
  return 'player_' + Date.now();
}
