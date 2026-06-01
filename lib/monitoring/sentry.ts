// Sentryエラー監視設定（準備）

/**
 * Sentry初期化
 *
 * 使用方法：
 * 1. npm install @sentry/nextjs
 * 2. .env.localに以下を追加：
 *    NEXT_PUBLIC_SENTRY_DSN=your-dsn-here
 * 3. このファイルのコメントを解除
 */

/*
import * as Sentry from '@sentry/nextjs';

export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      debug: false,

      // エラーのフィルタリング
      beforeSend(event, hint) {
        // 開発環境では送信しない
        if (process.env.NODE_ENV === 'development') {
          return null;
        }
        return event;
      },

      // パフォーマンス監視
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: ['localhost', /^\//],
        }),
      ],
    });
  }
}

// エラーを手動で報告
export function captureError(error: Error, context?: Record<string, any>) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      contexts: {
        game: context,
      },
    });
  } else {
    console.error('Error captured:', error, context);
  }
}

// カスタムメッセージを報告
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`[${level}] ${message}`);
  }
}
*/

// 現在はコンソールログのみ
export function initSentry() {
  console.log('Sentry monitoring is not configured yet.');
}

export function captureError(error: Error, context?: Record<string, any>) {
  console.error('Error captured:', error, context);
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  console.log(`[${level}] ${message}`);
}
