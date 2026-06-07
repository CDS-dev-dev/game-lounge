// 中国象棋 CPU対戦ページ

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PlaySetupCard, SetupBackLink, SetupOptionButton } from '@/components/game/PlaySetup';
import { DecisionPanel } from '@/components/game/GamePlayUI';
import {
  createInitialState,
  joinBlackPlayer,
  movePiece,
  checkWinner,
  finishGame,
  toClientState,
  getValidMoves,
} from '@/lib/games/xiangqi/engine';
import { calculateCpuMove } from '@/lib/games/xiangqi/ai';
import type { XiangqiState, Position } from '@/lib/games/xiangqi/types';
import { XiangqiBoard } from '@/components/game/XiangqiBoard';
import { RulesModal } from '@/components/game/RulesModal';
import { useToast } from '@/components/ui/Toast';
import { GameHeader } from '@/components/layout/GameHeader';
import { formatGameError } from '@/lib/utils/error-handler';
import { useSafeTimeout } from '@/lib/hooks/useSafeTimeout';
import { useGameHistory } from '@/lib/hooks/useGameHistory';
import { logger } from '@/lib/utils/logger';
import { Z_INDEX } from '@/lib/constants/z-index';

type CpuGamePhase = 'difficulty-select' | 'order-select' | 'playing' | 'cpuThinking' | 'finished';
type Difficulty = 'easy' | 'medium' | 'hard';

const PLAYER_ID = 'player-human';
const CPU_ID = 'player-cpu';
const GAME_ID = 'cpu-game';

