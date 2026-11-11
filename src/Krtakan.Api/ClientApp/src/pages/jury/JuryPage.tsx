import { useEffect, useState } from 'react';
import { CircleCheck, Download, LoaderCircle, Star } from 'lucide-react';
import { eventsApi, participantsApi, scoringApi } from '../../lib/endpoints';
import type { EventItem, Participant } from '../../lib/endpoints';
import { downloadMedia } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { Alert, Button, PageHeader, Pagination, Table, cell, errorText, selectClass, usePaged } from '../../components/ui';
import { StarRating } from '../../components/StarRating';

export function JuryPage() {
  const { t } = useI18n();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventId, setEventId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    eventsApi.list(1, 100)
      .then(result => {
        setEvents(result.items);
        if (result.items.length > 0) setEventId(result.items[0].id);
      })
      .catch(e => setError(errorText(e)));
  }, []);

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6">
      <PageHeader title={t('jury.title')} subtitle={t('jury.subtitle')} />
      <Alert message={error} onClose={() => setError('')} />
      <label className="mb-6 block max-w-sm text-sm font-medium text-fg">
        {t('jury.event')}
        <select className={`${selectClass} mt-1`} value={eventId ?? ''} onChange={e => setEventId(Number(e.target.value))}>
          {events.length === 0 && <option value="">{t('jury.noEvents')}</option>}
          {events.map(event => <option key={event.id} value={event.id}>{event.name}</option>)}
        </select>
      </label>
      {eventId && <ParticipantScores key={eventId} eventId={eventId} />}
    </main>
  );
}

function ParticipantScores({ eventId }: { eventId: number }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { items, page, loading, error, setError, setPageNumber } =
    usePaged((pageNumber: number) => participantsApi.byEvent(eventId, pageNumber), [eventId]);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<Record<number, number>>({});
  const [busyId, setBusyId] = useState<number | null>(null);

  async function submit(participant: Participant) {
    const score = scores[participant.id];
    if (!(score >= 1 && score <= 5)) { setError(t('jury.scoreRange')); return; }
    setBusyId(participant.id); setError('');
    try {
      await scoringApi.score({ eventParticipantId: participant.id, jurorId: user!.id, eventId, score });
      setSubmitted(s => ({ ...s, [participant.id]: score }));
    } catch (e) {
      setError(`${errorText(e)} ${t('jury.onceHint')}`);
    } finally {
      setBusyId(null);
    }
  }

  async function download(participant: Participant) {
    try { await downloadMedia(participant.documentId!, participant.title || 'document'); }
    catch (e) { setError(errorText(e)); }
  }

  return (
    <>
      <Alert message={error} onClose={() => setError('')} />
      <Table headers={[t('common.title'), t('common.author'), t('common.student'), t('common.document'), t('common.score')]} empty={!loading && items.length === 0}>
        {items.map(participant => (
          <tr key={participant.id}>
            <td className={`${cell} font-medium`}>{participant.title}</td>
            <td className={cell}>{participant.author}</td>
            <td className={cell}>{participant.fullName ?? t('participants.userFallback', { id: participant.userId })}</td>
            <td className={cell}>
              {participant.documentId
                ? <Button small variant="secondary" icon={Download} onClick={() => download(participant)}>{t('common.download')}</Button>
                : <span className="text-fg-subtle">—</span>}
            </td>
            <td className={cell}>
              {submitted[participant.id] !== undefined
                ? (
                  <span className="inline-flex flex-wrap items-center gap-2 font-semibold text-success">
                    <StarRating value={submitted[participant.id]} readOnly label={t('jury.scored', { score: submitted[participant.id] })} />
                    <span className="inline-flex items-center gap-1">
                      <CircleCheck className="h-4 w-4" aria-hidden />{t('jury.scored', { score: submitted[participant.id] })}
                    </span>
                  </span>
                )
                : (
                  <div className="flex flex-wrap items-center gap-2">
                    <StarRating
                      value={scores[participant.id] ?? null}
                      onChange={score => setScores(s => ({ ...s, [participant.id]: score }))}
                      disabled={busyId === participant.id}
                      label={t('common.score')}
                    />
                    <Button small icon={busyId === participant.id ? LoaderCircle : Star} disabled={busyId === participant.id || !scores[participant.id]} onClick={() => submit(participant)}>
                      {t('jury.submit')}
                    </Button>
                  </div>
                )}
            </td>
          </tr>
        ))}
      </Table>
      <Pagination page={page} onChange={setPageNumber} />
    </>
  );
}
