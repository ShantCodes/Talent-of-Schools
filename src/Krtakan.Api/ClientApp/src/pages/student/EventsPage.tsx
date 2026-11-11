import { useState } from 'react';
import { Cake, CalendarClock, CalendarDays, LoaderCircle, Lock, Send, Upload, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { eventsApi, participantsApi } from '../../lib/endpoints';
import type { EventItem } from '../../lib/endpoints';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import type { MessageKey } from '../../i18n/I18nContext';
import { Alert, Button, Field, Modal, PageHeader, Pagination, errorText, formatDate, usePaged } from '../../components/ui';

function eventStatus(event: EventItem): { label: MessageKey; ended: boolean; style: string } {
  const now = Date.now();
  if (now < new Date(event.startDate).getTime()) return { label: 'studentEvents.status.upcoming', ended: false, style: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' };
  if (now <= new Date(event.endDate).getTime()) return { label: 'studentEvents.status.open', ended: false, style: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' };
  return { label: 'studentEvents.status.ended', ended: true, style: 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400' };
}

export function StudentEventsPage() {
  const { t } = useI18n();
  const { hasRole } = useAuth();
  const { items, page, loading, error, setError, setPageNumber } = usePaged(eventsApi.list);
  const [joining, setJoining] = useState<EventItem | null>(null);
  const [notice, setNotice] = useState('');
  const isStudent = hasRole('Student');

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6">
      <PageHeader title={t('studentEvents.title')} subtitle={t('studentEvents.subtitle')} />
      <Alert message={error} onClose={() => setError('')} />
      <Alert message={notice} kind="success" onClose={() => setNotice('')} />

      {!loading && items.length === 0 && <p className="text-gray-500">{t('studentEvents.none')}</p>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map(event => {
          const status = eventStatus(event);
          return (
            <article key={event.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">{event.name}</h2>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.style}`}>{t(status.label)}</span>
              </div>
              <p className="mt-2 flex-1 text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div><dt className="flex items-center gap-1 font-semibold"><CalendarDays className="h-3.5 w-3.5" aria-hidden />{t('studentEvents.starts')}</dt><dd>{formatDate(event.startDate)}</dd></div>
                <div><dt className="flex items-center gap-1 font-semibold"><CalendarClock className="h-3.5 w-3.5" aria-hidden />{t('studentEvents.ends')}</dt><dd>{formatDate(event.endDate)}</dd></div>
                {(event.minBirthDate || event.maxBirthDate) && (
                  <div className="col-span-2">
                    <dt className="flex items-center gap-1 font-semibold"><Cake className="h-3.5 w-3.5" aria-hidden />{t('studentEvents.bornBetween')}</dt>
                    <dd>{t('studentEvents.bornRange', { min: event.minBirthDate ?? '…', max: event.maxBirthDate ?? '…' })}</dd>
                  </div>
                )}
              </dl>
              {isStudent && (
                <Button className="mt-4" icon={status.ended ? Lock : Send} disabled={status.ended} onClick={() => setJoining(event)}>
                  {status.ended ? t('studentEvents.closed') : t('studentEvents.signUp')}
                </Button>
              )}
            </article>
          );
        })}
      </div>
      <Pagination page={page} onChange={setPageNumber} />

      {joining && (
        <SignUpModal event={joining} onClose={() => setJoining(null)}
          onDone={() => { setNotice(t('studentEvents.signedUp', { name: joining.name })); setJoining(null); }} />
      )}
    </main>
  );
}

function SignUpModal({ event, onClose, onDone }: { event: EventItem; onClose: () => void; onDone: () => void }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(user?.fullName ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await participantsApi.signUp(event.id, title.trim(), author.trim(), file);
      onDone();
    } catch (err) {
      setError(`${errorText(err)} ${t('studentEvents.alreadyHint')}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={t('studentEvents.modalTitle', { name: event.name })} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Alert message={error} />
        <Field label={t('studentEvents.workTitle')}><input value={title} onChange={e => setTitle(e.target.value)} required maxLength={255} /></Field>
        <Field label={t('common.author')}><input value={author} onChange={e => setAuthor(e.target.value)} required maxLength={100} /></Field>
        <Field label={t('studentEvents.file')}>
          <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} className="!p-1.5 text-sm" />
        </Field>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" icon={X} onClick={onClose}>{t('common.cancel')}</Button>
          <Button disabled={busy} icon={busy ? LoaderCircle : Upload}>{busy ? t('studentEvents.submitting') : t('studentEvents.submit')}</Button>
        </div>
      </form>
    </Modal>
  );
}
