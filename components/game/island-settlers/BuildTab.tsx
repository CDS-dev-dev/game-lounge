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
    <div className="grid gap-2 sm:gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* 建設ボタン */}
      <div className="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-950 shadow-sm sm:p-3 lg:col-span-2">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold">建設する</h3>
          <span className="text-xs font-semibold text-neutral-500">選ぶと盤面で配置</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              setBuildMode('road');
            }}
            className={`
              min-h-14 w-full rounded-md px-2 py-2 text-left text-xs font-bold transition-colors sm:px-3 sm:text-sm
              ${buildMode === 'road' ? 'bg-teal-700 text-white ring-2 ring-teal-300' : 'bg-neutral-100 text-neutral-950'}
              ${canAfford('road') && myPlayer.buildings.roads > 0 ? 'hover:bg-teal-800 hover:text-white' : 'opacity-50 cursor-not-allowed'}
            `}
            disabled={!canAfford('road') || myPlayer.buildings.roads <= 0}
          >
            <div className="truncate">道路</div>
            <div className="mt-1 truncate text-[11px] opacity-80">
              {RESOURCE_ICONS.wood}{BUILD_COSTS.road.wood} {RESOURCE_ICONS.food}{BUILD_COSTS.road.food}
            </div>
            <div className="text-[11px] opacity-75">残{myPlayer.buildings.roads}</div>
          </button>

          <button
            onClick={() => setBuildMode('village')}
            className={`
              min-h-14 w-full rounded-md px-2 py-2 text-left text-xs font-bold transition-colors sm:px-3 sm:text-sm
              ${buildMode === 'village' ? 'bg-teal-700 text-white ring-2 ring-teal-300' : 'bg-neutral-100 text-neutral-950'}
              ${canAfford('village') && myPlayer.buildings.villages > 0 ? 'hover:bg-teal-800 hover:text-white' : 'opacity-50 cursor-not-allowed'}
            `}
            disabled={!canAfford('village') || myPlayer.buildings.villages <= 0}
          >
            <div className="truncate">村</div>
            <div className="mt-1 truncate text-[11px] opacity-80">木 石 食 金</div>
            <div className="text-[11px] opacity-75">残{myPlayer.buildings.villages}</div>
          </button>

          <button
            onClick={() => setBuildMode('town')}
            className={`
              min-h-14 w-full rounded-md px-2 py-2 text-left text-xs font-bold transition-colors sm:px-3 sm:text-sm
              ${buildMode === 'town' ? 'bg-teal-700 text-white ring-2 ring-teal-300' : 'bg-neutral-100 text-neutral-950'}
              ${canAfford('town') && myPlayer.buildings.towns > 0 ? 'hover:bg-teal-800 hover:text-white' : 'opacity-50 cursor-not-allowed'}
            `}
            disabled={!canAfford('town') || myPlayer.buildings.towns <= 0}
          >
            <div className="truncate">町</div>
            <div className="mt-1 truncate text-[11px] opacity-80">
              {RESOURCE_ICONS.stone}{BUILD_COSTS.town.stone} {RESOURCE_ICONS.gold}{BUILD_COSTS.town.gold}
            </div>
            <div className="text-[11px] opacity-75">残{myPlayer.buildings.towns}</div>
          </button>

          {buildMode && (
            <button
              onClick={cancelBuildMode}
              className="col-span-3 min-h-11 w-full rounded-md bg-rose-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-rose-800"
            >
              キャンセル
            </button>
          )}
        </div>
      </div>

      {/* 自分の資源 */}
      <div className="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-950 shadow-sm sm:p-3">
        <h3 className="mb-2 text-sm font-bold">あなたの資源</h3>
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {Object.entries(myPlayer.resources).map(([type, count]) => (
            <div key={type} className="rounded-md bg-neutral-50 p-1.5 text-center sm:p-2">
              <span className="text-base sm:text-lg">{RESOURCE_ICONS[type as keyof typeof RESOURCE_ICONS]}</span>
              <div className="text-sm font-bold sm:mt-1 sm:text-base">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 建設コスト表 */}
      <div className="hidden rounded-lg border border-neutral-200 bg-white p-3 text-neutral-950 shadow-sm sm:block">
        <h3 className="mb-2 text-sm font-bold">建設コスト</h3>
        <div className="space-y-2 text-xs font-semibold">
          <div className="flex items-center justify-between rounded-md bg-neutral-50 p-2">
            <span>🛤️ 道路</span>
            <span>
              {RESOURCE_ICONS.wood}{BUILD_COSTS.road.wood} {RESOURCE_ICONS.food}{BUILD_COSTS.road.food}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-neutral-50 p-2">
            <span>🏘️ 村</span>
            <span>
              {RESOURCE_ICONS.wood}{BUILD_COSTS.village.wood} {RESOURCE_ICONS.stone}{BUILD_COSTS.village.stone}{' '}
              {RESOURCE_ICONS.food}{BUILD_COSTS.village.food} {RESOURCE_ICONS.gold}{BUILD_COSTS.village.gold}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-neutral-50 p-2">
            <span>🏛️ 町</span>
            <span>
              {RESOURCE_ICONS.stone}{BUILD_COSTS.town.stone} {RESOURCE_ICONS.gold}{BUILD_COSTS.town.gold}
            </span>
          </div>
        </div>
      </div>

      {/* ターン終了 */}
      <button
        onClick={onEndTurn}
        className="hidden min-h-12 w-full rounded-md bg-slate-800 px-6 py-3 font-bold text-white transition-colors hover:bg-slate-900 sm:block lg:col-span-2"
      >
        ターン終了
      </button>
    </div>
  );
};
