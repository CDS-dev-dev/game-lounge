'use client';

import React from 'react';
import Link from 'next/link';
import { GameHeader } from '@/components/layout/GameHeader';
import { Button } from '@/components/ui/Button';

export default function TigerDragonRulesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 sm:pt-20 pb-4 sm:pb-8 px-2 sm:px-4">
      <GameHeader title="タイガー&ドラゴン - ルール説明" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
          {/* ゲーム概要 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-orange-500 pb-2">
              ゲーム概要
            </h2>
            <p className="text-gray-700 mb-4">
              アークライト×オインクゲームズのボードゲーム「タイガー&ドラゴン」は、
              ごいた系の牌ゲームです。攻めと受けを繰り返して手牌を出し切り、
              戦場カードの条件を満たして得点を獲得します。
            </p>
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>プレイ人数：</strong> 2-5人
                <br />
                <strong>プレイ時間：</strong> 約15-30分
                <br />
                <strong>目標：</strong> 得点チップを10枚集める
              </p>
            </div>
          </section>

          {/* 牌の構成 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-orange-500 pb-2">
              牌の構成
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-700 mb-2">数字牌（40枚）</h3>
                <p className="text-sm text-gray-700">
                  1から8までの数字牌が各5枚ずつ
                </p>
                <div className="mt-2 text-2xl">
                  ① ② ③ ④ ⑤ ⑥ ⑦ ⑧
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-bold text-purple-700 mb-2">奥義牌（2枚）</h3>
                <p className="text-sm text-gray-700">
                  タイガー奥義（1枚）、ドラゴン奥義（1枚）
                </p>
                <div className="mt-2 text-2xl">
                  🐯 🐉
                </div>
              </div>
            </div>
          </section>

          {/* ゲームの準備 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-orange-500 pb-2">
              ゲームの準備
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>
                <strong>牌の配布：</strong>
                <ul className="ml-6 mt-2 space-y-1 text-sm">
                  <li>2人プレイ：各20枚</li>
                  <li>3人プレイ：各13枚</li>
                  <li>4人プレイ：各10枚</li>
                  <li>5人プレイ：各8枚</li>
                  <li>※ スタートプレイヤーは+1枚</li>
                </ul>
              </li>
              <li>
                <strong>戦場カード選択：</strong> 6種類の得点ルールから1枚をランダムに選択
              </li>
              <li>
                <strong>スタートプレイヤー決定：</strong> ランダムに決定（次ラウンドは時計回り）
              </li>
            </ol>
          </section>

          {/* ゲームの流れ */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-orange-500 pb-2">
              ゲームの流れ
            </h2>

            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                  <span className="text-2xl">⚔️</span> 1. 攻め
                </h3>
                <p className="text-sm text-gray-700">
                  現在の攻め番のプレイヤーが手牌から1枚選んで表向きで出します。
                  これが「攻め牌」となります。
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                  <span className="text-2xl">🛡️</span> 2. 受け
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  左隣のプレイヤーから順に、攻め牌を「受ける」か「パス」するかを選びます。
                </p>
                <ul className="text-sm text-gray-700 ml-4 space-y-1">
                  <li>• 同じ数字の牌があれば受けられる</li>
                  <li>• タイガー奥義：偶数（2,4,6,8）全てに対応</li>
                  <li>• ドラゴン奥義：奇数（1,3,5,7）全てに対応</li>
                  <li>• 受けたプレイヤーが次の攻め番になる</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-bold text-yellow-700 mb-2 flex items-center gap-2">
                  <span className="text-2xl">🎯</span> 3. 1周ボーナス
                </h3>
                <p className="text-sm text-gray-700">
                  全員が受けをパスして攻め牌が自分に戻ってきた場合、
                  好きな手牌を1枚「裏向き」で出せます。これが「1周ボーナス」です。
                  上がり時に1周ボーナス数×1点の追加得点がもらえます。
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                  <span className="text-2xl">🏆</span> 4. 上がり
                </h3>
                <p className="text-sm text-gray-700">
                  手牌が0枚になったプレイヤーが「上がり」です。
                  最後に出した牌（上がり牌）に応じて得点チップを獲得します。
                </p>
              </div>
            </div>
          </section>

          {/* 奥義牌の特殊ルール */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-orange-500 pb-2">
              奥義牌の特殊ルール
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-bold text-orange-700 mb-2 flex items-center gap-2">
                  <span className="text-2xl">🐯</span> タイガー奥義
                </h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>受けで使う：</strong> 偶数（2,4,6,8）の攻め牌を全て受けられる</p>
                  <p><strong>攻めで使う：</strong> 偶数（2,4,6,8）の牌で受けられてしまう</p>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-bold text-purple-700 mb-2 flex items-center gap-2">
                  <span className="text-2xl">🐉</span> ドラゴン奥義
                </h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>受けで使う：</strong> 奇数（1,3,5,7）の攻め牌を全て受けられる</p>
                  <p><strong>攻めで使う：</strong> 奇数（1,3,5,7）の牌で受けられてしまう</p>
                </div>
              </div>
            </div>
          </section>

          {/* 戦場カード（得点ルール） */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-orange-500 pb-2">
              戦場カード（得点ルール）
            </h2>
            <p className="text-gray-700 mb-4">
              各ラウンドで選ばれた戦場カードによって、上がり時の得点が決まります。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-bold text-blue-700 text-sm">偶数の道</h4>
                <p className="text-xs text-gray-700">偶数（2,4,6,8）で上がり → 2点</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h4 className="font-bold text-red-700 text-sm">奇数の道</h4>
                <p className="text-xs text-gray-700">奇数（1,3,5,7）で上がり → 2点</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="font-bold text-green-700 text-sm">小さき者の道</h4>
                <p className="text-xs text-gray-700">小さい数（1,2,3,4）で上がり → 2点</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h4 className="font-bold text-yellow-700 text-sm">大いなる道</h4>
                <p className="text-xs text-gray-700">大きい数（5,6,7,8）で上がり → 2点</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <h4 className="font-bold text-purple-700 text-sm">奥義の道</h4>
                <p className="text-xs text-gray-700">奥義（🐯🐉）で上がり → 3点</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h4 className="font-bold text-gray-700 text-sm">万能の道</h4>
                <p className="text-xs text-gray-700">何で上がっても → 1点</p>
              </div>
            </div>
            <div className="mt-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <strong>1周ボーナス：</strong> 戦場カードの得点に加えて、
                1周ボーナス数×1点が追加されます。
              </p>
            </div>
          </section>

          {/* 勝利条件 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-orange-500 pb-2">
              勝利条件
            </h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-gray-700 mb-2">
                <strong>得点チップを10枚集めたプレイヤーが総合優勝です！</strong>
              </p>
              <p className="text-sm text-gray-700">
                複数ラウンドを繰り返し、最初に10点に到達したプレイヤーがゲームに勝利します。
              </p>
            </div>
          </section>

          {/* 戦略のヒント */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-orange-500 pb-2">
              戦略のヒント
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span className="text-sm">
                  奥義牌は受けられやすいので、早めに出して処理するのも一つの手
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span className="text-sm">
                  1周ボーナスを狙って、受けられにくい牌で攻めるのも効果的
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span className="text-sm">
                  手牌が少なくなったら、戦場カードの条件に合う牌を残しておく
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span className="text-sm">
                  相手の受け牌を推測して、通りやすい牌で攻める
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span className="text-sm">
                  受けるかパスするかの判断が重要。攻め番を取るタイミングを見極める
                </span>
              </li>
            </ul>
          </section>

          {/* ボタン */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" asChild>
              <Link href="/games/tiger-dragon/cpu">CPU対戦を始める</Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/games/tiger-dragon">モード選択に戻る</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
