'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            エラーが発生しました
          </h2>
          <p className="text-slate-700">
            申し訳ございません。予期しないエラーが発生しました。
          </p>
        </div>

        {error.message && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p className="text-sm text-red-800">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            onClick={reset}
            className="w-full"
          >
            もう一度試す
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            ホームに戻る
          </Button>
        </div>
      </div>
    </div>
  );
}
