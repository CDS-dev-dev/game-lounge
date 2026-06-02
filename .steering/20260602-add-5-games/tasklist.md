# 5ゲーム追加 - タスクリスト

## フェーズ1: 共通基盤（2-3日）

### 共通コンポーネント
- [ ] Card.tsx - トランプカード表示コンポーネント
- [ ] Deck.tsx - デッキ表示コンポーネント
- [ ] Hand.tsx - 手札表示コンポーネント
- [ ] PlayerCountSelector.tsx - プレイヤー人数選択
- [ ] MatchingWaitingRoom.tsx - マッチング待機画面（CPU混在対応）
- [ ] ChipDisplay.tsx - チップ/コイン表示
- [ ] BettingControls.tsx - ベット操作UI

### ユーティリティ
- [ ] lib/utils/card-utils.ts - カードシャッフル、デッキ生成
- [ ] lib/utils/poker-utils.ts - ポーカー役判定（テキサスホールデム用）
- [ ] lib/hooks/useMultiplayerGame.ts - 多人数ゲーム共通ロジック

---

## フェーズ2: インディアンポーカー（2-3日）

### ゲームロジック
- [ ] lib/games/indian-poker/types.ts
- [ ] lib/games/indian-poker/constants.ts
- [ ] lib/games/indian-poker/engine.ts
  - [ ] ゲーム初期化
  - [ ] カード配布
  - [ ] ベッティング処理
  - [ ] ショーダウン
  - [ ] 勝敗判定
- [ ] lib/games/indian-poker/ai.ts
  - [ ] Easy AI
  - [ ] Medium AI
  - [ ] Hard AI
- [ ] lib/games/indian-poker/engine.test.ts

### UI実装
- [ ] components/game/IndianPokerBoard.tsx
- [ ] app/games/indian-poker/page.tsx - モード選択
- [ ] app/games/indian-poker/online/page.tsx
- [ ] app/games/indian-poker/local/page.tsx
- [ ] app/games/indian-poker/cpu/page.tsx
- [ ] app/games/indian-poker/rules/page.tsx

### 統合
- [ ] ゲーム選択画面に追加
- [ ] SEO対応（構造化データ）
- [ ] テスト・デバッグ

---

## フェーズ3: ドラゴンタイガー（1-2日）

### ゲームロジック
- [ ] lib/games/dragon-tiger/types.ts
- [ ] lib/games/dragon-tiger/constants.ts
- [ ] lib/games/dragon-tiger/engine.ts
  - [ ] ゲーム初期化
  - [ ] ベッティング処理
  - [ ] カード配布
  - [ ] 勝敗判定
  - [ ] 配当計算
- [ ] lib/games/dragon-tiger/ai.ts
- [ ] lib/games/dragon-tiger/engine.test.ts

### UI実装
- [ ] components/game/DragonTigerBoard.tsx
- [ ] app/games/dragon-tiger/page.tsx
- [ ] app/games/dragon-tiger/online/page.tsx
- [ ] app/games/dragon-tiger/local/page.tsx
- [ ] app/games/dragon-tiger/cpu/page.tsx
- [ ] app/games/dragon-tiger/rules/page.tsx

### 統合
- [ ] ゲーム選択画面に追加
- [ ] SEO対応
- [ ] テスト・デバッグ

---

## フェーズ4: エンペラーゲーム（2-3日）

### ゲームロジック
- [ ] lib/games/emperor/types.ts
- [ ] lib/games/emperor/constants.ts
- [ ] lib/games/emperor/engine.ts
  - [ ] ゲーム初期化
  - [ ] カード配布（階級決定）
  - [ ] コイン移動処理
  - [ ] 破産判定
  - [ ] 勝敗判定
- [ ] lib/games/emperor/ai.ts
  - [ ] リスク計算
  - [ ] 期待値計算
- [ ] lib/games/emperor/engine.test.ts

### UI実装
- [ ] components/game/EmperorBoard.tsx
- [ ] app/games/emperor/page.tsx
- [ ] app/games/emperor/online/page.tsx
- [ ] app/games/emperor/local/page.tsx
- [ ] app/games/emperor/cpu/page.tsx
- [ ] app/games/emperor/rules/page.tsx

### 統合
- [ ] ゲーム選択画面に追加
- [ ] SEO対応
- [ ] テスト・デバッグ

---

## フェーズ5: テキサスホールデム（3-5日）

### ゲームロジック
- [ ] lib/games/texas-holdem/types.ts
- [ ] lib/games/texas-holdem/constants.ts
- [ ] lib/games/texas-holdem/poker-hands.ts
  - [ ] 役判定ロジック
  - [ ] ハンドランキング
  - [ ] 勝者決定
