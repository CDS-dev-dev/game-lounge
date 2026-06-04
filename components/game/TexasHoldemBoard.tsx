// テキサスホールデムのゲームボード

'use client';

import React from 'react';
import { PlayingCard } from './card/Card';
import type { TexasHoldemClientState, PlayerAction } from '@/lib/games/texas-holdem/types';
import { toCommonCard } from '@/lib/games/texas-holdem/types';
import { CompactPlayerCard } from '@/components/ui/CompactPlayerCard';
import { FoldButton, CheckButton, CallButton, RaiseButton, AllInButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';

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
  const [showRaiseModal, setShowRaiseModal] = React.useState(false);

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

  // レイズ実行
  const handleRaiseConfirm = () => {
    onAction('raise', raiseAmount);
    setShowRaiseModal(false);
  };

  // 最大チップ数を計算（プログレスバー用）
  const maxChips = Math.max(...gameState.players.map(p => p.chips));

  // (変換関数は toCommonCard を使用)

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-6xl flex-col rounded-lg border border-emerald-700/50 bg-[radial-gradient(circle_at_center,#14633f_0%,#0d432f_54%,#07261f_100%)] p-3 shadow-2xl sm:p-4">
      {/* 対戦相手エリア */}
      <div className="mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-w-6xl mx-auto">
          {opponents.map((player) => {
            // ディーラーボタンの判定
            const isDealer = gameState.dealerButton === player.position;
            // ポジション表示（SB/BBはディーラーボタンの次/次の次）
            let positionLabel = '';
            const sbPosition = (gameState.dealerButton + 1) % gameState.players.length;
            const bbPosition = (gameState.dealerButton + 2) % gameState.players.length;
            if (player.position === sbPosition) positionLabel = 'SB';
            else if (player.position === bbPosition) positionLabel = 'BB';
            else if (isDealer) positionLabel = 'BTN';

            return (
              <div key={player.id} className="relative">
                <CompactPlayerCard
                  name={player.name}
                  chips={player.chips}
                  maxChips={maxChips}
                  bet={player.currentBet}
                  isActive={gameState.currentTurn === player.position}
                  isFolded={!player.isActive}
                  isDealer={isDealer}
                  avatar="🃏"
                  position={positionLabel}
                />
                {/* 相手のカード（裏向き） */}
                <div className="flex gap-1 mt-2 justify-center">
                  {player.holeCards && player.isActive ? (
                    <>
                      <PlayingCard faceDown size="small" />
                      <PlayingCard faceDown size="small" />
                    </>
                  ) : null}
                </div>
                {/* アクション表示 */}
                {player.action && (
                  <div className="text-white text-xs bg-black bg-opacity-70 px-2 py-1 rounded text-center mt-1">
                    {player.action.toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 中央エリア（コミュニティカード＋ポット） */}
      <div className="flex flex-col items-center space-y-4 mb-4">
        {/* ポット */}
        <div className="rounded-full border border-amber-200 bg-amber-500 px-6 py-3 text-xl font-bold text-neutral-950 shadow-lg">
          POT: {gameState.pot}
        </div>

        {/* コミュニティカード */}
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-lg border border-white/10 bg-white/10 p-3 sm:gap-2 sm:p-4">
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
        <div className="max-w-md w-full">
          <CompactPlayerCard
            name={`${myPlayer?.name || ''} (YOU)`}
            chips={myPlayer?.chips || 0}
            maxChips={maxChips}
            bet={myPlayer?.currentBet}
            isActive={gameState.isMyTurn}
            isFolded={myPlayer ? !myPlayer.isActive : false}
            avatar="👤"
          />
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
          <div className="flex justify-center gap-2 rounded-lg border border-white/10 bg-black/20 p-3 shadow-lg sm:gap-3">
            {gameState.canFold && (
              <FoldButton
                onClick={() => onAction('fold')}
                showTooltip={true}
                size="lg"
              />
            )}

            {gameState.canCheck && (
              <CheckButton
                onClick={() => onAction('check')}
                showTooltip={true}
                size="lg"
              />
            )}

            {gameState.canCall && (
              <div className="flex flex-col items-center gap-1">
                <CallButton
                  onClick={() => onAction('call')}
                  showTooltip={true}
                  size="lg"
                />
                <span className="text-white text-xs font-semibold">{gameState.callAmount}</span>
              </div>
            )}

            {gameState.canRaise && (
              <RaiseButton
                onClick={() => setShowRaiseModal(true)}
                showTooltip={true}
                size="lg"
              />
            )}

            {myPlayer && myPlayer.chips > 0 && (
              <div className="flex flex-col items-center gap-1">
                <AllInButton
                  onClick={() => onAction('allin')}
                  showTooltip={true}
                  size="lg"
                />
                <span className="text-white text-xs font-semibold">{myPlayer.chips}</span>
              </div>
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

      {/* レイズモーダル */}
      <Modal
        isOpen={showRaiseModal}
        onClose={() => setShowRaiseModal(false)}
        title="レイズ額を入力"
        showCloseButton={true}
      >
        <div className="space-y-4">
          {/* スライダー */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              レイズ額: 💰 {raiseAmount.toLocaleString()}
            </label>
            <input
              type="range"
              value={raiseAmount}
              onChange={handleRaiseChange}
              min={gameState.minRaise}
              max={myPlayer?.chips || 0}
              step={gameState.minRaise}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>最小: {gameState.minRaise}</span>
              <span>最大: {myPlayer?.chips || 0}</span>
            </div>
          </div>

          {/* 数値入力 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              直接入力
            </label>
            <input
              type="number"
              value={raiseAmount}
              onChange={handleRaiseChange}
              min={gameState.minRaise}
              max={myPlayer?.chips || 0}
              step={gameState.minRaise}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* クイックアクション */}
          <div className="flex gap-2 justify-between">
            <button
              onClick={() => setRaiseAmount(gameState.minRaise)}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-900 text-sm rounded-lg transition-colors"
            >
              最小
            </button>
            <button
              onClick={() => setRaiseAmount(Math.floor((gameState.minRaise + (myPlayer?.chips || 0)) / 2))}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-900 text-sm rounded-lg transition-colors"
            >
              1/2 ポット
            </button>
            <button
              onClick={() => setRaiseAmount(myPlayer?.chips || 0)}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-900 text-sm rounded-lg transition-colors"
            >
              オールイン
            </button>
          </div>

          {/* 実行ボタン */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowRaiseModal(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleRaiseConfirm}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              レイズ実行
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
