# 設計書: アイランドセトラーズ タブ式UI

## アーキテクチャ

### ファイル構成
```
components/game/island-settlers/
  ├── IslandSettlersBoardTabbed.tsx  # メインコンポーネント（親）
  ├── BoardTab.tsx                   # ボードタブ（盤面とサイコロ）
  ├── BuildTab.tsx                   # 建設タブ（道路・村・町）
  ├── TradeTab.tsx                   # 交易タブ（資源交換）
  ├── InfoTab.tsx                    # 情報タブ（プレイヤー情報・履歴）
  └── IslandSettlersBoardOld.tsx     # バックアップ
```

### タブ構成

#### 1. ボードタブ 🎮
- 6×6グリッドのゲーム盤面
- サイコロ表示とサイコロボタン
- 現在のターン情報（最小限）
- 建設モード時の視覚的フィードバック

#### 2. 建設タブ 🏗️
- 道路/村/町の建設ボタン
- 各建設物のコスト表示
- 残り建設可能数の表示
- 資源が足りない場合の無効化

#### 3. 交易タブ 💱
- 資源交換UI（4:1レート）
- 渡す資源と受け取る資源のセレクトボックス
- 交易可能かのバリデーション

#### 4. 情報タブ 📊
- 全プレイヤーの資源・スコア一覧
- 自分の資源詳細
- ターン履歴（オプション）

## 状態管理

### 親コンポーネント（IslandSettlersBoardTabbed）
- `buildMode`: 建設モード状態
- `roadStart`: 道路建設の開始地点
- `tradeGive`, `tradeReceive`: 交易設定

### 各タブコンポーネント
- propsでゲーム状態と操作関数を受け取る
- 状態は親コンポーネントで一元管理

## インターフェース

### 既存のprops（維持）
```typescript
interface IslandSettlersBoardProps {
  gameState: IslandSettlersClientState;
  onRollDice?: () => void;
  onBuildRoad?: (from: Position, to: Position) => void;
  onBuildVillage?: (position: Position) => void;
  onBuildTown?: (position: Position) => void;
  onTrade?: (give: ResourceType, receive: ResourceType) => void;
  onEndTurn?: () => void;
}
```

### 各タブコンポーネントのprops
- BoardTab: gameState, onRollDice, onTileClick, buildMode, roadStart
- BuildTab: gameState, canAfford, setBuildMode, cancelBuildMode, buildMode
- TradeTab: gameState, onTrade, tradeState, setTradeState
- InfoTab: gameState

## レスポンシブ対応
- モバイル: タブは横スクロール可能
- デスクトップ: タブリストは1行表示
- ブレークポイント: sm (640px), md (768px), lg (1024px)

## アクセシビリティ
- ARIA属性（role, aria-selected, tabindex）
- キーボード操作対応（Enter, Space, Arrow keys）
- フォーカス管理
