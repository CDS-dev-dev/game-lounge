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
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
      };
    }

    // 他プレイヤーを円形配置
    const adjustedIndex = index > state.myIndex ? index - 1 : index;
    const adjustedTotal = total - 1;
    const angle = (Math.PI * (adjustedIndex + 0.5)) / adjustedTotal;

    const radius = 35; // パーセント単位
    const x = 50 + radius * Math.sin(angle);
    const y = 50 - radius * Math.cos(angle);

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

    return (
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-white/95 rounded-xl shadow-2xl p-3 sm:p-4 min-w-[280px] sm:min-w-[320px]">
        <div className="space-y-2">
          {/* チェック/コールボタン */}
          {state.canCheck ? (
            <button
              onClick={() => onAction && onAction({ type: 'check' })}
              className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-colors"
            >
              チェック
            </button>
          ) : (
            <button
              onClick={() => onAction && onAction({ type: 'call' })}
              className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-colors"
            >
              コール ({state.callAmount}チップ)
            </button>
          )}

          {/* レイズボタン */}
          {state.canRaise && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={state.minRaise}
                  max={Math.min(state.myChips - state.callAmount, state.pot)}
                  value={raiseAmount}
                  onChange={(e) => setRaiseAmount(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs sm:text-sm font-bold min-w-[60px] text-right">
                  {raiseAmount}
                </span>
              </div>
              <button
                onClick={() => onAction && onAction({ type: 'raise', amount: raiseAmount })}
                className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold transition-colors"
              >
                レイズ
              </button>
            </div>
          )}

          {/* オールインボタン */}
          {state.myChips > 0 && (
            <button
              onClick={() => onAction && onAction({ type: 'allin' })}
              className="w-full py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold transition-colors"
            >
              オールイン
            </button>
          )}

          {/* フォールドボタン */}
          <button
            onClick={() => onAction && onAction({ type: 'fold' })}
            className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-colors"
          >
            フォールド
          </button>
        </div>
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
          className="bg-white/90 rounded-lg px-3 py-2 shadow-lg min-w-[120px] text-center"
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
    <div className="relative w-full h-full min-h-[600px]">
      {/* 中央：ポット表示 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full w-32 h-32 sm:w-40 sm:h-40 flex flex-col items-center justify-center shadow-2xl border-4 border-yellow-300">
          <div className="text-white text-xs sm:text-sm font-bold mb-1">POT</div>
          <div className="text-white text-2xl sm:text-3xl font-bold">{state.pot}</div>
          <div className="text-white/80 text-xs mt-1">Round {state.round}</div>
        </div>
      </div>

      {/* プレイヤー配置 */}
      {state.players.map((_, index) => renderPlayer(index))}

      {/* アクションボタン */}
      {renderActionButtons()}

      {/* ステータス表示 */}
      {state.status === 'showdown' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/95 rounded-lg px-4 py-2 shadow-lg">
          <div className="text-center font-bold text-gray-900">
            ショーダウン！
          </div>
        </div>
      )}

      {state.status === 'finished' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/95 rounded-lg px-4 py-2 shadow-lg">
          <div className="text-center font-bold text-gray-900">
            ゲーム終了
          </div>
        </div>
      )}
    </div>
  );
}
