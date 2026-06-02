/**
 * 環境変数で制御されるロガーユーティリティ
 * 開発環境でのみログ出力し、本番環境ではエラーのみを出力
 */

export const logger = {
  /**
   * 開発環境でのみログ出力
   */
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },

  /**
   * 開発環境でのみ警告出力
   */
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  },

  /**
   * エラーは本番環境でも出力
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * 開発環境でのみデバッグ出力
   */
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(...args);
    }
  },
};
