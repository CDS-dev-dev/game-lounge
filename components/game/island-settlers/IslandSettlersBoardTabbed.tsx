// アイランドセトラーズのボードコンポーネント（タブ式UI）

'use client';

import React, { useState } from 'react';
import type { IslandSettlersClientState, Position, ResourceType, BuildingType } from '@/lib/games/island-settlers/types';
import { BUILD_COSTS } from '@/lib/games/island-settlers/constants';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { BoardTab } from './BoardTab';
import { BuildTab } from './BuildTab';
import { TradeTab } from './TradeTab';
import { InfoTab } from './InfoTab';

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

  const myPlayer = gameState.players[gameState.myPlayerIndex];

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
    <div className="h-full flex flex-col">
      <Tabs defaultValue="board" className="flex-1 flex flex-col">
        {/* タブリスト */}
        <TabsList className="flex-shrink-0 overflow-x-auto">
          <TabsTrigger value="board">🎮 ボード</TabsTrigger>
          <TabsTrigger value="build">🏗️ 建設</TabsTrigger>
          <TabsTrigger value="trade">💱 交易</TabsTrigger>
          <TabsTrigger value="info">📊 情報</TabsTrigger>
        </TabsList>

        {/* タブコンテンツ */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-4">
          <TabsContent value="board">
            <BoardTab
              gameState={gameState}
              onRollDice={onRollDice}
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
    </div>
  );
};
