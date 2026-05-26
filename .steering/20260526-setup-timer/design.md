# 初期配置UI改善と時間制限 設計

## 1. 共通コンポーネント作成

### SetupBoardコンポーネント

```typescript
// components/game/SetupBoard.tsx

interface SetupBoardProps {
  myRole: 'player1' | 'player2';
  setup: PieceSetup[];
  onSetupChange: (setup: PieceSetup[]) => void;
  timeLimit?: number; // 秒数、undefined = 無制限
  onTimeout?: () => void;
  onComplete: (setup: PieceSetup[]) => void;
}
```

### 機能

1. **タイマー表示**
```typescript
const [remainingTime, setRemainingTime] = useState(timeLimit || 0);

useEffect(() => {
  if (!timeLimit) return;
  
  const timer = setInterval(() => {
    setRemainingTime(prev => {
      if (prev <= 1) {
        handleTimeout();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  
  return () => clearInterval(timer);
}, [timeLimit]);

const handleTimeout = () => {
  // 残りをランダム配置
  const randomSetup = generateRandomSetup(setup, myRole);
  onSetupChange(randomSetup);
  onTimeout?.();
  onComplete(randomSetup);
};
```

2. **ランダム配置生成**
```typescript
function generateRandomSetup(
  currentSetup: PieceSetup[],
  role: 'player1' | 'player2'
): PieceSetup[] {
  const goodCount = currentSetup.filter(s => s.type === 'good').length;
  const badCount = currentSetup.filter(s => s.type === 'bad').length;
  
  const needGood = 4 - goodCount;
  const needBad = 4 - badCount;
  
  // 配置可能位置を取得
  const allowedRows = role === 'player1' ? [0, 1] : [4, 5];
  const allowedCols = [1, 2, 3, 4];
  
  const availablePositions: Position[] = [];
  for (const y of allowedRows) {
    for (const x of allowedCols) {
      if (!currentSetup.find(s => s.position.x === x && s.position.y === y)) {
        availablePositions.push({ x, y });
      }
    }
  }
  
  // シャッフル
  const shuffled = availablePositions.sort(() => Math.random() - 0.5);
  
  const newPieces: PieceSetup[] = [];
  let goodAdded = 0;
  let badAdded = 0;
  
  for (const pos of shuffled) {
    if (goodAdded < needGood) {
      newPieces.push({
        pieceId: `auto-${role}-${currentSetup.length + newPieces.length}`,
        position: pos,
        type: 'good',
      });
      goodAdded++;
    } else if (badAdded < needBad) {
      newPieces.push({
        pieceId: `auto-${role}-${currentSetup.length + newPieces.length}`,
        position: pos,
        type: 'bad',
      });
      badAdded++;
    }
  }
  
  return [...currentSetup, ...newPieces];
}
```

3. **UI改善**

```tsx
// 駒タイプ選択（大きく分かりやすく）
<div className="flex gap-4 mb-6">
  <button
    onClick={() => setSelectedType('good')}
    className={`
      flex-1 p-6 rounded-xl border-4 transition-all
      ${selectedType === 'good' 
        ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-200' 
        : 'border-gray-300 bg-white hover:border-blue-300'}
    `}
  >
    <div className="text-6xl mb-2">👻</div>
    <div className="text-xl font-bold">Good駒</div>
    <div className="text-sm mt-2">
      残り: {4 - setup.filter(s => s.type === 'good').length} / 4
    </div>
    {/* プログレスバー */}
    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-blue-500 transition-all"
        style={{ width: `${(setup.filter(s => s.type === 'good').length / 4) * 100}%` }}
      />
    </div>
  </button>
  
  <button
    onClick={() => setSelectedType('bad')}
    className={`
      flex-1 p-6 rounded-xl border-4 transition-all
      ${selectedType === 'bad' 
        ? 'border-red-500 bg-red-50 ring-4 ring-red-200' 
        : 'border-gray-300 bg-white hover:border-red-300'}
    `}
  >
    <div className="text-6xl mb-2">😈</div>
    <div className="text-xl font-bold">Bad駒</div>
    <div className="text-sm mt-2">
      残り: {4 - setup.filter(s => s.type === 'bad').length} / 4
    </div>
    {/* プログレスバー */}
    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-red-500 transition-all"
        style={{ width: `${(setup.filter(s => s.type === 'bad').length / 4) * 100}%` }}
      />
    </div>
  </button>
</div>

// タイマー表示
{timeLimit && (
  <div className={`
    text-center mb-6 p-4 rounded-lg font-mono text-4xl font-bold
    ${remainingTime <= 10 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}
    ${remainingTime <= 5 ? 'animate-pulse' : ''}
  `}>
    残り時間: {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
  </div>
)}

// 配置済み駒のクリック処理
const handlePieceClick = (piece: PieceSetup) => {
  // 種類を切り替える
  const newSetup = setup.map(s => 
    s === piece 
      ? { ...s, type: s.type === 'good' ? 'bad' as const : 'good' as const }
      : s
  );
  onSetupChange(newSetup);
};
```

## 2. ゲームプレイ時のタイマー

### TurnTimerコンポーネント

```typescript
// components/game/TurnTimer.tsx

interface TurnTimerProps {
  timeLimit: number; // 秒数
  isMyTurn: boolean;
  onTimeout: () => void;
}

export const TurnTimer: React.FC<TurnTimerProps> = ({
  timeLimit,
  isMyTurn,
  onTimeout,
}) => {
  const [remainingTime, setRemainingTime] = useState(timeLimit);
  
  useEffect(() => {
    if (!isMyTurn) {
      setRemainingTime(timeLimit); // リセット
      return;
    }
    
    setRemainingTime(timeLimit);
    
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isMyTurn, timeLimit]);
  
  if (!isMyTurn) return null;
  
  return (
    <div className={`
      fixed top-4 right-4 z-50
      px-6 py-4 rounded-lg shadow-lg font-mono text-3xl font-bold
      ${remainingTime <= 10 ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}
      ${remainingTime <= 5 ? 'animate-pulse' : ''}
    `}>
      {remainingTime}秒
    </div>
  );
};
```

### ランダム移動処理

```typescript
const handleMoveTimeout = async () => {
  if (!isMyTurn) return;
  
  // 合法手を全て取得
  const myPieces = clientState.myPieces.filter(p => !p.captured && !p.escaped);
  const allMoves: { pieceId: string; to: Position }[] = [];
  
  for (const piece of myPieces) {
    const validMoves = getValidMoves(gameState, playerId, piece.id);
    for (const move of validMoves) {
      allMoves.push({ pieceId: piece.id, to: move });
    }
  }
  
  if (allMoves.length === 0) return;
  
  // ランダムに選択
  const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
  
  // 移動実行
  await handleMove(randomMove.to);
};
```

## 3. 実装順序

1. SetupBoardコンポーネント作成（タイマーなし）
2. ランダム配置機能追加
3. タイマー機能追加
4. `/setup/[gameId]/page.tsx`に統合
5. `/games/geister/local/page.tsx`に統合
6. `/games/geister/cpu/page.tsx`に統合
7. TurnTimerコンポーネント作成
8. オンライン対戦にタイマー追加
9. CPU対戦にタイマー追加（オプション）
10. ローカル対戦にタイマー追加（オプション）
