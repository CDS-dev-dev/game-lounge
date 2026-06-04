// インディアンポーカーのゲームボードコンポーネント

'use client';

import React, { useState } from 'react';
import { PlayingCard } from '@/components/game/card/Card';
import type { IndianPokerClientState, BettingAction } from '@/lib/games/indian-poker/types';
import { PLAYER_COLORS } from '@/lib/games/indian-poker/constants';

interface IndianPokerBoardProps {
  state: IndianPokerClientState;
  onAction?: (action: BettingAction) => void;
  disabled?: boolean;
}

export function IndianPokerBoard({ state, onAction, disabled = false }: IndianPokerBoardProps) {
  const [raiseAmount, setRaiseAmount] = useState<number>(state.minRaise);

  // プレイヤーを円形配置するための角度計算
  const getPlayerPosition = (index: number, total: number) => {
    // 自分を下部中央に固定
    if (index === state.myIndex) {
      return {
        position: 'absolute' as const,
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
      };
    }

    // 他プレイヤーは上半分の弧に配置して、自分の操作エリアと重ならないようにする
    const adjustedIndex = index > state.myIndex ? index - 1 : index;
    const adjustedTotal = total - 1;
    const angle = adjustedTotal === 1
      ? -Math.PI / 2
      : -Math.PI * 0.86 + ((Math.PI * 0.72) * adjustedIndex) / (adjustedTotal - 1);

    const x = 50 + 34 * Math.cos(angle);
    const y = 50 + 36 * Math.sin(angle);

    return {
      position: 'absolute' as const,
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)',
    };
  };

  // アクションボタンの表示
  const renderActionButtons = () => {
    if (!state.canOperate || disabled) return null;

    const raiseMax = Math.max(
      state.minRaise,
      Math.min(state.myChips - state.callAmount, Math.max(state.minRaise, state.pot))
    );

    return (
      <div className="mx-auto w-full max-w-3xl rounded-lg border border-neutral-200 bg-white/95 p-3 shadow-xl sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-neutral-950">あなたの操作</p>
            <p className="text-xs text-neutral-600">手持ち {state.myChips} / コール {state.callAmount}</p>
          </div>
          <span className="rounded-lg bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
            最小レイズ {state.minRaise}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {state.canCheck ? (
            <button
              onClick={() => onAction && onAction({ type: 'check' })}
              className="min-h-11 rounded-lg bg-slate-800 px-4 py-2 font-bold text-white transition-colors hover:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-teal-300"
            >
              チェック
            </button>
          ) : (
            <button
              onClick={() => onAction && onAction({ type: 'call' })}
              className="min-h-11 rounded-lg bg-emerald-700 px-4 py-2 font-bold text-white transition-colors hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-teal-300"
            >
              コール {state.callAmount}
            </button>
          )}

          {state.myChips > 0 && (
            <button
              onClick={() => onAction && onAction({ type: 'allin' })}
              className="min-h-11 rounded-lg bg-amber-600 px-4 py-2 font-bold text-white transition-colors hover:bg-amber-700 focus:outline-none focus:ring-4 focus:ring-teal-300"
            >
              オールイン
            </button>
          )}

          <button
            onClick={() => onAction && onAction({ type: 'fold' })}
            className="min-h-11 rounded-lg bg-red-700 px-4 py-2 font-bold text-white transition-colors hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-teal-300"
          >
            フォールド
          </button>
        </div>

        {state.canRaise && (
          <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="indian-raise" className="text-sm font-semibold text-neutral-700">
                レイズ額
              </label>
              <span className="min-w-[64px] text-right text-sm font-bold text-neutral-950">{raiseAmount}</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="indian-raise"
                type="range"
                min={state.minRaise}
                max={raiseMax}
                value={Math.min(raiseAmount, raiseMax)}
                onChange={(e) => setRaiseAmount(Number(e.target.value))}
                className="h-2 flex-1 cursor-pointer accent-amber-600"
              />
              <button
                onClick={() => onAction && onAction({ type: 'raise', amount: Math.min(raiseAmount, raiseMax) })}
                className="min-h-10 rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-teal-300"
              >
                レイズ
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // プレイヤー情報の表示
  const renderPlayer = (index: number) => {
    const player = state.players[index];
    const isMyTurn = index === state.currentTurn;
    const isMe = index === state.myIndex;
    const color = PLAYER_COLORS[index % PLAYER_COLORS.length];

    return (
      <div
        key={player.id}
        style={getPlayerPosition(index, state.players.length)}
        className="flex flex-col items-center"
      >
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
        <div
          className="min-w-[120px] rounded-lg border border-white/70 bg-white/95 px-3 py-2 text-center shadow-lg"
          style={{ borderLeft: `4px solid ${color}` }}
        >
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
    <div className="mx-auto w-full max-w-5xl space-y-3">
      <div className="relative min-h-[520px] overflow-hidden rounded-lg border border-emerald-900/60 bg-[radial-gradient(circle_at_center,#18724d_0%,#0f5138_52%,#0b3327_100%)] shadow-2xl sm:min-h-[620px]">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(90deg,rgba(255,255,255,.14)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.14)_1px,transparent_1px)] [background-size:36px_36px]" aria-hidden="true" />

        {/* 中央：ポット表示 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full border-4 border-amber-200 bg-amber-500 text-neutral-950 shadow-2xl sm:h-40 sm:w-40">
            <div className="mb-1 text-xs font-bold sm:text-sm">POT</div>
            <div className="text-2xl font-bold sm:text-3xl">{state.pot}</div>
            <div className="mt-1 text-xs text-neutral-800">Round {state.round}</div>
          </div>
        </div>

        {/* プレイヤー配置 */}
        {state.players.map((_, index) => renderPlayer(index))}

        {/* ステータス表示 */}
        {state.status === 'showdown' && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 rounded-lg bg-white/95 px-4 py-2 shadow-lg">
            <div className="text-center font-bold text-gray-900">
              ショーダウン！
            </div>
          </div>
        )}

        {state.status === 'finished' && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 rounded-lg bg-white/95 px-4 py-2 shadow-lg">
            <div className="text-center font-bold text-gray-900">
              ゲーム終了
            </div>
          </div>
        )}
      </div>

      {/* アクションボタン */}
      {renderActionButtons()}
    </div>
  );
}
