'use client';

import React, { useState } from 'react';
import type { TigerDragonClientState, Tile } from '@/lib/games/tiger-dragon/types';
import {
  TILE_DISPLAY_NAMES,
  TILE_EMOJIS,
  TILE_COLORS,
  BATTLEFIELD_CARD_COLORS,
  EVEN_TILES,
  ODD_TILES,
} from '@/lib/games/tiger-dragon/constants';
import { KeyboardHelpModal } from '@/components/ui/KeyboardHelpModal';
import {
  ActionButton,
  ActionButtonGroup,
  BottomActionArea,
  GameScreen,
  GameStatePanel,
  PlayerStatusCard,
} from '@/components/game/GamePlayUI';

interface TigerDragonBoardProps {
  gameState: TigerDragonClientState;
  onAttack?: (tileId: string) => void;
  onDefend?: (tileId: string) => void;
  onPass?: () => void;
  onEndRound?: () => void;
}

export const TigerDragonBoard: React.FC<TigerDragonBoardProps> = ({
  gameState,
  onAttack,
  onDefend,
  onPass,
  onEndRound,
}) => {
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const myPlayer = gameState.myPlayer;
  const currentPlayer = gameState.players.find((p) => p.id === gameState.currentPlayerId);
  const isMyTurn = gameState.currentPlayerId === gameState.myPlayerId;
  const selectedTile = myPlayer?.hand.find((tile) => tile.id === selectedTileId);

  const getTileColor = (type: Tile['type']): string => {
    if (type === 'tiger') return TILE_COLORS.tiger;
    if (type === 'dragon') return TILE_COLORS.dragon;
    if (typeof type === 'number' && EVEN_TILES.includes(type)) return TILE_COLORS.even;
    if (typeof type === 'number' && ODD_TILES.includes(type)) return TILE_COLORS.odd;
    return 'bg-gray-100 border-gray-500 text-gray-700';
  };

  const renderTile = (tile: Tile, isSelectable = false, isSelected = false) => {
    const isBackside = !tile.isFaceUp;
    const emoji = TILE_EMOJIS[tile.type];
    const displayName = TILE_DISPLAY_NAMES[tile.type];

    return (
      <button
        type="button"
        className={`h-14 w-11 rounded-lg border-2 text-center shadow-sm transition-all sm:h-16 sm:w-12 ${
          isBackside ? 'border-gray-900 bg-gray-700 text-white' : getTileColor(tile.type)
        } ${isSelected ? 'ring-4 ring-amber-300 -translate-y-0.5 shadow-lg' : ''} ${
          isSelectable ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg' : 'cursor-default'
        }`}
        onClick={isSelectable ? () => setSelectedTileId(tile.id) : undefined}
        disabled={!isSelectable}
        aria-pressed={isSelected}
      >
        {isBackside ? (
          <span className="text-xl">□</span>
        ) : (
          <span className="flex h-full flex-col items-center justify-center leading-none">
            <span className="text-xl sm:text-2xl">{emoji}</span>
            <span className="mt-1 text-[10px] font-bold sm:text-xs">{displayName}</span>
          </span>
        )}
      </button>
    );
  };

  const handleAction = () => {
    if (!selectedTileId) return;
    if (gameState.canAttack && onAttack) {
      onAttack(selectedTileId);
      setSelectedTileId(null);
    } else if (gameState.canDefend && onDefend) {
      onDefend(selectedTileId);
      setSelectedTileId(null);
    }
  };

  const handlePass = () => {
    if (gameState.canPass && onPass) {
      onPass();
      setSelectedTileId(null);
    }
  };

  const keyboardShortcuts = [
    { keys: ['1-9'], description: '牌を選択' },
    { keys: ['Enter'], description: '選択した牌で攻め/受け' },
    { keys: ['Space'], description: 'パス' },
  ];

  const phaseLabel =
    gameState.status === 'roundEnd'
      ? 'ラウンド終了'
      : gameState.status === 'finished'
        ? 'ゲーム終了'
        : gameState.attackColumn.attackTile
          ? '受け番'
          : '攻め番';

  return (
    <>
      <KeyboardHelpModal shortcuts={keyboardShortcuts} gameName="タイガー＆ドラゴン" />
      <GameScreen>
        <GameStatePanel
          title={isMyTurn ? `${phaseLabel}: あなたの判断です` : `${phaseLabel}: ${currentPlayer?.name || '相手'}の番`}
          subtitle={undefined}
          status={`Round ${gameState.currentRound}`}
          items={[
            { label: '戦場', value: gameState.battlefieldCard.name, emphasis: true },
            { label: '目標点', value: `${gameState.targetScore}点` },
            { label: '選択中', value: selectedTile ? TILE_DISPLAY_NAMES[selectedTile.type] : 'なし' },
            { label: '受け候補', value: `${gameState.defendableTiles.length}枚`, emphasis: gameState.canDefend },
          ]}
        />

        <section className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[220px_minmax(0,1fr)_260px]">
          <aside className="hidden gap-2 lg:grid lg:grid-cols-1">
            {gameState.players.map((player) => (
              <PlayerStatusCard
                key={player.id}
                name={player.name}
                note={`${player.handCount}枚 / ${player.score}点`}
                isActive={player.id === gameState.currentPlayerId}
                action={player.hasFinished ? '上がり' : player.id === gameState.currentPlayerId ? '手番' : '待機'}
              >
                <div className="text-xs font-semibold text-neutral-600">
                  ボーナス {player.roundBonusCount} / {player.isCpu ? 'CPU' : 'あなた'}
                </div>
              </PlayerStatusCard>
            ))}
          </aside>

          <section className="overflow-hidden rounded-lg border border-emerald-900/60 bg-[radial-gradient(circle_at_center,#16734c_0%,#0d513a_56%,#092d25_100%)] p-2 shadow-2xl sm:p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 sm:mb-3">
              <div
                className={`rounded-lg border-2 px-3 py-2 text-sm font-bold ${
                  BATTLEFIELD_CARD_COLORS[gameState.battlefieldCard.type]
                }`}
              >
                {gameState.battlefieldCard.name}
                <span className="ml-2 text-xs font-semibold">{gameState.battlefieldCard.description}</span>
              </div>
              <span className="rounded-md bg-white/15 px-3 py-1 text-xs font-bold text-white">
                {phaseLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 md:gap-3">
              <div>
                <h2 className="mb-2 text-sm font-bold text-white">攻め牌</h2>
                <div className="flex min-h-20 items-center justify-center rounded-lg border border-white/10 bg-white/15 p-2 sm:min-h-24 sm:p-3">
                  {gameState.attackColumn.attackTile ? (
                    <div className="text-center">
                      {renderTile(gameState.attackColumn.attackTile)}
                      <p className="mt-2 text-xs font-semibold text-white">
                        {gameState.players.find((p) => p.id === gameState.attackColumn.attackerId)?.name} の攻め
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-white/80">攻め牌を選んでください</p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="mb-2 text-sm font-bold text-white">受け履歴</h2>
                <div className="min-h-20 rounded-lg border border-white/10 bg-white/15 p-2 sm:min-h-24 sm:p-3">
                  {gameState.defendColumn.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {gameState.defendColumn.slice(-8).map((tile, index) => (
                        <div key={`${tile.id}-${index}`}>{renderTile(tile)}</div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-xs font-semibold text-white/80 sm:text-sm">受け牌なし</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-lg border border-neutral-200 bg-white p-2.5 shadow-sm sm:p-3">
            <h2 className="text-sm font-bold text-neutral-950">あなたの手牌</h2>
            <p className="mt-1 text-xs font-semibold text-neutral-600">
              {gameState.canAttack ? '攻めに使う牌を選択' : gameState.canDefend ? '受けられる牌だけ選択できます' : '相手の番です'}
            </p>
            <div className="mt-2 grid max-h-[154px] grid-cols-6 justify-items-center gap-2 overflow-y-auto pb-1 pr-1 sm:flex sm:max-h-[34svh] sm:flex-wrap sm:justify-center">
              {myPlayer?.hand.map((tile) => {
                const isSelectable =
                  gameState.canAttack ||
                  (gameState.canDefend && gameState.defendableTiles.some((t) => t.id === tile.id));
                return (
                  <div key={tile.id}>
                    {renderTile(tile, isSelectable, selectedTileId === tile.id)}
                  </div>
                );
              })}
            </div>
          </aside>
        </section>

        {isMyTurn && gameState.status === 'playing' ? (
          <BottomActionArea>
            <ActionButtonGroup title="次にできる操作" subtitle={selectedTile ? `${TILE_DISPLAY_NAMES[selectedTile.type]} を選択中` : '牌を選んでください'}>
              {gameState.canAttack ? (
                <ActionButton tone="danger" onClick={handleAction} disabled={!selectedTileId}>
                  攻める
                </ActionButton>
              ) : null}
              {gameState.canDefend ? (
                <ActionButton
                  tone="primary"
                  onClick={handleAction}
                  disabled={!selectedTileId || !gameState.defendableTiles.some((tile) => tile.id === selectedTileId)}
                >
                  受ける
                </ActionButton>
              ) : null}
              {gameState.canPass ? (
                <ActionButton tone="ghost" onClick={handlePass}>
                  パス
                </ActionButton>
              ) : null}
            </ActionButtonGroup>
          </BottomActionArea>
        ) : null}

        {gameState.status === 'roundEnd' && onEndRound ? (
          <BottomActionArea>
            <ActionButtonGroup title="ラウンド終了" subtitle="得点を確認して次へ進みます">
              <ActionButton tone="primary" onClick={onEndRound}>
                得点計算へ
              </ActionButton>
            </ActionButtonGroup>
          </BottomActionArea>
        ) : null}
      </GameScreen>
    </>
  );
};
