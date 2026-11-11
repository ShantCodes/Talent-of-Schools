import { useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { Star } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

const MIN = 1;
const MAX = 5;
const STEP = 0.5;

const clamp = (value: number) => Math.min(MAX, Math.max(MIN, value));

type Props = {
  value: number | null;
  onChange?: (value: number) => void;
  disabled?: boolean;
  /** Smaller, non-interactive stars for showing a score that was already given. */
  readOnly?: boolean;
  label?: string;
};

/** 1–5 star picker in half-star steps: hover to preview, click to set, arrow keys to adjust. */
export function StarRating({ value, onChange, disabled, readOnly, label }: Props) {
  const { dir } = useI18n();
  const [hover, setHover] = useState<number | null>(null);
  const interactive = !readOnly && !disabled && !!onChange;
  const shown = (interactive ? hover : null) ?? value ?? 0;
  const size = readOnly ? 'h-4 w-4' : 'h-6 w-6';

  function valueAt(event: MouseEvent<HTMLSpanElement>, star: number) {
    const rect = event.currentTarget.getBoundingClientRect();
    const fromStart = dir === 'rtl' ? rect.right - event.clientX : event.clientX - rect.left;
    return clamp(fromStart < rect.width / 2 ? star - STEP : star);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!interactive) return;
    const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const back = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    const current = value ?? 0;
    let next: number | null = null;
    if (event.key === forward || event.key === 'ArrowUp') next = clamp(current + STEP);
    else if (event.key === back || event.key === 'ArrowDown') next = clamp(current - STEP);
    else if (event.key === 'Home') next = MIN;
    else if (event.key === 'End') next = MAX;
    if (next === null) return;
    event.preventDefault();
    onChange!(next);
  }

  return (
    <div
      role={readOnly ? 'img' : 'slider'}
      aria-label={label}
      aria-valuemin={readOnly ? undefined : MIN}
      aria-valuemax={readOnly ? undefined : MAX}
      aria-valuenow={readOnly ? undefined : value ?? undefined}
      aria-valuetext={value ? `${value} / ${MAX}` : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={onKeyDown}
      onMouseLeave={() => setHover(null)}
      className={`inline-flex items-center gap-0.5 rounded outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${disabled ? 'opacity-60' : ''}`}
    >
      {Array.from({ length: MAX }, (_, i) => {
        const star = i + 1;
        const fill = shown >= star ? 'full' : shown >= star - STEP ? 'half' : 'empty';
        return (
          <span
            key={star}
            className={`relative ${size} ${interactive ? 'cursor-pointer' : ''}`}
            onMouseMove={interactive ? event => setHover(valueAt(event, star)) : undefined}
            onClick={interactive ? event => onChange!(valueAt(event, star)) : undefined}
          >
            <Star className={`absolute inset-0 ${size} text-gray-300 dark:text-gray-600`} aria-hidden />
            {fill !== 'empty' && (
              <span className={`absolute inset-y-0 start-0 overflow-hidden ${fill === 'half' ? 'w-1/2' : 'w-full'}`}>
                <Star className={`absolute start-0 top-0 ${size} fill-amber-400 text-amber-400`} aria-hidden />
              </span>
            )}
          </span>
        );
      })}
      {!readOnly && (
        <span className="ms-2 w-12 text-sm tabular-nums text-gray-600 dark:text-gray-400" dir="ltr">
          {shown ? `${shown} / ${MAX}` : '—'}
        </span>
      )}
    </div>
  );
}
