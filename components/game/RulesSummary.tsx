// ルールの超概要表示コンポーネント

import React from 'react';

export const RulesSummary: React.FC = () => {
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-xs sm:text-sm">
      <p className="font-semibold text-indigo-900 mb-2">📖 ルール</p>

      {/* 駒の動き */}
      <div className="mb-3 bg-white/70 rounded p-2">
        <p className="font-semibold text-indigo-900 mb-1.5">🎮 駒の動き</p>
        <div className="flex items-center gap-2 mb-1">
          <div className="grid grid-cols-3 gap-0.5 w-12">
            <div className="w-3 h-3"></div>
            <div className="w-3 h-3 bg-green-300 border border-green-500 rounded-sm flex items-center justify-center text-[6px]">↑</div>
            <div className="w-3 h-3"></div>
            <div className="w-3 h-3 bg-green-300 border border-green-500 rounded-sm flex items-center justify-center text-[6px]">←</div>
            <div className="w-3 h-3 bg-amber-200 border-2 border-indigo-500 rounded-sm flex items-center justify-center text-[10px]">👻</div>
            <div className="w-3 h-3 bg-green-300 border border-green-500 rounded-sm flex items-center justify-center text-[6px]">→</div>
            <div className="w-3 h-3"></div>
            <div className="w-3 h-3 bg-green-300 border border-green-500 rounded-sm flex items-center justify-center text-[6px]">↓</div>
            <div className="w-3 h-3"></div>
          </div>
          <p className="text-indigo-800 text-xs">上下左右に1マスずつ移動</p>
        </div>
      </div>

      {/* 勝利条件 */}
      <div className="bg-white/70 rounded p-2">
        <p className="font-semibold text-indigo-900 mb-1.5">🎯 勝利条件（いずれか1つ）</p>
        <div className="text-indigo-800 space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">👻</span>
            <p className="text-xs">相手の<span className="font-bold">青いお化け👻を全て取る</span></p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg">😈</span>
            <p className="text-xs">自分の<span className="font-bold">赤い悪魔😈を全て取らせる</span></p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg">🚪</span>
            <p className="text-xs"><span className="font-bold">青いお化け👻を脱出口🚪から脱出</span>させる</p>
          </div>
        </div>
      </div>
    </div>
  );
};
