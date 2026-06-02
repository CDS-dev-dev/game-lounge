# UIレイアウトガイドライン

UIの重なり問題を予防するための設計ガイドライン

## z-index階層ルール

**必須**: 全てのz-indexは `/lib/constants/z-index.ts` の定数を使用すること

```typescript
import { Z_INDEX } from '@/lib/constants/z-index';

// ✅ 正しい
<div style={{ zIndex: Z_INDEX.MODAL }}>...</div>

// ❌ 間違い
<div className="z-50">...</div>
```

### z-index階層表
| レイヤー | 値 | 用途 | 例 |
|---------|-----|------|-----|
| HEADER | 1000 | ヘッダー | GameHeader |
| MODAL | 900 | モーダル | Modal, RulesModal |
| OVERLAY | 800 | オーバーレイ | CPU思考中 |
| TOAST | 700 | 通知 | Toast |
| FLOATING | 600 | フローティング要素 | KeyboardHelpModal |

---

## ページ全体のpadding統一

### 上部padding（GameHeader分）
```tsx
// ✅ 統一ルール
className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 sm:pt-24 pb-4 sm:pb-8"
```

- **pt-20 sm:pt-24**: GameHeader（約64-80px）に余裕を持たせる
- **pb-4 sm:pb-8**: 下部にも適度な余白

### 横padding
```tsx
// ✅ 統一ルール
className="px-3 sm:px-4"
```

- **px-3**: スマホで12px（最小タップ領域を確保）
- **sm:px-4**: PCで16px

---

## CPU思考中オーバーレイの実装パターン

```tsx
import { Z_INDEX } from '@/lib/constants/z-index';

{phase === 'cpuThinking' && (
  <div 
    className="fixed inset-0 bg-black/50 flex items-center justify-center pointer-events-none" 
    style={{ zIndex: Z_INDEX.OVERLAY }}
  >
    <Card className="bg-white/95 pointer-events-auto">
      <CardContent className="py-4 px-6 text-center">
        <div className="flex justify-center mb-2">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        </div>
        <p className="text-sm font-semibold text-slate-900">CPUが思考中...</p>
      </CardContent>
    </Card>
  </div>
)}
```

**重要ポイント:**
- 親要素: `pointer-events-none` でクリック無効化
- 子要素: `pointer-events-auto` でカード自体のクリックを有効化
- 背景: `bg-black/50` で統一（透明度50%）
- z-index: `Z_INDEX.OVERLAY` を使用

---

## モーダルの高さ設定

```tsx
// ✅ GameHeaderを考慮した高さ
className="max-h-[calc(100vh-8rem)] overflow-y-auto"

// ❌ GameHeaderを考慮していない
className="max-h-[90vh] overflow-y-auto"
```

- `calc(100vh-8rem)` = 画面高さ - 128px（ヘッダー + 余白）
- 必ず `overflow-y-auto` を指定してスクロール可能にする

---

## 絶対配置（absolute/fixed）のチェックリスト

新しく絶対配置を使う場合、以下を確認：

### 1. z-indexの設定
- [ ] `/lib/constants/z-index.ts` の定数を使用している
- [ ] Tailwindの `z-XX` クラスを使用していない
- [ ] 適切な階層（HEADER/MODAL/OVERLAY/TOAST/FLOATING）を選択

### 2. 重なりの検証
- [ ] GameHeaderと重ならないか確認
- [ ] 他の固定要素と重ならないか確認
- [ ] スマホ（320px-375px）で表示を確認
- [ ] タブレット（768px）で表示を確認

### 3. スクロール・操作性
- [ ] モーダルの場合、`overflow-y-auto` を指定
- [ ] オーバーレイの場合、`pointer-events-none` を親に指定
- [ ] 長いコンテンツでスクロール可能か確認

### 4. レスポンシブ対応
- [ ] スマホとPCで異なる値を使用している
- [ ] `bottom-XX sm:bottom-YY` のようなブレークポイントを活用
- [ ] 最小タップ領域（44x44px）を確保

---

## 新規ゲーム追加時のチェックリスト

### CPU対戦ページ
- [ ] CPU思考中オーバーレイを上記パターンで実装
- [ ] z-indexは `Z_INDEX.OVERLAY` を使用
- [ ] ページpadding: `pt-20 sm:pt-24 px-3 sm:px-4`

### ローカル対戦ページ
- [ ] ターン交代画面を実装する場合、同じパターンを使用
- [ ] ページpadding統一

### オンライン対戦ページ
- [ ] マッチング中のオーバーレイも統一パターン
- [ ] ページpadding統一

---

## トラブルシューティング

### 問題: 要素が重なって見える
1. z-indexを確認 → 定数を使用しているか？
2. padding-topを確認 → `pt-20 sm:pt-24` になっているか？
3. DevToolsで要素を検査 → 実際のz-indexの値は？

### 問題: モーダルがスクロールできない
1. `max-h-[calc(100vh-8rem)]` を使用しているか？
2. `overflow-y-auto` を指定しているか？
3. コンテンツが画面高さを超えているか確認

### 問題: オーバーレイの下がクリックできる
1. 親要素に `pointer-events-none` を指定
2. 子要素（カード）に `pointer-events-auto` を指定

---

## 参考実装

良い実装例:
- `/home/vscode/game-lounge/app/games/geister/cpu/page.tsx`
- `/home/vscode/game-lounge/components/ui/Modal.tsx`
- `/home/vscode/game-lounge/components/game/RulesModal.tsx`

---

**更新日: 2026-06-02**
