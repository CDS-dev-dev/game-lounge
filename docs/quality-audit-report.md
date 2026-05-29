# ゲームラウンジ 品質監査レポート

**監査日:** 2026-05-29  
**監査範囲:** 全ゲーム（Connect4、Geister、Xiangqi）のCPU対戦、AIロジック、UI/UX  
**発見された問題:** 23件（優先度高: 7件、中: 10件、低: 6件）

---

## エグゼクティブサマリー

ゲームラウンジアプリの品質監査を実施した結果、**7件の優先度高の問題**を発見しました。特に以下が重大です：

1. **ガイスターの座標変換バグ**（緊急・修正済み）- タップした駒と別の駒が動く
2. **Error Boundary未実装** - ランタイムエラーでアプリ全体がクラッシュする可能性
3. **AIの「合法手が見つかりません」エラー** - ゲーム進行が止まる

基本的なUI/UX品質は良好ですが、エラー処理とアクセシビリティに改善の余地があります。

---

## 🔴 優先度：高（Critical） - 7件

### 1. ガイスターの座標変換バグ ✅ **修正済み**

**状態:** 修正完了  
**影響:** ユーザーがタップした駒と違う駒が動く致命的なバグ

**原因:**
```typescript
// components/game/GeisterBoard.tsx 行139（修正前）
const getCellAriaLabel = (x: number, y: number): string => {
  const piece = gameState.board[y][x]; // 表示座標を直接使用（間違い）
```

- `getCellAriaLabel`が表示座標を受け取っているのに内部座標として使用
- `displayY`の計算ロジックとtoInternalCoordsの反転が重複
- player2でプレイ時に座標がずれる

**修正内容:**
- 関数を内部座標を受け取るように変更
- displayYの計算を単純化（rowIndexをそのまま使用）
- toInternalCoordsで全ての座標変換を統一

---

### 2. Error Boundary（エラー境界）が未実装 ❌ **未対応**

**状態:** 未対応  
**影響:** ランタイムエラーが発生するとアプリ全体が白画面になる

**問題点:**
- `/app/layout.tsx` にError Boundaryなし
- 各ゲームページにもローカルなエラー境界なし
- Three.js（Connect4の3D表示）でエラーが出るとリカバリー不可能

**修正案:**
```typescript
// app/error.tsx を作成
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          エラーが発生しました
        </h2>
        <p className="text-slate-700 mb-4">
          申し訳ございません。予期しないエラーが発生しました。
        </p>
        <button
          onClick={reset}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          もう一度試す
        </button>
      </div>
    </div>
  );
}
```

---

### 3. Connect4Board3Dのエラーハンドリングが不十分 ❌ **未対応**

**状態:** 未対応  
**影響:** Three.js関連エラーでゲームが停止

**問題点:**
```typescript
// components/game/Connect4Board3D.tsx 行206
<Suspense fallback={null}>
  <Canvas>
    {/* Three.jsコンテンツ */}
  </Canvas>
</Suspense>
```

- `fallback={null}` では何も表示されない
- Canvas初期化失敗時のフォールバックなし
- WebGL非対応ブラウザでクラッシュ

**修正案:**
```typescript
<Suspense fallback={
  <div className="w-full h-96 flex items-center justify-center bg-slate-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <p className="text-slate-600">3Dボードを読み込み中...</p>
    </div>
  </div>
}>
  <Canvas fallback={<div>WebGLが利用できません</div>}>
    {/* Three.jsコンテンツ */}
  </Canvas>
</Suspense>
```

---

### 4. AIの「合法手が見つかりません」エラー ⚠️ **部分的修正済み**

**状態:** デバッグログ追加済み、根本解決は未完  
**影響:** ゲームが進行不能になる

**発見された原因:**

#### Connect4の問題
```typescript
// lib/games/connect4/ai.ts 行222-230（修正前）
if (state.currentTurn !== cpuRole) {
  throw new Error(`CPUのターンではありません`);
}
```
- minimax内で相手の手をシミュレートする際にもチェックが走る
- ゲーム状態が`'playing'`以外の時に呼ばれるとgetAvailablePositionsが空配列を返す

#### Geisterの問題
```typescript
// lib/games/geister/engine.ts 行267-275
// 端っこ（左右の列）は脱出口以外移動禁止
if (isLeftEdge || isRightEdge) {
  if (!isEscapeCell) {
    return false;
  }
}
```
- 駒が盤面端に追い込まれると合法手が0になる可能性
- 全ての駒が移動不可能な状態でAIが呼ばれるとエラー

**修正状況:**
- ✅ 詳細デバッグログを追加（盤面状態、駒の位置、合法手の数を出力）
- ❌ 合法手が0件の場合のフォールバック処理は未実装

