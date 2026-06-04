// ボードタブ - ゲーム盤面とサイコロ

'use client';

import React from 'react';
import type { IslandSettlersClientState, Position, BuildingType } from '@/lib/games/island-settlers/types';

interface BoardTabProps {
  gameState: IslandSettlersClientState;
  onRollDice?: () => void;
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
  onRollDice,
  onTileClick,
  buildMode,
  roadStart,
}) => {
  const myPlayer = gameState.players[gameState.myPlayerIndex];
  const currentPlayer = gameState.players[gameState.currentTurn];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* ゲーム情報 */}
      <div className="w-full rounded-lg border border-neutral-200 bg-white/95 p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-neutral-700">
            <span className="font-bold text-neutral-950">ラウンド {gameState.round + 1}</span>
            <span className="mx-2">|</span>
            <span>現在のターン: {currentPlayer.name}</span>
          </div>
          <div
            className={`
              inline-block px-3 py-1 rounded text-sm font-bold text-white
              ${COLOR_CLASSES[currentPlayer.color]}
            `}
          >
            {COLOR_LABELS[currentPlayer.color] || currentPlayer.color}
          </div>
        </div>
      </div>

      {/* サイコロ */}
      {gameState.isMyTurn && gameState.diceValue === 0 && (
        <button
          onClick={onRollDice}
          className="w-full rounded-lg bg-teal-700 px-6 py-3 font-bold text-white transition-colors hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-300"
          disabled={!gameState.canOperate}
        >
          🎲 サイコロを振る
        </button>
      )}

      {gameState.diceValue > 0 && (
        <div className="rounded-lg border border-neutral-200 bg-white/95 p-4 text-center shadow-lg">
          <div className="text-4xl mb-2">🎲</div>
          <div className="text-2xl font-bold text-neutral-950">{gameState.diceValue}</div>
        </div>
      )}

      {/* 建設モード表示 */}
      {buildMode && (
        <div className="w-full rounded-lg border border-teal-300 bg-teal-50 p-3 text-center">
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

      {/* ゲームボード */}
      <div className="grid grid-cols-6 gap-1 rounded-lg border border-neutral-900/50 bg-neutral-900/80 p-4 shadow-xl">
        {gameState.board.map((row, y) =>
          row.map((tile, x) => {
            const position = tile.position;
            const isRoadStart = roadStart && roadStart.x === x && roadStart.y === y;

            return (
              <div
                key={`${x}-${y}`}
                className={`
                  relative w-12 h-12 sm:w-16 sm:h-16 border-2 rounded-lg cursor-pointer
                  transition-all hover:scale-105
                  ${tile.terrain === 'desert' ? 'bg-yellow-200' : 'bg-green-100'}
                  ${isRoadStart ? 'ring-4 ring-blue-500' : ''}
                  ${buildMode ? 'hover:ring-2 hover:ring-yellow-400' : ''}
                `}
                onClick={() => onTileClick(position)}
              >
                {/* 地形と数字 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl sm:text-2xl">{TERRAIN_ICONS[tile.terrain]}</span>
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
                      absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center
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
                      absolute -top-2 -right-2 w-8 h-8 rounded-full border-2 flex items-center justify-center
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

      {/* 道路の表示 */}
      <div className="text-xs text-neutral-500">
        道路: {gameState.roads.filter((r) => r.owner === myPlayer.id).length}本
      </div>

      {/* 勝利メッセージ */}
      {gameState.status === 'finished' && gameState.winner && (
        <div className="w-full bg-green-600 rounded-lg p-4 text-center">
          <h3 className="text-xl font-bold">🎉 ゲーム終了！</h3>
          <p className="mt-2">
            勝者: {gameState.players.find((p) => p.id === gameState.winner)?.name}
          </p>
        </div>
      )}
    </div>
  );
};
