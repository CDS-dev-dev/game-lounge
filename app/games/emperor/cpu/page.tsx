// エンペラーゲーム（カイジのEカード）CPU対戦ページ

'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';
import { PlaySetupCard, SetupOptionButton } from '@/components/game/PlaySetup';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import {
  createInitialState,
  startSet,
  selectPlayerCard,
  executeBattle,
  nextSet,
  toClientState,
} from '@/lib/games/emperor/engine';
import { calculateCpuCard } from '@/lib/games/emperor/ai';
import type { EmperorState } from '@/lib/games/emperor/types';
import { useToast } from '@/components/ui/Toast';
import { formatGameError } from '@/lib/utils/error-handler';
import {
  CARD_NAMES,
  CARD_EMOJIS,
  CARD_COLORS,
  SIDE_NAMES,
  SIDE_COLORS,
} from '@/lib/games/emperor/constants';
import { logger } from '@/lib/utils/logger';

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
      logger.error('Game start error:', error);
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
      logger.error('Card select error:', error);
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
      logger.error('Next set error:', error);
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
    <div className="min-h-screen app-bg board-pattern pt-16 sm:pt-20 pb-4 sm:pb-8 px-3 sm:px-4">
      <GameHeader title="エンペラーゲーム - CPU対戦" />

      <main className="container mx-auto px-4 py-8">
        {phase === 'setup' && (
          <PlaySetupCard
            title="ゲーム設定"
            subtitle="皇帝・市民・奴隷の相性を読みながら、セットごとの得点を競います。"
          >
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">難易度</label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { value: 'easy' as const, title: 'かんたん', description: '素直な選択が多め', tone: 'green' as const },
                    { value: 'medium' as const, title: 'ふつう', description: '標準的に読み合う', tone: 'amber' as const },
                    { value: 'hard' as const, title: 'むずかしい', description: 'カード残数を重視', tone: 'red' as const },
                  ].map((item) => (
                    <SetupOptionButton
                      key={item.value}
                      title={item.title}
                      description={item.description}
                      selected={difficulty === item.value}
                      onClick={() => setDifficulty(item.value)}
                      tone={item.tone}
                    />
                  ))}
                </div>
              </div>

              <Button onClick={handleStartGame} variant="primary" className="w-full">
                ゲーム開始
              </Button>
              <Link href="/games/emperor">
                <Button variant="secondary" className="w-full">戻る</Button>
              </Link>
            </div>
          </PlaySetupCard>
        )}

        {(phase === 'playing' || phase === 'battleResult' || phase === 'setEnd') && clientState && myPlayer && opponentPlayer && (
          <div className="max-w-4xl mx-auto space-y-4">
            <Card className="bg-white/95">
              <CardContent className="py-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${SIDE_COLORS[myPlayer.side]}`}>
                      {SIDE_NAMES[myPlayer.side]}
                    </span>
                    <span className="text-xl font-bold text-slate-900">{myPlayer.score}点</span>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-600">セット {clientState.currentSet}/{clientState.maxSets}</div>
                    <div className="text-xs text-slate-600">勝負 {clientState.currentBattle}/5</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-900">{opponentPlayer.score}点</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${SIDE_COLORS[opponentPlayer.side]}`}>
                      {SIDE_NAMES[opponentPlayer.side]}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95">
              <Tabs defaultValue="game">
                <TabsList>
                  <TabsTrigger value="game">ゲーム</TabsTrigger>
                  <TabsTrigger value="score">スコア詳細</TabsTrigger>
                </TabsList>

                <TabsContent value="game" className="space-y-3">
                  <div className="text-center py-3">
                    <div className="text-xs text-slate-600 mb-2">CPUのカード</div>
                    {clientState.cpuCard ? (
                      <div className={`inline-block px-5 py-3 rounded-lg border-2 ${CARD_COLORS[clientState.cpuCard.type]}`}>
                        <div className="text-3xl mb-1">{CARD_EMOJIS[clientState.cpuCard.type]}</div>
                        <div className="text-sm font-bold">{CARD_NAMES[clientState.cpuCard.type]}</div>
                      </div>
                    ) : (
                      <div className="inline-block px-5 py-3 rounded-lg border-2 border-dashed border-slate-300 bg-slate-100">
                        <div className="text-3xl mb-1">?</div>
                        <div className="text-sm font-bold text-slate-500">未選択</div>
                      </div>
                    )}
                  </div>

                  <div className="py-3">
                    <div className="text-center mb-2">
                      <div className="text-xs text-slate-600">あなたの手札</div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {myPlayer.hand.map((card) => (
                        <button
                          key={card.id}
                          onClick={() => handleCardSelect(card.id)}
                          disabled={phase !== 'playing'}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${CARD_COLORS[card.type]} ${
                            phase === 'playing' ? 'hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                          } ${selectedCardId === card.id ? 'ring-4 ring-blue-500' : ''}`}
                        >
                          <div className="text-3xl">{CARD_EMOJIS[card.type]}</div>
                          <div className="text-xs font-bold mt-1">{CARD_NAMES[card.type]}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {clientState.lastBattleResult && phase === 'battleResult' && (
                    <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-slate-900">
                        {clientState.lastBattleResult.winner === 'draw' ? '引き分け！' :
                         clientState.lastBattleResult.winner === 'player' ? 'あなたの勝ち！' : 'CPUの勝ち！'}
                      </div>
                      {clientState.lastBattleResult.playerPoints > 0 && (
                        <div className="text-base text-green-600 font-bold mt-1">
                          +{clientState.lastBattleResult.playerPoints}点
                        </div>
                      )}
                      {clientState.lastBattleResult.cpuPoints > 0 && (
                        <div className="text-base text-red-600 font-bold mt-1">
                          CPU +{clientState.lastBattleResult.cpuPoints}点
                        </div>
                      )}
                    </div>
                  )}

                  {phase === 'setEnd' && (
                    <div className="text-center py-3">
                      <div className="text-lg font-bold mb-2 text-slate-900">セット{clientState.currentSet}終了</div>
                      <Button onClick={handleNextSet} variant="primary" size="lg">次のセットへ</Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="score" className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-600 mb-1">あなた</div>
                      <div className="text-2xl font-bold text-slate-900 mb-1">{myPlayer.score}点</div>
                      <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${SIDE_COLORS[myPlayer.side]}`}>
                        {SIDE_NAMES[myPlayer.side]}
                      </div>
                      <div className="mt-2 text-xs text-slate-600">残り: {myPlayer.hand.length}枚</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-600 mb-1">CPU</div>
                      <div className="text-2xl font-bold text-slate-900 mb-1">{opponentPlayer.score}点</div>
                      <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${SIDE_COLORS[opponentPlayer.side]}`}>
                        {SIDE_NAMES[opponentPlayer.side]}
                      </div>
                      <div className="mt-2 text-xs text-slate-600">残り: {opponentPlayer.hand.length}枚</div>
                    </div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-600 mb-1">進行状況</div>
                    <div className="text-base font-bold text-slate-900">
                      セット {clientState.currentSet}/{clientState.maxSets} | 勝負 {clientState.currentBattle}/5
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      難易度: {difficulty === 'easy' ? 'かんたん' : difficulty === 'medium' ? 'ふつう' : 'むずかしい'}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        )}

        {phase === 'finished' && clientState && myPlayer && opponentPlayer && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/95">
              <CardHeader>
                <h2 className="text-2xl font-bold text-center text-slate-900">ゲーム終了</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl mb-3">
                    {clientState.winner === PLAYER_ID ? '🎉' : clientState.winner === 'cpu' ? '😢' : '🤝'}
                  </div>
                  <div className="text-xl font-bold text-slate-900 mb-4">
                    {clientState.winner === PLAYER_ID ? 'あなたの勝利！' : clientState.winner === 'cpu' ? 'CPUの勝利' : '引き分け'}
                  </div>
                  <div className="flex justify-center gap-6 mb-4">
                    <div>
                      <div className="text-xs text-slate-600">あなた</div>
                      <div className="text-3xl font-bold text-slate-900">{myPlayer.score}点</div>
                    </div>
                    <div className="text-2xl text-slate-400">-</div>
                    <div>
                      <div className="text-xs text-slate-600">CPU</div>
                      <div className="text-3xl font-bold text-slate-900">{opponentPlayer.score}点</div>
                    </div>
                  </div>
                </div>
                <Button onClick={handleReset} variant="primary" className="w-full">もう一度プレイ</Button>
                <Link href="/games/emperor">
                  <Button variant="secondary" className="w-full">メニューに戻る</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
