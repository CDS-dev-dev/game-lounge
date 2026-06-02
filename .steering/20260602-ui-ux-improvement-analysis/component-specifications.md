# 共通コンポーネント仕様書

**作成日**: 2026-06-02

---

## 1. Tabs コンポーネント

### 目的
複雑な情報を複数のタブに分割し、1画面内での縦スクロールを削減する。

### 使用例
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

<Tabs defaultValue="board" className="w-full">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="board">🎮 ボード</TabsTrigger>
    <TabsTrigger value="actions">⚡ アクション</TabsTrigger>
    <TabsTrigger value="info">📊 情報</TabsTrigger>
  </TabsList>
  
  <TabsContent value="board">
    <GameBoard />
  </TabsContent>
  
  <TabsContent value="actions">
    <ActionPanel />
  </TabsContent>
  
  <TabsContent value="info">
    <InfoPanel />
  </TabsContent>
</Tabs>
```

### Props
```typescript
interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}
```

### スタイル
- タブボタン: 最小高さ48px（タップしやすさ）
- アクティブタブ: 下線 or 背景色変更
- トランジション: スムーズなフェードイン/アウト

### アクセシビリティ
- キーボード操作対応（矢印キー）
- ARIA属性（role="tablist", role="tab", role="tabpanel"）
- フォーカス管理

---

## 2. Accordion（折りたたみセクション）

### 目的
詳細情報を折りたたみ、必要時のみ展開して表示する。

### 使用例
```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/Accordion';

<Accordion type="single" collapsible defaultValue="players">
  <AccordionItem value="players">
    <AccordionTrigger>
      👥 プレイヤー情報 (4人)
    </AccordionTrigger>
    <AccordionContent>
      {players.map(player => (
        <PlayerCard key={player.id} {...player} />
      ))}
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="captured">
    <AccordionTrigger>
      🏴 捕獲した駒 (5個)
    </AccordionTrigger>
    <AccordionContent>
      <CapturedPiecesDisplay />
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### Props
```typescript
interface AccordionProps {
  type: 'single' | 'multiple'; // 単一展開 or 複数展開
  collapsible?: boolean; // 全て閉じることを許可
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  className?: string;
  children: React.ReactNode;
}

interface AccordionItemProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface AccordionTriggerProps {
  className?: string;
  children: React.ReactNode;
}

interface AccordionContentProps {
  className?: string;
  children: React.ReactNode;
}
```

### スタイル
- トリガー: 最小高さ48px、右側に展開/折りたたみアイコン（▼/▲）
- アニメーション: height のトランジション
- コンテンツ: padding で余白確保

### アクセシビリティ
- ARIA属性（aria-expanded, aria-controls）
- キーボード操作（Enter/Space で展開/折りたたみ）

---

## 3. IconButton（アイコンボタン）

### 目的
スペースを節約しつつ、明確なアクションを提供する。

### 使用例
```tsx
import { IconButton } from '@/components/ui/IconButton';

<IconButton
  icon="❌"
  label="フォールド"
  onClick={handleFold}
  variant="danger"
  size="medium"
  showLabel="hover" // 'always' | 'hover' | 'never'
/>

<IconButton
  icon="✓"
  label="チェック"
  onClick={handleCheck}
  variant="success"
  disabled={!canCheck}
/>
```

### Props
```typescript
interface IconButtonProps {
  icon: React.ReactNode | string; // 絵文字 or JSX
  label: string; // アクセシビリティ用
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'small' | 'medium' | 'large';
  showLabel?: 'always' | 'hover' | 'never';
  disabled?: boolean;
  className?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}
```

### スタイル
```typescript
const sizes = {
  small: 'w-10 h-10 text-sm',
  medium: 'w-12 h-12 text-base',
  large: 'w-14 h-14 text-lg',
};

const variants = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white',
  secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
  success: 'bg-green-500 hover:bg-green-600 text-white',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
};
```

### アクセシビリティ
- aria-label でラベル提供
- title 属性でツールチップ
- disabled 時は aria-disabled="true"
- フォーカス可能

---

## 4. FloatingActionButton（FAB）

### 目的
常にアクセス可能なアクションを画面の隅に配置する。

### 使用例
```tsx
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';

<FloatingActionButton
  icon="💱"
  label="交易"
  onClick={() => setShowTradeModal(true)}
  position="bottom-right"
  badge={tradeCount}
/>

// 複数アクション
<FloatingActionButton
  icon="+"
  label="アクション"
  position="bottom-right"
  actions={[
    { icon: '🏗️', label: '建設', onClick: handleBuild },
    { icon: '💱', label: '交易', onClick: handleTrade },
    { icon: '🎲', label: 'サイコロ', onClick: handleRoll },
  ]}
/>
```

### Props
```typescript
interface FloatingActionButtonProps {
  icon: React.ReactNode | string;
  label: string;
  onClick?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  badge?: number | string; // 通知バッジ
  actions?: FloatingAction[]; // サブアクション
  className?: string;
}

interface FloatingAction {
  icon: React.ReactNode | string;
  label: string;
  onClick: () => void;
}
```

### スタイル
- サイズ: 56×56px（モバイル標準）
- 位置: fixed、画面端から16px
- シャドウ: 大きめのドロップシャドウ
- アニメーション: ホバー時に拡大

### 配置
```css
.fab-bottom-right {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 1000;
}
```

### アクセシビリティ
- aria-label
- フォーカス可能
- サブアクション展開時のフォーカス管理

---

## 5. CompactPlayerCard（コンパクトプレイヤーカード）

### 目的
プレイヤー情報を最小限のスペースで表示し、詳細はホバー/タップで表示。

