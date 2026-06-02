# カードゲーム共通コンポーネント

トランプカードを使用したゲームで利用できる共通コンポーネント群です。

## 構成ファイル

```
components/game/card/
├── Card.tsx        # トランプカード表示
├── Deck.tsx        # デッキ・捨て札表示
├── Hand.tsx        # 手札表示
├── index.ts        # エクスポート
└── README.md       # このファイル

lib/utils/
└── card-utils.ts   # カードユーティリティ関数
```

## コンポーネント一覧

### PlayingCard（単体カード表示）

トランプカード1枚を表示するコンポーネント。

#### 特徴
- 52枚 + ジョーカー2枚対応
- 裏面表示対応
- サイズバリエーション（small, medium, large）
- 選択状態の表示
- クリック可能

#### 使用例

```tsx
import { PlayingCard } from '@/components/game/card';
import { Card } from '@/lib/utils/card-utils';

const card: Card = {
  suit: 'hearts',
  rank: 'A',
  id: 'hearts-A'
};

// 表面表示
<PlayingCard card={card} size="medium" />

// 裏面表示
<PlayingCard card={card} faceDown size="medium" />

// クリック可能・選択状態
<PlayingCard
  card={card}
  size="medium"
  onClick={() => console.log('clicked')}
  selected={true}
/>

// 空スロット
<PlayingCard card={null} size="medium" />
```

### Deck（デッキ表示）

複数枚のカードを重ねて表示し、残り枚数を表示します。

#### 特徴
- カードの重なり表現
- 残り枚数の表示
- クリックでカードを引く操作

#### 使用例

```tsx
import { Deck } from '@/components/game/card';

<Deck
  cardCount={52}
  size="medium"
  onDraw={() => drawCard()}
/>
```

### DiscardPile（捨て札表示）

捨て札の山を表示します。一番上のカードが表向きで見えます。

#### 使用例

```tsx
import { DiscardPile } from '@/components/game/card';

<DiscardPile
  topCard={lastDiscardedCard}
  cardCount={10}
  size="medium"
/>
```

### Hand（手札表示）

複数枚のカードを手札として表示します。

#### 特徴
- 3つのレイアウト（spread, stack, fan）
- カードの選択機能
- 大量のカード対応

#### レイアウトの種類

- **spread**: 横並びに配置（デフォルト）
- **stack**: 少しずつずらして重ねる
- **fan**: 扇状に配置

#### 使用例

```tsx
import { Hand } from '@/components/game/card';

const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

const handleCardClick = (card: Card, index: number) => {
  setSelectedIndices(prev =>
    prev.includes(index)
      ? prev.filter(i => i !== index)
      : [...prev, index]
  );
};

<Hand
  cards={handCards}
  size="medium"
  layout="fan"
  onCardClick={handleCardClick}
  selectedIndices={selectedIndices}
/>

// 他プレイヤーの手札（裏面）
<Hand
  cards={opponentCards}
  faceDown
  size="small"
  layout="stack"
/>
```

## ユーティリティ関数

### カード生成

```tsx
import {
  createStandardDeck,
  createDeckWithJokers,
  shuffleDeck,
} from '@/lib/utils/card-utils';

// 52枚デッキ生成
const deck = createStandardDeck();

// ジョーカー入り54枚デッキ生成
const deckWithJokers = createDeckWithJokers();

// シャッフル
const shuffled = shuffleDeck(deck);
```

### カード操作

```tsx
import { drawCards } from '@/lib/utils/card-utils';

// デッキからカードを引く
const { drawn, remaining } = drawCards(deck, 5);
```

### カード情報取得

```tsx
import {
  getSuitDisplay,
  getSuitColor,
  getRankValue,
  getCardDisplayString,
} from '@/lib/utils/card-utils';

const card = { suit: 'hearts', rank: 'A', id: 'hearts-A' };

getSuitDisplay(card.suit);      // '♥'
getSuitColor(card.suit);        // 'red'
getRankValue(card.rank);        // 1
getCardDisplayString(card);     // '♥A'
```

## エラーハンドリング

すべてのコンポーネントとユーティリティ関数は、エラーハンドリングを実装しています。

- コンソールにエラーログを出力
- ユーザーにわかりやすいエラー表示
- 例外をスローして呼び出し元で捕捉可能

## テスト

テストページで動作確認ができます。

```
/test/card-components
```

## スタイリング

- Tailwind CSSを使用
- レスポンシブデザイン（スマホ・PC対応）
- 既存のUIコンポーネント（Button, Cardなど）との統一感

## 使用例：ゲームでの利用

### インディアンポーカー

```tsx
// 自分のカードは裏面、他人のカードは表面
<PlayingCard
  card={player.card}
  faceDown={player.id === currentPlayerId}
  size="large"
/>
```

### テキサスホールデム

```tsx
// 自分の手札
<Hand
  cards={myHoleCards}
  size="large"
  layout="spread"
/>

// 共有カード
<div className="flex gap-2">
  {communityCards.map(card => (
    <PlayingCard key={card.id} card={card} size="medium" />
  ))}
</div>
```

### ドラゴンタイガー

```tsx
// ドラゴン側のカード
<PlayingCard
  card={dragonCard}
  size="large"
/>

// タイガー側のカード
<PlayingCard
  card={tigerCard}
  size="large"
/>
```

## 今後の拡張案

- アニメーション（配布、移動、フリップ）
- サウンドエフェクト
- カスタムデザインのサポート
- 他のカードゲーム対応（UNO、麻雀など）
