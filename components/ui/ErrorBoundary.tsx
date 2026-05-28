// エラーバウンダリーコンポーネント

'use client';

import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader } from './Card';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
          <Card className="max-w-lg">
            <CardHeader>
              <h2 className="text-2xl font-bold text-center text-red-600">エラーが発生しました</h2>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-slate-700">
                申し訳ございません。予期しないエラーが発生しました。
              </p>
              {this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-left">
                  <p className="text-xs font-mono text-red-800 break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <div className="flex gap-4 justify-center">
                <Button variant="primary" onClick={this.handleReset}>
                  ページを再読み込み
                </Button>
                <Button variant="secondary" onClick={() => (window.location.href = '/')}>
                  ホームに戻る
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
