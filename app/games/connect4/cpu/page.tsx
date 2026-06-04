// 立体四目並べ CPU対戦ページ

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PlaySetupCard, SetupBackLink, SetupOptionButton } from '@/components/game/PlaySetup';
import {
  createInitialState,
  joinPlayer2,
  placePiece,
  checkWinner,
  finishGame,
  toClientState,
  getAvailablePositions,
} from '@/lib/games/connect4/engine';
import { calculateCpuMove } from '@/lib/games/connect4/ai';
import type { Connect4State, Position3D, Connect4ClientState } from '@/lib/games/connect4/types';
import { Connect4Board3D } from '@/components/game/Connect4Board3D';
import { RulesModal } from '@/components/game/RulesModal';
import { useToast } from '@/components/ui/Toast';
import { GameHeader } from '@/components/layout/GameHeader';
import { formatGameError } from '@/lib/utils/error-handler';
import { useSafeTimeout } from '@/lib/hooks/useSafeTimeout';
import { useGameHistory } from '@/lib/hooks/useGameHistory';
import { Z_INDEX } from '@/lib/constants/z-index';

type CpuGamePhase = 'difficulty-select' | 'order-select' | 'playing' | 'cpuThinking' | 'finished';
type Difficulty = 'easy' | 'medium' | 'hard';

const PLAYER_ID = 'player-human';
const CPU_ID = 'player-cpu';
const GAME_ID = 'cpu-game';

