// インディアンポーカーのゲームボードコンポーネント

'use client';

import React, { useState } from 'react';
import { PlayingCard } from '@/components/game/card/Card';
import type { IndianPokerClientState, BettingAction } from '@/lib/games/indian-poker/types';
import { PLAYER_COLORS } from '@/lib/games/indian-poker/constants';
import { Modal } from '@/components/ui/Modal';
import {
  ActionButton,
  ActionButtonGroup,
  BottomActionArea,
  DecisionPanel,
  GameLog,
  GameScreen,
  PlaySurface,
  PlayerStatusCard,
} from '@/components/game/GamePlayUI';

interface IndianPokerBoardProps {
  state: IndianPokerClientState;
  onAction?: (action: BettingAction) => void;
  disabled?: boolean;
}

export function IndianPokerBoard({ state, onAction, disabled = false }: IndianPokerBoardProps) {
  const [raiseAmount, setRaiseAmount] = useState<number>(state.minRaise);
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const myPlayer = state.players[state.myIndex];
  const opponents = state.players.filter((_, index) => index !== state.myIndex);
  const currentPlayer = state.players[state.currentTurn];
  const actionLabels: Record<string, string> = {
    fold: 'フォールド',
    call: 'コール',
    raise: 'レイズ',
    check: 'チェック',
    allin: 'オールイン',
  };
  const visibleRanks = opponents
    .map((player) => player.card?.rank)
    .filter(Boolean)
    .join(' / ');
  const decisionTitle = state.canOperate
    ? state.callAmount > 0
      ? '相手のカードを見て、勝負に残るか'
      : '無料で様子を見るか、賭けを上げるか'
    : '相手の判断を待っています';
  const decisionDetail = state.canOperate
    ? `見えているカード: ${visibleRanks || 'なし'}。自分のカードは見えません。`
    : `${currentPlayer?.name || '相手'}が行動中です。`;

  // アクションボタンの表示
  const renderActionButtons = () => {
    if (!state.canOperate || disabled) return null;

    return (
      <BottomActionArea>
        <ActionButtonGroup
          title="次にできる操作"
          subtitle={`手持ち ${state.myChips} / コール ${state.callAmount}`}
        >
          {state.canCheck ? (
            <ActionButton tone="primary" onClick={() => onAction && onAction({ type: 'check' })}>
              チェック
            </ActionButton>
          ) : (
            <ActionButton tone="primary" onClick={() => onAction && onAction({ type: 'call' })}>
              コール {state.callAmount}
            </ActionButton>
          )}

          {state.myChips > 0 && (
            <ActionButton tone="danger" onClick={() => onAction && onAction({ type: 'allin' })}>
              オールイン
            </ActionButton>
          )}

          <ActionButton tone="ghost" onClick={() => onAction && onAction({ type: 'fold' })}>
            フォールド
          </ActionButton>
          {state.canRaise && (
            <ActionButton tone="warning" onClick={() => setShowRaiseModal(true)}>
              レイズ
            </ActionButton>
          )}
        </ActionButtonGroup>
      </BottomActionArea>
    );
  };

  // プレイヤー情報の表示
  const renderPlayer = (index: number) => {
    const player = state.players[index];
    const isMyTurn = index === state.currentTurn;
    const isMe = index === state.myIndex;
    const color = PLAYER_COLORS[index % PLAYER_COLORS.length];

    return (
      <div key={player.id} className="flex min-w-0 flex-col items-center">
        {/* カード表示 */}
        <div className={`mb-2 ${isMyTurn ? 'animate-pulse' : ''}`}>
          <PlayingCard
            card={player.card}
            faceDown={isMe}
            size="small"
            className={isMyTurn ? 'ring-4 ring-yellow-400' : ''}
          />
        </div>

        {/* プレイヤー情報 */}
        <div className="w-full rounded-lg border border-white/70 bg-white/95 px-2 py-1.5 text-center shadow-lg sm:px-3 sm:py-2" style={{ borderLeft: `4px solid ${color}` }}>
          <div className="mb-1 truncate text-xs font-bold text-gray-900 sm:text-sm">
            {player.name}
            {player.isCPU && ' 🤖'}
            {isMe && ' (あなた)'}
          </div>

          <div className="text-xs text-gray-600 space-y-0.5">
            <div>💰 {player.chips}</div>
            {player.currentBet > 0 && (
              <div className="text-blue-600 font-bold">
                ベット: {player.currentBet}
              </div>
            )}
            {player.action && (
              <div className={`
                font-bold text-[10px] sm:text-xs
                ${player.action === 'fold' ? 'text-red-600' : ''}
                ${player.action === 'raise' ? 'text-orange-600' : ''}
                ${player.action === 'call' ? 'text-green-600' : ''}
              `}>
                {player.action === 'fold' && 'フォールド'}
                {player.action === 'raise' && 'レイズ'}
                {player.action === 'call' && 'コール'}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <GameScreen>
      <DecisionPanel
        title={decisionTitle}
        detail={decisionDetail}
        status={state.status === 'showdown' ? 'ショーダウン' : state.status === 'finished' ? '終了' : `R${state.round}`}
        primary={state.canOperate ? (state.callAmount > 0 ? `コール ${state.callAmount}` : 'チェック可') : '待機'}
        metrics={[
          { label: 'ポット', value: state.pot.toLocaleString(), tone: 'hot' },
          { label: '必要コール', value: state.callAmount.toLocaleString(), tone: state.canOperate ? 'hot' : 'plain' },
          { label: '手持ち', value: state.myChips.toLocaleString(), tone: 'cool' },
          { label: '手番', value: currentPlayer?.name || '-' },
        ]}
      />

      <section className="grid min-h-0 flex-1 gap-2 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-3">
        <PlaySurface>
          <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
            <h2 className="text-sm font-bold text-white sm:text-base">判断材料: 相手の見えているカード</h2>
            <span className="rounded-md bg-white/15 px-3 py-1 text-xs font-bold text-white">
              POT {state.pot.toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {opponents.map((player) => {
              const index = state.players.indexOf(player);
              return <div key={player.id} className="min-w-0">{renderPlayer(index)}</div>;
            })}
          </div>
        </PlaySurface>

        <aside className="space-y-3">
          <PlayerStatusCard
            name={`${myPlayer?.name || 'あなた'} (YOU)`}
            isActive={state.canOperate}
            note={undefined}
            action={state.canOperate ? 'あなたの番' : '待機'}
          >
            <div className="flex justify-center">
              <PlayingCard card={myPlayer?.card} faceDown size="small" />
            </div>
          </PlayerStatusCard>

          <div className="hidden sm:block">
            <GameLog
              items={state.players
                .filter((player) => player.action)
                .map((player) => `${player.name}: ${actionLabels[player.action || ''] || player.action}`)}
            />
          </div>
        </aside>
      </section>

      {renderActionButtons()}
      <Modal
        isOpen={showRaiseModal}
        onClose={() => setShowRaiseModal(false)}
        title="レイズ額を決める"
        showCloseButton
      >
        {(() => {
          const raiseMax = Math.max(
            state.minRaise,
            Math.min(state.myChips - state.callAmount, Math.max(state.minRaise, state.pot))
          );

          return (
            <div className="space-y-4">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                <div className="text-xs font-semibold text-neutral-500">レイズ額</div>
                <div className="mt-1 text-2xl font-bold text-neutral-950">{Math.min(raiseAmount, raiseMax)}</div>
              </div>
              <input
                id="indian-raise"
                type="range"
                min={state.minRaise}
                max={raiseMax}
                value={Math.min(raiseAmount, raiseMax)}
                onChange={(e) => setRaiseAmount(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-amber-600"
              />
              <div className="grid grid-cols-2 gap-2">
                <ActionButton tone="ghost" onClick={() => setShowRaiseModal(false)}>
                  キャンセル
                </ActionButton>
                <ActionButton
                  tone="warning"
                  onClick={() => {
                    onAction?.({ type: 'raise', amount: Math.min(raiseAmount, raiseMax) });
                    setShowRaiseModal(false);
                  }}
                >
                  レイズする
                </ActionButton>
              </div>
            </div>
          );
        })()}
      </Modal>
    </GameScreen>
  );
}
