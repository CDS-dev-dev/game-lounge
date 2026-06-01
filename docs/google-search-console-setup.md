# Google Search Console 設定手順

## 概要

Google Search Consoleは**完全無料**のGoogleサービスです。
サイトを検索結果に表示させるために必要な設定です。

**費用: 0円（永久無料）**

---

## 手順

### 1. Google Search Consoleにアクセス

https://search.google.com/search-console

Googleアカウントでログイン（無料）

### 2. プロパティを追加

1. 左上の「プロパティを追加」をクリック
2. 「URLプレフィックス」を選択
3. 以下を入力:
   ```
   https://game-lounge-pi.vercel.app
   ```

### 3. 所有権の確認（Vercelの場合）

#### 方法1: HTMLタグ（推奨）

1. Search Consoleで「HTMLタグ」を選択
2. 表示されたメタタグをコピー
   ```html
   <meta name="google-site-verification" content="xxxxx" />
   ```
3. `app/layout.tsx`の`<head>`内に追加:
   ```tsx
   <head>
     <meta name="google-site-verification" content="xxxxx" />
   </head>
   ```
4. デプロイ
5. Search Consoleで「確認」をクリック

#### 方法2: DNS（TXTレコード）

Vercelのドメイン設定からDNS TXTレコードを追加

### 4. サイトマップ送信

所有権確認後:

1. 左メニュー「サイトマップ」をクリック
2. 以下を入力して送信:
   ```
   https://game-lounge-pi.vercel.app/sitemap.xml
   ```
3. 「成功しました」と表示されればOK

### 5. インデックス登録

#### 自動（推奨）
- サイトマップ送信後、24-48時間でGoogleが自動クロール
- 数日〜1週間で検索結果に表示開始

#### 手動（急ぐ場合）
1. 左メニュー「URL検査」をクリック
2. 各ページURLを入力:
   ```
   https://game-lounge-pi.vercel.app/
   https://game-lounge-pi.vercel.app/games/geister
   （以下、重要ページを手動登録）
   ```
3. 「インデックス登録をリクエスト」をクリック

---

## 確認方法

### インデックス状況の確認

Google検索で以下を入力:
```
site:game-lounge-pi.vercel.app
```

登録済みのページ一覧が表示されます。

### 検索での表示確認

1-2週間後、以下のキーワードで検索:
- `ガイスター オンライン`
- `中国象棋 無料`
- `立体四目並べ`

---

## よくある質問

### Q: いつから検索結果に出ますか？
A: サイトマップ送信後、1-2週間程度

### Q: お金はかかりますか？
A: 完全無料です。後から請求も来ません。

### Q: 検索順位を上げるには？
A: 以下が重要:
1. ページの読み込み速度（既に高速✅）
2. コンテンツの質（ルールページ等）
3. 被リンク（他サイトからのリンク）
4. 定期的な更新

### Q: どのくらいアクセスが来ますか？
A: 初期は1日数人→数ヶ月で数十人→継続で増加

---

## トラブルシューティング

### 「サイトマップが読み取れません」
→ 24時間待つ（Googleのクロール待ち）

### 「所有権を確認できません」
→ メタタグが正しく追加されているか確認
→ デプロイが完了しているか確認

### 「インデックスに登録されません」
→ robots.txtで拒否していないか確認
→ 1週間待つ

---

## 参考リンク

- Google Search Console: https://search.google.com/search-console
- ヘルプセンター: https://support.google.com/webmasters
