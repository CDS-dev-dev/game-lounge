// 国際化対応のメッセージ定義

export type Locale = 'ja' | 'en';

export interface Messages {
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    confirm: string;
    back: string;
    next: string;
    close: string;
  };
  game: {
    yourTurn: string;
    opponentTurn: string;
    winner: string;
    loser: string;
    draw: string;
    undo: string;
    undoSuccess: string;
    undoFailed: string;
    replay: string;
    cpuThinking: string;
  };
  modes: {
    online: string;
    local: string;
    cpu: string;
  };
}

export const messages: Record<Locale, Messages> = {
  ja: {
    common: {
      loading: '読み込み中...',
      error: 'エラーが発生しました',
      retry: '再試行',
      cancel: 'キャンセル',
      confirm: '確認',
      back: '戻る',
      next: '次へ',
      close: '閉じる',
    },
    game: {
      yourTurn: 'あなたのターン',
      opponentTurn: '相手のターン',
      winner: 'あなたの勝ち！',
      loser: '相手の勝ち',
      draw: '引き分け',
      undo: '待った',
      undoSuccess: '1手戻しました',
      undoFailed: 'これ以上戻せません',
      replay: 'もう一度プレイ',
      cpuThinking: 'CPUが思考中...',
    },
    modes: {
      online: 'オンライン対戦',
      local: 'ローカル対戦',
      cpu: 'CPU対戦',
    },
  },
  en: {
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      close: 'Close',
    },
    game: {
      yourTurn: 'Your Turn',
      opponentTurn: "Opponent's Turn",
      winner: 'You Win!',
      loser: 'You Lose',
      draw: 'Draw',
      undo: 'Undo',
      undoSuccess: 'Undone 1 move',
      undoFailed: 'Cannot undo anymore',
      replay: 'Play Again',
      cpuThinking: 'CPU is thinking...',
    },
    modes: {
      online: 'Online',
      local: 'Local',
      cpu: 'vs CPU',
    },
  },
};

/**
 * ロケールに応じたメッセージを取得
 */
export function getMessages(locale: Locale = 'ja'): Messages {
  return messages[locale];
}

/**
 * ネストされたメッセージキーから値を取得
 */
export function getMessage(locale: Locale, key: string): string {
  const msgs = getMessages(locale);
  const keys = key.split('.');
  let value: any = msgs;

  for (const k of keys) {
    value = value?.[k];
  }

  return typeof value === 'string' ? value : key;
}
