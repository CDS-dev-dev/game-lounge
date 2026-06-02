import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ゲームラウンジ - 大人のためのオンラインボードゲームプラットフォーム',
    short_name: 'ゲームラウンジ',
    description: 'ガイスター、中国象棋、立体四目並べなど8種類のボードゲームを無料でプレイ。オンライン対戦・ローカル対戦・CPU対戦に対応。',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#6366f1',
    orientation: 'any',
    categories: ['games', 'entertainment'],
    lang: 'ja',
    dir: 'ltr',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
