import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, CircleAlert, CircleCheck, Eye, EyeOff, Inbox, LoaderCircle, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PagedResult } from '../features/auth/types';
import { currentLocale, translate, useI18n } from '../i18n/I18nContext';

const variants = {
  primary: 'bg-primary text-primary-fg hover:bg-primary/90',
  secondary: 'border border-line-strong text-fg hover:bg-surface-muted',
  danger: 'bg-danger text-danger-fg hover:bg-danger/90',
  success: 'bg-success text-success-fg hover:bg-success/90',
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants; small?: boolean; icon?: LucideIcon };

const iconSize = (small?: boolean) => (small ? 'h-3.5 w-3.5 shrink-0' : 'h-4 w-4 shrink-0');

/** Mirrors arrow-like icons on right-to-left pages so they keep pointing "back"/"forward". */
export const rtlFlip = 'rtl:-scale-x-100';
const directionalIcons: LucideIcon[] = [ArrowLeft, ChevronLeft, ChevronRight];

const iconClass = (Icon: LucideIcon, small?: boolean) =>
  `${iconSize(small)} ${Icon === LoaderCircle ? 'animate-spin' : ''} ${directionalIcons.includes(Icon) ? rtlFlip : ''}`;

export function Button({ variant = 'primary', small, icon: Icon, className = '', children, ...props }: ButtonProps) {
  return (
    <button {...props} className={`${variants[variant]} inline-flex items-center justify-center gap-1.5 ${small ? '!px-2.5 !py-1 text-sm' : ''} ${className}`}>
      {Icon && <Icon className={iconClass(Icon, small)} aria-hidden />}
      {children}
    </button>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-fg">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-fg-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Alert({ message, kind = 'error', onClose }: { message: string; kind?: 'error' | 'success'; onClose?: () => void }) {
  const { t } = useI18n();
  if (!message) return null;
  const style = kind === 'error'
    ? 'border-danger/30 bg-danger-soft text-danger'
    : 'border-success/30 bg-success-soft text-success';
  const Icon = kind === 'error' ? CircleAlert : CircleCheck;
  return (
    <div className={`mb-4 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${style}`} role="status">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span className="flex-1">{message}</span>
      {onClose && <button onClick={onClose} className="!p-0 opacity-70 hover:opacity-100" aria-label={t('common.dismiss')}><X className="h-4 w-4" /></button>}
    </div>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const topmost = Array.from(document.querySelectorAll('[data-modal]')).pop();
      if (event.key === 'Escape' && topmost === ref.current) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div ref={ref} data-modal className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl" onMouseDown={event => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-fg">{title}</h2>
          <button onClick={onClose} className="!p-1 text-fg-subtle hover:text-fg" aria-label={t('common.close')}><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

type ConfirmOptions = { title: string; message: React.ReactNode; confirmLabel?: string; variant?: keyof typeof variants; icon?: LucideIcon };

export function ConfirmModal({ title, message, confirmLabel, variant = 'primary', icon = Check, onConfirm, onCancel }:
  ConfirmOptions & { onConfirm: () => void; onCancel: () => void }) {
  const { t } = useI18n();
  return (
    <Modal title={title} onClose={onCancel}>
      <div className="text-sm text-fg">{message}</div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" icon={X} onClick={onCancel}>{t('common.cancel')}</Button>
        <Button variant={variant} icon={icon} onClick={onConfirm} autoFocus>{confirmLabel ?? t('common.confirm')}</Button>
      </div>
    </Modal>
  );
}

/** Promise-based replacement for window.confirm: render `dialog`, then `if (await ask({...})) ...`. */
export function useConfirm() {
  const [pending, setPending] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const ask = useCallback((options: ConfirmOptions) => new Promise<boolean>(resolve => setPending({ ...options, resolve })), []);
  const close = (ok: boolean) => { pending?.resolve(ok); setPending(null); };
  const dialog = pending && <ConfirmModal {...pending} onConfirm={() => close(true)} onCancel={() => close(false)} />;
  return [dialog, ask] as const;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-fg">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}

/** A password input with an eye button that toggles whether the characters are visible. */
export function PasswordInput({ className = '', ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <div className="relative">
      <input {...props} type={visible ? 'text' : 'password'} data-password className={`pr-10 rtl:pl-10 rtl:pr-3 ${className}`} />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        onMouseDown={event => event.preventDefault()}
        className="absolute inset-y-0 right-0 flex items-center !px-3 !py-0 text-fg-subtle hover:text-fg rtl:left-0 rtl:right-auto"
        aria-label={visible ? t('common.hidePassword') : t('common.showPassword')}
        aria-pressed={visible}
        title={visible ? t('common.hidePassword') : t('common.showPassword')}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

export const selectClass = 'w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-fg';

export function Pagination({ page, onChange }: { page?: PagedResult<unknown>; onChange: (pageNumber: number) => void }) {
  const { t } = useI18n();
  if (!page || page.totalPages <= 1) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center justify-end gap-3 text-sm">
      <Button variant="secondary" small icon={ChevronLeft} disabled={!page.hasPreviousPage} onClick={() => onChange(page.pageNumber - 1)}>{t('common.previous')}</Button>
      <span className="text-fg-muted">{t('common.pageOf', { page: page.pageNumber, total: page.totalPages, count: page.totalCount })}</span>
      <Button variant="secondary" small disabled={!page.hasNextPage} onClick={() => onChange(page.pageNumber + 1)}>
        {t('common.next')}<ChevronRight className={`h-3.5 w-3.5 ${rtlFlip}`} aria-hidden />
      </Button>
    </div>
  );
}

export function Table({ headers, children, empty }: { headers: string[]; children: React.ReactNode; empty?: boolean }) {
  const { t } = useI18n();
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full text-start text-sm">
        <thead className="bg-surface-muted text-xs uppercase text-fg-subtle">
          <tr>{headers.map((header, index) => <th key={index} className="px-4 py-3 font-semibold">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">
          {empty
            ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-10 text-center text-fg-subtle">
                  <Inbox className="mx-auto mb-2 h-6 w-6" aria-hidden />
                  {t('common.empty')}
                </td>
              </tr>
            )
            : children}
        </tbody>
      </table>
    </div>
  );
}

export const cell = 'px-4 py-3 align-middle';

/** Loads a paged endpoint and exposes reload/page controls. */
export function usePaged<T>(load: (pageNumber: number) => Promise<PagedResult<T>>, deps: unknown[] = []) {
  const [page, setPage] = useState<PagedResult<T>>();
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(load, deps);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const result = await run(pageNumber);
      if (result.items.length === 0 && pageNumber > 1) { setPageNumber(pageNumber - 1); return; }
      setPage(result);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : translate('common.failedToLoad'));
    } finally {
      setLoading(false);
    }
  }, [run, pageNumber]);

  useEffect(() => { reload(); }, [reload]);

  return { page, items: page?.items ?? [], loading, error, setError, reload, setPageNumber };
}

/** Loads a single item; a `null` result is reported as "Not found." */
export function useLoaded<T>(load: () => Promise<T | null>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    setLoading(true);
    load()
      .then(result => { if (!live) return; setData(result); setError(result === null ? translate('common.notFound') : ''); })
      .catch(e => { if (live) setError(errorText(e)); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, setData, loading, error, setError };
}

/** A success message handed over through navigation state, e.g. from a form page back to its list. */
export function useFlashNotice() {
  const location = useLocation();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(() => (location.state as { notice?: string } | null)?.notice ?? '');

  useEffect(() => {
    if ((location.state as { notice?: string } | null)?.notice) {
      navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: null });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [notice, setNotice] as const;
}

export function FormCard({ title, subtitle, backTo, backLabel, children }:
  { title: string; subtitle?: string; backTo: string; backLabel: string; children: React.ReactNode }) {
  return (
    <div className="max-w-2xl">
      <BackLink to={backTo}>{backLabel}</BackLink>
      <div className="mt-2"><PageHeader title={title} subtitle={subtitle} /></div>
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">{children}</div>
    </div>
  );
}

export function BackLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
      <ArrowLeft className={`h-4 w-4 ${rtlFlip}`} aria-hidden />{children}
    </Link>
  );
}

export function LinkButton({ to, children, variant = 'secondary', small, state, icon: Icon }:
  { to: string; children: React.ReactNode; variant?: keyof typeof variants; small?: boolean; state?: unknown; icon?: LucideIcon }) {
  return (
    <Link to={to} state={state} className={`${variants[variant]} inline-flex items-center gap-1.5 rounded-lg font-medium transition ${small ? 'px-2.5 py-1 text-sm' : 'px-4 py-2'}`}>
      {Icon && <Icon className={iconClass(Icon, small)} aria-hidden />}
      {children}
    </Link>
  );
}

export function errorText(e: unknown) {
  return e instanceof Error ? e.message : translate('common.somethingWrong');
}

export function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(currentLocale(), { dateStyle: 'medium', timeStyle: 'short' });
}
