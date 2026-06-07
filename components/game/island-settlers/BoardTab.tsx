// ボードタブ - ゲーム盤面とサイコロ

'use client';

import React from 'react';
import type { IslandSettlersClientState, Position, BuildingType } from '@/lib/games/island-settlers/types';

interface BoardTabProps {
  gameState: IslandSettlersClientState;
  onTileClick: (position: Position) => void;
  buildMode: BuildingType | null;
  roadStart: Position | null;
}

// 地形アイコン
const TERRAIN_ICONS: Record<string, string> = {
  forest: '🌲',
  mountain: '⛰️',
  field: '🌾',
  water: '🌊',
  desert: '🏜️',
};

// プレイヤーカラー
const COLOR_CLASSES: Record<string, string> = {
  red: 'bg-red-500 border-red-600',
  blue: 'bg-blue-500 border-blue-600',
  yellow: 'bg-yellow-500 border-yellow-600',
  green: 'bg-green-500 border-green-600',
};

const COLOR_LABELS: Record<string, string> = {
  red: '赤',
  blue: '青',
  yellow: '黄',
  green: '緑',
};

export const BoardTab: React.FC<BoardTabProps> = ({
  gameState,
  onTileClick,
  buildMode,
  roadStart,
}) => {
  const myPlayer = gameState.players[gameState.myPlayerIndex];
  const currentPlayer = gameState.players[gameState.currentTurn];

  return (
    <div className="grid min-h-0 gap-2 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-3">
      <div className="flex min-h-0 justify-center">
        {/* ゲームボード */}
        <div data-game-board className="grid grid-cols-6 gap-1 rounded-lg border border-neutral-900/50 bg-neutral-900/80 p-2 shadow-xl sm:p-3">
          {gameState.board.map((row, y) =>
            row.map((tile, x) => {
              const position = tile.position;
              const isRoadStart = roadStart && roadStart.x === x && roadStart.y === y;

              return (
                <div
                  key={`${x}-${y}`}
                  className={`
                    relative h-10 w-10 rounded-md border-2 cursor-pointer
                    transition-all hover:scale-105 sm:h-14 sm:w-14 md:h-16 md:w-16
                    ${tile.terrain === 'desert' ? 'bg-yellow-200' : 'bg-green-100'}
                    ${isRoadStart ? 'ring-4 ring-blue-500' : ''}
                    ${buildMode ? 'hover:ring-2 hover:ring-yellow-400' : ''}
                  `}
                  onClick={() => onTileClick(position)}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg sm:text-2xl">{TERRAIN_ICONS[tile.terrain]}</span>
                    {tile.diceNumber > 0 && (
                      <span className="mt-0.5 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold sm:text-xs">
                        {tile.diceNumber}
                      </span>
                    )}
                  </div>

                  {tile.hasVillage && (
                    <div
                      className={`
                        absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 sm:h-6 sm:w-6
                        ${COLOR_CLASSES[gameState.players.find((p) => p.id === tile.hasVillage)?.color || 'red']}
                      `}
                    >
                      <span className="text-[10px] sm:text-xs">村</span>
                    </div>
                  )}

                  {tile.hasTown && (
                    <div
                      className={`
                        absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 sm:h-7 sm:w-7
                        ${COLOR_CLASSES[gameState.players.find((p) => p.id === tile.hasTown)?.color || 'red']}
                      `}
                    >
                      <span className="text-[10px] sm:text-xs">町</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <aside className="space-y-2">
        <div className="rounded-lg border border-neutral-200 bg-white/95 p-3 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-neutral-600">現在のターン</p>
              <p className="text-sm font-bold text-neutral-950">{currentPlayer.name}</p>
            </div>
            <span className={`rounded-md px-3 py-1 text-xs font-bold text-white ${COLOR_CLASSES[currentPlayer.color]}`}>
              {COLOR_LABELS[currentPlayer.color] || currentPlayer.color}
            </span>
          </div>
        </div>

      {gameState.diceValue > 0 && (
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-center shadow-sm">
          <div className="text-xs font-bold text-teal-800">出た目</div>
          <div className="text-2xl font-bold text-neutral-950">{gameState.diceValue}</div>
          <p className="mt-1 text-xs font-semibold text-teal-900">次は建設・交易・終了を選択</p>
        </div>
      )}

      {/* 建設モード表示 */}
      {buildMode && (
        <div className="rounded-lg border border-teal-300 bg-teal-50 p-3 text-center">
          <div className="font-bold text-teal-950">
            {buildMode === 'road' && '🛤️ 道路建設モード'}
            {buildMode === 'village' && '🏘️ 村建設モード'}
            {buildMode === 'town' && '🏛️ 町建設モード'}
          </div>
          {buildMode === 'road' && roadStart && (
            <div className="text-xs text-teal-700 mt-1">
              開始地点選択済み。終了地点をクリックしてください。
            </div>
          )}
          {buildMode === 'road' && !roadStart && (
            <div className="text-xs text-teal-700 mt-1">
              開始地点をクリックしてください。
            </div>
          )}
          {buildMode !== 'road' && (
            <div className="text-xs text-teal-700 mt-1">
              タイルをクリックして配置してください。
            </div>
          )}
        </div>
      )}

      {/* 道路の表示 */}
      <div className="rounded-lg bg-white/90 p-2 text-center text-xs font-semibold text-neutral-600">
        自分の道路: {gameState.roads.filter((r) => r.owner === myPlayer.id).length}本
      </div>

      {/* 勝利メッセージ */}
      {gameState.status === 'finished' && gameState.winner && (
        <div className="rounded-lg bg-green-600 p-4 text-center text-white">
          <h3 className="text-xl font-bold">🎉 ゲーム終了！</h3>
          <p className="mt-2">
            勝者: {gameState.players.find((p) => p.id === gameState.winner)?.name}
          </p>
        </div>
      )}
      </aside>
    </div>
  );
};
