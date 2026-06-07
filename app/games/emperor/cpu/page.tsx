// エンペラーゲーム（カイジのEカード）CPU対戦ページ

'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameHeader } from '@/components/layout/GameHeader';
import { PlaySetupCard, SetupOptionButton } from '@/components/game/PlaySetup';
import { GameScreen, GameStatePanel, PlayerStatusCard } from '@/components/game/GamePlayUI';
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
    <div className="min-h-screen app-bg board-pattern pt-16 pb-3 px-3 sm:pt-20 sm:px-4">
      <GameHeader title="エンペラーゲーム - CPU対戦" />

      <main className="container mx-auto px-0 py-2 sm:px-4 sm:py-4">
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
              <Link
                href="/games/emperor"
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-800 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2"
              >
                戻る
              </Link>
            </div>
          </PlaySetupCard>
        )}

        {(phase === 'playing' || phase === 'battleResult' || phase === 'setEnd') && clientState && myPlayer && opponentPlayer && (
          <GameScreen className="max-w-4xl">
            <GameStatePanel
              title={phase === 'playing' ? 'カードを1枚選んで勝負' : phase === 'battleResult' ? '勝負結果' : `セット${clientState.currentSet}終了`}
              subtitle={undefined}
              status={`セット ${clientState.currentSet}/${clientState.maxSets} / 勝負 ${clientState.currentBattle}/5`}
              items={[
                { label: 'あなた', value: `${myPlayer.score}点`, emphasis: true },
                { label: '陣営', value: SIDE_NAMES[myPlayer.side] },
                { label: 'CPU', value: `${opponentPlayer.score}点` },
                { label: '残り札', value: `${myPlayer.hand.length}枚` },
              ]}
            />

            <section className="grid min-h-0 flex-1 gap-2 md:grid-cols-[220px_minmax(0,1fr)]">
              <aside className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
                <PlayerStatusCard
                  name="あなた"
                  note={`残り ${myPlayer.hand.length}枚`}
                  action={SIDE_NAMES[myPlayer.side]}
                  isActive={phase === 'playing'}
                />
                <PlayerStatusCard
                  name="CPU"
                  note={`残り ${opponentPlayer.hand.length}枚`}
                  action={SIDE_NAMES[opponentPlayer.side]}
                  isActive={false}
                />
              </aside>

              <section className="rounded-lg border border-neutral-200 bg-white p-2 shadow-sm sm:p-3">
                <div className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)]">
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2 text-center sm:p-3">
                    <div className="mb-2 text-xs font-semibold text-neutral-600">CPUのカード</div>
                    {clientState.cpuCard ? (
                      <div className={`inline-block rounded-lg border-2 px-4 py-2 ${CARD_COLORS[clientState.cpuCard.type]}`}>
                        <div className="text-2xl sm:text-3xl">{CARD_EMOJIS[clientState.cpuCard.type]}</div>
                        <div className="mt-1 text-sm font-bold">{CARD_NAMES[clientState.cpuCard.type]}</div>
                      </div>
                    ) : (
                      <div className="inline-block rounded-lg border-2 border-dashed border-slate-300 bg-slate-100 px-4 py-2">
                        <div className="text-2xl sm:text-3xl">?</div>
                        <div className="mt-1 text-sm font-bold text-slate-500">未選択</div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h2 className="mb-2 text-sm font-bold text-neutral-950">あなたの手札</h2>
                    <div className="flex flex-wrap justify-center gap-2">
                      {myPlayer.hand.map((card) => (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => handleCardSelect(card.id)}
                          disabled={phase !== 'playing'}
                          className={`min-h-20 min-w-[72px] rounded-lg border-2 px-2.5 py-1.5 transition-all sm:min-h-24 sm:min-w-20 sm:px-3 sm:py-2 ${CARD_COLORS[card.type]} ${
                            phase === 'playing' ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-50'
                          } ${selectedCardId === card.id ? 'ring-4 ring-blue-500' : ''}`}
                        >
                          <div className="text-2xl sm:text-3xl">{CARD_EMOJIS[card.type]}</div>
                          <div className="mt-1 text-xs font-bold">{CARD_NAMES[card.type]}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {clientState.lastBattleResult && phase === 'battleResult' && (
                  <div className="mt-3 rounded-lg border-2 border-blue-500 bg-blue-50 p-3 text-center">
                    <div className="text-lg font-bold text-slate-900">
                      {clientState.lastBattleResult.winner === 'draw' ? '引き分け' :
                       clientState.lastBattleResult.winner === 'player' ? 'あなたの勝ち' : 'CPUの勝ち'}
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-700">
                      あなた +{clientState.lastBattleResult.playerPoints} / CPU +{clientState.lastBattleResult.cpuPoints}
                    </div>
                  </div>
                )}

                {phase === 'setEnd' && (
                  <div className="mt-3 text-center">
                    <Button onClick={handleNextSet} variant="primary" size="lg">次のセットへ</Button>
                  </div>
                )}
              </section>
            </section>
          </GameScreen>
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
                <Link
                  href="/games/emperor"
                  className="inline-flex min-h-[48px] w-full items-center justify-center rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-800 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2"
                >
                  メニューに戻る
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
