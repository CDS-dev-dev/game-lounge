// ロケール管理フック

import { useState, useEffect } from 'react';
import type { Locale } from '@/lib/i18n/messages';
import { getMessages } from '@/lib/i18n/messages';

const LOCALE_STORAGE_KEY = 'game-lounge-locale';

/**
 * ロケール管理フック
 */
export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>('ja');

  useEffect(() => {
    // ローカルストレージから読み込み
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (stored && (stored === 'ja' || stored === 'en')) {
      setLocaleState(stored);
    } else {
      // ブラウザの言語設定を確認
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('en')) {
        setLocaleState('en');
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  };

  const messages = getMessages(locale);

  return {
    locale,
    setLocale,
    messages,
    t: (key: string) => {
      const keys = key.split('.');
      let value: any = messages;
      for (const k of keys) {
        value = value?.[k];
      }
      return typeof value === 'string' ? value : key;
    },
  };
}
