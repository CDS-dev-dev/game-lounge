// 情報タブ - プレイヤー情報と勝利点

'use client';

import React from 'react';
import type { IslandSettlersClientState } from '@/lib/games/island-settlers/types';

interface InfoTabProps {
  gameState: IslandSettlersClientState;
}

// 資源アイコン
const RESOURCE_ICONS: Record<string, string> = {
  wood: '🪵',
  stone: '🪨',
  food: '🌾',
  gold: '💰',
};

// プレイヤーカラー
const COLOR_CLASSES: Record<string, string> = {
  red: 'bg-red-500 border-red-600',
  blue: 'bg-blue-500 border-blue-600',
  yellow: 'bg-yellow-500 border-yellow-600',
  green: 'bg-green-500 border-green-600',
};

export const InfoTab: React.FC<InfoTabProps> = ({ gameState }) => {
  const myPlayer = gameState.players[gameState.myPlayerIndex];

  // プレイヤーをスコア順にソート
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col gap-4">
      {/* ゲーム進行状況 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-3">ゲーム進行状況</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">ラウンド</span>
            <span className="font-bold">{gameState.round + 1}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">現在のターン</span>
            <span className="font-bold">{gameState.players[gameState.currentTurn].name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">最後のサイコロ</span>
            <span className="font-bold">{gameState.diceValue > 0 ? `🎲 ${gameState.diceValue}` : '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">ステータス</span>
            <span className={`font-bold ${gameState.status === 'finished' ? 'text-green-400' : 'text-blue-400'}`}>
              {gameState.status === 'finished' ? '終了' : '進行中'}
            </span>
          </div>
        </div>
      </div>

      {/* プレイヤーランキング */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-3">プレイヤーランキング</h3>
        <div className="space-y-2">
          {sortedPlayers.map((player, index) => {
            const isMe = player.id === myPlayer.id;
            const isCurrentTurn = gameState.players[gameState.currentTurn].id === player.id;

            return (
              <div
                key={player.id}
                className={`
                  p-3 rounded-lg border-2 transition-colors
                  ${isMe ? 'border-yellow-500 bg-gray-700' : 'border-gray-600 bg-gray-900'}
                  ${isCurrentTurn ? 'ring-2 ring-blue-400' : ''}
                `}
              >
                {/* ヘッダー */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-400">#{index + 1}</span>
                    <div
                      className={`
                        w-4 h-4 rounded-full border-2
                        ${COLOR_CLASSES[player.color]}
                      `}
                    />
                    <span className="font-bold">{player.name}</span>
                    {isMe && <span className="text-xs bg-yellow-600 px-2 py-0.5 rounded">YOU</span>}
                    {isCurrentTurn && <span className="text-xs bg-blue-600 px-2 py-0.5 rounded">ターン中</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xl">⭐</span>
                    <span className="text-xl font-bold">{player.score}</span>
                  </div>
                </div>

                {/* 資源 */}
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="flex items-center gap-1">
                    <span>{RESOURCE_ICONS.wood}</span>
                    <span className="font-bold">{player.resources.wood}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span>{RESOURCE_ICONS.stone}</span>
                    <span className="font-bold">{player.resources.stone}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span>{RESOURCE_ICONS.food}</span>
                    <span className="font-bold">{player.resources.food}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span>{RESOURCE_ICONS.gold}</span>
                    <span className="font-bold">{player.resources.gold}</span>
                  </span>
                </div>

                {/* 建設物 */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-2">
                  <span>🛤️ 道: {15 - player.buildings.roads}</span>
                  <span>🏘️ 村: {5 - player.buildings.villages}</span>
                  <span>🏛️ 町: {4 - player.buildings.towns}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 自分の詳細情報 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-3">あなたの詳細情報</h3>
        <div className="space-y-3">
          {/* 資源 */}
          <div>
            <div className="text-sm text-gray-400 mb-2">資源</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(myPlayer.resources).map(([type, count]) => (
                <div key={type} className="bg-gray-700 rounded p-2 flex items-center justify-between">
                  <span className="text-xl">{RESOURCE_ICONS[type as keyof typeof RESOURCE_ICONS]}</span>
                  <span className="text-lg font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 建設物 */}
          <div>
            <div className="text-sm text-gray-400 mb-2">建設可能数</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-700 rounded p-2 text-center">
                <div className="text-xl">🛤️</div>
                <div className="text-sm font-bold">{myPlayer.buildings.roads}</div>
                <div className="text-xs text-gray-400">道</div>
              </div>
              <div className="bg-gray-700 rounded p-2 text-center">
                <div className="text-xl">🏘️</div>
                <div className="text-sm font-bold">{myPlayer.buildings.villages}</div>
                <div className="text-xs text-gray-400">村</div>
              </div>
              <div className="bg-gray-700 rounded p-2 text-center">
                <div className="text-xl">🏛️</div>
                <div className="text-sm font-bold">{myPlayer.buildings.towns}</div>
                <div className="text-xs text-gray-400">町</div>
              </div>
            </div>
          </div>

          {/* 勝利点 */}
          <div>
            <div className="text-sm text-gray-400 mb-2">勝利点</div>
            <div className="bg-yellow-900 border-2 border-yellow-600 rounded p-3 text-center">
              <div className="text-3xl font-bold">{myPlayer.score} 点</div>
              <div className="text-xs text-yellow-200 mt-1">目標: 10点</div>
            </div>
          </div>
        </div>
      </div>

      {/* 道路情報 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-3">道路情報</h3>
        <div className="text-sm text-gray-400">
          <div className="flex justify-between mb-1">
            <span>全体の道路数</span>
            <span className="font-bold text-white">{gameState.roads.length}本</span>
          </div>
          <div className="flex justify-between">
            <span>あなたの道路数</span>
            <span className="font-bold text-yellow-400">
              {gameState.roads.filter((r) => r.owner === myPlayer.id).length}本
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
