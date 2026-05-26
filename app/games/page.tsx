import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function GamesPage() {
  const games = [
    {
      id: 'geister',
      name: 'ガイスター',
      description: '青と赤のオバケ駒を使った心理戦ボードゲーム',
      playerCount: '2人',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">ゲーム選択</h1>
          <p className="text-gray-300">プレイしたいゲームを選んでください</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Card key={game.id} className="hover:shadow-xl transition-shadow duration-200">
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-800">{game.name}</h2>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{game.description}</p>
                <p className="text-sm text-gray-500 mb-4">プレイ人数: {game.playerCount}</p>
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/games/${game.id}/matching`}
                    className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    対戦開始
                  </Link>
                  <Link
                    href={`/games/${game.id}/rules`}
                    className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 text-center font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    ルールを見る
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-gray-300 hover:text-white underline">
            トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