export default function Connect4CpuPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { setSafeTimeout } = useSafeTimeout();
  const gameHistory = useGameHistory<Connect4State>(2); // CPU対戦は2手戻すため最小履歴3
  const [phase, setPhase] = useState<CpuGamePhase>('difficulty-select');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerOrder, setPlayerOrder] = useState<'first' | 'second' | null>(null);
  const [gameState, setGameState] = useState<Connect4State | null>(null);

  // 難易度選択
  const handleDifficultySelect = useCallback((selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setPhase('order-select');
  }, []);

  // 先攻後攻選択してゲーム開始
  const startGame = async (order: 'first' | 'second') => {
    setPlayerOrder(order);

    let newState: Connect4State;
    if (order === 'first') {
      // プレイヤーが先攻
      newState = createInitialState(GAME_ID, PLAYER_ID);
      newState = joinPlayer2(newState, CPU_ID);
    } else {
      // CPUが先攻
      newState = createInitialState(GAME_ID, CPU_ID);
      newState = joinPlayer2(newState, PLAYER_ID);

      // CPUが先に動く
      setPhase('cpuThinking');
      setGameState(newState);

      await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 1000));

      const cpuMove = calculateCpuMove(newState, 'player1', difficulty);
      newState = placePiece(newState, CPU_ID, cpuMove);
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
    showToast('1手戻しました', 'success');
  }, [gameHistory, showToast]);

  // プレイヤーの手
  const handleCellClick = useCallback(async (pos: Position3D) => {
    if (!gameState || phase !== 'playing') return;

    const playerRole = playerOrder === 'first' ? 'player1' : 'player2';
    if (gameState.currentTurn !== playerRole) return;

    try {
      // プレイヤーの配置
      let newState = placePiece(gameState, PLAYER_ID, pos);
      gameHistory.addHistory(newState); // 履歴に追加

      // 勝敗判定（最適化：最後に置いた位置のみチェック）
      const result = checkWinner(newState, pos);
      if (result.winner !== null) {
        newState = finishGame(newState, result.winner, result.winningLine);
        setGameState(newState);
        setPhase('finished');
        return;
      }

      // 引き分け判定
      if (getAvailablePositions(newState).length === 0) {
        newState = finishGame(newState, null, null);
        setGameState(newState);
        setPhase('finished');
        showToast('引き分けです！', 'info');
        return;
      }

      setGameState(newState);

      // CPUのターン
      setPhase('cpuThinking');

      // 少し待機（思考演出）
      await new Promise((resolve) => setSafeTimeout(() => resolve(undefined), 1000));

      // CPUが配置
      const cpuRole = playerOrder === 'first' ? 'player2' : 'player1';
      const cpuMove = calculateCpuMove(newState, cpuRole, difficulty);
      newState = placePiece(newState, CPU_ID, cpuMove);
      gameHistory.addHistory(newState); // 履歴に追加

      // 勝敗判定（最適化：最後に置いた位置のみチェック）
      const cpuResult = checkWinner(newState, cpuMove);
      if (cpuResult.winner !== null) {
        newState = finishGame(newState, cpuResult.winner, cpuResult.winningLine);
        setGameState(newState);
        setPhase('finished');
        return;
      }

      // 引き分け判定
      if (getAvailablePositions(newState).length === 0) {
        newState = finishGame(newState, null, null);
        setGameState(newState);
        setPhase('finished');
        showToast('引き分けです！', 'info');
        return;
      }

      setGameState(newState);
      setPhase('playing');
    } catch (error) {
      showToast(formatGameError(error), 'error');
    }
  }, [gameState, phase, playerOrder, gameHistory, setSafeTimeout, difficulty, showToast]);

  // リプレイ
  const handleReplay = useCallback(() => {
    setPhase('difficulty-select');
    setPlayerOrder(null);
    setGameState(null);
    gameHistory.clearHistory();
  }, [gameHistory]);

  const clientState: Connect4ClientState | null = useMemo(() =>
    gameState ? toClientState(gameState, PLAYER_ID) : null,
    [gameState]
  );

  const availablePositions = useMemo(() =>
    gameState && phase === 'playing' ? getAvailablePositions(gameState) : [],
    [gameState, phase]
  );

  return (
    <>
      <GameHeader
        title="立体四目並べ CPU対戦"
        backUrl="/games/connect4"
        backLabel="モード選択"
      />
      <div className="min-h-screen app-bg board-pattern pt-16 sm:pt-20 pb-4 sm:pb-8 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">立体四目並べ CPU対戦</h1>
            <p className="text-sm sm:text-base text-gray-200">4×4×4の立体空間で4つ揃えよう！</p>
          </div>

        {/* 難易度選択 */}
        {phase === 'difficulty-select' && (
          <PlaySetupCard
            title="難易度を選択"
            subtitle="4×4×4の立体盤面で4つ揃えます。初回は3D表示で始まります。"
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {[
                { value: 'easy' as Difficulty, title: '初級', description: '置ける場所を試しやすい', tone: 'green' as const },
                { value: 'medium' as Difficulty, title: '中級', description: '標準的な読み合い', tone: 'amber' as const },
                { value: 'hard' as Difficulty, title: '上級', description: '3Dラインを強く警戒', tone: 'red' as const },
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
              <SetupBackLink href="/games/connect4">モード選択に戻る</SetupBackLink>
            </div>
          </PlaySetupCard>
        )}

        {/* 先攻後攻選択 */}
        {phase === 'order-select' && (
          <PlaySetupCard
            title="先攻・後攻を選択"
            subtitle={`難易度: ${difficulty === 'easy' ? '初級' : difficulty === 'medium' ? '中級' : '上級'}`}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SetupOptionButton
                title="先攻"
                description="あなたが先に置きます"
                onClick={() => startGame('first')}
                tone="blue"
              />
              <SetupOptionButton
                title="後攻"
                description="CPUが先に置きます"
                onClick={() => startGame('second')}
                tone="red"
              />
            </div>
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setPhase('difficulty-select')}
                className="inline-flex min-h-10 items-center justify-center rounded-lg px-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 focus:outline-none focus:ring-4 focus:ring-teal-300"
              >
                難易度を変更
              </button>
            </div>
          </PlaySetupCard>
        )}

        {/* CPU思考中インジケーター（固定配置） */}
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
            <Card className="mb-3 sm:mb-4 bg-white/95">
              <CardContent className="py-2 sm:py-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">ターン</p>
                    <p className="text-base sm:text-xl font-bold text-slate-900">
                      {gameState && gameState.currentTurn === (playerOrder === 'first' ? 'player1' : 'player2') ? '🔵 あなた' : '🔴 CPU'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">難易度</p>
                    <p className="text-sm sm:text-base font-semibold text-slate-900">
                      {difficulty === 'easy' && '😊 初級'}
                      {difficulty === 'medium' && '🤔 中級'}
                      {difficulty === 'hard' && '🔥 上級'}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {/* ルールボタン */}
                    <RulesModal gameName="立体四目並べ">
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-sm">
                        <p className="font-semibold text-indigo-900 mb-2">🎯 勝利条件</p>
                        <p className="text-indigo-800 mb-3">
                          • 縦・横・斜め（3次元含む）のいずれかで<span className="font-bold">4つ揃える</span>
                        </p>
                        <p className="text-indigo-700 text-xs mb-3">
                          💡 4つの層（L1〜L4）を俯瞰して戦略を立てよう
                        </p>
                        <div className="bg-white/70 rounded p-3 mt-3">
                          <p className="font-semibold text-indigo-900 mb-2 text-sm">🎮 操作方法</p>
                          <ul className="text-indigo-800 text-xs space-y-1">
                            <li>• <strong>マウスドラッグ:</strong> 視点を回転</li>
                            <li>• <strong>スクロール:</strong> 拡大・縮小</li>
                            <li>• <strong>青い玉クリック:</strong> 駒を配置</li>
                          </ul>
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
              </CardContent>
            </Card>

            <Connect4Board3D
              gameState={clientState}
              onCellClick={handleCellClick}
              availablePositions={availablePositions}
            />

            {phase === 'finished' && gameState && (
              <div role="alert" aria-live="assertive">
                <Card className="mt-6 bg-white/95">
                  <CardHeader>
                    <h2 className="text-3xl font-bold text-center text-slate-900">
                      {gameState.winner === (playerOrder === 'first' ? 'player1' : 'player2') && '🎉 あなたの勝ち！'}
                      {gameState.winner && gameState.winner !== (playerOrder === 'first' ? 'player1' : 'player2') && '😢 CPUの勝ち'}
                      {gameState.winner === null && '🤝 引き分け'}
                    </h2>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="flex gap-4 justify-center mt-6">
                      <Button variant="primary" onClick={handleReplay}>
                        もう一度プレイ
                      </Button>
                      <Button variant="secondary" onClick={() => router.push('/games/connect4')}>
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
