// Google Analytics設定（準備）

/**
 * Google Analytics初期化
 *
 * 使用方法：
 * 1. .env.localに以下を追加：
 *    NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
 * 2. app/layout.tsxに以下を追加：
 *    <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
 *    <Script id="google-analytics">
 *      {`window.dataLayer = window.dataLayer || [];
 *        function gtag(){dataLayer.push(arguments);}
 *        gtag('js', new Date());
 *        gtag('config', '${GA_ID}');`}
 *    </Script>
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// ページビューを送信
export function pageview(url: string) {
  if (typeof window !== 'undefined' && GA_ID && (window as any).gtag) {
    (window as any).gtag('config', GA_ID, {
      page_path: url,
    });
  }
}

// イベントを送信
export function event({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) {
  if (typeof window !== 'undefined' && GA_ID && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  } else {
    console.log('GA Event:', { action, category, label, value });
  }
}

// ゲーム関連のイベント
export const gameEvents = {
  // ゲーム開始
  gameStart: (gameName: string, mode: string) => {
    event({
      action: 'game_start',
      category: 'Game',
      label: `${gameName}_${mode}`,
    });
  },

  // ゲーム終了
  gameEnd: (gameName: string, mode: string, result: 'win' | 'lose' | 'draw') => {
    event({
      action: 'game_end',
      category: 'Game',
      label: `${gameName}_${mode}_${result}`,
    });
  },

  // 待った使用
  undo: (gameName: string) => {
    event({
      action: 'undo',
      category: 'Game',
      label: gameName,
    });
  },

  // CPU難易度選択
  selectDifficulty: (gameName: string, difficulty: string) => {
    event({
      action: 'select_difficulty',
      category: 'Game',
      label: `${gameName}_${difficulty}`,
    });
  },
};
