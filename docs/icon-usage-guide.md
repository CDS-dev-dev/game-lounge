# アイコン使用ガイド - Lucide React

## 📦 インストール済み

```bash
npm install lucide-react
```

## 🎨 基本的な使い方

### インポート
```tsx
import { Ghost, Sparkles, Users, Trophy, Gamepad2 } from 'lucide-react';
```

### 使用例
```tsx
// サイズと色を指定
<Ghost size={24} className="text-indigo-600" />
<Users size={32} color="#6366f1" />

// ストロークの太さ調整
<Gamepad2 strokeWidth={1.5} />
```

---

## 🎮 ゲーム別おすすめアイコン

### ガイスター
```tsx
import { Ghost, Skull } from 'lucide-react';
<Ghost /> {/* 良いおばけ */}
<Skull /> {/* 悪いおばけ */}
```

### 立体四目並べ
```tsx
import { Grid3x3, Box } from 'lucide-react';
<Grid3x3 /> {/* グリッド */}
<Box /> {/* 3D */}
```

### 中国象棋
```tsx
import { Crown, Shield } from 'lucide-react';
<Crown /> {/* 将 */}
<Shield /> {/* 象棋全般 */}
```

### エンペラー
```tsx
import { Crown, Zap } from 'lucide-react';
<Crown /> {/* 皇帝 */}
<Zap /> {/* カイジ要素 */}
```

### タイガー&ドラゴン
```tsx
import { Flame } from 'lucide-react';
<Flame /> {/* ドラゴン */}
```

### アイランドセトラーズ
```tsx
import { Palmtree, Home } from 'lucide-react';
<Palmtree /> {/* 島 */}
<Home /> {/* 開拓 */}
```

### インディアンポーカー
```tsx
import { Spade, Heart, Diamond, Club } from 'lucide-react';
<Spade /> {/* トランプ */}
```

### テキサスホールデム
```tsx
import { Spade, Coins } from 'lucide-react';
<Spade /> {/* ポーカー */}
<Coins /> {/* チップ */}
```

---

## 🎯 共通UIアイコン

### ナビゲーション
```tsx
import { Home, Menu, ArrowLeft, X } from 'lucide-react';

<Home />      {/* ホーム */}
<Menu />      {/* メニュー */}
<ArrowLeft /> {/* 戻る */}
<X />         {/* 閉じる */}
```

### アクション
```tsx
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

<Play />      {/* 開始 */}
<Pause />     {/* 一時停止 */}
<RotateCcw /> {/* リプレイ */}
<Settings />  {/* 設定 */}
```

### ステータス
```tsx
import { Check, AlertCircle, Info, Trophy } from 'lucide-react';

<Check />        {/* 成功 */}
<AlertCircle />  {/* エラー */}
<Info />         {/* 情報 */}
<Trophy />       {/* 勝利 */}
```

### ゲームモード
```tsx
import { Cpu, Users, Globe } from 'lucide-react';

<Cpu />    {/* CPU対戦 */}
<Users />  {/* ローカル対戦 */}
<Globe />  {/* オンライン対戦 */}
```

---

## 💡 実装例

### ボタンにアイコン追加
```tsx
import { Play } from 'lucide-react';

<Button variant="primary">
  <Play size={20} className="mr-2" />
  ゲーム開始
</Button>
```

### モード選択カード
```tsx
import { Cpu, Users, Globe } from 'lucide-react';

<Card>
  <Cpu size={48} className="text-indigo-600 mb-4" />
  <h3>CPU対戦</h3>
  <p>AIと対戦</p>
</Card>
```

### ゲームヘッダー
```tsx
import { Ghost } from 'lucide-react';

<GameHeader 
  title={
    <div className="flex items-center gap-2">
      <Ghost size={24} />
      ガイスター
    </div>
  }
/>
```

---

## 🔍 アイコン検索

公式サイトで検索: https://lucide.dev/icons/

**カテゴリ**:
- Gaming: Gamepad2, Dices, Trophy
- Social: Users, UserPlus, MessageCircle
- Navigation: Home, ArrowLeft, Menu
- Actions: Play, Pause, RotateCcw
- Status: Check, X, AlertCircle

---

## 🎨 カスタマイズ

### サイズ
```tsx
<Ghost size={16} />  {/* 小 */}
<Ghost size={24} />  {/* 中 */}
<Ghost size={32} />  {/* 大 */}
```

### 色（Tailwind）
```tsx
<Ghost className="text-indigo-600" />
<Ghost className="text-red-500" />
<Ghost className="text-gray-400" />
```

### ストローク
```tsx
<Ghost strokeWidth={1} />    {/* 細い */}
<Ghost strokeWidth={2} />    {/* 標準 */}
<Ghost strokeWidth={3} />    {/* 太い */}
```

### アニメーション
```tsx
<Ghost className="animate-spin" />
<Ghost className="hover:scale-110 transition-transform" />
```

---

**更新日: 2026-06-02**
