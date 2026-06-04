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
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/Accordion';

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

  // 牌の色を取得
  const getTileColor = (type: Tile['type']): string => {
    if (type === 'tiger') return TILE_COLORS.tiger;
    if (type === 'dragon') return TILE_COLORS.dragon;
    if (typeof type === 'number' && EVEN_TILES.includes(type)) {
      return TILE_COLORS.even;
    }
    if (typeof type === 'number' && ODD_TILES.includes(type)) {
      return TILE_COLORS.odd;
    }
    return 'bg-gray-100 border-gray-500 text-gray-700';
  };

  // 牌を表示
  const renderTile = (tile: Tile, isSelectable: boolean = false, isSelected: boolean = false) => {
    const isBackside = !tile.isFaceUp;
    const emoji = TILE_EMOJIS[tile.type];
    const displayName = TILE_DISPLAY_NAMES[tile.type];

    return (
      <div
        className={`w-12 h-16 sm:w-14 sm:h-20 rounded-lg border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
          isBackside
            ? 'bg-gray-700 border-gray-900'
            : getTileColor(tile.type)
        } ${isSelected ? 'ring-4 ring-amber-300 -translate-y-0.5 shadow-lg' : ''} ${
          isSelectable ? 'hover:-translate-y-0.5 hover:shadow-lg' : ''
        }`}
        onClick={
          isSelectable ? () => setSelectedTileId(tile.id) : undefined
        }
      >
        {isBackside ? (
          <span className="text-white text-2xl">🂠</span>
        ) : (
          <>
            <span className="text-2xl sm:text-3xl">{emoji}</span>
            <span className="text-xs font-bold mt-1">{displayName}</span>
          </>
        )}
      </div>
    );
  };

  // ステータスメッセージ
  const getStatusMessage = () => {
    if (gameState.status === 'waiting') {
      return 'ラウンドを開始します...';
    }

    if (gameState.status === 'roundEnd') {
      const finishedPlayer = gameState.players.find((p) => p.hasFinished);
      return `${finishedPlayer?.name}が上がりました！`;
    }

    if (gameState.status === 'finished') {
      const winner = gameState.players.find((p) => p.id === gameState.winner);
      return `${winner?.name}の勝利！`;
    }

    const currentPlayer = gameState.players.find(
      (p) => p.id === gameState.currentPlayerId
    );

    if (gameState.attackColumn.attackTile) {
      return `${currentPlayer?.name}の受け番`;
    }

    return `${currentPlayer?.name}の攻め番`;
  };

  // 自分のプレイヤー情報
  const myPlayer = gameState.myPlayer;
  const isMyTurn = gameState.currentPlayerId === gameState.myPlayerId;

  // アクション実行
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

  return (
    <>
      <KeyboardHelpModal shortcuts={keyboardShortcuts} gameName="タイガー＆ドラゴン" />
      <div className="w-full max-w-6xl mx-auto p-2 sm:p-4">
        {/* ゲーム情報 */}
        <div className="mb-4 rounded-lg border border-neutral-200 bg-white/95 p-3 shadow-lg sm:p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                ラウンド {gameState.currentRound}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">{getStatusMessage()}</p>
            </div>

            {/* 戦場カード */}
            <div
              className={`border-2 rounded-lg px-3 py-2 sm:px-4 sm:py-2 ${
                BATTLEFIELD_CARD_COLORS[gameState.battlefieldCard.type]
              }`}
            >
              <div className="text-center">
                <p className="text-sm sm:text-base font-bold">
                  {gameState.battlefieldCard.name}
                </p>
                <p className="text-xs text-gray-600">
                  {gameState.battlefieldCard.description}
                </p>
              </div>
            </div>

            {gameState.status === 'finished' && (
              <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg px-3 py-2 sm:px-4 sm:py-2">
                <div className="text-center">
                  <span className="text-2xl sm:text-3xl">🏆</span>
                  <p className="text-base sm:text-lg font-bold text-yellow-700">
                    {gameState.players.find((p) => p.id === gameState.winner)?.name} の勝利！
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* プレイヤー情報（折りたたみ可能） */}
        <div className="mb-4">
          <Accordion
            type="multiple"
            defaultValue={gameState.players
              .filter((p) => p.id === gameState.myPlayerId || p.id === gameState.currentPlayerId)
              .map((p) => p.id)}
          >
            {gameState.players.map((player) => {
              const isMe = player.id === gameState.myPlayerId;
              const isCurrent = player.id === gameState.currentPlayerId;

              return (
                <AccordionItem key={player.id} value={player.id}>
                  <AccordionTrigger
                    className={`${
                      isMe ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    } ${isCurrent ? 'bg-green-50 border-l-4 border-green-500' : ''} ${
                      player.hasFinished ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-base sm:text-lg">👥</span>
                      <span className={`font-bold ${isMe ? 'text-blue-600' : 'text-gray-700'}`}>
                        {player.name}
                        {player.isCpu && ' 🤖'}
                        {isCurrent && ' ⭕'}
                      </span>
                      <span className="ml-auto mr-4 flex items-center gap-2">
                        <span className="text-sm sm:text-base">🏅 {player.score}点</span>
                        {player.hasFinished && (
                          <span className="text-xs text-green-600 font-bold">上がり</span>
                        )}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {/* 手牌枚数と得点 */}
                      <div className="flex items-center justify-start gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-base sm:text-lg">🃏</span>
                          <span className="text-sm sm:text-base font-bold">
                            手牌: {player.handCount}枚
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-base sm:text-lg">🏅</span>
                          <span className="text-sm sm:text-base font-bold text-yellow-600">
                            勝利点: {player.score}点
                          </span>
                        </div>
                      </div>

                      {/* 1周ボーナス */}
                      {player.roundBonusCount > 0 && (
                        <div className="bg-purple-50 rounded-lg p-2 border border-purple-200">
                          <span className="text-xs sm:text-sm text-purple-700 font-bold">
                            🎯 1周ボーナス: {player.roundBonusCount}回
                          </span>
                        </div>
                      )}

                      {/* 上がり牌 */}
                      {player.finishTile && (
                        <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                          <p className="text-xs sm:text-sm text-gray-700 mb-2 font-bold">
                            ✨ 上がり牌:
                          </p>
                          <div className="flex justify-start">
                            {renderTile(player.finishTile)}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* 攻め列・受け列 */}
        <div className="mb-4 rounded-lg border border-emerald-700/50 bg-[radial-gradient(circle_at_center,#16734c_0%,#0d513a_56%,#092d25_100%)] p-4 shadow-lg sm:p-6">
          {/* 攻め列 */}
          <div className="mb-6">
            <h3 className="text-sm sm:text-base font-bold text-white mb-2">攻め列</h3>
            <div className="flex min-h-24 items-center justify-center rounded-lg border border-white/10 bg-white/15 p-3">
              {gameState.attackColumn.attackTile ? (
                <div className="flex flex-col items-center">
                  {renderTile(gameState.attackColumn.attackTile)}
                  <p className="text-xs text-white mt-2">
                    {
                      gameState.players.find(
                        (p) => p.id === gameState.attackColumn.attackerId
                      )?.name
                    }
                    の攻め
                  </p>
                </div>
              ) : (
                <p className="text-white text-sm">（攻め牌なし）</p>
              )}
            </div>
          </div>

          {/* 受け列 */}
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white mb-2">
              受け列（{gameState.defendColumn.length}枚）
            </h3>
            <div className="min-h-24 rounded-lg border border-white/10 bg-white/15 p-3">
              {gameState.defendColumn.length > 0 ? (
                <div className="flex flex-wrap gap-2 justify-start">
                  {gameState.defendColumn.slice(-10).map((tile, index) => (
                    <div key={`${tile.id}-${index}`}>{renderTile(tile)}</div>
                  ))}
                  {gameState.defendColumn.length > 10 && (
                    <div className="text-white text-sm self-center">
                      ...他{gameState.defendColumn.length - 10}枚
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-white text-sm text-center">（受け牌なし）</p>
              )}
            </div>
          </div>
        </div>

        {/* 自分の手牌 */}
        {myPlayer && (
          <div className="mb-4 rounded-lg border border-neutral-200 bg-white/95 p-3 shadow-lg sm:p-4">
            <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3">
              あなたの手牌（{myPlayer.hand.length}枚）
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {myPlayer.hand.map((tile) => {
                const isSelectable =
                  gameState.canAttack ||
                  (gameState.canDefend &&
                    gameState.defendableTiles.some((t) => t.id === tile.id));
                const isSelected = selectedTileId === tile.id;

                return (
                  <div key={tile.id}>
                    {renderTile(tile, isSelectable, isSelected)}
                  </div>
                );
              })}
            </div>

            {/* アクションボタン */}
            {isMyTurn && gameState.status === 'playing' && (
              <div className="mt-4 flex justify-center gap-4">
                {gameState.canAttack && (
                  <button
                    onClick={handleAction}
                    disabled={!selectedTileId}
                    className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-colors ${
                      selectedTileId
                        ? 'bg-red-700 hover:bg-red-800 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    攻める
                  </button>
                )}

                {gameState.canDefend && (
                  <>
                    <button
                      onClick={handleAction}
                      disabled={!selectedTileId || !gameState.defendableTiles.some(t => t.id === selectedTileId)}
                      className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-colors ${
                        selectedTileId && gameState.defendableTiles.some(t => t.id === selectedTileId)
                          ? 'bg-slate-800 hover:bg-slate-900 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      受ける
                    </button>
                    <button
                      onClick={handlePass}
                      className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-amber-700 sm:px-6 sm:py-3 sm:text-base"
                    >
                      パス
                    </button>
                  </>
                )}
              </div>
            )}

            {gameState.defendableTiles.length > 0 && gameState.canDefend && (
              <div className="mt-2 text-xs sm:text-sm text-gray-600 text-center">
                受けられる牌: {gameState.defendableTiles.length}枚
              </div>
            )}
          </div>
        )}

        {/* ラウンド終了ボタン */}
        {gameState.status === 'roundEnd' && onEndRound && (
          <div className="flex justify-center">
            <button
              onClick={onEndRound}
              className="rounded-lg bg-emerald-700 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-emerald-800 sm:text-lg"
            >
              得点計算へ
            </button>
          </div>
        )}

        {/* ルール説明（コンパクト） */}
        <div className="mt-4 rounded-lg border border-neutral-200 bg-white/90 p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2">
            タイガー＆ドラゴンのルール
          </h3>
          <ul className="text-xs sm:text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>攻め牌に対して、同じ数字の牌で受けられます</li>
            <li>🐯タイガー奥義：偶数（2,4,6,8）全てに対応</li>
            <li>🐉ドラゴン奥義：奇数（1,3,5,7）全てに対応</li>
            <li>全員パスで「1周ボーナス」獲得（上がり時に追加得点）</li>
            <li>手牌を出し切って上がり！戦場カードの条件を満たせば高得点</li>
            <li>目標得点（{gameState.targetScore}点）に到達したら勝利！</li>
          </ul>
        </div>
      </div>
    </>
  );
};
