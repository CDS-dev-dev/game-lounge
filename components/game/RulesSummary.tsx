// ルールの超概要表示コンポーネント

import React from 'react';

export const RulesSummary: React.FC = () => {
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm">
      <p className="font-semibold text-indigo-900 mb-1">🎯 勝利条件（いずれか1つ）</p>
      <div className="text-indigo-800 space-y-0.5">
        <p>• 相手の<span className="font-bold">青いお化け👻を全て取れ</span></p>
        <p>• 自分の<span className="font-bold">赤い悪魔😈を全て取らせろ</span></p>
        <p>• <span className="font-bold">青いお化け👻を脱出口🚪から脱出させろ</span></p>
      </div>
    </div>
  );
};
