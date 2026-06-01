// エラーハンドリングユーティリティのテスト

import { getErrorMessage, formatGameError } from '@/lib/utils/error-handler';

describe('error-handler', () => {
  describe('getErrorMessage', () => {
    it('Errorオブジェクトからメッセージを取得', () => {
      const error = new Error('テストエラー');
      expect(getErrorMessage(error)).toBe('テストエラー');
    });

    it('文字列エラーをそのまま返す', () => {
      expect(getErrorMessage('エラーメッセージ')).toBe('エラーメッセージ');
    });

    it('未知の型のエラーはデフォルトメッセージ', () => {
      expect(getErrorMessage(null)).toBe('予期しないエラーが発生しました');
      expect(getErrorMessage(undefined)).toBe('予期しないエラーが発生しました');
      expect(getErrorMessage(123)).toBe('予期しないエラーが発生しました');
    });
  });

  describe('formatGameError', () => {
    it('開発環境では詳細メッセージを返す', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('詳細なエラー');
      expect(formatGameError(error)).toBe('詳細なエラー');

      process.env.NODE_ENV = originalEnv;
    });

    it('本番環境では一般的なメッセージを返す', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('詳細なエラー');
      expect(formatGameError(error)).toBe('詳細なエラー');

      process.env.NODE_ENV = originalEnv;
    });
  });
});