**推奨対応:**
```typescript
// calculateCpuMove内
if (allMoves.length === 0) {
  // ゲーム終了判定（詰み）
  console.error('詰みの状態です');
  // 投了処理またはランダムな駒を返す
  return {
    pieceId: myPieces[0].id,
    to: myPieces[0].position, // 動けない場合は同じ位置
    score: -Infinity
  };
}
```

---

### 5. Toast通知のアクセシビリティ不足 ❌ **未対応**

**状態:** 未対応  
**影響:** スクリーンリーダーユーザーがエラーに気づかない

**問題点:**
```typescript
// components/ui/Toast.tsx 行49（推定）
<div className={...}>  // role属性なし、aria-live属性なし
```

**修正案:**
```typescript
<div
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
  className={...}
>
```

---

### 6. ゲーム終了時のアクセシビリティが不統一 ⚠️ **部分的対応**

**状態:** Geisterのみ実装済み、Connect4/Xiangqiは未対応  
**影響:** スクリーンリーダーで勝敗が読み上げられない

**現状:**
- ✅ Geister: `<div role="alert" aria-live="assertive">` 実装済み
- ❌ Connect4: role属性なし
- ❌ Xiangqi: role属性なし

**修正案:**
```typescript
// 全ゲームの終了画面を統一
{phase === 'finished' && (
  <div role="alert" aria-live="assertive">
    <Card className="mt-6 bg-white/95">
      {/* 勝敗表示 */}
    </Card>
  </div>
)}
```

---

### 7. ボタンにaria-label/focus状態が不足 ❌ **未対応**

**状態:** 未対応  
**影響:** キーボードユーザー・スクリーンリーダーユーザーに不親切

**問題点:**
```typescript
// components/ui/Button.tsx
// disabledの理由がスクリーンリーダーに伝わらない
// 絵文字ボタン（↩️ 待った）にaria-labelなし
// focus:ring系のスタイルがない
```

**修正案:**
```typescript
className={`
  ...existing classes...
  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
  disabled:cursor-not-allowed
`}
aria-label={ariaLabel}
aria-disabled={disabled}
```

---

## 🟡 優先度：中（High） - 10件

### 8. 待った機能のUI/UXの微妙な不一致

**問題:** 実装は同じだが、ボタン配置が微妙に異なる
- Connect4: CardContent内、右側
- Geister: CardContent内、右側（修正済み）
- Xiangqi: CardContent内、中央下

**推奨:** 全ゲームで右上に統一

---

### 9. CPU思考中オーバーレイのZ-index

**状態:** 全ゲームで`z-50`を使用（統一済み）✅  
**問題なし**

---

### 10. Xiangqiのminimax深度3は重い

**問題:** 初期盤面で30-40手の分岐、depth 3で数百万ノード評価
**影響:** CPU思考が5-10秒かかる可能性

**推奨対応:**
```typescript
// タイムアウト追加
const startTime = Date.now();
const TIMEOUT = 5000; // 5秒

function minimax(...) {
  if (Date.now() - startTime > TIMEOUT) {
    return currentBestScore; // 時間切れで現在の最善手を返す
  }
  // ... 既存のロジック
}
```

---

### 11. レスポンシブデザインのブレークポイントが不統一

**問題:**
- Connect4: `text-2xl sm:text-4xl`
- Geister: `text-2xl sm:text-4xl`
- Xiangqi: `text-2xl sm:text-3xl md:text-4xl` ← mdが追加

**推奨:** 全ゲームでBreakpoint戦略を統一

---

### 12. エラーメッセージがユーザーフレンドリーでない

**例:**
```typescript
throw new Error('このゲームの参加者ではありません'); // 技術的すぎる
throw new Error('その位置には配置できません'); // 理由が不明
```

**推奨:**
```typescript
throw new Error('この位置には配置できません（下に駒が必要です）');
throw new Error('ゲームに参加していないため操作できません');
```

---

### 13. ローディング状態の表示が不統一

**CPU思考中:** ✅ 全ゲームでオーバーレイ表示  
**初期ロード:** ❌ Canvas（Connect4）の初期ロード時に何も表示されない

---

### 14. キーボード操作のサポートがない

**問題:**
- ゲーム盤面がマウス操作のみ
- Tabキーでのフォーカス移動が不自然
- WCAG 2.1 アクセシビリティ基準に違反

**影響:** 身体障害者、キーボードのみユーザーがプレイ不可能

**推奨:** 各ゲームでキーボード操作を実装
- 矢印キーでセル移動
- EnterまたはSpaceで選択/配置
- Escapeで選択解除

**ノート:** Geisterは既に実装済み ✅

---

### 15. Connect4/Xiangqiのルールがまだ画面を占有

