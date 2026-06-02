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
        } ${isSelected ? 'ring-4 ring-yellow-400 scale-110' : ''} ${
          isSelectable ? 'hover:scale-110 hover:shadow-lg' : ''
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
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 mb-4">
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

        {/* プレイヤー情報 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {gameState.players.map((player) => {
            const isMe = player.id === gameState.myPlayerId;
            const isCurrent = player.id === gameState.currentPlayerId;

            return (
              <div
                key={player.id}
                className={`bg-white rounded-lg shadow-lg p-2 sm:p-3 ${
                  isMe ? 'border-4 border-blue-500' : 'border-2 border-gray-300'
                } ${isCurrent ? 'ring-2 ring-green-500' : ''} ${
                  player.hasFinished ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      isMe ? 'text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {player.name}
                    {player.isCpu && ' 🤖'}
                  </span>
                  {player.hasFinished && (
                    <span className="text-xs text-green-500 font-bold">上がり</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-base sm:text-lg">🃏</span>
                    <span className="text-sm sm:text-base font-bold">
                      {player.handCount}枚
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-base sm:text-lg">🏅</span>
                    <span className="text-sm sm:text-base font-bold text-yellow-600">
                      {player.score}点
                    </span>
                  </div>
                </div>

                {player.roundBonusCount > 0 && (
                  <div className="mt-2 text-xs text-purple-600 font-bold">
                    1周ボーナス: {player.roundBonusCount}
                  </div>
                )}

                {player.finishTile && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">上がり牌:</p>
                    <div className="flex justify-center">
                      {renderTile(player.finishTile)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 攻め列・受け列 */}
        <div className="bg-gradient-to-br from-green-700 to-green-900 rounded-lg shadow-lg p-4 sm:p-6 mb-4">
          {/* 攻め列 */}
          <div className="mb-6">
            <h3 className="text-sm sm:text-base font-bold text-white mb-2">攻め列</h3>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 min-h-24 flex items-center justify-center">
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
            <div className="bg-white bg-opacity-20 rounded-lg p-3 min-h-24">
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
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 mb-4">
            <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3">
              あなたの手牌（{myPlayer.hand.length}枚）
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {myPlayer.hand.map((tile, index) => {
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
                        ? 'bg-red-500 hover:bg-red-600 text-white'
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
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      受ける
                    </button>
                    <button
                      onClick={handlePass}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-colors"
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
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold text-base sm:text-lg transition-colors"
            >
              得点計算へ
            </button>
          </div>
        )}

        {/* ルール説明（コンパクト） */}
        <div className="mt-4 bg-gray-100 rounded-lg p-3 sm:p-4">
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
