// SEO用メタデータ生成ユーティリティ

import type { Metadata } from 'next';

const BASE_URL = 'https://game-lounge-pi.vercel.app';

interface GameMetadataConfig {
  title: string;
  description: string;
  keywords: string[];
  path: string;
}

/**
 * ゲームページ用のメタデータを生成
 */
export function generateGameMetadata(config: GameMetadataConfig): Metadata {
  const { title, description, keywords, path } = config;

  return {
    title: `${title} | ゲームラウンジ`,
    description,
    keywords: [...keywords, 'オンライン対戦', 'ボードゲーム', '無料'],
    openGraph: {
      type: 'website',
      locale: 'ja_JP',
      url: `${BASE_URL}${path}`,
      siteName: 'ゲームラウンジ',
      title: `${title} | ゲームラウンジ`,
      description,
      images: [
        {
          url: `${BASE_URL}/icon-512.png`,
          width: 512,
          height: 512,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: `${title} | ゲームラウンジ`,
      description,
      images: [`${BASE_URL}/icon-512.png`],
    },
  };
}

/**
 * 各ゲームのメタデータ定義
 */
export const GAME_METADATA = {
  geister: generateGameMetadata({
    title: 'ガイスター',
    description: 'ドイツ生まれの心理戦ボードゲーム。青いお化けと赤い悪魔を使った頭脳戦。オンライン対戦・ローカル対戦・CPU対戦に対応。',
    keywords: ['ガイスター', 'Geister', '心理戦', '戦略ゲーム'],
    path: '/games/geister',
  }),
  xiangqi: generateGameMetadata({
    title: '中国象棋',
    description: '中国伝統の将棋ゲーム。将棋とチェスの要素を併せ持つ奥深い戦略ゲーム。オンライン対戦・ローカル対戦・CPU対戦に対応。',
    keywords: ['中国象棋', 'シャンチー', '象棋', '将棋'],
    path: '/games/xiangqi',
  }),
  connect4: generateGameMetadata({
    title: '立体四目並べ',
    description: '3次元空間で展開される四目並べ。縦・横・斜め全てのラインで4つ揃えを目指す立体パズルゲーム。',
    keywords: ['立体四目並べ', '3D四目', 'Connect4', 'パズルゲーム'],
    path: '/games/connect4',
  }),
};
