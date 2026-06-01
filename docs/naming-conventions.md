# 命名規約

## 概要

コードベース全体で一貫した命名規則を維持するためのガイドライン。

## プレイヤー識別子

### 現状の混在パターン
- `playerId`: プレイヤーの一意識別子（文字列）
- `PLAYER_ID`: 定数としてのプレイヤーID
- `playerRole`: ゲーム内の役割（'player1' | 'player2' | 'red' | 'black'）
- `currentTurn`: 現在のターンのプレイヤー役割
- `currentPlayer`: 現在のプレイヤー（ローカル対戦用）

### 推奨ルール

#### 1. プレイヤーID（識別子）
```typescript
// 定数: 大文字スネークケース
const PLAYER1_ID = 'local-player1';
const PLAYER2_ID = 'local-player2';

// 変数: キャメルケース
const playerId = currentPlayer === 'player1' ? PLAYER1_ID : PLAYER2_ID;
```

#### 2. プレイヤーロール（役割）
```typescript
// 型定義
type PlayerRole = 'player1' | 'player2' | 'red' | 'black';

// 変数名: role を含める
const playerRole: PlayerRole = 'player1';
const myRole: PlayerRole = 'player2';
```

#### 3. ターン管理
```typescript
// ゲーム状態のターン
currentTurn: PlayerRole

// ローカル対戦の現在プレイヤー
currentPlayer: PlayerRole
```

## ゲーム状態

### State vs ClientState
```typescript
// サーバー側・完全な状態
interface GameState {
  // 全情報を含む
}

// クライアント側・部分的な状態
interface GameClientState {
  // 公開情報のみ
  myRole: PlayerRole;
  isMyTurn: boolean;
}
```

## 関数命名

### イベントハンドラ
```typescript
// handleXxx パターン
const handleCellClick = () => {};
const handleUndo = () => {};
const handleReplay = () => {};
```

### ユーティリティ関数
```typescript
// 動詞 + 名詞
function createInitialState() {}
function getValidMoves() {}
function checkWinner() {}
```

## コンポーネント命名

### コンポーネント
```typescript
// PascalCase
export const Connect4Board: React.FC = () => {};
export const GeisterBoard: React.FC = () => {};
```

### Props
```typescript
// コンポーネント名 + Props
interface Connect4BoardProps {
  gameState: Connect4ClientState;
  onCellClick?: (pos: Position3D) => void;
}
```

## 定数

### 環境依存の定数
```typescript
// 大文字スネークケース
const GAME_ID = 'local-game';
const PLAYER1_ID = 'local-player1';
const BASE_URL = 'https://game-lounge-pi.vercel.app';
```

### 設定値
```typescript
// 大文字スネークケース
const BOARD_SIZE = 4;
const MAX_TURNS = 100;
```

## ファイル命名

### コンポーネント
- PascalCase: `Connect4Board.tsx`, `GeisterBoard.tsx`

### ユーティリティ
- kebab-case: `error-handler.ts`, `metadata.ts`

### フック
- camelCase: `useGameHistory.ts`, `useKeyboardNavigation.ts`

### テスト
- 対象ファイル名 + `.test.ts`: `error-handler.test.ts`

## 将来の改善

現在のコードベースには命名の混在がありますが、以下の理由から段階的な改善を推奨：

1. **影響範囲が大きい**: 6ゲームページ × 数百行の修正が必要
2. **リグレッションリスク**: 動作に影響する可能性
3. **優先度**: 機能追加・バグ修正を優先

### 改善アプローチ
1. 新規コードは必ずこの規約に従う
2. 既存コード修正時に周辺を揃える
3. 大規模リファクタリングは別PRで実施
