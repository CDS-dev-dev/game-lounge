# 5ゲーム追加 - 設計書

## アーキテクチャ設計

### ディレクトリ構造

```
lib/games/
├── indian-poker/      # インディアンポーカー
│   ├── types.ts
│   ├── constants.ts
│   ├── engine.ts
│   ├── ai.ts
│   └── engine.test.ts
├── dragon-tiger/      # ドラゴンタイガー
│   ├── types.ts
│   ├── constants.ts
│   ├── engine.ts
│   ├── ai.ts
│   └── engine.test.ts
├── emperor/           # エンペラーゲーム
│   ├── types.ts
│   ├── constants.ts
│   ├── engine.ts
│   ├── ai.ts
│   └── engine.test.ts
├── texas-holdem/      # テキサスホールデム
│   ├── types.ts
│   ├── constants.ts
│   ├── engine.ts
│   ├── poker-hands.ts # 役判定ロジック
│   ├── ai.ts
│   └── engine.test.ts
└── island-settlers/   # アイランドセトラーズ
    ├── types.ts
    ├── constants.ts
    ├── engine.ts
    ├── board-generator.ts # ボード生成
    ├── ai.ts
    └── engine.test.ts

components/game/
├── IndianPokerBoard.tsx
├── DragonTigerBoard.tsx
├── EmperorBoard.tsx
├── TexasHoldemBoard.tsx
├── IslandSettlersBoard.tsx
└── card/              # カードゲーム共通コンポーネント
    ├── Card.tsx
    ├── Deck.tsx
    └── Hand.tsx

app/games/
├── indian-poker/
├── dragon-tiger/
├── emperor/
├── texas-holdem/
└── island-settlers/
```

### 共通コンポーネント設計

#### 1. カード表示コンポーネント
```typescript
// components/game/card/Card.tsx
interface CardProps {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades' | 'joker';
  rank: 'A' | '2' | '3' | ... | 'K' | 'Joker';
  faceDown?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}
```

#### 2. プレイヤー人数選択コンポーネント
```typescript
// components/game/PlayerCountSelector.tsx
interface PlayerCountSelectorProps {
  minPlayers: number;
  maxPlayers: number;
  onSelect: (count: number) => void;
}
```

#### 3. CPU混在マッチング待機UI
```typescript
// components/game/MatchingWaitingRoom.tsx
interface MatchingWaitingRoomProps {
  currentPlayers: number;
  requiredPlayers: number;
  allowCPU: boolean;
  onToggleCPU: () => void;
  players: PlayerInfo[];
}
```

---

## 各ゲームの詳細設計

### 1. インディアンポーカー

#### ゲームフロー
1. プレイヤー人数選択（2-10人）
2. 各プレイヤーに1枚ずつカード配布
3. **自分のカードは見えない**（額に貼るイメージ）
4. ベッティングラウンド（レイズ、コール、フォールド）
5. 全員がコールorフォールドしたらショーダウン
6. 最も強いカードを持つプレイヤーが勝利

#### データモデル
```typescript
interface IndianPokerState {
  gameId: string;
  status: 'waiting' | 'betting' | 'showdown' | 'finished';
  players: IndianPokerPlayer[];
  currentTurn: number; // プレイヤーインデックス
  pot: number; // 賭け金総額
  currentBet: number; // 現在のベット額
  deck: Card[];
  round: number;
}

interface IndianPokerPlayer {
  id: string;
  name: string;
  card: Card; // 他人には見える、自分には見えない
  chips: number; // 所持チップ
  currentBet: number; // 今ラウンドのベット額
  action: 'waiting' | 'fold' | 'call' | 'raise' | null;
  isActive: boolean;
}
```

#### UI設計
- 中央：ポット（賭け金総額）
- 各プレイヤー位置：カード（自分以外は表、自分は裏）
- 下部：アクションボタン（フォールド、コール、レイズ）

---

### 2. ドラゴンタイガー

#### ゲームフロー
1. プレイヤーがベット（ドラゴン or タイガー or タイ）
2. ディーラーがドラゴン側に1枚、タイガー側に1枚配る
3. カードを公開して勝敗判定
4. 配当を支払い

#### データモデル
```typescript
interface DragonTigerState {
  gameId: string;
  status: 'betting' | 'dealing' | 'result' | 'finished';
  players: DragonTigerPlayer[];
  dragonCard: Card | null;
  tigerCard: Card | null;
  deck: Card[];
  round: number;
}

interface DragonTigerPlayer {
  id: string;
  name: string;
  chips: number;
  currentBet: {
    type: 'dragon' | 'tiger' | 'tie';
    amount: number;
  } | null;
}
```

#### UI設計
- 左：ドラゴン側（赤）
- 右：タイガー側（青）
- 下部：ベットボタン

---

### 3. エンペラーゲーム

#### ゲームフロー
1. プレイヤー人数選択（3-6人推奨）
2. 各プレイヤーに初期コイン配布
3. 階級カード配布（皇帝1枚、市民n-2枚、奴隷1枚）
4. 階級公開
5. 奴隷が皇帝にコインを渡す
6. 次のラウンド
7. 誰かが破産したらゲーム終了

#### データモデル
```typescript
interface EmperorState {
  gameId: string;
  status: 'dealing' | 'reveal' | 'transfer' | 'finished';
  players: EmperorPlayer[];
  round: number;
  maxRounds: number;
}

interface EmperorPlayer {
  id: string;
  name: string;
  coins: number;
  role: 'emperor' | 'citizen' | 'slave' | null;
  card: Card | null;
  isActive: boolean; // 破産していない
}
```

