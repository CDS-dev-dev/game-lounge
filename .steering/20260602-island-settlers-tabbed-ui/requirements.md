# アイランドセトラーズ タブ式UI刷新

## 要求内容

### 現状の問題
- `/home/vscode/game-lounge/components/game/IslandSettlersBoard.tsx`が374行あり可読性が低い
- 全セクション（ボード、建設、交易、情報）が縦に並んでいるためモバイルで大きな縦スクロールが発生
- ゲームプレイ中に不要な情報も常時表示されており、画面が煩雑

### 目標
- タブ式UIに刷新し、必要な情報のみを表示
- コンポーネントを分割してメンテナンス性を向上
- モバイルUXを改善（スクロール削減）
- 既存のゲームロジックを維持（UIのみ変更）

### スコープ
- **対象**: IslandSettlersBoardコンポーネントのみ
- **変更範囲**: UIレイアウトとコンポーネント構成
- **不変**: ゲームロジック、状態管理、propsインターフェース

## 成果物
1. 新しいディレクトリ構造: `components/game/island-settlers/`
2. タブ別コンポーネント: BoardTab、BuildTab、TradeTab、InfoTab
3. メインコンポーネント: IslandSettlersBoardTabbed.tsx
4. 既存ファイルのバックアップ: IslandSettlersBoardOld.tsx
