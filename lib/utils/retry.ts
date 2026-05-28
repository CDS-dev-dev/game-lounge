// リトライ機能を提供するユーティリティ

export interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoff?: boolean; // 指数バックオフを使用するか
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * 非同期関数をリトライ付きで実行
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoff = true,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // 最後の試行の場合はエラーをスロー
      if (attempt === maxRetries) {
        break;
      }

      // リトライコールバック
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      // 待機時間を計算（指数バックオフの場合）
      const waitTime = backoff ? delayMs * Math.pow(2, attempt) : delayMs;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
}

/**
 * ネットワークエラーかどうかを判定
 */
export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    error.name === 'NetworkError' ||
    error.name === 'TypeError'
  );
}

/**
 * オフライン状態を検出
 */
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}
