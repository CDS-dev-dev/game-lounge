-- Game Lounge Database Schema for Supabase

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT NOT NULL,
  email TEXT UNIQUE,
  is_guest BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- ゲームセッションテーブル
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type TEXT NOT NULL,
  player1_id UUID NOT NULL REFERENCES users(id),
  player2_id UUID REFERENCES users(id),
  game_state JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting', -- waiting, setup, playing, finished
  winner_id UUID REFERENCES users(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ゲーム移動履歴テーブル
CREATE TABLE IF NOT EXISTS game_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES users(id),
  move_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_type ON game_sessions(game_type);
CREATE INDEX IF NOT EXISTS idx_game_moves_session_id ON game_moves(session_id);

-- RLS (Row Level Security) 有効化
-- 注意: 現在は簡易実装のため、すべてのテーブルでRLSを無効化しています
-- 本番環境では適切なRLSポリシーを設定してください
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_moves ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 一時的にすべてのアクセスを許可（開発用）
CREATE POLICY "Allow all access to users" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to game_sessions" ON game_sessions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to game_moves" ON game_moves
  FOR ALL USING (true) WITH CHECK (true);

-- updated_atを自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- game_sessionsのupdated_atを自動更新するトリガー
CREATE TRIGGER update_game_sessions_updated_at
  BEFORE UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
