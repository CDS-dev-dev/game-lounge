// エラーバウンダリーコンポーネント

'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from './Button';
import { Card, CardContent, CardHeader } from './Card';
import { TEXT_SIZE, PADDING } from '@/lib/constants/ui-scale';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h1 className={`${TEXT_SIZE.heading2} font-bold text-slate-900`}>
                  エラーが発生しました
                </h1>
              </div>
            </CardHeader>
            <CardContent className={PADDING.card}>
              <p className={`${TEXT_SIZE.body} text-slate-700 mb-4`}>
                申し訳ございません。予期しないエラーが発生しました。
              </p>
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className={`${TEXT_SIZE.label} font-mono text-red-800 break-all`}>
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={this.handleReset}
                  className="flex-1"
                >
                  リトライ
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.location.href = '/games'}
                  className="flex-1"
                >
                  ゲーム選択に戻る
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
