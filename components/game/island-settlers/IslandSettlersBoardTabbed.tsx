// アイランドセトラーズのボードコンポーネント（タブ式UI）

'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, Hammer, Map, Repeat2 } from 'lucide-react';
import type { IslandSettlersClientState, Position, ResourceType, BuildingType } from '@/lib/games/island-settlers/types';
import { BUILD_COSTS } from '@/lib/games/island-settlers/constants';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
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
  const [activeTab, setActiveTab] = useState('board');

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
      setActiveTab('board');
    } else if (!buildMode && activeTab === 'board') {
      setActiveTab(canBuildAnything ? 'build' : 'trade');
    }
  }, [activeTab, buildMode, canBuildAnything, gameState.diceValue, gameState.isMyTurn]);

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
                  setActiveTab('build');
                }}
                className="min-h-11 rounded-md bg-teal-700 px-2 text-xs font-bold text-white shadow-sm hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-300"
              >
                  サイコロ
                </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('build')}
                  className={`min-h-11 rounded-md px-2 text-xs font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-teal-300 ${
                    activeTab === 'build' ? 'bg-teal-700 text-white' : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                  }`}
                >
                  建設
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('trade')}
                  className={`min-h-11 rounded-md px-2 text-xs font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-teal-300 ${
                    activeTab === 'trade' ? 'bg-teal-700 text-white' : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
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

      <Tabs defaultValue="board" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        {/* タブリスト */}
        <TabsList className="grid grid-cols-4 flex-shrink-0 overflow-hidden">
          <TabsTrigger value="board">
            <Map className="h-4 w-4" aria-hidden="true" />
            ボード
          </TabsTrigger>
          <TabsTrigger value="build">
            <Hammer className="h-4 w-4" aria-hidden="true" />
            建設
          </TabsTrigger>
          <TabsTrigger value="trade">
            <Repeat2 className="h-4 w-4" aria-hidden="true" />
            交易
          </TabsTrigger>
          <TabsTrigger value="info">
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            情報
          </TabsTrigger>
        </TabsList>

        {/* タブコンテンツ */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-4">
          <TabsContent value="board">
            <BoardTab
              gameState={gameState}
              onTileClick={handleTileClick}
              buildMode={buildMode}
              roadStart={roadStart}
            />
          </TabsContent>

          <TabsContent value="build">
            <BuildTab
              gameState={gameState}
              onEndTurn={onEndTurn}
              buildMode={buildMode}
              setBuildMode={setBuildMode}
              cancelBuildMode={cancelBuildMode}
              canAfford={canAfford}
            />
          </TabsContent>

          <TabsContent value="trade">
            <TradeTab
              gameState={gameState}
              onTrade={onTrade}
            />
          </TabsContent>

          <TabsContent value="info">
            <InfoTab gameState={gameState} />
          </TabsContent>
        </div>
      </Tabs>
    </GameScreen>
  );
};
