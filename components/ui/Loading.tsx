// 共通ローディングコンポーネント

'use client';

import React from 'react';
import { Card, CardContent } from './Card';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  message = '読み込み中...',
  fullScreen = false,
}) => {
  const content = (
    <Card className={fullScreen ? 'bg-white/95' : ''}>
      <CardContent className="py-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
        <p className="text-slate-900 text-lg font-semibold">{message}</p>
      </CardContent>
    </Card>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        {content}
      </div>
    );
  }

  return content;
};