- [ ] lib/games/texas-holdem/engine.ts
  - [ ] ゲーム初期化
  - [ ] ブラインド処理
  - [ ] カード配布
  - [ ] ベッティングラウンド
  - [ ] フロップ/ターン/リバー
  - [ ] ショーダウン
  - [ ] ポット分配
- [ ] lib/games/texas-holdem/ai.ts
  - [ ] ハンドレンジ
  - [ ] ポットオッズ計算
  - [ ] ポジション戦略
- [ ] lib/games/texas-holdem/poker-hands.test.ts
- [ ] lib/games/texas-holdem/engine.test.ts

### UI実装
- [ ] components/game/TexasHoldemBoard.tsx
  - [ ] コミュニティカード表示
  - [ ] プレイヤーハンド表示
  - [ ] ベット操作UI
  - [ ] ポット表示
- [ ] app/games/texas-holdem/page.tsx
- [ ] app/games/texas-holdem/online/page.tsx
- [ ] app/games/texas-holdem/local/page.tsx
- [ ] app/games/texas-holdem/cpu/page.tsx
- [ ] app/games/texas-holdem/rules/page.tsx

### 統合
- [ ] ゲーム選択画面に追加
- [ ] SEO対応
- [ ] テスト・デバッグ

---

## フェーズ6: アイランドセトラーズ（7-14日）

### ゲームロジック
- [ ] lib/games/island-settlers/types.ts
- [ ] lib/games/island-settlers/constants.ts
- [ ] lib/games/island-settlers/board-generator.ts
  - [ ] ランダムボード生成
  - [ ] バランス調整
- [ ] lib/games/island-settlers/engine.ts
  - [ ] ゲーム初期化
  - [ ] 初期配置フェーズ
  - [ ] サイコロ処理
  - [ ] 資源獲得
  - [ ] 建設処理
  - [ ] 交易処理
  - [ ] 得点計算
  - [ ] 勝敗判定
- [ ] lib/games/island-settlers/ai.ts
  - [ ] 資源期待値計算
  - [ ] 建設優先度
  - [ ] 拡大戦略
- [ ] lib/games/island-settlers/board-generator.test.ts
- [ ] lib/games/island-settlers/engine.test.ts

### UI実装
- [ ] components/game/IslandSettlersBoard.tsx
  - [ ] グリッドボード表示
  - [ ] タイル表示
  - [ ] 村・町・道の表示
  - [ ] 建設UI
  - [ ] 資源表示
  - [ ] 交易UI
- [ ] app/games/island-settlers/page.tsx
- [ ] app/games/island-settlers/online/page.tsx
- [ ] app/games/island-settlers/local/page.tsx
- [ ] app/games/island-settlers/cpu/page.tsx
- [ ] app/games/island-settlers/rules/page.tsx

### 統合
- [ ] ゲーム選択画面に追加
- [ ] SEO対応
- [ ] テスト・デバッグ

---

## フェーズ7: 統合テスト・品質向上（2-3日）

### テスト
- [ ] 全ゲームの動作確認
- [ ] オンライン対戦テスト
- [ ] CPU対戦テスト
- [ ] ローカル対戦テスト
- [ ] 多人数マッチングテスト
- [ ] CPU混在マッチングテスト

### バグ修正
- [ ] バグ修正リスト作成
- [ ] 優先度付け
- [ ] 修正実施

### パフォーマンス最適化
- [ ] レンダリング最適化
- [ ] 画像最適化
- [ ] コード分割

### アクセシビリティ
- [ ] キーボード操作確認
- [ ] スクリーンリーダー対応
- [ ] ARIA属性追加

### ドキュメント
- [ ] 各ゲームのREADME
- [ ] API仕様書更新
- [ ] デプロイ手順確認

---

## フェーズ8: デプロイ・検証（1日）

### デプロイ
- [ ] Vercel本番環境デプロイ
- [ ] デプロイ確認
- [ ] 動作検証

### 最終確認
- [ ] 全ゲームが正常動作
- [ ] UI/UXの最終チェック
- [ ] パフォーマンス確認
- [ ] SEO確認

---

## 進捗管理

### 完了基準
- [ ] 全タスク完了
- [ ] テストカバレッジ70%以上
- [ ] 既存3ゲームと同等以上の品質
- [ ] 縦スクロール不要なUI
- [ ] Vercel本番環境で正常動作

### リスク管理
- **技術的難易度**: アイランドセトラーズが最も複雑
- **スコープ調整**: 必要に応じて機能削減
- **テスト時間**: 多人数ゲームのテストに時間がかかる

### マイルストーン
1. 共通基盤完成（Day 3）
2. インディアンポーカー完成（Day 6）
3. ドラゴンタイガー完成（Day 8）
4. エンペラーゲーム完成（Day 11）
5. テキサスホールデム完成（Day 16）
6. アイランドセトラーズ完成（Day 28）
7. 統合テスト完了（Day 30）
8. 本番デプロイ（Day 31）
