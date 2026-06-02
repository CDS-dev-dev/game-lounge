'use client';

import React from 'react';
import Link from 'next/link';
import { GameModeCard } from '@/components/game/GameModeCard';

export default function TigerDragonGamePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          タイガー&ドラゴン 🐯🐉
        </h1>
        <p className="text-gray-600">攻めと受けの牌ゲーム</p>
      </div>

      {/* ゲーム説明 */}
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">ゲーム概要</h2>
        <p className="text-gray-700 mb-4">
          アークライト×オインクゲームズのボードゲーム「タイガー&ドラゴン」。
          ごいた系の牌ゲームで、攻めと受けを繰り返して手牌を出し切るゲームです。
        </p>

        <div className="grid gap-4 mb-4">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-3xl">⚔️</span>
            <div>
              <h3 className="font-bold text-blue-700">攻め</h3>
              <p className="text-sm text-gray-700">
                手牌から1枚出して攻めます。相手に受けられるか、全員パスされるか。
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <span className="text-3xl">🛡️</span>
            <div>
              <h3 className="font-bold text-red-700">受け</h3>
              <p className="text-sm text-gray-700">
                同じ数字の牌で受けられます。受けたプレイヤーが次の攻め番に。
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <span className="text-3xl">🐯</span>
            <div>
              <h3 className="font-bold text-orange-700">タイガー奥義</h3>
              <p className="text-sm text-gray-700">
                受けで使う：偶数（2,4,6,8）全てに対応。攻めで使う：偶数で受けられる。
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <span className="text-3xl">🐉</span>
            <div>
              <h3 className="font-bold text-purple-700">ドラゴン奥義</h3>
              <p className="text-sm text-gray-700">
                受けで使う：奇数（1,3,5,7）全てに対応。攻めで使う：奇数で受けられる。
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <span className="text-3xl">🎯</span>
            <div>
              <h3 className="font-bold text-yellow-700">1周ボーナス</h3>
              <p className="text-sm text-gray-700">
                攻め牌が全員にパスされて戻ってきたら、裏向きで1枚出せます。上がり時に追加得点！
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-bold text-green-700 mb-2">勝利条件</h3>
          <p className="text-sm text-gray-700">
            手牌を出し切って上がり！戦場カードの条件を満たせば高得点。
            得点チップを10枚集めたプレイヤーが総合優勝です！
          </p>
        </div>
      </div>

      {/* ゲームモード選択 */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          ゲームモードを選択
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <GameModeCard
            title="CPU対戦"
            description="コンピュータと対戦します（2-5人）"
            icon="🤖"
            href="/games/tiger-dragon/cpu"
            color="blue"
          />

          <GameModeCard
            title="ローカル対戦"
            description="同じ端末で対戦します（2-5人）"
            icon="👥"
            href="/games/tiger-dragon/local"
            color="green"
          />

          <GameModeCard
            title="オンライン対戦"
            description="オンラインで対戦します（準備中）"
            icon="🌐"
            href="/games/tiger-dragon/online"
            color="purple"
            disabled
          />
        </div>
      </div>

      {/* ルールリンク */}
      <div className="text-center mt-8">
        <Link
          href="/games/tiger-dragon/rules"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          詳細なルールを見る
        </Link>
      </div>

      {/* 戻るボタン */}
      <div className="text-center mt-8">
        <Link
          href="/games"
          className="inline-block bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
        >
          ゲーム一覧に戻る
        </Link>
      </div>
    </div>
  );
}
