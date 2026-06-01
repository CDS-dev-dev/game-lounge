// ゲーム履歴管理フックのテスト

import { renderHook, act } from '@testing-library/react';
import { useGameHistory } from '@/lib/hooks/useGameHistory';

describe('useGameHistory', () => {
  it('初期状態は空の履歴', () => {
    const { result } = renderHook(() => useGameHistory<number>());
    expect(result.current.history).toEqual([]);
    expect(result.current.canUndo()).toBe(false);
  });

  it('履歴に状態を追加できる', () => {
    const { result } = renderHook(() => useGameHistory<number>());

    act(() => {
      result.current.addHistory(1);
      result.current.addHistory(2);
      result.current.addHistory(3);
    });

    expect(result.current.history).toEqual([1, 2, 3]);
  });

  it('履歴をクリアできる', () => {
    const { result } = renderHook(() => useGameHistory<number>());

    act(() => {
      result.current.addHistory(1);
      result.current.addHistory(2);
      result.current.clearHistory();
    });

    expect(result.current.history).toEqual([]);
  });

  it('1手戻せる（デフォルト）', () => {
    const { result } = renderHook(() => useGameHistory<number>());

    act(() => {
      result.current.addHistory(1);
      result.current.addHistory(2);
    });

    expect(result.current.canUndo()).toBe(true);

    let previousState: number | null = null;
    act(() => {
      previousState = result.current.undo();
    });

    expect(previousState).toBe(1);
    expect(result.current.history).toEqual([1]);
  });

  it('最小履歴数を指定できる', () => {
    const { result } = renderHook(() => useGameHistory<number>(2));

    act(() => {
      result.current.addHistory(1);
      result.current.addHistory(2);
    });

    // 履歴2、最小2なので戻せない
    expect(result.current.canUndo()).toBe(false);

    act(() => {
      result.current.addHistory(3);
    });

    // 履歴3、最小2なので戻せる
    expect(result.current.canUndo()).toBe(true);
  });

  it('複数手戻せる', () => {
    const { result } = renderHook(() => useGameHistory<number>(2));

    act(() => {
      result.current.addHistory(1);
      result.current.addHistory(2);
      result.current.addHistory(3);
      result.current.addHistory(4);
    });

    let previousState: number | null = null;
    act(() => {
      previousState = result.current.undo(2);
    });

    expect(previousState).toBe(2);
    expect(result.current.history).toEqual([1, 2]);
  });

  it('履歴不足の場合はnullを返す', () => {
    const { result } = renderHook(() => useGameHistory<number>());

    let previousState: number | null = null;
    act(() => {
      previousState = result.current.undo();
    });

    expect(previousState).toBe(null);
  });
});