### 使用例
```tsx
import { CompactPlayerCard } from '@/components/ui/CompactPlayerCard';

<CompactPlayerCard
  player={{
    id: 'p1',
    name: 'プレイヤー1',
    avatar: '👤',
    chips: 1500,
    maxChips: 2000,
    isCurrent: true,
    isCPU: false,
  }}
  showDetails="hover" // 'always' | 'hover' | 'never'
  size="small"
/>
```

### Props
```typescript
interface CompactPlayerCardProps {
  player: {
    id: string;
    name: string;
    avatar?: string | React.ReactNode;
    chips?: number;
    maxChips?: number;
    score?: number;
    isCurrent: boolean;
    isCPU: boolean;
    status?: 'active' | 'folded' | 'finished';
  };
  showDetails?: 'always' | 'hover' | 'never';
  size?: 'small' | 'medium' | 'large';
  orientation?: 'horizontal' | 'vertical';
  onClick?: () => void;
  className?: string;
}
```

### レイアウト（horizontal, small）
```
┌──────────────────────┐
│ 👤 P1  💰███░░ 1500  │ ← 40px height
└──────────────────────┘
```

### レイアウト（vertical, medium）
```
┌──────┐
│  👤  │
│  P1  │
│ 💰75%│
│ 1500 │
└──────┘
```

### 詳細ポップオーバー（hover時）
```
┌──────────────────────┐
│ 👤 プレイヤー1       │
│ ━━━━━━━━━━━━━━━━━━━ │
│ 💰 チップ: 1500/2000 │
│ 📊 勝率: 45%         │
│ 🎯 今回のベット: 50  │
└──────────────────────┘
```

---

## 6. ProgressBar（プログレスバー）

### 目的
数値を視覚的にわかりやすく表示する（チップ残量、時間など）。

### 使用例
```tsx
import { ProgressBar } from '@/components/ui/ProgressBar';

<ProgressBar
  value={player.chips}
  max={initialChips}
  color="yellow"
  size="small"
  showLabel={true}
  label={`${player.chips}💰`}
  variant="flat" // 'flat' | 'rounded' | 'pill'
/>
```

### Props
```typescript
interface ProgressBarProps {
  value: number;
  max: number;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  label?: string;
  variant?: 'flat' | 'rounded' | 'pill';
  animated?: boolean;
  className?: string;
}
```

### スタイル
```typescript
const sizes = {
  small: 'h-1',
  medium: 'h-2',
  large: 'h-3',
};

const colors = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
  gray: 'bg-gray-500',
};
```

### アニメーション（animated=true）
- トランジション: width 0.3s ease
- グラデーション移動（無限ループ）

---

## 7. InfoTooltip（情報ツールチップ）

### 目的
簡潔なアイコンに詳細説明を添える。

### 使用例
```tsx
import { InfoTooltip } from '@/components/ui/InfoTooltip';

<div className="flex items-center gap-2">
  <span>1周ボーナス</span>
  <InfoTooltip content="全員がパスした時に得られるボーナス。上がり時に追加得点として加算されます。">
    ℹ️
  </InfoTooltip>
</div>
```

### Props
```typescript
interface InfoTooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: string;
  children: React.ReactNode;
}
```

### スタイル
- 背景: 半透明黒 (bg-black/90)
- テキスト: 白、12-14px
- パディング: 8-12px
- 矢印: ポジションに応じて表示

---

## 8. QuickActionMenu（クイックアクションメニュー）

### 目的
複数のアクションを1つのボタンにまとめる。

### 使用例
```tsx
import { QuickActionMenu } from '@/components/ui/QuickActionMenu';

<QuickActionMenu
  trigger={<button>⚡ アクション</button>}
  actions={[
    {
      icon: '🏗️',
      label: '道を建設',
      onClick: () => setBuildMode('road'),
      disabled: !canBuildRoad,
    },
    {
      icon: '🏘️',
      label: '村を建設',
      onClick: () => setBuildMode('village'),
      disabled: !canBuildVillage,
    },
    {
      icon: '🏛️',
      label: '町を建設',
      onClick: () => setBuildMode('town'),
      disabled: !canBuildTown,
    },
  ]}
  position="top"
/>
```

### Props
```typescript
interface QuickActionMenuProps {
  trigger: React.ReactNode;
  actions: QuickAction[];
  position?: 'top' | 'bottom';
  className?: string;
}

interface QuickAction {
  icon: React.ReactNode | string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  badge?: string | number;
}
```

### スタイル
- メニュー: 白背景、ドロップシャドウ
- アイテム: 48px高さ、ホバー時背景色変更
- アニメーション: フェードイン + スライド

---

## 実装順序

### フェーズ1: 基本コンポーネント
1. Tabs
2. Accordion
3. IconButton

### フェーズ2: 応用コンポーネント
4. FloatingActionButton
5. CompactPlayerCard
6. ProgressBar

### フェーズ3: 補助コンポーネント
7. InfoTooltip
8. QuickActionMenu

---

## テスト戦略

### ユニットテスト
- 各コンポーネントの基本機能
- Props のバリエーション
- イベントハンドラーの動作

### アクセシビリティテスト
- キーボード操作
- スクリーンリーダー対応
- ARIA属性の正確性

### ビジュアルリグレッションテスト
- Storybook でのスナップショット
- 各ブレークポイントでの表示確認

---

## パフォーマンス考慮事項

### 最適化
- React.memo でのメモ化
- useCallback/useMemo の活用
- 不要な再レンダリングの防止

### 遅延読み込み
- モーダル/ポップオーバーのコンテンツ
- 大きな画像/アニメーション

### バンドルサイズ
- Tree-shaking 可能な構造
- アイコンライブラリの選択的インポート
