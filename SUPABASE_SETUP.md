# Supabase セットアップ手順

## 1. Supabaseダッシュボードにアクセス

https://supabase.com/dashboard にアクセスし、プロジェクト `rbdncduyukqufnpcqckd` を開きます。

## 2. SQLエディタでスキーマを作成

左サイドバーから「SQL Editor」を選択し、「New query」をクリックします。

`supabase/schema.sql` の内容をコピーして、SQLエディタに貼り付けます。

「Run」ボタンをクリックしてスクリプトを実行します。

## 3. 実行後の確認

左サイドバーから「Table Editor」を選択し、以下のテーブルが作成されていることを確認します：

- users
- game_sessions
- game_moves

## 4. RLS（Row Level Security）の確認

「Authentication」→「Policies」から、各テーブルのRLSポリシーが有効になっていることを確認します。

## 5. Realtimeの有効化

「Database」→「Replication」から、`game_sessions` テーブルのRealtimeが有効になっていることを確認します。

有効になっていない場合は、「Enable」ボタンをクリックして有効化します。

## 注意事項

- RLSポリシーは認証されたユーザーのみアクセスを許可します
- 現在はゲストユーザー（認証なし）でもアクセスできるよう設定していますが、本番環境では適切な認証を実装することを推奨します
- Realtimeは自動的にゲーム状態の変更を全参加者に通知します

## トラブルシューティング

### エラー: "new row violates row-level security policy"

RLSポリシーが適切に設定されていない可能性があります。上記のSQLスクリプトを再度実行してください。

### リアルタイム更新が動作しない

1. `game_sessions` テーブルのRealtimeが有効になっているか確認
2. ブラウザのコンソールでWebSocketエラーがないか確認
3. Supabaseのログで接続エラーがないか確認
