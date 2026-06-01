// Vercel Analytics設定（準備）

/**
 * Vercel Analytics初期化
 *
 * 使用方法：
 * 1. npm install @vercel/analytics
 * 2. app/layout.tsxに以下を追加：
 *    import { Analytics } from '@vercel/analytics/react';
 *    <Analytics />
 */

/*
import { track } from '@vercel/analytics';

export function trackCustomEvent(name: string, properties?: Record<string, any>) {
  track(name, properties);
}
*/

// 現在はコンソールログのみ
export function trackCustomEvent(name: string, properties?: Record<string, any>) {
  console.log('Custom Event:', name, properties);
}

// ゲームパフォーマンス計測
export function measureGamePerformance(gameName: string, action: string) {
  const startTime = performance.now();

  return {
    end: () => {
      const duration = performance.now() - startTime;
      trackCustomEvent('game_performance', {
        game: gameName,
        action,
        duration: Math.round(duration),
      });
    },
  };
}
