// テキサスホールデムのゲームボード

'use client';

import React from 'react';
import { PlayingCard } from './card/Card';
import type { TexasHoldemClientState, PlayerAction } from '@/lib/games/texas-holdem/types';
import { toCommonCard } from '@/lib/games/texas-holdem/types';
import { Modal } from '@/components/ui/Modal';
import {
  ActionButton,
  ActionButtonGroup,
  BottomActionArea,
  DecisionPanel,
  GameLog,
  GameScreen,
  GameStatePanel,
  PlaySurface,
  PlayerStatusCard,
} from '@/components/game/GamePlayUI';

export interface TexasHoldemBoardProps {
  gameState: TexasHoldemClientState;
  onAction: (action: PlayerAction, raiseAmount?: number) => void;
  disabled?: boolean;
}

const phaseLabels: Record<TexasHoldemClientState['status'], string> = {
  waiting: '待機中',
  preflop: 'プリフロップ',
  flop: 'フロップ',
  turn: 'ターン',
  river: 'リバー',
  showdown: 'ショーダウン',
  finished: '終了',
};

const actionLabels: Record<Exclude<PlayerAction, null>, string> = {
  fold: 'フォールド',
  check: 'チェック',
  call: 'コール',
  raise: 'レイズ',
  allin: 'オールイン',
};

function getPositionLabel(
  playerPosition: number,
  dealerButton: number,
  playerCount: number
) {
  const sbPosition = (dealerButton + 1) % playerCount;
  const bbPosition = (dealerButton + 2) % playerCount;
  if (playerPosition === dealerButton) return 'BTN';
  if (playerPosition === sbPosition) return 'SB';
  if (playerPosition === bbPosition) return 'BB';
  return '';
}

