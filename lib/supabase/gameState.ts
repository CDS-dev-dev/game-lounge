import { supabase } from './client';
import type { GeisterState } from '../games/geister/types';
import { withRetry, isNetworkError } from '../utils/retry';

/**
 * ゲームセッションをSupabaseに保存（リトライ付き）
 */
export async function saveGameSession(gameId: string, state: GeisterState): Promise<void> {
  await withRetry(
    async () => {
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
    },
    {
      maxRetries: 3,
      delayMs: 1000,
      onRetry: (attempt) => {
        console.log(`ゲーム保存をリトライ中... (${attempt}/3)`);
      },
    }
  );
}

/**
 * ゲームセッションをSupabaseから読み込み（リトライ付き）
 */
export async function loadGameSession(gameId: string): Promise<GeisterState | null> {
  return await withRetry(
    async () => {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('game_state')
        .eq('id', gameId)
        .single();

      if (error) {
        console.error('Failed to load game session:', error);
        throw new Error('ゲームの読み込みに失敗しました');
      }

      return data?.game_state as GeisterState;
    },
    {
      maxRetries: 3,
      delayMs: 1000,
      onRetry: (attempt) => {
        console.log(`ゲーム読み込みをリトライ中... (${attempt}/3)`);
      },
    }
  ).catch(() => null);
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

/**
 * 待機中のゲームを探してマッチング、なければ新規作成
 */
export async function findOrCreateGame(playerId: string): Promise<string> {
  // 待機中のゲーム（player2が未参加）を検索
  const { data: waitingGames, error: searchError } = await supabase
    .from('game_sessions')
    .select('id, game_state')
    .eq('game_type', 'geister')
    .eq('status', 'waiting')
    .is('player2_id', null)
    .neq('player1_id', playerId) // 自分が作ったゲームは除外
    .order('started_at', { ascending: true })
    .limit(1);

  if (searchError) {
    console.error('Failed to search for waiting games:', searchError);
    throw new Error('ゲーム検索に失敗しました');
  }

  // 待機中のゲームが見つかった場合、player2として参加
  if (waitingGames && waitingGames.length > 0) {
    const gameId = waitingGames[0].id;
    const gameState = waitingGames[0].game_state as GeisterState;

    // player2として参加
    const { joinPlayer2 } = await import('../games/geister/engine');
    const updatedState = joinPlayer2(gameState, playerId);

    await saveGameSession(gameId, updatedState);

    return gameId;
  }

  // 待機中のゲームがない場合、新規作成
  const gameId = generateGameId();
  const { createInitialState } = await import('../games/geister/engine');
  const initialState = createInitialState(gameId, playerId);
  await saveGameSession(gameId, initialState);

  return gameId;
}
