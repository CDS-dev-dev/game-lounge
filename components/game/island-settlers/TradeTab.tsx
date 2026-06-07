// 交易タブ - 資源交換UI

'use client';

import React, { useState } from 'react';
import type { IslandSettlersClientState, ResourceType } from '@/lib/games/island-settlers/types';
import { TRADE_RATE } from '@/lib/games/island-settlers/constants';

interface TradeTabProps {
  gameState: IslandSettlersClientState;
  onTrade?: (give: ResourceType, receive: ResourceType) => void;
}

// 資源アイコン
const RESOURCE_ICONS: Record<string, string> = {
  wood: '🪵',
  stone: '🪨',
  food: '🌾',
  gold: '💰',
};

// 資源名
const RESOURCE_NAMES: Record<string, string> = {
  wood: '木材',
  stone: '石材',
  food: '食料',
  gold: '金',
};

export const TradeTab: React.FC<TradeTabProps> = ({
  gameState,
  onTrade,
}) => {
  const [tradeGive, setTradeGive] = useState<ResourceType>('wood');
  const [tradeReceive, setTradeReceive] = useState<ResourceType>('stone');

  const myPlayer = gameState.players[gameState.myPlayerIndex];

  // 交易可能かチェック
  const canTrade = (): boolean => {
    return myPlayer.resources[tradeGive] >= TRADE_RATE;
  };

  // 自分のターンでサイコロを振っていない場合は交易不可
  if (!gameState.isMyTurn || gameState.diceValue === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-gray-400 text-center">
          <div className="text-4xl mb-4">💱</div>
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
      {/* 自分の資源 */}
      <div className="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-950 shadow-sm sm:p-3">
        <h3 className="mb-2 text-sm font-bold">あなたの資源</h3>
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {Object.entries(myPlayer.resources).map(([type, count]) => (
            <div key={type} className="rounded-md bg-neutral-50 p-1.5 text-center sm:p-2">
              <span className="text-base sm:text-lg">{RESOURCE_ICONS[type as keyof typeof RESOURCE_ICONS]}</span>
              <div className="text-sm font-bold sm:text-base">{count}</div>
              <div className="truncate text-[10px] font-semibold text-neutral-500 sm:text-xs">{RESOURCE_NAMES[type]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 交易レート */}
      <div className="rounded-lg border border-sky-200 bg-sky-50 p-2 text-center text-neutral-950 shadow-sm sm:p-3">
        <div className="text-xs font-bold text-sky-800">交易レート</div>
        <div className="text-2xl font-bold text-slate-950">
          {TRADE_RATE} : 1
        </div>
        <div className="mt-1 text-xs font-semibold text-sky-900">同じ資源4つを任意の資源1つへ</div>
      </div>

      {/* 交易UI */}
      <div className="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-950 shadow-sm sm:p-3 lg:col-span-2">
        <h3 className="mb-2 text-sm font-bold">交易する</h3>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end">
          {/* 渡す資源 */}
          <div>
            <label className="mb-1 block text-xs font-bold text-neutral-600">渡す資源 ×{TRADE_RATE}</label>
            <select
              value={tradeGive}
              onChange={(e) => setTradeGive(e.target.value as ResourceType)}
              className="min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-950 focus:outline-none focus:ring-4 focus:ring-sky-200"
            >
              <option value="wood">{RESOURCE_ICONS.wood} 木材 (所持: {myPlayer.resources.wood})</option>
              <option value="stone">{RESOURCE_ICONS.stone} 石材 (所持: {myPlayer.resources.stone})</option>
              <option value="food">{RESOURCE_ICONS.food} 食料 (所持: {myPlayer.resources.food})</option>
              <option value="gold">{RESOURCE_ICONS.gold} 金 (所持: {myPlayer.resources.gold})</option>
            </select>
            <div className="mt-1 text-xs font-semibold text-neutral-500">
              現在の所持数: {myPlayer.resources[tradeGive]}
            </div>
          </div>

          {/* 交換の矢印 */}
          <div className="flex justify-center pb-5">
            <div className="rounded-md bg-neutral-100 px-3 py-2 text-sm font-bold text-neutral-700">→</div>
          </div>

          {/* 受け取る資源 */}
          <div>
            <label className="mb-1 block text-xs font-bold text-neutral-600">受け取る資源 ×1</label>
            <select
              value={tradeReceive}
              onChange={(e) => setTradeReceive(e.target.value as ResourceType)}
              className="min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-950 focus:outline-none focus:ring-4 focus:ring-sky-200"
            >
              <option value="wood">{RESOURCE_ICONS.wood} 木材 (所持: {myPlayer.resources.wood})</option>
              <option value="stone">{RESOURCE_ICONS.stone} 石材 (所持: {myPlayer.resources.stone})</option>
              <option value="food">{RESOURCE_ICONS.food} 食料 (所持: {myPlayer.resources.food})</option>
              <option value="gold">{RESOURCE_ICONS.gold} 金 (所持: {myPlayer.resources.gold})</option>
            </select>
          </div>

          {/* 交易ボタン */}
          <button
            onClick={() => onTrade?.(tradeGive, tradeReceive)}
            className={`
              min-h-12 w-full rounded-md px-4 py-2 text-sm font-bold text-white transition-colors sm:col-span-3
              ${canTrade() && tradeGive !== tradeReceive
                ? 'bg-teal-700 hover:bg-teal-800'
                : 'bg-neutral-400 opacity-60 cursor-not-allowed'}
            `}
            disabled={!canTrade() || tradeGive === tradeReceive}
          >
            {tradeGive === tradeReceive
              ? '同じ資源は交換できません'
              : canTrade()
              ? `交易する (${RESOURCE_ICONS[tradeGive]} ×${TRADE_RATE} → ${RESOURCE_ICONS[tradeReceive]} ×1)`
              : `資源が不足しています (必要: ${TRADE_RATE})`}
          </button>
        </div>
      </div>

      {/* 交易のヒント */}
      <div className="rounded-lg border border-neutral-200 bg-white p-2 text-xs font-semibold text-neutral-600 shadow-sm sm:p-3 lg:col-span-2">
        建設に足りない資源を作るための補助操作です。交換後は建設またはターン終了を選びます。
      </div>
    </div>
  );
};
