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
  GameScreen,
  GameStatePanel,
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

  const nextDecision = gameState.isMyTurn
    ? gameState.callAmount > 0
      ? `コール ${gameState.callAmount.toLocaleString()} で残る / フォールドで降りる`
      : 'チェックで見る / レイズで圧力をかける'
    : `${currentPlayer?.name || '相手'}の判断待ち`;

  const renderOpponentSeat = (player: TexasHoldemClientState['players'][number]) => (
    <div
      key={player.id}
      className={`min-w-0 rounded-lg border bg-white/95 p-2 shadow-sm ${
        gameState.currentTurn === player.position ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-white/70'
      } ${!player.isActive ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold text-neutral-950">{player.name}</span>
            {getPositionLabel(player.position, gameState.dealerButton, gameState.players.length) ? (
              <span className="rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {getPositionLabel(player.position, gameState.dealerButton, gameState.players.length)}
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-xs font-semibold text-neutral-500">
            {player.isActive ? '参加中' : 'フォールド'}
          </div>
        </div>
        <span className="shrink-0 rounded-md bg-neutral-100 px-2 py-1 text-xs font-bold text-neutral-800">
          {player.action ? actionLabels[player.action as Exclude<PlayerAction, null>] : '待機'}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <div className="rounded-md bg-neutral-50 px-2 py-1">
          <div className="text-[10px] font-bold text-neutral-500">チップ</div>
          <div className="text-sm font-bold text-neutral-950">{player.chips.toLocaleString()}</div>
        </div>
        <div className="rounded-md bg-neutral-50 px-2 py-1">
          <div className="text-[10px] font-bold text-neutral-500">ベット</div>
          <div className="text-sm font-bold text-neutral-950">{player.currentBet.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );

  return (
    <GameScreen className="max-w-5xl">
      <section className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-2 rounded-xl border border-emerald-900/60 bg-[radial-gradient(circle_at_center,#176b49_0%,#0c3f2f_58%,#08231e_100%)] p-2 shadow-2xl sm:p-3">
        <div className="grid grid-cols-4 gap-1.5 rounded-lg bg-black/20 p-1.5 text-white sm:grid-cols-5 sm:gap-2">
          <div className="rounded-md bg-white/15 px-2 py-1.5">
            <div className="text-[10px] font-bold text-white/70">判断</div>
            <div className="truncate text-sm font-bold">{nextDecision}</div>
          </div>
          <div className="rounded-md bg-amber-300 px-2 py-1.5 text-neutral-950">
            <div className="text-[10px] font-bold text-neutral-600">POT</div>
            <div className="text-lg font-black">{gameState.pot.toLocaleString()}</div>
          </div>
          <div className="rounded-md bg-white/15 px-2 py-1.5">
            <div className="text-[10px] font-bold text-white/70">コール</div>
            <div className="text-lg font-black">{gameState.callAmount.toLocaleString()}</div>
          </div>
          <div className="rounded-md bg-white/15 px-2 py-1.5">
            <div className="text-[10px] font-bold text-white/70">手持ち</div>
            <div className="text-lg font-black">{(myPlayer?.chips || 0).toLocaleString()}</div>
          </div>
          <div className="hidden rounded-md bg-white/15 px-2 py-1.5 sm:block">
            <div className="text-[10px] font-bold text-white/70">フェーズ</div>
            <div className="truncate text-sm font-bold">{phaseLabels[gameState.status]}</div>
          </div>
        </div>

        <div className="grid min-h-0 gap-2 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-2">
            <div className="grid grid-cols-3 gap-2">
              {opponents.map(renderOpponentSeat)}
            </div>

            <div className="grid place-items-center rounded-xl border border-white/15 bg-black/20 p-2">
              <div className="mb-2 rounded-full bg-white/15 px-4 py-1 text-xs font-bold text-white">
                {phaseLabels[gameState.status]}
              </div>
              <div className="grid grid-cols-5 place-items-center gap-1 sm:gap-3">
                {communityCards.length ? (
                  communityCards.map((card, index) => (
                    <React.Fragment key={`${card.id}-${index}`}>
                      <span className="sm:hidden"><PlayingCard card={toCommonCard(card)} size="small" /></span>
                      <span className="hidden sm:block"><PlayingCard card={toCommonCard(card)} size="medium" /></span>
                    </React.Fragment>
                  ))
                ) : (
                  <div className="col-span-5 rounded-md border border-dashed border-white/30 px-5 py-4 text-sm font-bold text-white/80">
                    場札なし
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
            </div>

            <div className="rounded-lg border border-white/20 bg-white p-2 shadow-sm">
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-bold text-neutral-950">{myPlayer?.name || 'あなた'} (YOU)</h2>
                  <p className="text-xs font-semibold text-neutral-600">{gameState.isMyTurn ? 'あなたの判断です' : '相手の手番です'}</p>
                </div>
                <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-bold text-neutral-800">
                  {gameState.isMyTurn ? '手番' : '待機'}
                </span>
              </div>
              <div data-own-hand className="flex min-h-20 items-center justify-center gap-2">
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
            </div>
          </div>

          <aside className="grid gap-2 rounded-lg bg-white/95 p-2 shadow-sm lg:grid-rows-[auto_minmax(0,1fr)]">
            <div>
              <h2 className="text-sm font-bold text-neutral-950">次にできる操作</h2>
              <p className="mt-1 text-xs font-semibold text-neutral-600">{nextDecision}</p>
            </div>
            {isActionAvailable ? (
              <ActionButtonGroup title="操作" subtitle={`最小レイズ ${gameState.minRaise.toLocaleString()}`} className="shadow-none">
                {gameState.canFold ? <ActionButton tone="ghost" onClick={() => onAction('fold')}>フォールド</ActionButton> : null}
                {gameState.canCheck ? <ActionButton tone="primary" onClick={() => onAction('check')}>チェック</ActionButton> : null}
                {gameState.canCall ? <ActionButton tone="primary" onClick={() => onAction('call')}>コール {gameState.callAmount.toLocaleString()}</ActionButton> : null}
                {gameState.canRaise ? <ActionButton tone="warning" onClick={() => setShowRaiseModal(true)}>レイズ</ActionButton> : null}
                {myPlayer && myPlayer.chips > 0 ? <ActionButton tone="danger" onClick={() => onAction('allin')}>オールイン</ActionButton> : null}
              </ActionButtonGroup>
            ) : (
              <div className="grid min-h-20 place-items-center rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-center text-sm font-bold text-neutral-700">
                {gameState.status === 'showdown' ? '結果を確認しています' : '相手の行動を待っています'}
              </div>
            )}
          </aside>
        </div>
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
