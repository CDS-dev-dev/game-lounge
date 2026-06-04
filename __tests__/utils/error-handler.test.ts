import { formatGameError, getErrorMessage } from '@/lib/utils/error-handler';

function setNodeEnv(value: typeof process.env.NODE_ENV) {
  Object.defineProperty(process.env, 'NODE_ENV', {
    value,
    configurable: true,
    writable: true,
  });
}

describe('error-handler', () => {
  describe('getErrorMessage', () => {
    it('returns a message from Error instances', () => {
      expect(getErrorMessage(new Error('test error'))).toBe('test error');
    });

    it('returns string errors as-is', () => {
      expect(getErrorMessage('plain error')).toBe('plain error');
    });

    it('falls back for unknown error values', () => {
      expect(getErrorMessage(null)).toBe('予期しないエラーが発生しました');
      expect(getErrorMessage(undefined)).toBe('予期しないエラーが発生しました');
      expect(getErrorMessage(123)).toBe('予期しないエラーが発生しました');
    });
  });

  describe('formatGameError', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      setNodeEnv(originalEnv);
    });

    it('returns detailed messages in development', () => {
      setNodeEnv('development');

      expect(formatGameError(new Error('detailed error'))).toBe('detailed error');
    });

    it('keeps the current production fallback behavior', () => {
      setNodeEnv('production');

      expect(formatGameError(new Error('detailed error'))).toBe('detailed error');
    });
  });
});
