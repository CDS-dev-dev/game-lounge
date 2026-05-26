# ゲームラウンジ

大人のためのオンラインボードゲームプラットフォーム

## 概要

ゲームラウンジは、さまざまなボードゲームをオンラインでリアルタイム対戦できるWebアプリケーションです。落ち着いた大人な雰囲気の中で、気軽にボードゲームを楽しめます。

### 対応ゲーム

- **ガイスター**: 青と赤のオバケ駒を使った心理戦ボードゲーム

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **認証・データベース**: Supabase
- **リアルタイム通信**: Socket.io
- **ORM**: Prisma
- **状態管理**: Zustand
- **デプロイ**: Vercel

## セットアップ

### 前提条件

- Node.js 20.x以上
- npm または pnpm

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd game-lounge

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env.local
# .env.localを編集して必要な環境変数を設定
```

### 環境変数

`.env.local`に以下の環境変数を設定してください：

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gamelounge"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Upstash Redis
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### データベースのセットアップ

```bash
# Prismaマイグレーション実行
npx prisma migrate dev

# Prisma Clientの生成
npx prisma generate
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## プロジェクト構成

```
game-lounge/
├── app/                    # Next.js App Router
│   ├── page.tsx           # トップページ
│   ├── games/             # ゲーム選択
│   └── play/              # 対戦画面
├── components/            # Reactコンポーネント
│   ├── ui/               # UIコンポーネント
│   └── game/             # ゲーム関連コンポーネント
├── lib/                   # ライブラリ・ユーティリティ
│   └── games/            # ゲームロジック
│       └── geister/      # ガイスター
├── prisma/               # Prismaスキーマ
├── docs/                 # ドキュメント
└── .steering/            # 開発作業記録
```

## デプロイ

### Vercelへのデプロイ

1. Vercelアカウントを作成
2. GitHubリポジトリと連携
3. 環境変数を設定
4. デプロイ

```bash
# Vercel CLIを使用する場合
npm install -g vercel
vercel
```

## 開発ドキュメント

詳細なドキュメントは`docs/`ディレクトリを参照してください：

- `docs/1_product-requirements.md` - プロダクト要求定義書
- `docs/2_functional-design.md` - 機能設計書
- `docs/3_architecture.md` - 技術仕様書
- `docs/4_repository-structure.md` - リポジトリ構造
- `docs/5_development-guidelines.md` - 開発ガイドライン
- `docs/6_glossary.md` - 用語集

## ライセンス

MIT License