#### UI設計
- 各プレイヤーのカード（裏→表）
- コイン数表示
- 階級バッジ

---

### 4. テキサスホールデム

#### ゲームフロー
1. プレイヤー人数選択（2-9人）
2. 各プレイヤーに2枚ずつ配布（ホールカード）
3. プリフロップベッティング
4. フロップ（共有カード3枚）→ ベッティング
5. ターン（共有カード1枚）→ ベッティング
6. リバー（共有カード1枚）→ ベッティング
7. ショーダウン（役判定）

#### データモデル
```typescript
interface TexasHoldemState {
  gameId: string;
  status: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'finished';
  players: TexasHoldemPlayer[];
  communityCards: Card[]; // 最大5枚
  pot: number;
  currentBet: number;
  dealerButton: number; // ディーラーポジション
  currentTurn: number;
  deck: Card[];
}

interface TexasHoldemPlayer {
  id: string;
  name: string;
  holeCards: [Card, Card]; // 手札2枚
  chips: number;
  currentBet: number;
  action: 'waiting' | 'fold' | 'check' | 'call' | 'raise' | 'allin' | null;
  isActive: boolean;
}

// ポーカー役の列挙
enum PokerHand {
  HighCard,
  OnePair,
  TwoPair,
  ThreeOfAKind,
  Straight,
  Flush,
  FullHouse,
  FourOfAKind,
  StraightFlush,
  RoyalFlush,
}
```

#### 役判定ロジック
```typescript
// lib/games/texas-holdem/poker-hands.ts
function evaluateHand(holeCards: Card[], communityCards: Card[]): {
  hand: PokerHand;
  rank: number; // 同じ役同士の強さ比較用
}
```

#### UI設計
- 中央：共有カード5枚 + ポット
- 各プレイヤー：手札2枚（自分は表、他は裏）
- 下部：アクションボタン

---

### 5. アイランドセトラーズ（カタン風）

#### コアメカニクス（カタンとの違い）

| 要素 | カタン | アイランドセトラーズ |
|------|--------|---------------------|
| ボード | 六角形タイル | **正方形グリッド** |
| 資源 | 5種類 | **4種類**（木材、石材、食料、金） |
| 建設物 | 道・開拓地・都市 | **道・村・町** |
| サイコロ | 2個 | **1個**（1-6） |
| 盗賊 | あり | **なし**（シンプル化） |
| 交易 | プレイヤー間 | **簡易交換**（固定レート） |
| 勝利条件 | 10点 | **8点** |

#### ゲームフロー
1. プレイヤー人数選択（3-4人）
2. ランダムボード生成
3. 初期配置（村2つ、道2本）
4. メインフェーズ繰り返し：
   - サイコロを振る
   - 資源獲得
   - 建設・交易
   - ターン終了
5. 誰かが8点到達で勝利

#### データモデル
```typescript
interface IslandSettlersState {
  gameId: string;
  status: 'setup' | 'playing' | 'finished';
  players: IslandSettlersPlayer[];
  board: BoardTile[][]; // 6x6グリッド
  currentTurn: number;
  dice: number;
  round: number;
}

interface BoardTile {
  type: 'forest' | 'mountain' | 'field' | 'water' | 'desert';
  number: number; // 1-6のいずれか
  hasVillage: string | null; // プレイヤーID
  hasTown: string | null;
}

interface IslandSettlersPlayer {
  id: string;
  name: string;
  resources: {
    wood: number;
    stone: number;
    food: number;
    gold: number;
  };
  buildings: {
    villages: number; // 残り建設可能数
    towns: number;
    roads: number;
  };
  score: number;
  color: string; // プレイヤーカラー
}
```

#### UI設計
- 中央：6x6グリッドボード
- 各タイル：資源アイコン + サイコロ目
- 右サイド：プレイヤー情報（資源、得点）
- 下部：建設ボタン、交易ボタン

---

## AI実装設計

### 難易度レベル
- **Easy**: ランダム行動
- **Medium**: 基本戦略（有利な行動を選ぶ）
- **Hard**: 高度な戦略（確率計算、相手の行動予測）

### 各ゲームのAI戦略

#### インディアンポーカー
- 他プレイヤーのカードから自分のカードを推測
- 勝率を計算してベット額を決定

#### ドラゴンタイガー
- 完全な運ゲーなので、ランダム選択

#### エンペラーゲーム
- カードの確率分布から期待値計算
- リスク管理

#### テキサスホールデム
- ハンドレンジ理論
- ポット・オッズ計算
- ポジションによる戦略変更

#### アイランドセトラーズ
- 資源の期待値計算
- 建設優先度判定
- 拡大戦略

---

## テスト設計

### 単体テスト
- ゲームエンジンのロジックテスト
- 役判定（ポーカー）
- ボード生成（アイランドセトラーズ）

### 統合テスト
- ゲームフロー全体
- AI対戦

### E2Eテスト（手動）
- UI操作
- オンライン対戦
- エラーハンドリング

---

## パフォーマンス最適化

1. **状態管理の最適化**
   - 不要な再レンダリング防止
   - useCallback, useMemoの活用

2. **画像最適化**
   - カード画像のSVG化またはスプライト化

3. **リアルタイム通信**
   - WebSocketの効率的な利用
   - 差分更新のみ送信

---

## セキュリティ考慮事項

1. **カードのシャッフル**
   - サーバーサイドで実施
   - 予測不可能な乱数生成

2. **チート対策**
   - サーバー側で全ロジック検証
   - クライアントは表示のみ

3. **入力検証**
   - 不正なベット額の拒否
   - ターン外の行動を拒否
