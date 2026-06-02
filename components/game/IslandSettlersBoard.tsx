// アイランドセトラーズのボードコンポーネント

'use client';

import React, { useState } from 'react';
import type { IslandSettlersClientState, Position, ResourceType, BuildingType } from '@/lib/games/island-settlers/types';
import { BOARD_SIZE, BUILD_COSTS, TRADE_RATE } from '@/lib/games/island-settlers/constants';

interface IslandSettlersBoardProps {
  gameState: IslandSettlersClientState;
  onRollDice?: () => void;
  onBuildRoad?: (from: Position, to: Position) => void;
  onBuildVillage?: (position: Position) => void;
  onBuildTown?: (position: Position) => void;
  onTrade?: (give: ResourceType, receive: ResourceType) => void;
  onEndTurn?: () => void;
}

// 地形アイコン
const TERRAIN_ICONS: Record<string, string> = {
  forest: '🌲',
  mountain: '⛰️',
  field: '🌾',
  water: '🌊',
  desert: '🏜️',
};

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

export const IslandSettlersBoard: React.FC<IslandSettlersBoardProps> = ({
  gameState,
  onRollDice,
  onBuildRoad,
  onBuildVillage,
  onBuildTown,
  onTrade,
  onEndTurn,
}) => {
  const [buildMode, setBuildMode] = useState<BuildingType | null>(null);
  const [roadStart, setRoadStart] = useState<Position | null>(null);
  const [tradeGive, setTradeGive] = useState<ResourceType>('wood');
  const [tradeReceive, setTradeReceive] = useState<ResourceType>('stone');

  const myPlayer = gameState.players[gameState.myPlayerIndex];
  const currentPlayer = gameState.players[gameState.currentTurn];

  // タイルクリック処理
  const handleTileClick = (position: Position) => {
    if (!gameState.canOperate) return;

    if (buildMode === 'village') {
      onBuildVillage?.(position);
      setBuildMode(null);
    } else if (buildMode === 'town') {
      onBuildTown?.(position);
      setBuildMode(null);
    } else if (buildMode === 'road') {
      if (!roadStart) {
        setRoadStart(position);
      } else {
        onBuildRoad?.(roadStart, position);
        setRoadStart(null);
        setBuildMode(null);
      }
    }
  };

  // 建設モードをキャンセル
  const cancelBuildMode = () => {
    setBuildMode(null);
    setRoadStart(null);
  };

  // 資源が足りるかチェック
  const canAfford = (type: BuildingType): boolean => {
    const cost = BUILD_COSTS[type];
    return (
      myPlayer.resources.wood >= cost.wood &&
      myPlayer.resources.stone >= cost.stone &&
      myPlayer.resources.food >= cost.food &&
      myPlayer.resources.gold >= cost.gold
    );
  };

  // 交易可能かチェック
  const canTrade = (): boolean => {
    return myPlayer.resources[tradeGive] >= TRADE_RATE;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* ボード */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="grid grid-cols-6 gap-1 bg-gray-800 p-4 rounded-lg">
          {gameState.board.map((row, y) =>
            row.map((tile, x) => {
              const position = tile.position;
              const isRoadStart = roadStart && roadStart.x === x && roadStart.y === y;

              return (
                <div
                  key={`${x}-${y}`}
                  className={`
                    relative w-16 h-16 border-2 rounded-lg cursor-pointer
                    transition-all hover:scale-105
                    ${tile.terrain === 'desert' ? 'bg-yellow-200' : 'bg-green-100'}
                    ${isRoadStart ? 'ring-4 ring-blue-500' : ''}
                  `}
                  onClick={() => handleTileClick(position)}
                >
                  {/* 地形と数字 */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl">{TERRAIN_ICONS[tile.terrain]}</span>
                    {tile.diceNumber > 0 && (
                      <span className="text-xs font-bold bg-white rounded-full px-1.5 py-0.5 mt-1">
                        {tile.diceNumber}
                      </span>
                    )}
                  </div>

                  {/* 村 */}
                  {tile.hasVillage && (
                    <div
                      className={`
                        absolute -top-2 -right-2 w-6 h-6 rounded-full border-2
                        ${COLOR_CLASSES[gameState.players.find((p) => p.id === tile.hasVillage)?.color || 'red']}
                      `}
                    >
                      <span className="text-xs">🏘️</span>
                    </div>
                  )}

                  {/* 町 */}
                  {tile.hasTown && (
                    <div
                      className={`
                        absolute -top-2 -right-2 w-8 h-8 rounded-full border-2
                        ${COLOR_CLASSES[gameState.players.find((p) => p.id === tile.hasTown)?.color || 'red']}
                      `}
                    >
                      <span className="text-sm">🏛️</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 道路の表示（簡易版） */}
        <div className="mt-2 text-xs text-gray-400">
          道路: {gameState.roads.filter((r) => r.owner === myPlayer.id).length}本
        </div>
      </div>

      {/* 右サイドパネル */}
      <div className="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto">
        {/* ゲーム情報 */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-2">ゲーム情報</h3>
          <div className="space-y-1 text-sm">
            <div>ラウンド: {gameState.round + 1}</div>
            <div>現在のターン: {currentPlayer.name}</div>
            <div
              className={`
                inline-block px-2 py-1 rounded
                ${COLOR_CLASSES[currentPlayer.color]}
              `}
            >
              {currentPlayer.color}
            </div>
          </div>
        </div>

        {/* サイコロ */}
        {gameState.isMyTurn && gameState.diceValue === 0 && (
          <button
            onClick={onRollDice}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
            disabled={!gameState.canOperate}
          >
            🎲 サイコロを振る
          </button>
        )}

        {gameState.diceValue > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-4xl mb-2">🎲</div>
            <div className="text-2xl font-bold">{gameState.diceValue}</div>
          </div>
        )}

        {/* プレイヤー情報 */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-2">プレイヤー</h3>
          <div className="space-y-2">
            {gameState.players.map((player, index) => (
              <div
                key={player.id}
                className={`
                  p-2 rounded border-2
                  ${player.id === myPlayer.id ? 'border-yellow-500' : 'border-gray-600'}
                  ${gameState.currentTurn === index ? 'bg-gray-700' : 'bg-gray-900'}
                `}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">{player.name}</span>
                  <span className="text-xl">⭐ {player.score}</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <span>{RESOURCE_ICONS.wood} {player.resources.wood}</span>
                  <span>{RESOURCE_ICONS.stone} {player.resources.stone}</span>
                  <span>{RESOURCE_ICONS.food} {player.resources.food}</span>
                  <span>{RESOURCE_ICONS.gold} {player.resources.gold}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 自分の資源 */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-2">あなたの資源</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(myPlayer.resources).map(([type, count]) => (
              <div key={type} className="bg-gray-700 rounded p-2 text-center">
                <span className="text-xl">{RESOURCE_ICONS[type as ResourceType]}</span>
                <div className="text-lg font-bold">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 建設アクション */}
        {gameState.isMyTurn && gameState.diceValue > 0 && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-2">建設</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setBuildMode('road');
                  setRoadStart(null);
                }}
                className={`
                  w-full py-2 px-4 rounded font-bold
                  ${buildMode === 'road' ? 'bg-blue-600' : 'bg-gray-700'}
                  ${canAfford('road') ? 'hover:bg-blue-700' : 'opacity-50 cursor-not-allowed'}
                `}
                disabled={!canAfford('road') || myPlayer.buildings.roads <= 0}
              >
                🛤️ 道 (🪵{BUILD_COSTS.road.wood} 🌾{BUILD_COSTS.road.food})
                <div className="text-xs">残り: {myPlayer.buildings.roads}</div>
              </button>

              <button
                onClick={() => setBuildMode('village')}
                className={`
                  w-full py-2 px-4 rounded font-bold
                  ${buildMode === 'village' ? 'bg-blue-600' : 'bg-gray-700'}
                  ${canAfford('village') ? 'hover:bg-blue-700' : 'opacity-50 cursor-not-allowed'}
                `}
                disabled={!canAfford('village') || myPlayer.buildings.villages <= 0}
              >
                🏘️ 村 (🪵🪨🌾💰 各1)
                <div className="text-xs">残り: {myPlayer.buildings.villages}</div>
              </button>

              <button
                onClick={() => setBuildMode('town')}
                className={`
                  w-full py-2 px-4 rounded font-bold
                  ${buildMode === 'town' ? 'bg-blue-600' : 'bg-gray-700'}
                  ${canAfford('town') ? 'hover:bg-blue-700' : 'opacity-50 cursor-not-allowed'}
                `}
                disabled={!canAfford('town') || myPlayer.buildings.towns <= 0}
              >
                🏛️ 町 (🪨{BUILD_COSTS.town.stone} 💰{BUILD_COSTS.town.gold})
                <div className="text-xs">残り: {myPlayer.buildings.towns}</div>
              </button>

              {buildMode && (
                <button
                  onClick={cancelBuildMode}
                  className="w-full py-2 px-4 rounded bg-red-600 hover:bg-red-700 font-bold"
                >
                  キャンセル
                </button>
              )}
            </div>
          </div>
        )}

        {/* 交易 */}
        {gameState.isMyTurn && gameState.diceValue > 0 && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-2">交易 (4:1)</h3>
            <div className="space-y-2">
              <div>
                <label className="text-sm">渡す:</label>
                <select
                  value={tradeGive}
                  onChange={(e) => setTradeGive(e.target.value as ResourceType)}
                  className="w-full bg-gray-700 rounded px-2 py-1"
                >
                  <option value="wood">🪵 木材</option>
                  <option value="stone">🪨 石材</option>
                  <option value="food">🌾 食料</option>
                  <option value="gold">💰 金</option>
                </select>
              </div>
              <div>
                <label className="text-sm">受け取る:</label>
                <select
                  value={tradeReceive}
                  onChange={(e) => setTradeReceive(e.target.value as ResourceType)}
                  className="w-full bg-gray-700 rounded px-2 py-1"
                >
                  <option value="wood">🪵 木材</option>
                  <option value="stone">🪨 石材</option>
                  <option value="food">🌾 食料</option>
                  <option value="gold">💰 金</option>
                </select>
              </div>
              <button
                onClick={() => onTrade?.(tradeGive, tradeReceive)}
                className={`
                  w-full py-2 px-4 rounded font-bold
                  ${canTrade() ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 opacity-50 cursor-not-allowed'}
                `}
                disabled={!canTrade() || tradeGive === tradeReceive}
              >
                交易する
              </button>
            </div>
          </div>
        )}

        {/* ターン終了 */}
        {gameState.isMyTurn && gameState.diceValue > 0 && (
          <button
            onClick={onEndTurn}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            ターン終了
          </button>
        )}

        {/* 勝利メッセージ */}
        {gameState.status === 'finished' && gameState.winner && (
          <div className="bg-green-600 rounded-lg p-4 text-center">
            <h3 className="text-xl font-bold">🎉 ゲーム終了！</h3>
            <p className="mt-2">
              勝者: {gameState.players.find((p) => p.id === gameState.winner)?.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
