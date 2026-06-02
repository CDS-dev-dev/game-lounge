// 建設タブ - 道路/村/町の建設UI

'use client';

import React from 'react';
import type { IslandSettlersClientState, BuildingType } from '@/lib/games/island-settlers/types';
import { BUILD_COSTS } from '@/lib/games/island-settlers/constants';

interface BuildTabProps {
  gameState: IslandSettlersClientState;
  onEndTurn?: () => void;
  buildMode: BuildingType | null;
  setBuildMode: (mode: BuildingType | null) => void;
  cancelBuildMode: () => void;
  canAfford: (type: BuildingType) => boolean;
}

// 資源アイコン
const RESOURCE_ICONS: Record<string, string> = {
  wood: '🪵',
  stone: '🪨',
  food: '🌾',
  gold: '💰',
};

export const BuildTab: React.FC<BuildTabProps> = ({
  gameState,
  onEndTurn,
  buildMode,
  setBuildMode,
  cancelBuildMode,
  canAfford,
}) => {
  const myPlayer = gameState.players[gameState.myPlayerIndex];

  // 自分のターンでサイコロを振っていない場合は建設不可
  if (!gameState.isMyTurn || gameState.diceValue === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-gray-400 text-center">
          <div className="text-4xl mb-4">🏗️</div>
          <p>
            {!gameState.isMyTurn
              ? '他のプレイヤーのターンです'
              : 'まずサイコロを振ってください'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 自分の資源 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-3">あなたの資源</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(myPlayer.resources).map(([type, count]) => (
            <div key={type} className="bg-gray-700 rounded p-3 text-center">
              <span className="text-2xl">{RESOURCE_ICONS[type as keyof typeof RESOURCE_ICONS]}</span>
              <div className="text-lg font-bold mt-1">{count}</div>
              <div className="text-xs text-gray-400 capitalize">{type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 建設コスト表 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-3">建設コスト</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between bg-gray-700 rounded p-2">
            <span>🛤️ 道路</span>
            <span>
              {RESOURCE_ICONS.wood}{BUILD_COSTS.road.wood} {RESOURCE_ICONS.food}{BUILD_COSTS.road.food}
            </span>
          </div>
          <div className="flex items-center justify-between bg-gray-700 rounded p-2">
            <span>🏘️ 村</span>
            <span>
              {RESOURCE_ICONS.wood}{BUILD_COSTS.village.wood} {RESOURCE_ICONS.stone}{BUILD_COSTS.village.stone}{' '}
              {RESOURCE_ICONS.food}{BUILD_COSTS.village.food} {RESOURCE_ICONS.gold}{BUILD_COSTS.village.gold}
            </span>
          </div>
          <div className="flex items-center justify-between bg-gray-700 rounded p-2">
            <span>🏛️ 町</span>
            <span>
              {RESOURCE_ICONS.stone}{BUILD_COSTS.town.stone} {RESOURCE_ICONS.gold}{BUILD_COSTS.town.gold}
            </span>
          </div>
        </div>
      </div>

      {/* 建設ボタン */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-3">建設する</h3>
        <div className="space-y-3">
          <button
            onClick={() => {
              setBuildMode('road');
            }}
            className={`
              w-full py-3 px-4 rounded font-bold transition-colors
              ${buildMode === 'road' ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-gray-700'}
              ${canAfford('road') && myPlayer.buildings.roads > 0 ? 'hover:bg-blue-700' : 'opacity-50 cursor-not-allowed'}
            `}
            disabled={!canAfford('road') || myPlayer.buildings.roads <= 0}
          >
            <div className="flex items-center justify-between">
              <span>🛤️ 道</span>
              <span className="text-sm">
                {RESOURCE_ICONS.wood}{BUILD_COSTS.road.wood} {RESOURCE_ICONS.food}{BUILD_COSTS.road.food}
              </span>
            </div>
            <div className="text-xs mt-1 opacity-75">残り: {myPlayer.buildings.roads}</div>
          </button>

          <button
            onClick={() => setBuildMode('village')}
            className={`
              w-full py-3 px-4 rounded font-bold transition-colors
              ${buildMode === 'village' ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-gray-700'}
              ${canAfford('village') && myPlayer.buildings.villages > 0 ? 'hover:bg-blue-700' : 'opacity-50 cursor-not-allowed'}
            `}
            disabled={!canAfford('village') || myPlayer.buildings.villages <= 0}
          >
            <div className="flex items-center justify-between">
              <span>🏘️ 村</span>
              <span className="text-sm">
                {RESOURCE_ICONS.wood} {RESOURCE_ICONS.stone} {RESOURCE_ICONS.food} {RESOURCE_ICONS.gold}
              </span>
            </div>
            <div className="text-xs mt-1 opacity-75">残り: {myPlayer.buildings.villages}</div>
          </button>

          <button
            onClick={() => setBuildMode('town')}
            className={`
              w-full py-3 px-4 rounded font-bold transition-colors
              ${buildMode === 'town' ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-gray-700'}
              ${canAfford('town') && myPlayer.buildings.towns > 0 ? 'hover:bg-blue-700' : 'opacity-50 cursor-not-allowed'}
            `}
            disabled={!canAfford('town') || myPlayer.buildings.towns <= 0}
          >
            <div className="flex items-center justify-between">
              <span>🏛️ 町</span>
              <span className="text-sm">
                {RESOURCE_ICONS.stone}{BUILD_COSTS.town.stone} {RESOURCE_ICONS.gold}{BUILD_COSTS.town.gold}
              </span>
            </div>
            <div className="text-xs mt-1 opacity-75">残り: {myPlayer.buildings.towns}</div>
          </button>

          {buildMode && (
            <button
              onClick={cancelBuildMode}
              className="w-full py-2 px-4 rounded bg-red-600 hover:bg-red-700 font-bold transition-colors"
            >
              キャンセル
            </button>
          )}
        </div>
      </div>

      {/* ターン終了 */}
      <button
        onClick={onEndTurn}
        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        ターン終了
      </button>
    </div>
  );
};
