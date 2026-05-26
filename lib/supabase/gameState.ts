import { supabase } from './client';
import type { GeisterState } from '../games/geister/types';

/**
 * ゲームセッションをSupabaseに保存
 */
export async function saveGameSession(gameId: string, state: GeisterState): Promise<void> {
  const { error } = await supabase
    .from('game_sessions')
    .upsert({
      id: gameId,
      game_type: 'geister',
      player1_id: state.players.player1,
      player2_id: state.players.player2,
      game_state: state,
      status: state.status,
      winner_id: state.winner ? state.players[state.winner] : null,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Failed to save game session:', error);
    throw new Error('ゲームの保存に失敗しました');
  }
}

/**
 * ゲームセッションをSupabaseから読み込み
 */
export async function loadGameSession(gameId: string): Promise<GeisterState | null> {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('game_state')
    .eq('id', gameId)
    .single();

  if (error) {
    console.error('Failed to load game session:', error);
    return null;
  }

  return data?.game_state as GeisterState;
}

/**
 * ゲームセッションの変更をリアルタイムで監視
 */
export function subscribeToGameSession(
  gameId: string,
  callback: (state: GeisterState) => void
) {
  const channel = supabase
    .channel(`game:${gameId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'game_sessions',
        filter: `id=eq.${gameId}`,
      },
      (payload) => {
        const newState = payload.new.game_state as GeisterState;
        callback(newState);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * ゲストユーザーを作成
 */
export async function createGuestUser(nickname: string): Promise<string> {
  const { data, error } = await supabase
    .from('users')
    .insert({
      nickname,
      is_guest: true,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create guest user:', error);
    throw new Error('ユーザーの作成に失敗しました');
  }

  return data.id;
}

/**
 * プレイヤーIDを生成または取得（localStorage併用）
 */
export async function getOrCreatePlayerId(): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('This function must be called on the client side');
  }

  // localStorageから既存のプレイヤーIDを取得
  let playerId = localStorage.getItem('player_id');

  if (!playerId) {
    // 新規ゲストユーザーを作成
    const nickname = `ゲスト${Math.floor(Math.random() * 10000)}`;
    playerId = await createGuestUser(nickname);
    localStorage.setItem('player_id', playerId);
  }

  return playerId;
}

/**
 * ゲームIDを生成
 */
export function generateGameId(): string {
  return crypto.randomUUID();
}
