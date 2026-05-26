# デプロイガイド

## 本番環境へのデプロイ手順

### 1. GitHubリポジトリの作成

```bash
# GitHubで新規リポジトリを作成後
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Supabaseのセットアップ

1. [Supabase](https://supabase.com)でアカウント作成
2. 新規プロジェクト作成
3. SQL Editorで以下を実行:

```sql
-- users テーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE,
  is_guest BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login TIMESTAMP
);

-- game_sessions テーブル
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type VARCHAR(50) NOT NULL,
  player1_id UUID REFERENCES users(id),
  player2_id UUID REFERENCES users(id),
  game_state JSONB NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('waiting', 'playing', 'finished')),
  winner_id UUID REFERENCES users(id),
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP
);

CREATE INDEX idx_game_sessions_status ON game_sessions(status);
CREATE INDEX idx_game_sessions_game_type ON game_sessions(game_type);

-- game_moves テーブル
CREATE TABLE game_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id UUID REFERENCES users(id),
  move_data JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_game_moves_session_id ON game_moves(session_id);
```

4. Settings > API から以下を取得:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

5. Settings > Database から `DATABASE_URL` を取得

### 3. Upstash Redisのセットアップ

1. [Upstash](https://upstash.com)でアカウント作成
2. Redisデータベースを作成
3. REST API情報から以下を取得:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 4. Vercelへのデプロイ

#### 方法1: Vercel Dashboard（推奨）

1. [Vercel](https://vercel.com)でアカウント作成
2. 「New Project」をクリック
3. GitHubリポジトリを連携
4. 環境変数を設定:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `NEXT_PUBLIC_APP_URL` (Vercelが発行するURLを設定)
5. 「Deploy」をクリック

#### 方法2: Vercel CLI

```bash
# Vercel CLIをインストール
npm install -g vercel

# ログイン
vercel login

# デプロイ
vercel

# 環境変数を設定
vercel env add DATABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
vercel env add NEXT_PUBLIC_APP_URL

# 本番環境にデプロイ
vercel --prod
```

### 5. デプロイ後の確認

1. デプロイされたURLにアクセス
2. トップページが表示されることを確認
3. 「ゲームを始める」→「ガイスター」→「対戦開始」で動作確認
4. ゲームが正常にプレイできることを確認

## トラブルシューティング

### ビルドエラー

- `npm run build` でローカルビルドを確認
- TypeScriptエラーがないか確認
- 環境変数が正しく設定されているか確認

### データベース接続エラー

- `DATABASE_URL` が正しいか確認
- Supabaseプロジェクトが実行中か確認
- テーブルが正しく作成されているか確認

### リアルタイム通信の問題

- Upstash Redis の認証情報が正しいか確認
- ネットワークファイアウォール設定を確認

## 今後の拡張

### Phase 2: 追加機能実装

1. WebSocketサーバーの実装（リアルタイムマッチング）
2. Supabase Authの完全統合（メール認証）
3. 他のゲームの追加（○×ゲーム、チェス、将棋など）
4. ユーザー戦績・ランキング機能
5. フレンド機能
6. チャット機能

### パフォーマンス最適化

- 画像の最適化
- CDN設定
- データベースインデックスの最適化
- キャッシング戦略の実装

### セキュリティ強化

- レート制限の実装
- 不正操作検知
- CSRF対策の強化
- XSS対策の徹底
