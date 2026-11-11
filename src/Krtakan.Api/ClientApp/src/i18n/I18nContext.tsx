import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { en } from './en';
import type { MessageKey } from './en';
import { hy } from './hy';
import { fa } from './fa';

export type Language = 'en' | 'hy' | 'fa';
export type Direction = 'ltr' | 'rtl';
export type { MessageKey };

export const languages: { code: Language; label: string; short: string; dir: Direction }[] = [
  { code: 'en', label: 'English', short: 'EN', dir: 'ltr' },
  { code: 'hy', label: 'Հայերեն', short: 'ՀՅ', dir: 'ltr' },
  { code: 'fa', label: 'فارسی', short: 'فا', dir: 'rtl' },
];

const dictionaries: Record<Language, Record<MessageKey, string>> = { en, hy, fa };
// fa-IR formats dates in the Solar Hijri calendar with Persian digits.
const locales: Record<Language, string> = { en: 'en-US', hy: 'hy-AM', fa: 'fa-IR' };
const storageKey = 'krtakan.language';

const isLanguage = (value: string | null): value is Language => languages.some(l => l.code === value);
const directionOf = (language: Language) => languages.find(l => l.code === language)!.dir;

function initialLanguage(): Language {
  const saved = localStorage.getItem(storageKey);
  if (isLanguage(saved)) return saved;
  const browser = navigator.language?.toLowerCase().slice(0, 2) ?? '';
  return isLanguage(browser) ? browser : 'en';
}

// Module-level copy so code outside React (API client, helpers) can translate too.
let current: Language = initialLanguage();
document.documentElement.lang = current;
document.documentElement.dir = directionOf(current);

export type Vars = Record<string, string | number>;

/** Unknown `{placeholders}` are left in place so callers can split on them (e.g. to insert a link). */
export function translate(key: MessageKey, vars?: Vars) {
  const text = dictionaries[current][key] ?? en[key] ?? key;
  return vars ? text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match)) : text;
}

export function currentLocale() {
  return locales[current];
}

/** Role names come from the API; built-in ones are translated, custom ones are shown as-is. */
export function roleLabel(name: string) {
  const key = `role.${name}`;
  return key in en ? translate(key as MessageKey) : name;
}

export function roleList(names: string[]) {
  return names.length > 0 ? names.map(roleLabel).join(', ') : translate('users.noRoles');
}

type I18nContextType = {
  language: Language;
  dir: Direction;
  setLanguage: (language: Language) => void;
  t: typeof translate;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(current);

  const dir = directionOf(language);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  const setLanguage = useCallback((next: Language) => {
    current = next;
    localStorage.setItem(storageKey, next);
    setLanguageState(next);
  }, []);

  // A new `t` per language makes every consumer re-render when the language changes.
  const value = useMemo(() => ({ language, dir, setLanguage, t: (key: MessageKey, vars?: Vars) => translate(key, vars) }), [language, dir, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within an I18nProvider');
  return context;
}
