// robots.txt自動生成

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // APIエンドポイントは非公開
          '/_next/',         // Next.js内部ファイル
          '/setup/*',        // ゲームセットアップ（動的）
          '/play/*',         // プレイ中ページ（動的）
        ],
      },
      {
        userAgent: 'GPTBot',  // ChatGPTクローラー
        disallow: '/',         // AI学習用クロール拒否（任意）
      },
    ],
    sitemap: 'https://game-lounge-pi.vercel.app/sitemap.xml',
  };
}
