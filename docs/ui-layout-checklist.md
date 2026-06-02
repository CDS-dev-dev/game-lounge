# UI重なり問題 予防チェックリスト

新規ページ・コンポーネント作成時、またはPRレビュー時に使用するチェックリスト

## 🎯 基本チェック（全ページ必須）

### padding統一
- [ ] ページ全体のpadding: `pt-20 sm:pt-24 pb-4 sm:pb-8 px-3 sm:px-4`
- [ ] 上記以外のpadding値を使用していない

### z-index
- [ ] Tailwindの `z-XX` クラスを使用していない
- [ ] `/lib/constants/z-index.ts` の `Z_INDEX` 定数を使用している
- [ ] `style={{ zIndex: Z_INDEX.XXX }}` の形式で指定

## 🎮 ゲームページ固有チェック

### CPU対戦ページ
- [ ] CPU思考中オーバーレイの実装
  - [ ] `fixed inset-0 bg-black/50`
  - [ ] `pointer-events-none` on parent
  - [ ] `pointer-events-auto` on child (Card)
  - [ ] `style={{ zIndex: Z_INDEX.OVERLAY }}`

### ローカル対戦ページ
- [ ] ターン交代画面の実装（必要な場合）
  - [ ] CPU思考中と同じパターンを使用

### オンライン対戦ページ
- [ ] マッチング中の表示
  - [ ] CPU思考中と同じパターンを使用

## 🔧 絶対配置使用時チェック

### position: fixed/absolute を使う場合
- [ ] z-indexを`Z_INDEX`定数で指定している
- [ ] 適切な階層（HEADER/MODAL/OVERLAY/TOAST/FLOATING）を選択
- [ ] GameHeaderと重ならない位置か確認
- [ ] 他の固定要素と重ならないか確認

### オーバーレイ・モーダルの場合
- [ ] 親要素: `pointer-events-none`
- [ ] 子要素: `pointer-events-auto`
- [ ] 背景: `bg-black/50` （透明度50%）
- [ ] モーダル高さ: `max-h-[calc(100vh-8rem)]`
- [ ] スクロール: `overflow-y-auto`

### ボタン・プレイヤー配置の場合
- [ ] 他の要素との距離を計算
- [ ] スマホでの表示を確認（320px幅）
- [ ] タッチ領域の重なりがないか確認
- [ ] `bottom-XX sm:bottom-YY` でレスポンシブ対応

## 📱 レスポンシブチェック

### 画面幅テスト
- [ ] 320px（iPhone SE）で確認
- [ ] 375px（iPhone標準）で確認
- [ ] 768px（タブレット）で確認
- [ ] 1024px以上（PC）で確認

### 重なり確認
- [ ] GameHeaderとコンテンツが重なっていない
- [ ] アクションボタンとプレイヤー情報が重なっていない
- [ ] Toastと他の要素が重なっていない
- [ ] モーダルとヘッダーが重なっていない

### スクロール確認
- [ ] 長いコンテンツでスクロール可能
- [ ] モーダルの中がスクロール可能
- [ ] スクロール時にヘッダーが固定されている

## 🧪 動作テスト

### CPU対戦
- [ ] CPU思考中のオーバーレイ表示
- [ ] オーバーレイの下がクリックできない
- [ ] オーバーレイのCardはクリックできる

### モーダル表示
- [ ] モーダルを開いてもヘッダーが見える
- [ ] モーダルが画面全体を覆っている
- [ ] 背景クリックで閉じる
- [ ] ESCキーで閉じる

### Toast通知
- [ ] 通知が画面右下に表示
- [ ] 他の要素と重ならない
- [ ] 複数表示時に縦に並ぶ

## 📝 コードレビューポイント

### PRレビュー時の確認
```bash
# z-indexの直接指定をチェック
git diff main | grep 'z-[0-9]'

# 古いpadding値をチェック
git diff main | grep -E 'pt-16 sm:pt-20|px-2 sm:px-4'

# fixed/absolute使用箇所をチェック
git diff main | grep -E 'fixed|absolute'
```

### コミット前の自己チェック
1. このチェックリストを最初から確認
2. DevToolsで要素を検査
3. 複数デバイスサイズで確認
4. スクリーンショットを撮って記録

## 🚨 よくある問題と解決方法

### 問題1: 要素が重なって見える
- **原因**: z-indexが同じ値
- **解決**: `Z_INDEX`定数を使用して階層を明確化

### 問題2: モーダルがスクロールできない
- **原因**: `max-h-[90vh]` でGameHeader分を考慮していない
- **解決**: `max-h-[calc(100vh-8rem)]` に変更

### 問題3: オーバーレイの下がクリックできる
- **原因**: `pointer-events-none` の指定忘れ
- **解決**: 親に `pointer-events-none`、子に `pointer-events-auto`

### 問題4: スマホでボタンが押せない
- **原因**: タップ領域が小さい、または重なっている
- **解決**: `MIN_TAP_AREA` (44x44px) を確保、配置を調整

### 問題5: ヘッダーとコンテンツが重なる
- **原因**: padding-topが不足
- **解決**: `pt-20 sm:pt-24` に統一

## 🔗 参考資料

- [UIレイアウトガイドライン](./ui-layout-guidelines.md)
- [z-index定数定義](/lib/constants/z-index.ts)
- [カスタムESLintルール](../.eslintrc.custom-rules.md)

---

**このチェックリストは定期的に更新してください**

最終更新: 2026-06-02
