'use client';

import React from 'react';
import Link from 'next/link';
import { GameHeader } from '@/components/layout/GameHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { INITIAL_COINS, TRANSFER_COINS } from '@/lib/games/emperor/constants';

export default function EmperorRulesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 sm:pt-20 pb-4 sm:pb-8 px-2 sm:px-4">
      <GameHeader title="エンペラーゲーム - ルール説明" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ゲーム概要 */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">ゲーム概要</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                エンペラーゲームは、カイジに登場する心理戦ゲームです。
                各ラウンドでカードを引き、その結果によって「皇帝」「市民」「奴隷」の階級が決まります。
                奴隷は皇帝にコインを渡さなければならず、コインが0になると破産してゲームから脱落します。
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-bold text-yellow-800 mb-2">勝利条件</h3>
                <p className="text-gray-700">
                  最後まで破産せずに残ったプレイヤーが勝者となります。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 基本ルール */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">基本ルール</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">1. ゲームの準備</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>プレイヤー人数: 3〜6人</li>
                    <li>初期コイン: 各プレイヤー{INITIAL_COINS}コイン</li>
                    <li>階級カード: 皇帝（K）1枚、市民（Q）n-2枚、奴隷（J）1枚</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-2">2. ラウンドの流れ</h3>
                  <ol className="list-decimal list-inside text-gray-700 space-y-2">
                    <li>
                      <strong>カード配布：</strong> 各プレイヤーに1枚ずつ階級カードが配られる
                    </li>
                    <li>
                      <strong>階級決定：</strong> カードを公開し、階級が決まる
                    </li>
                    <li>
                      <strong>コイン移動：</strong> 奴隷が皇帝に{TRANSFER_COINS}コイン渡す
                    </li>
                    <li>
                      <strong>破産判定：</strong> コインが0以下のプレイヤーは破産（脱落）
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-2">3. ゲーム終了</h3>
                  <p className="text-gray-700">
                    プレイヤーが1人になるまで続けます。
                    最後まで残ったプレイヤーが勝者です。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 階級の説明 */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">階級の説明</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="text-4xl">👑</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-yellow-700 mb-2">皇帝（K）</h3>
                    <p className="text-gray-700 mb-2">
                      最も強い階級。奴隷から{TRANSFER_COINS}コインを受け取ります。
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>カード: K（キング）</li>
                      <li>人数: 必ず1人</li>
                      <li>効果: +{TRANSFER_COINS}コイン</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-4xl">🧑</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-blue-700 mb-2">市民（Q）</h3>
                    <p className="text-gray-700 mb-2">
                      中立の階級。コインの移動はありません。
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>カード: Q（クイーン）</li>
                      <li>人数: プレイヤー数 - 2人</li>
                      <li>効果: なし（±0コイン）</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-4xl">⛓️</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-700 mb-2">奴隷（J）</h3>
                    <p className="text-gray-700 mb-2">
                      最も弱い階級。皇帝に{TRANSFER_COINS}コイン渡さなければなりません。
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>カード: J（ジャック）</li>
                      <li>人数: 必ず1人</li>
                      <li>効果: -{TRANSFER_COINS}コイン</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 戦略のヒント */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">戦略のヒント</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-bold text-green-800 mb-2">💡 確率を理解する</h3>
                  <p className="text-sm text-gray-700">
                    各階級になる確率は均等ではありません。
                    例えば4人プレイの場合、皇帝になる確率は1/4、市民になる確率は2/4（1/2）です。
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-bold text-blue-800 mb-2">💰 コイン管理</h3>
                  <p className="text-sm text-gray-700">
                    奴隷になってもコインが残るように常に{TRANSFER_COINS}
                    コイン以上は確保しておくのが安全です。
                    コインが少ないときは慎重にプレイしましょう。
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-bold text-purple-800 mb-2">🎲 運を味方に</h3>
                  <p className="text-sm text-gray-700">
                    エンペラーゲームは運の要素が強いゲームです。
                    短期的には不利な展開もありますが、長期的には確率が収束します。
                    あきらめずにプレイを続けましょう！
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* プレイ人数別の特徴 */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">プレイ人数別の特徴</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-bold text-gray-800">3人プレイ</h3>
                  <p className="text-sm text-gray-700">
                    市民が1人のみ。階級の差がはっきりしており、運要素が最も高い。
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-bold text-gray-800">4人プレイ（推奨）</h3>
                  <p className="text-sm text-gray-700">
                    市民が2人。バランスが良く、最も標準的なプレイ人数。
                  </p>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4">
                  <h3 className="font-bold text-gray-800">5-6人プレイ</h3>
                  <p className="text-sm text-gray-700">
                    市民が増えるため、市民になる確率が高まる。長期戦になりやすい。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 戻るボタン */}
          <div className="text-center py-6">
            <Link
              href="/games/emperor"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold transition-colors"
            >
              ゲームを始める
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
