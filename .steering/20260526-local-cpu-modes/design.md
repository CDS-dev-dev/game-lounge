# ローカル対戦・CPU対戦 設計

## ファイル構成

```
app/
  games/geister/
    local/
      page.tsx          # ローカル対戦メイン画面
    cpu/
      page.tsx          # CPU対戦メイン画面
lib/
  games/geister/
    ai.ts               # CPU AIロジック
    localEngine.ts      # ローカル用の簡易ラッパー（オプション）
```

## 1. ローカル対戦（app/games/geister/local/page.tsx）

### 状態管理

```typescript
type LocalGamePhase = 'setup-p1' | 'setup-p2' | 'playing' | 'turnChange' | 'finished';

interface LocalGameState {
  phase: LocalGamePhase;
  gameState: GeisterState;
  currentPlayer: PlayerRole;
  waitingForPlayer: PlayerRole | null;
}
```

### コンポーネント構成

```typescript
export default function GeisterLocalPage() {
  const [localState, setLocalState] = useState<LocalGameState>({
    phase: 'setup-p1',
    gameState: createInitialState(...),
    currentPlayer: 'player1',
    waitingForPlayer: null,
  });

  // 配置完了
  const handleSetupComplete = (playerRole: PlayerRole, setup: PieceSetup[]) => {
    // 配置を適用
    // player1完了 → setup-p2へ
    // player2完了 → playingへ
  };

  // ターン交代画面を表示
  const handleTurnEnd = () => {
    setLocalState({ ...localState, phase: 'turnChange', waitingForPlayer: ... });
  };

  // 準備完了ボタン
  const handleReady = () => {
    setLocalState({ ...localState, phase: 'playing', waitingForPlayer: null });
  };

  return (
    <>
      {phase === 'setup-p1' && <SetupScreen player="player1" />}
      {phase === 'setup-p2' && <InterstitialScreen then={<SetupScreen player="player2" />} />}
      {phase === 'playing' && <GameBoard />}
      {phase === 'turnChange' && <InterstitialScreen message="相手の番です" />}
      {phase === 'finished' && <GameResult />}
    </>
  );
}
```

### 中間画面コンポーネント

```typescript
function InterstitialScreen({ 
  message, 
  playerName, 
  onReady 
}: { 
  message?: string;
  playerName?: string;
  onReady: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <Card>
        <CardContent>
          <h2 className="text-3xl font-bold mb-6">
            {message || `${playerName}の番です`}
          </h2>
          <p className="text-gray-600 mb-8">
            準備ができたらボタンを押してください
          </p>
          <Button onClick={onReady}>準備完了</Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

## 2. CPU対戦（app/games/geister/cpu/page.tsx）

### 状態管理

```typescript
interface CpuGameState {
  phase: 'setup' | 'playing' | 'cpuThinking' | 'finished';
  gameState: GeisterState;
  difficulty: 'easy' | 'normal' | 'hard'; // 将来拡張用
}
```

### フロー

```typescript
export default function GeisterCpuPage() {
  const [cpuState, setCpuState] = useState<CpuGameState>(...);

  // プレイヤーが移動
  const handlePlayerMove = async (pieceId: string, to: Position) => {
    // 移動実行
    const newState = movePiece(...);
    
    // 勝敗判定
    if (newState.winner) {
      setCpuState({ ...cpuState, phase: 'finished', gameState: newState });
      return;
    }

    // CPUのターンへ
    setCpuState({ ...cpuState, phase: 'cpuThinking', gameState: newState });
    
    // 1秒待機
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // CPUが移動
    const cpuMove = calculateCpuMove(newState, 'player2');
    const stateAfterCpu = movePiece(newState, 'cpu-id', cpuMove.pieceId, cpuMove.to);
    
    setCpuState({ ...cpuState, phase: 'playing', gameState: stateAfterCpu });
  };

  return (
    <>
      {phase === 'setup' && <SetupScreen />}
      {phase === 'playing' && <GameBoard onMove={handlePlayerMove} />}
      {phase === 'cpuThinking' && <LoadingOverlay message="CPUが思考中..." />}
      {phase === 'finished' && <GameResult />}
    </>
  );
}
```

## 3. CPU AIロジック（lib/games/geister/ai.ts）

### インターフェース

```typescript
export interface CpuMove {
  pieceId: string;
  to: Position;
}

export function calculateCpuMove(
  state: GeisterState,
  cpuRole: PlayerRole,
  difficulty: 'easy' | 'normal' | 'hard' = 'easy'
): CpuMove;
```

### レベル1: ランダムAI

```typescript
export function calculateCpuMove(
  state: GeisterState,
  cpuRole: PlayerRole
): CpuMove {
  const myPieces = state.pieces[cpuRole].filter(p => !p.captured && !p.escaped);
  
  // 全ての合法手を生成
  const allMoves: CpuMove[] = [];
  for (const piece of myPieces) {
    const validMoves = getValidMoves(state, 'cpu-id', piece.id);
    for (const move of validMoves) {
      allMoves.push({ pieceId: piece.id, to: move });
    }
  }
  
  // ランダムに選択
  const randomIndex = Math.floor(Math.random() * allMoves.length);
  return allMoves[randomIndex];
}
```

### レベル2: 基本戦略AI（将来実装）

優先順位：
1. good駒で脱出できるなら脱出
2. 相手のgood駒を取れるなら取る
3. bad駒を相手に取らせる位置に移動
4. ランダム移動

## 4. モード選択画面の更新

`app/games/geister/page.tsx` を更新：

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* オンライン対戦 */}
  <Card>
    <CardHeader>
      <h2>🌐 オンライン対戦</h2>
    </CardHeader>
    <CardContent>
      <p>世界中のプレイヤーと対戦</p>
      <Button onClick={() => router.push('/games/geister/online')}>
        オンライン対戦
      </Button>
    </CardContent>
  </Card>

  {/* ローカル対戦 */}
  <Card>
    <CardHeader>
      <h2>👥 ローカル対戦</h2>
    </CardHeader>
    <CardContent>
      <p>同じ端末で2人対戦</p>
      <Button onClick={() => router.push('/games/geister/local')}>
        ローカル対戦
      </Button>
    </CardContent>
  </Card>

  {/* CPU対戦 */}
  <Card>
    <CardHeader>
      <h2>🤖 CPU対戦</h2>
    </CardHeader>
    <CardContent>
      <p>コンピュータと対戦</p>
      <Button onClick={() => router.push('/games/geister/cpu')}>
        CPU対戦
      </Button>
    </CardContent>
  </Card>
</div>
```

## 技術的考慮事項

### 既存コードの再利用
- `lib/games/geister/engine.ts` の関数をそのまま使用
- `components/games/geister/` のUIコンポーネントを再利用
- オンライン対戦のコードには一切影響を与えない

### ローカル対戦の課題
- 画面を見ながらのターン交代なので、物理的に端末を渡す必要がある
- 中間画面で盤面を完全に隠すことで、フェアプレイを保証

### CPU対戦の課題
- 初期実装はランダムAIで十分
- 将来的にMinimax、Monte Carlo Tree Searchなどの高度なAIを実装可能
