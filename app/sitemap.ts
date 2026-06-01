// sitemap.xml自動生成

import { MetadataRoute } from 'next';

const BASE_URL = 'https://game-lounge-pi.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const games = ['geister', 'xiangqi', 'connect4'];
  const modes = ['cpu', 'local', 'online'];

  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/games`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // ゲームページ
  const gamePages: MetadataRoute.Sitemap = games.flatMap((game) => [
    // ゲームトップ
    {
      url: `${BASE_URL}/games/${game}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    // ルールページ
    {
      url: `${BASE_URL}/games/${game}/rules`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    // 各モード
    ...modes.map((mode) => ({
      url: `${BASE_URL}/games/${game}/${mode}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]);

  return [...staticPages, ...gamePages];
}