**状態:** Geisterのみモーダル化完了 ✅  
**未対応:** Connect4とXiangqiは部分的に修正済みだがモーダル未完成

---

### 16. SetupBoardのタイムアウト後のボタンvisualフィードバック

**問題:** `isTimedOut`時に`opacity-50`だが、カーソルは`cursor-not-allowed`
- ユーザーはクリックしようとする可能性あり

**推奨:** disabledボタンのスタイルを強化

---

### 17. Geisterエンジンの二重ターンチェック

**問題:** AIとengineの両方でターンチェック
- 無駄な処理
- エラーメッセージが同じで原因特定が困難

**推奨:** AIのターンチェックを削除（engineでチェック済み）

---

## 🟢 優先度：低（Medium） - 6件

### 18. console.logが本番コードに残っている

**問題:** 多数のconsole.log/console.errorが残っている
**推奨:** 開発時のみログ出力、本番では削除または環境変数で制御

---

### 19. TypeScriptの`!`演算子の多用

**問題:** `gameState!.winner`など、null/undefinedの可能性があるのに`!`で強制
**推奨:** 適切なnullチェックまたはOptional Chaining使用

---

### 20. 3ゲームでコンポーネントの重複

**問題:** CPU対戦ページのロジックがほぼ同じなのに重複
**推奨:** 共通化できる部分を抽出（難易度選択、先攻後攻選択など）

---

### 21. ゲーム終了時のアニメーションが不統一

- Connect4: アニメーションなし
- Geister: `animate-[fadeIn_0.5s_ease-in]`, `animate-[bounce_1s_ease-in-out]`
- Xiangqi: アニメーションなし

**推奨:** 全ゲームでアニメーション統一

---

### 22. 待った機能の履歴管理が非効率

**問題:** `history.length >= 3`で判定
- 初期状態を含むため、実質2手以上必要
- コメントと実装が不一致

**推奨:** コメントを明確化、または判定ロジックを改善

---

### 23. モバイル対応のタッチ操作最適化不足

**問題:** 
- Connect4の3D操作がスマホで難しい
- ボタンのタッチターゲットが小さい箇所がある

**推奨:** タッチターゲットを44x44px以上に統一

---

## 修正優先順位

### Phase 1（即座に対応すべき）
1. ✅ ガイスターの座標変換バグ修正（完了）
2. ❌ Error Boundaryの実装（app/error.tsx）
3. ⚠️ AIの合法手エラー対応（フォールバック処理）
4. ❌ Toast通知にrole="alert"とaria-live追加
5. ❌ Connect4/Xiangqiのゲーム終了時にrole="alert"追加

### Phase 2（1週間以内）
6. ❌ Connect4Board3DにSuspense fallbackとエラーハンドリング
7. ❌ ボタンにfocus:ring追加
8. ⚠️ Connect4/Xiangqiのルールをモーダル化（部分完了）
9. ❌ エラーメッセージをユーザーフレンドリーに改善
10. ❌ Xiangqiのminimax タイムアウト追加

### Phase 3（2週間以内）
11. ❌ Connect4/Xiangqiでキーボード操作サポート追加
12. ❌ レスポンシブデザインのブレークポイント統一
13. ❌ console.logの整理（環境変数で制御）
14. ❌ TypeScriptの`!`演算子を適切なnullチェックに変更
15. ❌ コンポーネントの重複を削減

---

## テスト結果

### 自動テスト
- ✅ Connect4 AI: 8テスト全て通過
- ✅ Geister AI: 6テスト全て通過
- ❌ Xiangqi AI: テストなし

### 手動テスト（推奨）
1. [ ] 各ゲームで50手以上プレイしてエラーが出ないか確認
2. [ ] スマホ（iOS/Android）で操作性確認
3. [ ] キーボードのみでの操作性確認
4. [ ] スクリーンリーダー（NVDA/VoiceOver）で読み上げ確認
5. [ ] WebGL非対応ブラウザでConnect4が表示されるか確認

---

## まとめ

**現状評価:**
- 基本的なゲームロジック: ⭐⭐⭐⭐☆ (4/5)
- UI/UX品質: ⭐⭐⭐☆☆ (3/5)
- エラー処理: ⭐⭐☆☆☆ (2/5)
- アクセシビリティ: ⭐⭐☆☆☆ (2/5)
- テストカバレッジ: ⭐⭐⭐☆☆ (3/5)

**総合評価:** ⭐⭐⭐☆☆ (3/5)

ゲームとして遊べる品質には達していますが、**エラー処理とアクセシビリティの改善が急務**です。特にError Boundaryの未実装は重大なリスクです。

Phase 1の5項目を完了すれば、安定性とアクセシビリティが大幅に向上します。
