'use client';

import React from 'react';
import type { EmperorClientState } from '@/lib/games/emperor/types';
import { RANK_NAMES, RANK_COLORS, RANK_EMOJIS } from '@/lib/games/emperor/constants';
import { KeyboardHelpModal } from '@/components/ui/KeyboardHelpModal';

interface EmperorBoardProps {
  gameState: EmperorClientState;
  onNextRound?: () => void;
}

export const EmperorBoard: React.FC<EmperorBoardProps> = ({ gameState, onNextRound }) => {
  // プレイヤーを円形に配置するための座標計算
  const getPlayerPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // 上から時計回り
    const radius = 35; // パーセント単位
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    return { x, y };
  };

  // カード表示
  const renderCard = (rank: string | null, isRevealed: boolean) => {
    if (!rank) {
      return (
        <div className="w-12 h-16 sm:w-16 sm:h-20 bg-blue-600 rounded-lg border-2 border-blue-800 flex items-center justify-center">
          <span className="text-white text-2xl sm:text-3xl">🂠</span>
        </div>
      );
    }

    if (!isRevealed) {
      return (
        <div className="w-12 h-16 sm:w-16 sm:h-20 bg-blue-600 rounded-lg border-2 border-blue-800 flex items-center justify-center">
          <span className="text-white text-2xl sm:text-3xl">🂠</span>
        </div>
      );
    }

    const cardColors: Record<string, string> = {
      K: 'bg-yellow-100 border-yellow-500 text-yellow-700',
      Q: 'bg-blue-100 border-blue-500 text-blue-700',
      J: 'bg-gray-100 border-gray-500 text-gray-700',
    };

    return (
      <div
        className={`w-12 h-16 sm:w-16 sm:h-20 rounded-lg border-2 flex flex-col items-center justify-center ${
          cardColors[rank] || 'bg-white border-gray-300'
        }`}
      >
        <span className="text-xl sm:text-2xl font-bold">{rank}</span>
      </div>
    );
  };

  // 階級バッジ
  const renderRoleBadge = (role: string | null) => {
    if (!role) return null;

    return (
      <div
        className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full border-2 text-xs sm:text-sm font-bold flex items-center gap-1 ${
          RANK_COLORS[role] || 'bg-gray-100 border-gray-300'
        }`}
      >
        <span>{RANK_EMOJIS[role]}</span>
        <span>{RANK_NAMES[role]}</span>
      </div>
    );
  };

  // コイン表示
  const renderCoins = (coins: number, isActive: boolean) => {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xl sm:text-2xl">🪙</span>
        <span
          className={`text-base sm:text-lg font-bold ${
            isActive ? 'text-yellow-600' : 'text-gray-400'
          }`}
        >
          {coins}
        </span>
      </div>
    );
  };

  // ステータスメッセージ
  const getStatusMessage = () => {
    switch (gameState.status) {
      case 'waiting':
        return 'カードを配ります...';
      case 'dealing':
        return 'カードが配られました';
      case 'reveal':
        return '階級が決定しました！';
      case 'transfer':
        return `奴隷が皇帝に${gameState.transferAmount}コイン渡しました`;
      case 'finished':
        return 'ゲーム終了！';
      default:
        return '';
    }
  };

  // 勝者の判定
  const winner = gameState.players.find((p) => p.id === gameState.winner);

  // カードが公開されているか
  const isRevealed = gameState.status === 'reveal' || gameState.status === 'transfer' || gameState.status === 'finished';

  const keyboardShortcuts = [
    { keys: ['Enter'], description: '次のラウンドへ' },
    { keys: ['Space'], description: '次のラウンドへ' },
  ];

  return (
    <>
      <KeyboardHelpModal shortcuts={keyboardShortcuts} gameName="エンペラーゲーム" />
      <div className="w-full max-w-4xl mx-auto p-2 sm:p-4">
        {/* ゲーム情報 */}
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                ラウンド {gameState.currentRound} / {gameState.maxRounds}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">{getStatusMessage()}</p>
            </div>

            {gameState.status === 'finished' && winner && (
              <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg px-3 py-2 sm:px-4 sm:py-2">
                <div className="text-center">
                  <span className="text-2xl sm:text-3xl">👑</span>
                  <p className="text-base sm:text-lg font-bold text-yellow-700">
                    {winner.name} の勝利！
                  </p>
                  <p className="text-xs sm:text-sm text-yellow-600">{winner.coins}コイン</p>
                </div>
              </div>
            )}

            {gameState.status === 'transfer' && gameState.winner === null && onNextRound && (
              <button
                onClick={onNextRound}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-colors"
              >
                次のラウンドへ
              </button>
            )}
          </div>
        </div>

        {/* プレイヤー配置（円形） */}
        <div className="relative bg-gradient-to-br from-green-700 to-green-900 rounded-lg shadow-lg p-4 sm:p-8" style={{ aspectRatio: '1' }}>
          {/* 中央のポット表示 */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-3 sm:p-4 shadow-lg">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">コイン移動</p>
              <div className="flex items-center justify-center gap-1">
                <span className="text-xl sm:text-2xl">⛓️</span>
                <span className="text-lg sm:text-xl font-bold text-gray-800">→</span>
                <span className="text-base sm:text-lg font-bold text-red-600">
                  {gameState.transferAmount}
                </span>
                <span className="text-lg sm:text-xl font-bold text-gray-800">→</span>
                <span className="text-xl sm:text-2xl">👑</span>
              </div>
              {gameState.lastTransfer && (
                <p className="text-xs text-green-600 mt-1">
                  移動完了！
                </p>
              )}
            </div>
          </div>

          {/* プレイヤー配置 */}
          {gameState.players.map((player, index) => {
            const pos = getPlayerPosition(index, gameState.players.length);
            const isMe = player.id === gameState.myPlayerId;

            return (
              <div
                key={player.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <div
                  className={`bg-white rounded-lg shadow-lg p-2 sm:p-3 ${
                    isMe ? 'border-4 border-blue-500' : 'border-2 border-gray-300'
                  } ${!player.isActive ? 'opacity-50' : ''}`}
                  style={{ minWidth: '120px' }}
                >
                  {/* プレイヤー名 */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs sm:text-sm font-bold ${isMe ? 'text-blue-600' : 'text-gray-700'}`}>
                      {player.name}
                      {player.isCpu && ' 🤖'}
                    </span>
                    {!player.isActive && (
                      <span className="text-xs text-red-500 font-bold">破産</span>
                    )}
                  </div>

                  {/* カード */}
                  <div className="flex justify-center mb-2">
                    {renderCard(player.card?.rank || null, isRevealed || isMe)}
                  </div>

                  {/* 階級バッジ */}
                  {isRevealed && player.role && (
                    <div className="flex justify-center mb-2">{renderRoleBadge(player.role)}</div>
                  )}

                  {/* コイン数 */}
                  <div className="flex justify-center">
                    {renderCoins(player.coins, player.isActive)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ルール説明（コンパクト） */}
        <div className="mt-4 bg-gray-100 rounded-lg p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2">
            エンペラーゲームのルール
          </h3>
          <ul className="text-xs sm:text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>各ラウンドで階級カードが配られます（K=皇帝、Q=市民、J=奴隷）</li>
            <li>奴隷は皇帝に{gameState.transferAmount}コイン渡します</li>
            <li>コインが0以下になると破産し、ゲームから脱落します</li>
            <li>最後まで残ったプレイヤーが勝利！</li>
          </ul>
        </div>
      </div>
    </>
  );
};
