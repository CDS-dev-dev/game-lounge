// テキサスホールデムのゲームボード

'use client';

import React from 'react';
import { PlayingCard } from './card/Card';
import type { TexasHoldemClientState, PlayerAction } from '@/lib/games/texas-holdem/types';
import { toCommonCard } from '@/lib/games/texas-holdem/types';

export interface TexasHoldemBoardProps {
  gameState: TexasHoldemClientState;
  onAction: (action: PlayerAction, raiseAmount?: number) => void;
  disabled?: boolean;
}

/**
 * テキサスホールデムのゲームボード
 *
 * レイアウト:
 * - 上部: 対戦相手の情報とカード
 * - 中央: コミュニティカードとポット
 * - 下部: 自分のカードとアクションボタン
 */
export const TexasHoldemBoard: React.FC<TexasHoldemBoardProps> = ({
  gameState,
  onAction,
  disabled = false,
}) => {
  const [raiseAmount, setRaiseAmount] = React.useState(gameState.minRaise);

  // プレイヤーを自分と相手に分ける
  const myPlayer = gameState.players.find(p => p.id === gameState.myPlayerId);
  const opponents = gameState.players.filter(p => p.id !== gameState.myPlayerId);

  // レイズ額の調整
  const handleRaiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setRaiseAmount(Math.max(gameState.minRaise, Math.min(value, myPlayer?.chips || 0)));
    }
  };

  // (変換関数は toCommonCard を使用)

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-green-800 to-green-900 p-4 overflow-hidden">
      {/* 対戦相手エリア */}
      <div className="flex-1 flex items-start justify-around mb-4 overflow-x-auto">
        {opponents.map((player, index) => (
          <div
            key={player.id}
            className={`flex flex-col items-center space-y-2 px-2 ${
              gameState.currentTurn === player.position ? 'ring-4 ring-yellow-400 rounded-lg p-2' : ''
            }`}
          >
            <div className="bg-white rounded-lg px-3 py-1 text-sm font-semibold shadow-md">
              <div className="text-gray-900">{player.name}</div>
              <div className="text-gray-600 text-xs">💰 {player.chips}</div>
              {player.currentBet > 0 && (
                <div className="text-blue-600 text-xs">ベット: {player.currentBet}</div>
              )}
            </div>

            {/* 相手のカード（裏向き） */}
            <div className="flex gap-1">
              {player.holeCards && player.isActive ? (
                <>
                  <PlayingCard faceDown size="small" />
                  <PlayingCard faceDown size="small" />
                </>
              ) : (
                <div className="text-white text-xs">フォールド</div>
              )}
            </div>

            {/* アクション表示 */}
            {player.action && (
              <div className="text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                {player.action.toUpperCase()}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 中央エリア（コミュニティカード＋ポット） */}
      <div className="flex flex-col items-center space-y-4 mb-4">
        {/* ポット */}
        <div className="bg-yellow-500 text-black font-bold text-xl px-6 py-3 rounded-full shadow-lg">
          POT: 💰 {gameState.pot}
        </div>

        {/* コミュニティカード */}
        <div className="flex gap-2 bg-white bg-opacity-10 p-4 rounded-lg">
          {gameState.status === 'preflop' ? (
            <div className="text-white text-sm">プリフロップ</div>
          ) : (
            <>
              {gameState.communityCards.map((card, index) => (
                <PlayingCard key={`${card.id}-${index}`} card={toCommonCard(card)} size="medium" />
              ))}
              {/* 未公開のカード枠 */}
              {Array.from({ length: 5 - gameState.communityCards.length }).map((_, i) => (
                <PlayingCard key={`empty-${i}`} card={null} size="medium" />
              ))}
            </>
          )}
        </div>

        {/* ゲームステータス */}
        <div className="text-white text-sm font-semibold">
          {gameState.status === 'preflop' && 'プリフロップ'}
          {gameState.status === 'flop' && 'フロップ'}
          {gameState.status === 'turn' && 'ターン'}
          {gameState.status === 'river' && 'リバー'}
          {gameState.status === 'showdown' && 'ショーダウン'}
        </div>
      </div>

      {/* 自分のエリア */}
      <div className="flex flex-col items-center space-y-4">
        {/* 自分の情報 */}
        <div className={`bg-white rounded-lg px-6 py-3 shadow-lg ${
          gameState.isMyTurn ? 'ring-4 ring-yellow-400' : ''
        }`}>
          <div className="text-gray-900 font-bold text-lg">{myPlayer?.name} (YOU)</div>
          <div className="text-gray-600">💰 チップ: {myPlayer?.chips}</div>
          {myPlayer && myPlayer.currentBet > 0 && (
            <div className="text-blue-600">現在のベット: {myPlayer.currentBet}</div>
          )}
        </div>

        {/* 自分のカード */}
        <div className="flex gap-2">
          {myPlayer?.holeCards ? (
            <>
              <PlayingCard card={toCommonCard(myPlayer.holeCards[0])} size="large" />
              <PlayingCard card={toCommonCard(myPlayer.holeCards[1])} size="large" />
            </>
          ) : (
            <>
              <PlayingCard faceDown size="large" />
              <PlayingCard faceDown size="large" />
            </>
          )}
        </div>

        {/* アクションボタン */}
        {gameState.isMyTurn && !disabled && (
          <div className="flex flex-wrap gap-2 justify-center">
            {gameState.canFold && (
              <button
                onClick={() => onAction('fold')}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition-colors"
              >
                フォールド
              </button>
            )}

            {gameState.canCheck && (
              <button
                onClick={() => onAction('check')}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg shadow-md transition-colors"
              >
                チェック
              </button>
            )}

            {gameState.canCall && (
              <button
                onClick={() => onAction('call')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors"
              >
                コール ({gameState.callAmount})
              </button>
            )}

            {gameState.canRaise && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={raiseAmount}
                  onChange={handleRaiseChange}
                  min={gameState.minRaise}
                  max={myPlayer?.chips || 0}
                  step={gameState.minRaise}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
                <button
                  onClick={() => onAction('raise', raiseAmount)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-colors"
                >
                  レイズ
                </button>
              </div>
            )}

            {myPlayer && myPlayer.chips > 0 && (
              <button
                onClick={() => onAction('allin')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md transition-colors"
              >
                オールイン ({myPlayer.chips})
              </button>
            )}
          </div>
        )}

        {/* 待機中メッセージ */}
        {!gameState.isMyTurn && gameState.status !== 'showdown' && (
          <div className="text-white text-sm">相手のターンを待っています...</div>
        )}

        {/* 勝者表示 */}
        {gameState.status === 'showdown' && gameState.winners.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-lg max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-2">勝者</h3>
            {gameState.winners.map((winner, index) => {
              const winnerPlayer = gameState.players.find(p => p.id === winner.playerId);
              return (
                <div key={index} className="mb-2">
                  <div className="font-semibold text-gray-900">{winnerPlayer?.name}</div>
                  <div className="text-sm text-gray-600">{winner.hand.description}</div>
                  <div className="text-sm text-green-600">獲得: 💰 {winner.amount}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
