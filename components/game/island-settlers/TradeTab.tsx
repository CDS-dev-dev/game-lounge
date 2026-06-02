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
    <div className="flex flex-col gap-4">
      {/* 自分の資源 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-3">あなたの資源</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(myPlayer.resources).map(([type, count]) => (
            <div key={type} className="bg-gray-700 rounded p-3 text-center">
              <span className="text-2xl">{RESOURCE_ICONS[type as keyof typeof RESOURCE_ICONS]}</span>
              <div className="text-lg font-bold mt-1">{count}</div>
              <div className="text-xs text-gray-400">{RESOURCE_NAMES[type]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 交易レート */}
      <div className="bg-blue-900 border-2 border-blue-500 rounded-lg p-4 text-center">
        <div className="text-sm text-blue-200 mb-1">交易レート</div>
        <div className="text-2xl font-bold">
          {TRADE_RATE} : 1
        </div>
        <div className="text-xs text-blue-300 mt-1">
          同じ資源4つを、任意の資源1つと交換できます
        </div>
      </div>

      {/* 交易UI */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-3">交易する</h3>
        <div className="space-y-4">
          {/* 渡す資源 */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">渡す資源 (×{TRADE_RATE})</label>
            <select
              value={tradeGive}
              onChange={(e) => setTradeGive(e.target.value as ResourceType)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="wood">{RESOURCE_ICONS.wood} 木材 (所持: {myPlayer.resources.wood})</option>
              <option value="stone">{RESOURCE_ICONS.stone} 石材 (所持: {myPlayer.resources.stone})</option>
              <option value="food">{RESOURCE_ICONS.food} 食料 (所持: {myPlayer.resources.food})</option>
              <option value="gold">{RESOURCE_ICONS.gold} 金 (所持: {myPlayer.resources.gold})</option>
            </select>
            <div className="text-xs text-gray-400 mt-1">
              現在の所持数: {myPlayer.resources[tradeGive]}
            </div>
          </div>

          {/* 交換の矢印 */}
          <div className="flex justify-center">
            <div className="text-3xl">⬇️</div>
          </div>

          {/* 受け取る資源 */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">受け取る資源 (×1)</label>
            <select
              value={tradeReceive}
              onChange={(e) => setTradeReceive(e.target.value as ResourceType)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              w-full py-3 px-4 rounded font-bold transition-colors
              ${canTrade() && tradeGive !== tradeReceive
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-700 opacity-50 cursor-not-allowed'}
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
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-400">
        <div className="font-bold text-gray-300 mb-1">💡 ヒント</div>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>同じ資源を4つ渡すことで、任意の資源1つを受け取れます</li>
          <li>建設に必要な資源が不足している場合に活用しましょう</li>
          <li>交易は自分のターン中、何度でも実行できます</li>
        </ul>
      </div>
    </div>
  );
};
