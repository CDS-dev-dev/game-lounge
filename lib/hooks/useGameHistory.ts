// ゲーム履歴管理（待った機能）の共通フック

import { useState } from 'react';

export interface HistoryEntry<T> {
  state: T;
  metadata?: Record<string, unknown>;
}

/**
 * ゲーム履歴管理と待った機能を提供
 * @param minHistoryForUndo - 待ったに必要な最小履歴数（デフォルト: 1）
 */
export function useGameHistory<T>(minHistoryForUndo: number = 1) {
  const [history, setHistory] = useState<T[]>([]);

  /**
   * 履歴に状態を追加
   */
  const addHistory = (state: T) => {
    setHistory((prev) => [...prev, state]);
  };

  /**
   * 履歴をクリア
   */
  const clearHistory = () => {
    setHistory([]);
  };

  /**
   * 指定した数だけ履歴を戻す
   * @param steps - 戻す手数（デフォルト: 1）
   * @returns 成功した場合は戻した後の状態、失敗した場合はnull
   */
  const undo = (steps: number = 1): T | null => {
    if (history.length < minHistoryForUndo + steps) {
      return null;
    }

    const newHistory = history.slice(0, -steps);
    const previousState = newHistory[newHistory.length - 1];
    setHistory(newHistory);
    return previousState;
  };

  /**
   * 待った可能か判定
   */
  const canUndo = (): boolean => {
    return history.length >= minHistoryForUndo + 1;
  };

  return {
    history,
    addHistory,
    clearHistory,
    undo,
    canUndo,
  };
}
