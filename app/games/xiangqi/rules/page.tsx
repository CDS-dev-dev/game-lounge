// 中国象棋のルールページ

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { GameHeader } from '@/components/layout/GameHeader';

export default function XiangqiRulesPage() {
  return (
    <>
      <GameHeader
        title="中国象棋ルール"
        backUrl="/games/xiangqi"
        backLabel="モード選択"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 sm:pt-20 pb-4 sm:pb-8 px-2 sm:px-4">
        <div className="max-w-4xl mx-auto">
        <Card className="bg-white/95">
          <CardHeader>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">中国象棋（シャンチー）ルール</h1>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold mt-6 mb-4 text-slate-900">ゲーム概要</h2>
            <p className="text-slate-700 font-medium leading-relaxed">
              中国象棋（シャンチー、Xiangqi）は中国の伝統的な将棋ゲームです。
              2人対戦で、紅（赤）が先手、黒が後手となります。
              楚河漢界と呼ばれる「川」が盤面を二分し、各駒に固有の動き方があります。
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">盤面構成</h2>
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6 my-6">
              <div className="mb-4">
                <h3 className="font-bold text-lg mb-3 text-amber-900">盤面サイズと構造</h3>
                <ul className="list-disc pl-6 text-slate-700 font-medium space-y-2">
                  <li><strong>サイズ</strong>: 9列（a-i）× 10行（1-10）</li>
                  <li><strong>楚河漢界</strong>: 4行目と5行目の間にある「川」</li>
                  <li><strong>九宮</strong>: 各陣地の中央3×3エリア（将/帥と士/仕の移動範囲）</li>
                </ul>
              </div>

              <div className="mt-6">
                <h3 className="font-bold text-lg mb-3 text-amber-900">初期配置図</h3>
                <div className="bg-amber-100 p-4 rounded-lg overflow-x-auto">
                  <div className="grid grid-cols-9 gap-0.5 min-w-[300px]">
                    {/* 10行目（黒側最後列） */}
                    {['車','馬','象','士','将','士','象','馬','車'].map((p, i) => (
                      <div key={`b10-${i}`} className="w-8 h-8 bg-slate-700 text-white flex items-center justify-center text-xs font-bold rounded">
                        {p}
                      </div>
                    ))}
                    {/* 9行目 */}
                    {Array(9).fill(null).map((_, i) => (
                      <div key={`b9-${i}`} className="w-8 h-8 bg-amber-200 border border-amber-400"></div>
                    ))}
                    {/* 8行目（砲の列） */}
                    {Array(9).fill(null).map((_, i) => (
                      <div key={`b8-${i}`} className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded ${i === 1 || i === 7 ? 'bg-slate-700 text-white' : 'bg-amber-200 border border-amber-400'}`}>
                        {(i === 1 || i === 7) ? '砲' : ''}
                      </div>
                    ))}
                    {/* 7行目（卒の列） */}
                    {Array(9).fill(null).map((_, i) => (
                      <div key={`b7-${i}`} className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded ${i % 2 === 0 ? 'bg-slate-700 text-white' : 'bg-amber-200 border border-amber-400'}`}>
                        {i % 2 === 0 ? '卒' : ''}
                      </div>
                    ))}
                    {/* 6-5行目（川） */}
                    {Array(18).fill(null).map((_, i) => (
                      <div key={`river-${i}`} className="w-8 h-8 bg-blue-100 border border-blue-300 flex items-center justify-center text-[8px] text-blue-600">
                        {Math.floor(i / 9) === 0 && i === 4 ? '楚河' : Math.floor(i / 9) === 1 && i === 13 ? '漢界' : ''}
                      </div>
                    ))}
                    {/* 4行目（兵の列） */}
                    {Array(9).fill(null).map((_, i) => (
                      <div key={`r4-${i}`} className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded ${i % 2 === 0 ? 'bg-red-600 text-white' : 'bg-amber-200 border border-amber-400'}`}>
                        {i % 2 === 0 ? '兵' : ''}
                      </div>
                    ))}
                    {/* 3行目（炮の列） */}
                    {Array(9).fill(null).map((_, i) => (
                      <div key={`r3-${i}`} className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded ${i === 1 || i === 7 ? 'bg-red-600 text-white' : 'bg-amber-200 border border-amber-400'}`}>
                        {(i === 1 || i === 7) ? '炮' : ''}
                      </div>
                    ))}
                    {/* 2行目 */}
                    {Array(9).fill(null).map((_, i) => (
                      <div key={`r2-${i}`} className="w-8 h-8 bg-amber-200 border border-amber-400"></div>
                    ))}
                    {/* 1行目（紅側最後列） */}
                    {['車','馬','相','仕','帥','仕','相','馬','車'].map((p, i) => (
                      <div key={`r1-${i}`} className="w-8 h-8 bg-red-600 text-white flex items-center justify-center text-xs font-bold rounded">
                        {p}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-amber-900 mt-3 text-center">
                    <span className="inline-block bg-red-600 text-white px-2 py-0.5 rounded mr-2">紅（先手）</span>
                    <span className="inline-block bg-slate-700 text-white px-2 py-0.5 rounded">黒（後手）</span>
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">駒の種類と動き</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              {/* 帥/将 */}
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <h3 className="font-bold text-lg text-red-900 mb-2">帥/将（King）</h3>
                <div className="flex gap-4 items-center mb-2">
                  <div className="grid grid-cols-3 gap-1 bg-amber-100 p-2 rounded">
                    <div className="w-8 h-8 border border-gray-400"></div>
                    <div className="w-8 h-8 border border-gray-400 bg-yellow-200 flex items-center justify-center text-xs">↑</div>
                    <div className="w-8 h-8 border border-gray-400"></div>
                    <div className="w-8 h-8 border border-gray-400 bg-yellow-200 flex items-center justify-center text-xs">←</div>
                    <div className="w-8 h-8 border-2 border-red-600 bg-red-100 flex items-center justify-center font-bold">帥</div>
                    <div className="w-8 h-8 border border-gray-400 bg-yellow-200 flex items-center justify-center text-xs">→</div>
                    <div className="w-8 h-8 border border-gray-400"></div>
                    <div className="w-8 h-8 border border-gray-400 bg-yellow-200 flex items-center justify-center text-xs">↓</div>
                    <div className="w-8 h-8 border border-gray-400"></div>
                  </div>
                  <p className="text-xs text-red-800 font-medium flex-1">
                    九宮内で<br/>縦横1マスのみ
                  </p>
                </div>
                <p className="text-sm text-red-800 font-medium">
                  • 九宮から出られない<br />
                  • 対面禁止：相手の将と向き合えない
                </p>
              </div>

              {/* 仕/士 */}
              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                <h3 className="font-bold text-lg text-orange-900 mb-2">仕/士（Advisor）</h3>
                <div className="flex gap-4 items-center mb-2">
                  <div className="grid grid-cols-3 gap-1 bg-amber-100 p-2 rounded">
                    <div className="w-8 h-8 border border-gray-400 bg-yellow-200 flex items-center justify-center text-xs">↖</div>
                    <div className="w-8 h-8 border border-gray-400"></div>
                    <div className="w-8 h-8 border border-gray-400 bg-yellow-200 flex items-center justify-center text-xs">↗</div>
                    <div className="w-8 h-8 border border-gray-400"></div>
                    <div className="w-8 h-8 border-2 border-orange-600 bg-orange-100 flex items-center justify-center font-bold">士</div>
                    <div className="w-8 h-8 border border-gray-400"></div>
                    <div className="w-8 h-8 border border-gray-400 bg-yellow-200 flex items-center justify-center text-xs">↙</div>
                    <div className="w-8 h-8 border border-gray-400"></div>
                    <div className="w-8 h-8 border border-gray-400 bg-yellow-200 flex items-center justify-center text-xs">↘</div>
                  </div>
                  <p className="text-xs text-orange-800 font-medium flex-1">
                    九宮内で<br/>斜め1マスのみ
                  </p>
                </div>
                <p className="text-sm text-orange-800 font-medium">
                  • 九宮から出られない<br />
                  • 各陣営2個
                </p>
              </div>

              {/* 相/象 */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                <h3 className="font-bold text-lg text-yellow-900 mb-2">相/象（Elephant）</h3>
                <div className="flex gap-4 items-center mb-2">
                  <div className="grid grid-cols-5 gap-0.5 bg-amber-100 p-2 rounded">
                    <div className="w-6 h-6 border border-gray-400 bg-yellow-200 flex items-center justify-center text-[10px]">↖</div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400 bg-yellow-200 flex items-center justify-center text-[10px]">↗</div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-red-400 bg-red-100 flex items-center justify-center text-[10px]">×</div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-red-400 bg-red-100 flex items-center justify-center text-[10px]">×</div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border-2 border-yellow-600 bg-yellow-100 flex items-center justify-center font-bold text-sm">象</div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-red-400 bg-red-100 flex items-center justify-center text-[10px]">×</div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-red-400 bg-red-100 flex items-center justify-center text-[10px]">×</div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400 bg-yellow-200 flex items-center justify-center text-[10px]">↙</div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400 bg-yellow-200 flex items-center justify-center text-[10px]">↘</div>
                  </div>
                  <p className="text-xs text-yellow-800 font-medium flex-1">
                    斜め2マス<br/>
                    （×は塞象眼）
                  </p>
                </div>
                <p className="text-sm text-yellow-800 font-medium">
                  • 川を渡れない（自陣のみ）<br />
                  • 塞象眼：中間に駒があると移動不可
                </p>
              </div>

              {/* 馬 */}
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <h3 className="font-bold text-lg text-green-900 mb-2">馬（Horse）</h3>
                <div className="flex gap-4 items-center mb-2">
                  <div className="grid grid-cols-5 gap-0.5 bg-amber-100 p-2 rounded">
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400 bg-green-200 flex items-center justify-center text-[10px]">↖</div>
                    <div className="w-6 h-6 border border-red-400 bg-red-100 flex items-center justify-center text-[10px]">×</div>
                    <div className="w-6 h-6 border border-gray-400 bg-green-200 flex items-center justify-center text-[10px]">↗</div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400 bg-green-200 flex items-center justify-center text-[10px]">↖</div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-red-400 bg-red-100 flex items-center justify-center text-[10px]">×</div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400 bg-green-200 flex items-center justify-center text-[10px]">↗</div>
                    <div className="w-6 h-6 border border-red-400 bg-red-100 flex items-center justify-center text-[10px]">×</div>
                    <div className="w-6 h-6 border border-red-400 bg-red-100 flex items-center justify-center text-[10px]">×</div>
                    <div className="w-6 h-6 border-2 border-green-600 bg-green-100 flex items-center justify-center font-bold text-sm">馬</div>
                    <div className="w-6 h-6 border border-red-400 bg-red-100 flex items-center justify-center text-[10px]">×</div>
                    <div className="w-6 h-6 border border-red-400 bg-red-100 flex items-center justify-center text-[10px]">×</div>
                    <div className="w-6 h-6 border border-gray-400 bg-green-200 flex items-center justify-center text-[10px]">↙</div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-red-400 bg-red-100 flex items-center justify-center text-[10px]">×</div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400 bg-green-200 flex items-center justify-center text-[10px]">↘</div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400 bg-green-200 flex items-center justify-center text-[10px]">↙</div>
                    <div className="w-6 h-6 border border-red-400 bg-red-100 flex items-center justify-center text-[10px]">×</div>
                    <div className="w-6 h-6 border border-gray-400 bg-green-200 flex items-center justify-center text-[10px]">↘</div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                  </div>
                  <p className="text-xs text-green-800 font-medium flex-1">
                    日の字型<br/>
                    （×は蹩馬腿）
                  </p>
                </div>
                <p className="text-sm text-green-800 font-medium">
                  • 縦横1マス→斜め1マス<br />
                  • 蹩馬腿：最初の1マスに駒があると移動不可<br />
                  • チェスのナイトと異なり飛び越えられない
                </p>
              </div>

              {/* 車 */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <h3 className="font-bold text-lg text-blue-900 mb-2">車（Chariot）</h3>
                <div className="flex gap-4 items-center mb-2">
                  <div className="grid grid-cols-5 gap-0.5 bg-amber-100 p-2 rounded">
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400 bg-blue-200 flex items-center justify-center text-[10px]">↑</div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400 bg-blue-200 flex items-center justify-center text-[10px]">↑</div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400 bg-blue-200 flex items-center justify-center text-[10px]">←</div>
                    <div className="w-6 h-6 border border-gray-400 bg-blue-200 flex items-center justify-center text-[10px]">←</div>
                    <div className="w-6 h-6 border-2 border-blue-600 bg-blue-100 flex items-center justify-center font-bold text-sm">車</div>
                    <div className="w-6 h-6 border border-gray-400 bg-blue-200 flex items-center justify-center text-[10px]">→</div>
                    <div className="w-6 h-6 border border-gray-400 bg-blue-200 flex items-center justify-center text-[10px]">→</div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400 bg-blue-200 flex items-center justify-center text-[10px]">↓</div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400 bg-blue-200 flex items-center justify-center text-[10px]">↓</div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                    <div className="w-6 h-6 border border-gray-400"></div>
                  </div>
                  <p className="text-xs text-blue-800 font-medium flex-1">
                    縦横に<br/>何マスでも
                  </p>
                </div>
                <p className="text-sm text-blue-800 font-medium">
                  • 間に駒があると移動不可<br />
                  • 最強の駒
                </p>
              </div>

              {/* 炮/砲 */}
              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                <h3 className="font-bold text-lg text-purple-900 mb-2">炮/砲（Cannon）</h3>
                <div className="flex gap-4 items-center mb-2">
                  <div className="grid grid-cols-7 gap-0.5 bg-amber-100 p-2 rounded">
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400 bg-purple-200 flex items-center justify-center text-[8px]">↑</div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400 bg-red-200 flex items-center justify-center text-[8px] font-bold">敵</div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400 bg-slate-300 flex items-center justify-center text-[8px]">台</div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400 bg-purple-200 flex items-center justify-center text-[8px]">←</div>
                    <div className="w-5 h-5 border border-gray-400 bg-slate-300 flex items-center justify-center text-[8px]">台</div>
                    <div className="w-5 h-5 border-2 border-purple-600 bg-purple-100 flex items-center justify-center font-bold text-xs">炮</div>
                    <div className="w-5 h-5 border border-gray-400 bg-slate-300 flex items-center justify-center text-[8px]">台</div>
                    <div className="w-5 h-5 border border-gray-400 bg-purple-200 flex items-center justify-center text-[8px]">→</div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400 bg-slate-300 flex items-center justify-center text-[8px]">台</div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400 bg-red-200 flex items-center justify-center text-[8px] font-bold">敵</div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400 bg-purple-200 flex items-center justify-center text-[8px]">↓</div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                    <div className="w-5 h-5 border border-gray-400"></div>
                  </div>
                  <p className="text-xs text-purple-800 font-medium flex-1">
                    台を1つ飛び越えて<br/>攻撃できる
                  </p>
                </div>
                <p className="text-sm text-purple-800 font-medium">
                  • 移動：間に駒なし<br />
                  • 攻撃：必ず1つの駒を飛び越える
                </p>
              </div>

              {/* 兵/卒 */}
              <div className="bg-pink-50 border-2 border-pink-300 rounded-lg p-4">
                <h3 className="font-bold text-lg text-pink-900 mb-2">兵/卒（Soldier）</h3>
                <div className="flex gap-2 items-center mb-2">
                  <div>
                    <p className="text-[10px] text-pink-900 font-bold mb-1 text-center">川を渡る前</p>
                    <div className="grid grid-cols-3 gap-0.5 bg-amber-100 p-1.5 rounded">
                      <div className="w-6 h-6 border border-gray-400"></div>
                      <div className="w-6 h-6 border border-gray-400 bg-pink-200 flex items-center justify-center text-[10px]">↑</div>
                      <div className="w-6 h-6 border border-gray-400"></div>
                      <div className="w-6 h-6 border border-gray-400"></div>
                      <div className="w-6 h-6 border-2 border-pink-600 bg-pink-100 flex items-center justify-center font-bold text-sm">兵</div>
                      <div className="w-6 h-6 border border-gray-400"></div>
                      <div className="w-6 h-6 border border-gray-400"></div>
                      <div className="w-6 h-6 border border-gray-400"></div>
                      <div className="w-6 h-6 border border-gray-400"></div>
                    </div>
                  </div>
                  <div className="text-xl text-pink-900">→</div>
                  <div>
                    <p className="text-[10px] text-pink-900 font-bold mb-1 text-center">川を渡った後</p>
                    <div className="grid grid-cols-3 gap-0.5 bg-amber-100 p-1.5 rounded">
                      <div className="w-6 h-6 border border-gray-400"></div>
                      <div className="w-6 h-6 border border-gray-400 bg-pink-200 flex items-center justify-center text-[10px]">↑</div>
                      <div className="w-6 h-6 border border-gray-400"></div>
                      <div className="w-6 h-6 border border-gray-400 bg-pink-200 flex items-center justify-center text-[10px]">←</div>
                      <div className="w-6 h-6 border-2 border-pink-600 bg-pink-100 flex items-center justify-center font-bold text-sm">兵</div>
                      <div className="w-6 h-6 border border-gray-400 bg-pink-200 flex items-center justify-center text-[10px]">→</div>
                      <div className="w-6 h-6 border border-gray-400"></div>
                      <div className="w-6 h-6 border border-gray-400"></div>
                      <div className="w-6 h-6 border border-gray-400"></div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-pink-800 font-medium">
                  • 後退不可、成りなし
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">勝利条件</h2>
            <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-6 my-6">
              <ul className="list-disc pl-6 text-indigo-800 font-medium space-y-2">
                <li><strong>将死（チェックメイト）</strong>: 相手の将/帥を取る</li>
                <li><strong>困毙（ステイルメイト）</strong>: 相手が合法手を持たない＝負け（チェスと異なる）</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">特殊ルール</h2>
            <div className="bg-rose-50 border-2 border-rose-300 rounded-lg p-6 my-6">
              <ul className="list-disc pl-6 text-rose-800 font-medium space-y-2">
                <li><strong>王の対面禁止</strong>: 将と帥が同じ列で向き合う（間に駒なし）のは禁止</li>
                <li><strong>長将（連続王手）</strong>: 同じ王手を連続すると反則負け</li>
                <li><strong>塞象眼</strong>: 象の移動経路の中間マスに駒があると移動不可</li>
                <li><strong>蹩馬腿</strong>: 馬の最初の1マス目に駒があると移動不可</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">引き分け条件</h2>
            <ul className="list-disc pl-6 text-slate-700 font-medium space-y-2">
              <li>千日手：同じ局面が3回繰り返される</li>
              <li>双方合意：両者が引き分けに合意</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">戦略のヒント</h2>
            <ul className="list-disc pl-6 text-slate-700 font-medium space-y-2">
              <li>車（車）は最強駒。早期に活用する</li>
              <li>馬は中央に配置すると機動力が上がる</li>
              <li>炮（砲）は味方駒を台にして攻撃できる</li>
              <li>兵（兵/卒）は川を渡ると価値が倍増</li>
              <li>相（相/象）で自陣を守る</li>
              <li>将（帥/将）を九宮の中央に保つ</li>
            </ul>

          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