export const TexasHoldemBoard: React.FC<TexasHoldemBoardProps> = ({
  gameState,
  onAction,
  disabled = false,
}) => {
  const myPlayer = gameState.players.find((p) => p.id === gameState.myPlayerId);
  const opponents = gameState.players.filter((p) => p.id !== gameState.myPlayerId);
  const [showRaiseModal, setShowRaiseModal] = React.useState(false);
  const [raiseAmount, setRaiseAmount] = React.useState(gameState.minRaise);

  React.useEffect(() => {
    setRaiseAmount((current) =>
      Math.max(gameState.minRaise, Math.min(current, myPlayer?.chips || gameState.minRaise))
    );
  }, [gameState.minRaise, myPlayer?.chips]);

  const currentPlayer = gameState.players.find((p) => p.position === gameState.currentTurn);
  const isActionAvailable = gameState.isMyTurn && !disabled && gameState.status !== 'showdown';
  const communityCards = gameState.communityCards;
  const missingCommunityCards = Math.max(0, 5 - communityCards.length);
  const latestActions = gameState.players
    .filter((player) => player.action)
    .map((player) => `${player.name}: ${actionLabels[player.action as Exclude<PlayerAction, null>]}`);

  const handleRaiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!Number.isNaN(value)) {
      setRaiseAmount(Math.max(gameState.minRaise, Math.min(value, myPlayer?.chips || 0)));
    }
  };

  const handleRaiseConfirm = () => {
    onAction('raise', raiseAmount);
    setShowRaiseModal(false);
  };

  const decisionTitle = gameState.isMyTurn
    ? gameState.callAmount > 0
      ? '払って参加するか、降りるか'
      : '無料で見るか、圧力をかけるか'
    : '相手の判断を待っています';
  const decisionDetail = gameState.isMyTurn
    ? gameState.callAmount > 0
      ? `必要コールは ${gameState.callAmount.toLocaleString()}。手札と場札を見て判断します。`
      : 'チェックで次へ進むか、レイズでポットを取りに行きます。'
    : `${currentPlayer?.name || '相手'}がアクション中です。`;

  return (
    <GameScreen>
      <DecisionPanel
        title={decisionTitle}
        detail={decisionDetail}
        status={phaseLabels[gameState.status]}
        primary={gameState.isMyTurn ? `次: ${gameState.callAmount > 0 ? 'コール/フォールド' : 'チェック/レイズ'}` : '待機'}
        metrics={[
          { label: 'ポット', value: gameState.pot.toLocaleString(), tone: 'hot' },
          { label: '必要コール', value: gameState.callAmount.toLocaleString(), tone: gameState.isMyTurn ? 'hot' : 'plain' },
          { label: '現在ベット', value: gameState.currentBet.toLocaleString() },
          { label: '手持ち', value: (myPlayer?.chips || 0).toLocaleString(), tone: 'cool' },
        ]}
      />

      <section className="grid min-h-0 min-w-0 flex-1 gap-2 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex min-h-0 min-w-0 flex-col gap-2">
          <PlaySurface className="sm:p-4">
            <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
              <h2 className="text-sm font-bold text-white sm:text-base">場のカード</h2>
              <span className="rounded-md bg-white/15 px-3 py-1 text-xs font-bold text-white">
                {phaseLabels[gameState.status]}
              </span>
            </div>

            <div className="grid min-h-20 grid-cols-5 place-items-center gap-1 rounded-lg border border-white/15 bg-black/20 p-2 sm:min-h-32 sm:gap-3 sm:p-3">
              {communityCards.length ? (
                communityCards.map((card, index) => (
                  <React.Fragment key={`${card.id}-${index}`}>
                    <span className="sm:hidden"><PlayingCard card={toCommonCard(card)} size="small" /></span>
                    <span className="hidden sm:block"><PlayingCard card={toCommonCard(card)} size="medium" /></span>
                  </React.Fragment>
                ))
              ) : (
                <div className="col-span-5 rounded-md border border-dashed border-white/30 px-4 py-3 text-sm font-semibold text-white/80">
                  まだ場札はありません
                </div>
              )}
              {communityCards.length > 0 &&
                Array.from({ length: missingCommunityCards }).map((_, index) => (
                  <React.Fragment key={`empty-${index}`}>
                    <span className="sm:hidden"><PlayingCard card={null} size="small" className="bg-white/70" /></span>
                    <span className="hidden sm:block"><PlayingCard card={null} size="medium" className="bg-white/70" /></span>
                  </React.Fragment>
                ))}
            </div>
          </PlaySurface>

          <section className="grid min-h-0 grid-cols-3 gap-2">
            {opponents.map((player) => (
              <div key={player.id} className="min-w-0">
                <PlayerStatusCard
                  name={player.name}
                  chips={player.chips}
                  bet={player.currentBet}
                  isActive={gameState.currentTurn === player.position}
                  isFolded={!player.isActive}
                  position={getPositionLabel(player.position, gameState.dealerButton, gameState.players.length)}
                  action={player.action ? actionLabels[player.action as Exclude<PlayerAction, null>] : '待機'}
                  note={!player.isActive ? '降りています' : gameState.currentTurn === player.position ? '行動中' : '参加中'}
                >
                  <div className="hidden justify-center gap-1 sm:flex">
                    {player.holeCards && player.isActive ? (
                      <>
                        <PlayingCard faceDown size="small" />
                        <PlayingCard faceDown size="small" />
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-neutral-500">カードなし</span>
                    )}
                  </div>
                </PlayerStatusCard>
              </div>
            ))}
          </section>
        </div>

        <aside className="min-h-0 min-w-0 space-y-2 sm:space-y-3">
          <PlayerStatusCard
            name={`${myPlayer?.name || 'あなた'} (YOU)`}
            isActive={gameState.isMyTurn}
            isFolded={myPlayer ? !myPlayer.isActive : false}
            note={gameState.isMyTurn ? undefined : '相手の手番です'}
            action={gameState.isMyTurn ? 'あなたの番' : '待機'}
          >
            <div data-own-hand className="flex min-h-20 items-center justify-center gap-2 pb-2 pt-1 sm:min-h-32 sm:pb-0 sm:pt-0">
              {myPlayer?.holeCards ? (
                <>
                  <span className="sm:hidden"><PlayingCard card={toCommonCard(myPlayer.holeCards[0])} size="small" /></span>
                  <span className="sm:hidden"><PlayingCard card={toCommonCard(myPlayer.holeCards[1])} size="small" /></span>
                  <span className="hidden sm:block"><PlayingCard card={toCommonCard(myPlayer.holeCards[0])} size="medium" /></span>
                  <span className="hidden sm:block"><PlayingCard card={toCommonCard(myPlayer.holeCards[1])} size="medium" /></span>
                </>
              ) : (
                <>
                  <span className="sm:hidden"><PlayingCard faceDown size="small" /></span>
                  <span className="sm:hidden"><PlayingCard faceDown size="small" /></span>
                  <span className="hidden sm:block"><PlayingCard faceDown size="medium" /></span>
                  <span className="hidden sm:block"><PlayingCard faceDown size="medium" /></span>
                </>
              )}
            </div>
          </PlayerStatusCard>

          <div className="hidden sm:block">
            <GameLog items={latestActions} />
          </div>
        </aside>
      </section>

      {gameState.status === 'showdown' && gameState.winners.length > 0 && (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <h2 className="text-lg font-bold text-emerald-950">勝者</h2>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {gameState.winners.map((winner, index) => {
              const winnerPlayer = gameState.players.find((p) => p.id === winner.playerId);
              return (
                <div key={index} className="rounded-md bg-white p-3">
                  <div className="font-bold text-neutral-950">{winnerPlayer?.name}</div>
                  <div className="text-sm text-neutral-600">{winner.hand.description}</div>
                  <div className="mt-1 text-sm font-bold text-emerald-700">
                    獲得 {winner.amount.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {isActionAvailable ? (
        <BottomActionArea>
          <ActionButtonGroup
            title="次にできる操作"
            subtitle={`コール ${gameState.callAmount.toLocaleString()} / 最小レイズ ${gameState.minRaise.toLocaleString()}`}
          >
            {gameState.canFold ? (
              <ActionButton tone="ghost" onClick={() => onAction('fold')}>
                フォールド
              </ActionButton>
            ) : null}
            {gameState.canCheck ? (
              <ActionButton tone="primary" onClick={() => onAction('check')}>
                チェック
              </ActionButton>
            ) : null}
            {gameState.canCall ? (
              <ActionButton tone="primary" onClick={() => onAction('call')}>
                コール {gameState.callAmount.toLocaleString()}
              </ActionButton>
            ) : null}
            {gameState.canRaise ? (
              <ActionButton tone="warning" onClick={() => setShowRaiseModal(true)}>
                レイズ
              </ActionButton>
            ) : null}
            {myPlayer && myPlayer.chips > 0 ? (
              <ActionButton tone="danger" onClick={() => onAction('allin')}>
                オールイン
              </ActionButton>
            ) : null}
          </ActionButtonGroup>
        </BottomActionArea>
      ) : (
        <div className="rounded-lg border border-neutral-200 bg-white p-3 text-center text-sm font-semibold text-neutral-700 shadow-sm">
          {gameState.status === 'showdown' ? '結果を確認しています' : '相手の行動を待っています'}
        </div>
      )}

      <Modal
        isOpen={showRaiseModal}
        onClose={() => setShowRaiseModal(false)}
        title="レイズ額を決める"
        showCloseButton
      >
        <div className="space-y-4">
          <GameStatePanel
            title="レイズ"
            subtitle="最小額以上、あなたのチップ以内で指定してください。"
            items={[
              { label: '指定額', value: raiseAmount.toLocaleString(), emphasis: true },
              { label: '最小', value: gameState.minRaise.toLocaleString() },
              { label: '最大', value: (myPlayer?.chips || 0).toLocaleString() },
              { label: 'ポット', value: gameState.pot.toLocaleString() },
            ]}
            className="shadow-none"
          />

          <input
            type="range"
            value={raiseAmount}
            onChange={handleRaiseChange}
            min={gameState.minRaise}
            max={myPlayer?.chips || 0}
            step={gameState.minRaise}
            className="h-2 w-full cursor-pointer accent-amber-600"
          />

          <input
            type="number"
            value={raiseAmount}
            onChange={handleRaiseChange}
            min={gameState.minRaise}
            max={myPlayer?.chips || 0}
            step={gameState.minRaise}
            className="min-h-11 w-full rounded-lg border border-neutral-300 px-3 text-neutral-950 focus:outline-none focus:ring-4 focus:ring-amber-300"
          />

          <div className="grid grid-cols-3 gap-2">
            <ActionButton tone="ghost" onClick={() => setRaiseAmount(gameState.minRaise)}>
              最小
            </ActionButton>
            <ActionButton
              tone="ghost"
              onClick={() => setRaiseAmount(Math.max(gameState.minRaise, Math.floor(gameState.pot / 2)))}
            >
              1/2
            </ActionButton>
            <ActionButton tone="ghost" onClick={() => setRaiseAmount(myPlayer?.chips || 0)}>
              最大
            </ActionButton>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <ActionButton tone="ghost" onClick={() => setShowRaiseModal(false)}>
              キャンセル
            </ActionButton>
            <ActionButton tone="warning" onClick={handleRaiseConfirm}>
              レイズする
            </ActionButton>
          </div>
        </div>
      </Modal>
    </GameScreen>
  );
};
