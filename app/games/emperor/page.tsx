'use client';

import React from 'react';
import Link from 'next/link';
import { GameModeCard } from '@/components/game/GameModeCard';

export default function EmperorGamePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">エンペラーゲーム</h1>
        <p className="text-gray-600">カイジの名作心理戦ゲーム</p>
      </div>

      {/* ゲーム説明 */}
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">ゲーム概要</h2>
        <p className="text-gray-700 mb-4">
          エンペラーゲームは、各ラウンドで配られるカードによって階級が決まる運と心理戦のゲームです。
          皇帝・市民・奴隷の3つの階級があり、奴隷は皇帝にコインを渡さなければなりません。
        </p>

        <div className="grid gap-4 mb-4">
          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <span className="text-3xl">👑</span>
            <div>
              <h3 className="font-bold text-yellow-700">皇帝（K）</h3>
              <p className="text-sm text-gray-700">奴隷から3コインを受け取る</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-3xl">🧑</span>
            <div>
              <h3 className="font-bold text-blue-700">市民（Q）</h3>
              <p className="text-sm text-gray-700">コインの移動なし</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-3xl">⛓️</span>
            <div>
              <h3 className="font-bold text-gray-700">奴隷（J）</h3>
              <p className="text-sm text-gray-700">皇帝に3コイン渡す</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-bold text-red-700 mb-2">破産ルール</h3>
          <p className="text-sm text-gray-700">
            コインが0以下になったプレイヤーは破産し、ゲームから脱落します。
            最後まで残ったプレイヤーが勝者となります！
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
            description="コンピュータと対戦します（3-6人）"
            icon="🤖"
            href="/games/emperor/cpu"
            color="blue"
          />

          <GameModeCard
            title="ローカル対戦"
            description="同じ端末で対戦します（3-6人）"
            icon="👥"
            href="/games/emperor/local"
            color="green"
          />

          <GameModeCard
            title="オンライン対戦"
            description="オンラインで対戦します（3-6人）"
            icon="🌐"
            href="/games/emperor/online"
            color="purple"
          />
        </div>
      </div>

      {/* ルールリンク */}
      <div className="text-center mt-8">
        <Link
          href="/games/emperor/rules"
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
