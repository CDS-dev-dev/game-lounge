// メモリリーク対策: アンマウント時に自動クリーンアップするタイマーフック

import { useEffect, useRef } from 'react';

/**
 * コンポーネントアンマウント時に自動的にクリアされるタイマーを提供
 */
export function useSafeTimeout() {
  const timeoutIds = useRef<Set<NodeJS.Timeout>>(new Set());

  useEffect(() => {
    // クリーンアップ: コンポーネントアンマウント時に全てのタイマーをクリア
    return () => {
      timeoutIds.current.forEach((id) => clearTimeout(id));
      timeoutIds.current.clear();
    };
  }, []);

  /**
   * タイマーを設定（自動クリーンアップ付き）
   */
  const setSafeTimeout = (callback: () => void, delay: number): NodeJS.Timeout => {
    const id = setTimeout(() => {
      timeoutIds.current.delete(id);
      callback();
    }, delay);

    timeoutIds.current.add(id);
    return id;
  };

  /**
   * タイマーを手動でクリア
   */
  const clearSafeTimeout = (id: NodeJS.Timeout) => {
    clearTimeout(id);
    timeoutIds.current.delete(id);
  };

  return { setSafeTimeout, clearSafeTimeout };
}