export default function XiangqiCpuPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { setSafeTimeout } = useSafeTimeout();
  const gameHistory = useGameHistory<XiangqiState>(2); // CPU対戦は2手戻すため最小履歴3
  const [phase, setPhase] = useState<CpuGamePhase>('difficulty-select');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerColor, setPlayerColor] = useState<'red' | 'black' | null>(null);
  const [gameState, setGameState] = useState<XiangqiState | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);

  // 難易度選択
  const handleDifficultySelect = useCallback((selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setPhase('order-select');
  }, []);

  // 先攻後攻選択してゲーム開始
  const startGame = async (color: 'red' | 'black') => {
    setPlayerColor(color);

    let newState: XiangqiState;
    if (color === 'red') {
      // プレイヤーが紅（先攻）
      newState = createInitialState(GAME_ID, PLAYER_ID);
      newState = joinBlackPlayer(newState, CPU_ID);
    } else {
      // プレイヤーが黒（後攻）、CPUが紅（先攻）
      newState = createInitialState(GAME_ID, CPU_ID);
      newState = joinBlackPlayer(newState, PLAYER_ID);

      // CPUが先に動く
      setPhase('cpuThinking');
      setGameState(newState);

      await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 1000));

      const cpuMove = calculateCpuMove(newState, 'red', difficulty);
      newState = movePiece(newState, CPU_ID, cpuMove.from, cpuMove.to);
    }

    setGameState(newState);
    gameHistory.addHistory(newState); // 初期状態を履歴に保存
    setPhase('playing');
  };

  // 待った機能（プレイヤーの手とCPUの手の2手戻す）
  const handleUndo = useCallback(() => {
    const previousState = gameHistory.undo(2);
    if (!previousState) {
      showToast('待ったできません', 'error');
      return;
    }

    setGameState(previousState);
    setSelectedPiece(null);
    setValidMoves([]);
    showToast('1手戻しました', 'success');
  }, [gameHistory, showToast]);

  // セルクリック
  const handleCellClick = useCallback(async (pos: Position) => {
    if (!gameState || phase !== 'playing' || gameState.currentTurn !== playerColor) return;

    const clickedPiece = gameState.board[pos.row][pos.col];

    // 駒を選択
    if (clickedPiece && clickedPiece.owner === playerColor) {
      setSelectedPiece(pos);
      const moves = getValidMoves(gameState, PLAYER_ID, clickedPiece.id);
      setValidMoves(moves);
      return;
    }

    // 移動
    if (selectedPiece) {
      try {
        let newState = movePiece(gameState, PLAYER_ID, selectedPiece, pos);
        gameHistory.addHistory(newState); // 履歴に追加
        setSelectedPiece(null);
        setValidMoves([]);

        // 勝敗判定
        const result = checkWinner(newState);
        if (result.winner !== null) {
          newState = finishGame(newState, result.winner);
          setGameState(newState);
          setPhase('finished');
          return;
        }

        setGameState(newState);

        // CPUのターン
        setPhase('cpuThinking');

        // 少し待機（思考演出）
        await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 1000));

        // CPUが移動
        const cpuColor = playerColor === 'red' ? 'black' : 'red';
        const cpuMove = calculateCpuMove(newState, cpuColor, difficulty);
        newState = movePiece(newState, CPU_ID, cpuMove.from, cpuMove.to);
        gameHistory.addHistory(newState); // 履歴に追加

        // 勝敗判定
        const cpuResult = checkWinner(newState);
        if (cpuResult.winner !== null) {
          newState = finishGame(newState, cpuResult.winner);
          setGameState(newState);
          setPhase('finished');
          return;
        }

        setGameState(newState);
        setPhase('playing');
      } catch (error) {
        logger.error('Move error:', error);
        showToast(formatGameError(error), 'error');
        setSelectedPiece(null);
        setValidMoves([]);
      }
    }
  }, [gameState, phase, playerColor, selectedPiece, gameHistory, setSafeTimeout, difficulty, showToast]);

  // リプレイ
  const handleReplay = useCallback(() => {
    setPhase('difficulty-select');
    setPlayerColor(null);
    setGameState(null);
    setSelectedPiece(null);
    setValidMoves([]);
    gameHistory.clearHistory();
  }, [gameHistory]);

  const clientState = useMemo(() =>
    gameState ? toClientState(gameState, PLAYER_ID) : null,
    [gameState]
  );

  return (
    <>
      <GameHeader
        title="中国象棋 CPU対戦"
        backUrl="/games/xiangqi"
        backLabel="モード選択"
      />
      <div className="min-h-screen app-bg board-pattern pt-14 pb-2 px-3 sm:pt-[4.5rem] sm:px-4">
        <div className="max-w-5xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">中国象棋 CPU対戦</h1>
            <p className="text-sm sm:text-base text-gray-200">中国伝統の将棋ゲーム</p>
          </div>

        {/* 難易度選択 */}
        {phase === 'difficulty-select' && (
          <PlaySetupCard
            title="難易度を選択"
            subtitle="駒の動きが独特なので、最初は初級か中級がおすすめです。"
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {[
                { value: 'easy' as Difficulty, title: '初級', description: '取り合いを試しやすい', tone: 'green' as const },
                { value: 'medium' as Difficulty, title: '中級', description: '標準的な読み合い', tone: 'amber' as const },
                { value: 'hard' as Difficulty, title: '上級', description: '守りも強め', tone: 'red' as const },
              ].map((item) => (
                <SetupOptionButton
                  key={item.value}
                  title={item.title}
                  description={item.description}
                  selected={difficulty === item.value}
                  onClick={() => handleDifficultySelect(item.value)}
                  tone={item.tone}
                />
              ))}
            </div>
            <div className="mt-5 text-center">
              <SetupBackLink href="/games/xiangqi">モード選択に戻る</SetupBackLink>
            </div>
          </PlaySetupCard>
        )}

        {/* 先攻後攻選択 */}
        {phase === 'order-select' && (
          <PlaySetupCard
            title="紅・黒を選択"
            subtitle={`難易度: ${difficulty === 'easy' ? '初級' : difficulty === 'medium' ? '中級' : '上級'}`}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SetupOptionButton
                title="紅（先攻）"
                description="あなたが先に動きます"
                onClick={() => startGame('red')}
                tone="red"
              />
              <SetupOptionButton
                title="黒（後攻）"
                description="CPUが先に動きます"
                onClick={() => startGame('black')}
                tone="slate"
              />
            </div>
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setPhase('difficulty-select')}
                aria-label="難易度選択画面に戻る"
                className="inline-flex min-h-10 items-center justify-center rounded-lg px-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 focus:outline-none focus:ring-4 focus:ring-teal-300"
              >
                難易度を変更
              </button>
            </div>
          </PlaySetupCard>
        )}

        {/* CPU思考中インジケーター（固定オーバーレイ） */}
        {phase === 'cpuThinking' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center pointer-events-none" style={{ zIndex: Z_INDEX.OVERLAY }}>
            <Card className="bg-white/95 pointer-events-auto">
              <CardContent className="py-6 px-8 text-center">
                <div className="flex justify-center mb-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
                <p className="text-lg font-semibold text-slate-900">CPUが思考中...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ゲームプレイ */}
        {(phase === 'playing' || phase === 'finished' || phase === 'cpuThinking') && clientState && (
          <>
            <div className="mb-2">
              <DecisionPanel
                title={
                  gameState && gameState.currentTurn === playerColor
                    ? selectedPiece
                      ? '緑の移動先を選ぶ'
                      : '攻め筋を作る駒を選ぶ'
                    : 'CPUの応手を待つ'
                }
                detail="将/帥を取るゲームです。選択した駒の合法手だけを強調し、盤面で次の一手を決めます。"
                status={difficulty === 'easy' ? '初級' : difficulty === 'medium' ? '中級' : '上級'}
                primary={selectedPiece ? `${validMoves.length}手` : '駒を選択'}
                metrics={[
                  { label: '捕獲', value: `${Object.values(clientState.myCapturedPieces).reduce((a, b) => a + b, 0)}個`, tone: 'hot' },
                  { label: '喪失', value: `${Object.values(clientState.opponentCapturedPieces).reduce((a, b) => a + b, 0)}個` },
                  { label: '選択', value: selectedPiece ? '選択中' : 'なし', tone: selectedPiece ? 'cool' : 'plain' },
                  { label: '移動先', value: `${validMoves.length}箇所`, tone: validMoves.length > 0 ? 'hot' : 'plain' },
                ]}
              />
              <div className="mt-2 flex gap-2 justify-center">
                  {/* ルールボタン */}
                  <RulesModal gameName="中国象棋" compact>
                    <div className="space-y-3">
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <p className="font-semibold text-indigo-900 mb-2">🎯 勝利条件</p>
                        <p className="text-indigo-800 text-sm">
                          • 相手の<span className="font-bold">将/帥を取る</span>（チェックメイト）
                        </p>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="font-semibold text-amber-900 mb-2">📖 主要な駒</p>
                        <ul className="text-amber-800 text-sm space-y-1">
                          <li>• <strong>将/帥:</strong> 九宮内で縦横1マス</li>
                          <li>• <strong>車:</strong> 縦横に何マスでも（最強）</li>
                          <li>• <strong>馬:</strong> 日の字型（蹩馬腿あり）</li>
                          <li>• <strong>炮/砲:</strong> 台を飛び越えて攻撃</li>
                          <li>• <strong>兵/卒:</strong> 川を渡ると左右にも動ける</li>
                        </ul>
                        <p className="text-amber-700 text-xs mt-2">
                          💡 詳細は<a href="/games/xiangqi/rules" target="_blank" className="underline">ルールページ</a>をご覧ください
                        </p>
                      </div>
                    </div>
                  </RulesModal>
                  {/* 待ったボタン */}
                  {phase === 'playing' && gameHistory.canUndo() && (
                    <Button
                      variant="secondary"
                      onClick={handleUndo}
                      className="text-xs sm:text-sm"
                      aria-label="1手戻す"
                    >
                      ↩️ 待った
                    </Button>
                  )}
              </div>
            </div>

            <XiangqiBoard
              gameState={clientState}
              onCellClick={handleCellClick}
              selectedPiece={selectedPiece}
              validMoves={validMoves}
            />

            {phase === 'finished' && gameState && (
              <div role="alert" aria-live="assertive">
                <Card className="mt-6 bg-white/95">
                  <CardHeader>
                    <h2 className="text-3xl font-bold text-center text-slate-900">
                      {gameState.winner === playerColor && '🎉 あなたの勝ち！'}
                      {gameState.winner && gameState.winner !== playerColor && '😢 CPUの勝ち'}
                    </h2>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="flex gap-4 justify-center mt-6">
                      <Button variant="primary" onClick={handleReplay}>
                        もう一度プレイ
                      </Button>
                      <Button variant="secondary" onClick={() => router.push('/games/xiangqi')}>
                        モード選択に戻る
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}

      </div>
    </div>
    </>
  );
}
