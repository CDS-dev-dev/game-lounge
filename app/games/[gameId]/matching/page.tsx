'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/Loading';

export default function MatchingPage() {
  const router = useRouter();

  useEffect(() => {
    // 開発中: 3秒後にダミーセッションIDで対戦画面に遷移
    const timer = setTimeout(() => {
      const dummySessionId = 'demo-session-' + Date.now();
      router.push(`/play/${dummySessionId}`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center">
        <Loading message="対戦相手を探しています..." />
        <p className="mt-4 text-gray-300">
          マッチングが完了するまでお待ちください
        </p>
      </div>
    </div>
  );
}
