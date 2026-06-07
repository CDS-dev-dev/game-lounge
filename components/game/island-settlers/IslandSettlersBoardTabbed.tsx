// アイランドセトラーズのボードコンポーネント（タブ式UI）

'use client';

import React, { useEffect, useState } from 'react';
import type { IslandSettlersClientState, Position, ResourceType, BuildingType } from '@/lib/games/island-settlers/types';
import { BUILD_COSTS } from '@/lib/games/island-settlers/constants';
import { BoardTab } from './BoardTab';
import { BuildTab } from './BuildTab';
import { TradeTab } from './TradeTab';
import { InfoTab } from './InfoTab';
import { GameScreen } from '@/components/game/GamePlayUI';

interface IslandSettlersBoardProps {
  gameState: IslandSettlersClientState;
  onRollDice?: () => void;
  onBuildRoad?: (from: Position, to: Position) => void;
  onBuildVillage?: (position: Position) => void;
  onBuildTown?: (position: Position) => void;
  onTrade?: (give: ResourceType, receive: ResourceType) => void;
  onEndTurn?: () => void;
}

export const IslandSettlersBoard: React.FC<IslandSettlersBoardProps> = ({
  gameState,
  onRollDice,
  onBuildRoad,
  onBuildVillage,
  onBuildTown,
  onTrade,
  onEndTurn,
}) => {
  // 建設モード状態
  const [buildMode, setBuildMode] = useState<BuildingType | null>(null);
  const [roadStart, setRoadStart] = useState<Position | null>(null);
  const [activePanel, setActivePanel] = useState<'build' | 'trade' | 'info'>('build');

  const myPlayer = gameState.players[gameState.myPlayerIndex];
  const canBuildAnything = (['road', 'village', 'town'] as BuildingType[]).some((type) => {
    const cost = BUILD_COSTS[type];
    return (
      myPlayer.resources.wood >= cost.wood &&
      myPlayer.resources.stone >= cost.stone &&
      myPlayer.resources.food >= cost.food &&
      myPlayer.resources.gold >= cost.gold &&
      myPlayer.buildings[`${type}s` as keyof typeof myPlayer.buildings] > 0
    );
  });
  const nextAction =
    !gameState.isMyTurn
      ? '相手の操作待ち'
      : gameState.diceValue === 0
        ? 'サイコロを振る'
        : buildMode
          ? '盤面で配置場所を選ぶ'
          : canBuildAnything
            ? '建設する'
            : '交易またはターン終了';

  useEffect(() => {
    if (!gameState.isMyTurn) return;
    if (gameState.diceValue === 0) {
      setActivePanel('build');
    } else if (!buildMode) {
      setActivePanel(canBuildAnything ? 'build' : 'trade');
    }
  }, [buildMode, canBuildAnything, gameState.diceValue, gameState.isMyTurn]);

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

  return (
    <GameScreen>
      <section className="rounded-lg border border-neutral-200 bg-white p-2 shadow-sm sm:p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold leading-tight text-neutral-950 sm:text-lg">
              {gameState.isMyTurn ? 'あなたのターンです' : `${gameState.players[gameState.currentTurn].name}のターン`}
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-neutral-600 sm:text-sm">
              {gameState.diceValue === 0 && gameState.isMyTurn
                ? 'まずサイコロを振ります'
                : buildMode
                  ? '盤面で配置場所を選択'
                  : '次の操作を選びます'}
            </p>
          </div>
          <div className="shrink-0 rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-800 sm:text-sm">
            R{gameState.round + 1}
          </div>
        </div>

        <div className="mt-2 grid grid-cols-4 gap-1.5 sm:gap-2">
          {[
            ['得点', `${myPlayer.score}点`],
            ['サイコロ', gameState.diceValue || '未'],
            ['資源', Object.values(myPlayer.resources).reduce((sum, count) => sum + count, 0)],
            ['次', nextAction],
          ].map(([label, value]) => (
            <div
              key={label}
              className={`min-w-0 rounded-md border px-1.5 py-1 ${
                label === '次' && gameState.isMyTurn
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-neutral-200 bg-neutral-50'
              }`}
            >
              <div className="text-[10px] font-bold text-neutral-500 sm:text-[11px]">{label}</div>
              <div className="truncate text-sm font-bold text-neutral-950 sm:text-base">{value}</div>
            </div>
          ))}
        </div>

        {gameState.isMyTurn ? (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {gameState.diceValue === 0 ? (
              <button
                type="button"
                onClick={() => {
                  onRollDice?.();
                  setActivePanel('build');
                }}
                className="min-h-11 rounded-md bg-teal-700 px-2 text-xs font-bold text-white shadow-sm hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-300"
              >
                  サイコロ
                </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActivePanel('build')}
                  className={`min-h-11 rounded-md px-2 text-xs font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-teal-300 ${
                    activePanel === 'build' ? 'bg-teal-700 text-white' : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                  }`}
                >
                  建設
                </button>
                <button
                  type="button"
                  onClick={() => setActivePanel('trade')}
                  className={`min-h-11 rounded-md px-2 text-xs font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-teal-300 ${
                    activePanel === 'trade' ? 'bg-teal-700 text-white' : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                  }`}
                >
                  交易
                </button>
                <button
                  type="button"
                  onClick={onEndTurn}
                  className="min-h-11 rounded-md bg-slate-800 px-2 text-xs font-bold text-white shadow-sm hover:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-300"
                >
                  終了
                </button>
              </>
            )}
          </div>
        ) : null}
      </section>

      <section className="grid min-h-0 flex-1 gap-2 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-h-0 rounded-lg border border-neutral-200 bg-white/95 p-2 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-neutral-950">開拓ボード</h2>
            <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-bold text-teal-900">
              {buildMode ? '配置場所を選択' : gameState.diceValue > 0 ? '建設/交易/終了' : 'サイコロ待ち'}
            </span>
          </div>
          <BoardTab
            gameState={gameState}
            onTileClick={handleTileClick}
            buildMode={buildMode}
            roadStart={roadStart}
          />
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white/95 p-2 shadow-sm lg:hidden">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-950">すぐ使う操作</h2>
            <span className="text-xs font-bold text-neutral-500">{nextAction}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['road', 'village', 'town'] as BuildingType[]).map((type) => {
              const labels: Record<BuildingType, string> = { road: '道路', village: '村', town: '町' };
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBuildMode(type)}
                  disabled={!gameState.isMyTurn || gameState.diceValue === 0 || !canAfford(type)}
                  className={`min-h-11 rounded-md px-2 text-xs font-bold ${
                    buildMode === type
                      ? 'bg-teal-700 text-white'
                      : 'bg-neutral-100 text-neutral-900 disabled:cursor-not-allowed disabled:opacity-45'
                  }`}
                >
                  {labels[type]}
                </button>
              );
            })}
          </div>
          {buildMode ? (
            <button
              type="button"
              onClick={cancelBuildMode}
              className="mt-2 min-h-10 w-full rounded-md bg-rose-700 px-3 text-xs font-bold text-white"
            >
              配置キャンセル
            </button>
          ) : null}
          <div className="mt-2 grid grid-cols-4 gap-1.5 text-center text-xs font-bold">
            <div className="rounded bg-neutral-50 p-1">木 {myPlayer.resources.wood}</div>
            <div className="rounded bg-neutral-50 p-1">石 {myPlayer.resources.stone}</div>
            <div className="rounded bg-neutral-50 p-1">食 {myPlayer.resources.food}</div>
            <div className="rounded bg-neutral-50 p-1">金 {myPlayer.resources.gold}</div>
          </div>
        </div>

        <aside className="hidden min-h-0 rounded-lg border border-neutral-200 bg-white/95 p-2 shadow-sm lg:block">
          <div className="mb-2 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setActivePanel('build')}
              className={`min-h-10 rounded-md text-xs font-bold ${activePanel === 'build' ? 'bg-teal-700 text-white' : 'bg-neutral-100 text-neutral-900'}`}
            >
              建設
            </button>
            <button
              type="button"
              onClick={() => setActivePanel('trade')}
              className={`min-h-10 rounded-md text-xs font-bold ${activePanel === 'trade' ? 'bg-teal-700 text-white' : 'bg-neutral-100 text-neutral-900'}`}
            >
              交易
            </button>
            <button
              type="button"
              onClick={() => setActivePanel('info')}
              className={`min-h-10 rounded-md text-xs font-bold ${activePanel === 'info' ? 'bg-teal-700 text-white' : 'bg-neutral-100 text-neutral-900'}`}
            >
              状況
            </button>
          </div>

          <div className="max-h-[42svh] overflow-y-auto pr-1 lg:max-h-none">
            {activePanel === 'build' ? (
              <BuildTab
                gameState={gameState}
                onEndTurn={onEndTurn}
                buildMode={buildMode}
                setBuildMode={setBuildMode}
                cancelBuildMode={cancelBuildMode}
                canAfford={canAfford}
              />
            ) : null}
            {activePanel === 'trade' ? <TradeTab gameState={gameState} onTrade={onTrade} /> : null}
            {activePanel === 'info' ? <InfoTab gameState={gameState} /> : null}
          </div>
        </aside>
      </section>
    </GameScreen>
  );
};
