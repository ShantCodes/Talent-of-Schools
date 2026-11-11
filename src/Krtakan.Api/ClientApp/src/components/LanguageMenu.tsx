import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Check, ChevronDown, Languages } from 'lucide-react';
import { languages, useI18n } from '../i18n/I18nContext';

export function LanguageMenu() {
  const { language, setLanguage, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = languages.find(option => option.code === language)!;

  useEffect(() => {
    if (!open) return;
    itemRefs.current[languages.findIndex(option => option.code === language)]?.focus();

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, language]);

  function close() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = itemRefs.current.findIndex(item => item === document.activeElement);
    const focusAt = (next: number) => itemRefs.current[(next + languages.length) % languages.length]?.focus();
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    else if (event.key === 'ArrowDown') { event.preventDefault(); focusAt(index + 1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); focusAt(index - 1); }
    else if (event.key === 'Home') { event.preventDefault(); focusAt(0); }
    else if (event.key === 'End') { event.preventDefault(); focusAt(languages.length - 1); }
    else if (event.key === 'Tab') setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(value => !value)}
        onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); } }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t('nav.language')}: ${current.label}`}
        title={t('nav.language')}
        className={`inline-flex items-center gap-1.5 !px-2.5 !py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 ${open ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
      >
        <Languages className="h-5 w-5" aria-hidden />
        <span className="text-xs font-semibold">{current.short}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t('nav.language')}
          onKeyDown={onMenuKeyDown}
          className="absolute end-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          {languages.map((option, index) => {
            const active = option.code === language;
            return (
              <button
                key={option.code}
                ref={element => { itemRefs.current[index] = element; }}
                role="menuitemradio"
                aria-checked={active}
                lang={option.code}
                onClick={() => { setLanguage(option.code); close(); }}
                className={`flex w-full items-center gap-3 !rounded-none !px-3 !py-2 text-start text-sm focus:outline-none ${active
                  ? 'bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:bg-gray-800'}`}
              >
                <span className="w-7 shrink-0 rounded bg-gray-100 py-0.5 text-center text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {option.short}
                </span>
                <span className="flex-1">{option.label}</span>
                {active && <Check className="h-4 w-4 shrink-0" aria-hidden />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
