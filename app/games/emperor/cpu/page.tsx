// エンペラーゲーム（カイジのEカード）CPU対戦ページ

'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';
import {
  createInitialState,
  startSet,
  selectPlayerCard,
  selectCpuCard,
  executeBattle,
  nextSet,
  toClientState,
} from '@/lib/games/emperor/engine';
import { calculateCpuCard } from '@/lib/games/emperor/ai';
import type { EmperorState, EmperorClientState, ECard } from '@/lib/games/emperor/types';
import { useToast } from '@/components/ui/Toast';
import { formatGameError } from '@/lib/utils/error-handler';
import {
  CARD_NAMES,
  CARD_EMOJIS,
  CARD_COLORS,
  SIDE_NAMES,
  SIDE_COLORS,
} from '@/lib/games/emperor/constants';
import { TEXT_SIZE, MIN_TAP_AREA } from '@/lib/constants/ui-scale';

type GamePhase = 'setup' | 'playing' | 'battleResult' | 'setEnd' | 'finished';

const GAME_ID = 'emperor-cpu';
const PLAYER_ID = 'player';

export default function EmperorCpuPage() {
  const { showToast } = useToast();

  const [phase, setPhase] = useState<GamePhase>('setup');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [gameState, setGameState] = useState<EmperorState | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // ゲーム開始
  const handleStartGame = useCallback(() => {
    try {
      let newState = createInitialState(GAME_ID, difficulty);
      newState = startSet(newState);
      setGameState(newState);
      setPhase('playing');
    } catch (error) {
      console.error('Game start error:', error);
      showToast(formatGameError(error), 'error');
    }
  }, [difficulty, showToast]);

  // カード選択
  const handleCardSelect = useCallback(async (cardId: string) => {
    if (!gameState || phase !== 'playing') return;

    try {
      setSelectedCardId(cardId);

      // プレイヤーのカードを選択
      let newState = selectPlayerCard(gameState, cardId);

      // CPUのカードを選択
      const cpuCard = calculateCpuCard(newState, difficulty);
      newState = {
        ...newState,
        cpuCard,
      };

      // 勝負を実行
      newState = executeBattle(newState);
      setGameState(newState);

      // 結果表示
      setPhase('battleResult');
      setTimeout(() => {
        if (newState.status === 'roundEnd') {
          setPhase('setEnd');
        } else {
          setPhase('playing');
          setSelectedCardId(null);
        }
      }, 2000);
    } catch (error) {
      console.error('Card select error:', error);
      showToast(formatGameError(error), 'error');
    }
  }, [gameState, phase, difficulty, showToast]);

  // 次のセットへ
  const handleNextSet = useCallback(() => {
    if (!gameState) return;

    try {
      const newState = nextSet(gameState);
      setGameState(newState);

      if (newState.status === 'finished') {
        setPhase('finished');
      } else {
        setPhase('playing');
        setSelectedCardId(null);
      }
    } catch (error) {
      console.error('Next set error:', error);
      showToast(formatGameError(error), 'error');
    }
  }, [gameState, showToast]);

  // リセット
  const handleReset = useCallback(() => {
    setPhase('setup');
    setGameState(null);
    setSelectedCardId(null);
  }, []);

  const clientState = gameState ? toClientState(gameState, PLAYER_ID) : null;
  const myPlayer = clientState?.myPlayer;
  const opponentPlayer = clientState?.opponentPlayer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 sm:pt-20 pb-4 sm:pb-8 px-2 sm:px-4">
      <GameHeader title="エンペラーゲーム - CPU対戦" />

      <main className="container mx-auto px-4 py-8">
        {/* セットアップ画面 */}
        {phase === 'setup' && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/95">
              <CardHeader>
                <h2 className="text-2xl font-bold text-slate-900">ゲーム設定</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 難易度選択 */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">難易度</label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      onClick={() => setDifficulty('easy')}
                      variant={difficulty === 'easy' ? 'primary' : 'secondary'}
                      className={MIN_TAP_AREA}
                      aria-label="かんたんモードを選択"
                    >
                      <span className={TEXT_SIZE.body}>かんたん</span>
                    </Button>
                    <Button
                      onClick={() => setDifficulty('medium')}
                      variant={difficulty === 'medium' ? 'primary' : 'secondary'}
                      className={MIN_TAP_AREA}
                      aria-label="ふつうモードを選択"
                    >
                      <span className={TEXT_SIZE.body}>ふつう</span>
                    </Button>
                    <Button
                      onClick={() => setDifficulty('hard')}
                      variant={difficulty === 'hard' ? 'primary' : 'secondary'}
                      className={MIN_TAP_AREA}
                      aria-label="むずかしいモードを選択"
                    >
                      <span className={TEXT_SIZE.body}>むずかしい</span>
                    </Button>
                  </div>
                </div>

                <Button onClick={handleStartGame} variant="primary" className="w-full">
                  ゲーム開始
                </Button>

                <Link href="/games/emperor">
                  <Button variant="secondary" className="w-full">
                    戻る
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ゲーム画面 */}
        {(phase === 'playing' || phase === 'battleResult' || phase === 'setEnd') && clientState && myPlayer && opponentPlayer && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* スコア表示 */}
            <Card className="bg-white/95">
              <CardContent className="py-4">
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <div className="text-sm text-slate-600">あなた</div>
                    <div className="text-3xl font-bold text-slate-900">{myPlayer.score}点</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-600">セット {clientState.currentSet}/{clientState.maxSets}</div>
                    <div className="text-sm text-slate-600">勝負 {clientState.currentBattle}/5</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-600">CPU</div>
                    <div className="text-3xl font-bold text-slate-900">{opponentPlayer.score}点</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 役割表示 */}
            <div className="grid grid-cols-2 gap-4">
              <Card className={`${SIDE_COLORS[myPlayer.side]}`}>
                <CardContent className="py-4 text-center">
                  <div className="text-lg font-bold">あなた: {SIDE_NAMES[myPlayer.side]}</div>
                </CardContent>
              </Card>
              <Card className={`${SIDE_COLORS[opponentPlayer.side]}`}>
                <CardContent className="py-4 text-center">
                  <div className="text-lg font-bold">CPU: {SIDE_NAMES[opponentPlayer.side]}</div>
                </CardContent>
              </Card>
            </div>

            {/* CPUのカード表示 */}
            <Card className="bg-white/95">
              <CardContent className="py-6">
                <div className="text-center">
                  <div className="text-sm text-slate-600 mb-3">CPUのカード</div>
                  {clientState.cpuCard ? (
                    <div className={`inline-block px-8 py-6 rounded-lg border-2 ${CARD_COLORS[clientState.cpuCard.type]}`}>
                      <div className="text-5xl mb-2">{CARD_EMOJIS[clientState.cpuCard.type]}</div>
                      <div className="text-xl font-bold">{CARD_NAMES[clientState.cpuCard.type]}</div>
                    </div>
                  ) : (
                    <div className="inline-block px-8 py-6 rounded-lg border-2 border-dashed border-slate-300 bg-slate-100">
                      <div className="text-5xl mb-2">?</div>
                      <div className="text-xl font-bold text-slate-500">未選択</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* プレイヤーの手札 */}
            <Card className="bg-white/95">
              <CardContent className="py-6">
                <div className="text-center mb-4">
                  <div className="text-sm text-slate-600">あなたの手札</div>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {myPlayer.hand.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => handleCardSelect(card.id)}
                      disabled={phase !== 'playing'}
                      className={`px-6 py-4 rounded-lg border-2 transition-all ${CARD_COLORS[card.type]} ${
                        phase === 'playing' ? 'hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                      } ${selectedCardId === card.id ? 'ring-4 ring-blue-500' : ''}`}
                    >
                      <div className="text-4xl mb-1">{CARD_EMOJIS[card.type]}</div>
                      <div className="text-lg font-bold">{CARD_NAMES[card.type]}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 勝負結果 */}
            {clientState.lastBattleResult && phase === 'battleResult' && (
              <Card className="bg-white/95 border-4 border-blue-500">
                <CardContent className="py-6 text-center">
                  <div className="text-2xl font-bold mb-4 text-slate-900">
                    {clientState.lastBattleResult.winner === 'draw'
                      ? '引き分け！'
                      : clientState.lastBattleResult.winner === 'player'
                      ? 'あなたの勝ち！'
                      : 'CPUの勝ち！'}
                  </div>
                  {clientState.lastBattleResult.playerPoints > 0 && (
                    <div className="text-xl text-green-600 font-bold">
                      +{clientState.lastBattleResult.playerPoints}点獲得！
                    </div>
                  )}
                  {clientState.lastBattleResult.cpuPoints > 0 && (
                    <div className="text-xl text-red-600 font-bold">
                      CPU +{clientState.lastBattleResult.cpuPoints}点獲得
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* セット終了 */}
            {phase === 'setEnd' && (
              <Card className="bg-white/95">
                <CardContent className="py-6 text-center">
                  <div className="text-2xl font-bold mb-4 text-slate-900">セット{clientState.currentSet}終了</div>
                  <Button onClick={handleNextSet} variant="primary" size="lg">
                    次のセットへ
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* 終了画面 */}
        {phase === 'finished' && clientState && myPlayer && opponentPlayer && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/95">
              <CardHeader>
                <h2 className="text-3xl font-bold text-center text-slate-900">ゲーム終了</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl mb-4">
                    {clientState.winner === PLAYER_ID ? '🎉' : clientState.winner === 'cpu' ? '😢' : '🤝'}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-6">
                    {clientState.winner === PLAYER_ID
                      ? 'あなたの勝利！'
                      : clientState.winner === 'cpu'
                      ? 'CPUの勝利'
                      : '引き分け'}
                  </div>
                  <div className="flex justify-center gap-8 mb-6">
                    <div>
                      <div className="text-sm text-slate-600">あなた</div>
                      <div className="text-4xl font-bold text-slate-900">{myPlayer.score}点</div>
                    </div>
                    <div className="text-3xl text-slate-400">-</div>
                    <div>
                      <div className="text-sm text-slate-600">CPU</div>
                      <div className="text-4xl font-bold text-slate-900">{opponentPlayer.score}点</div>
                    </div>
                  </div>
                </div>

                <Button onClick={handleReset} variant="primary" className="w-full">
                  もう一度プレイ
                </Button>

                <Link href="/games/emperor">
                  <Button variant="secondary" className="w-full">
                    メニューに戻る
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
