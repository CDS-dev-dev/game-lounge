// エラーハンドリングのユーティリティ関数

/**
 * エラーオブジェクトから安全にメッセージを取得
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '予期しないエラーが発生しました';
}

/**
 * ゲームロジックエラーをユーザーフレンドリーなメッセージに変換
 */
export function formatGameError(error: unknown): string {
  const message = getErrorMessage(error);

  // 開発環境でのみ詳細を表示
  if (process.env.NODE_ENV === 'development') {
    console.error('Game error:', error);
    return message;
  }

  // 本番環境では一般的なメッセージ
  return message || 'ゲーム操作でエラーが発生しました';
}
