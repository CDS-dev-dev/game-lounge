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
  GameLog,
  GameScreen,
  GameStatePanel,
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
            faceDown={isMe} // 自分のカードだけ裏向き
            size="medium"
            className={isMyTurn ? 'ring-4 ring-yellow-400' : ''}
          />
        </div>

        {/* プレイヤー情報 */}
        <div className="w-full min-w-[120px] rounded-lg border border-white/70 bg-white/95 px-3 py-2 text-center shadow-lg" style={{ borderLeft: `4px solid ${color}` }}>
          <div className="text-xs sm:text-sm font-bold text-gray-900 mb-1">
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
      <GameStatePanel
        title={state.canOperate ? 'あなたの判断です' : '相手のアクション待ち'}
        subtitle={undefined}
        status={state.status === 'showdown' ? 'ショーダウン' : state.status === 'finished' ? '終了' : `Round ${state.round}`}
        items={[
          { label: 'ポット', value: state.pot.toLocaleString(), emphasis: true },
          { label: '必要コール', value: state.callAmount.toLocaleString(), emphasis: state.canOperate },
          { label: 'あなたのチップ', value: state.myChips.toLocaleString() },
          { label: '手番', value: currentPlayer?.name || '-' },
        ]}
      />

      <section className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-lg border border-emerald-900/60 bg-[radial-gradient(circle_at_center,#18724d_0%,#0f5138_52%,#0b3327_100%)] p-3 shadow-2xl">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-white sm:text-base">見えているカード</h2>
            <span className="rounded-md bg-white/15 px-3 py-1 text-xs font-bold text-white">
              POT {state.pot.toLocaleString()}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
            {opponents.map((player) => {
              const index = state.players.indexOf(player);
              return <div key={player.id} className="w-36 shrink-0 sm:w-auto">{renderPlayer(index)}</div>;
            })}
          </div>
        </div>

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
