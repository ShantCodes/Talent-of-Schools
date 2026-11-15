import { useCallback, useEffect, useState } from 'react';
import { CircleCheck, LoaderCircle, Star, Trophy, Printer } from 'lucide-react';
import { eventsApi, participantsApi, scoringApi } from '../../lib/endpoints';
import type { EventItem, Participant } from '../../lib/endpoints';
import { downloadMedia } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { Alert, Button, PageHeader, Pagination, Table, cell, errorText, selectClass, usePaged } from '../../components/ui';
import { StarRating } from '../../components/StarRating';
import { UserAvatar } from '../../components/Avatar';
import { ImagePreview } from '../../components/ImagePreview';
import type { ParticipantResult } from '../../lib/endpoints';

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
  // const [submitted, setSubmitted] = useState<Record<number, number>>({});
  const [busyId, setBusyId] = useState<number | null>(null);

  const [printItems, setPrintItems] = useState<Participant[]>([]);
  const [printing, setPrinting] = useState(false);

  async function handlePrint() {
    setPrinting(true);
    setError('');

    try {
      const result = await participantsApi.byEvent(eventId, 1, 10000);
      setPrintItems(result.items);

      // Wait for React to render the printable table
      setTimeout(() => {
        window.print();
        setPrinting(false);
      }, 300);
    } catch (e) {
      setError(errorText(e));
      setPrinting(false);
    }
  }

  const [results, setResults] = useState<ParticipantResult[]>([]);

  const loadResults = useCallback(() => {
    participantsApi.results(eventId)
      .then(setResults)
      .catch(e => setError(errorText(e)));
  }, [eventId, setError]);

  useEffect(loadResults, [loadResults]);

  async function submit(participant: Participant) {
    const score = scores[participant.id];

    if (!(score >= 1 && score <= 5)) {
      setError(t('jury.scoreRange'));
      return;
    }

    setBusyId(participant.id);
    setError('');

    try {
      await scoringApi.score({
        eventParticipantId: participant.id,
        jurorId: user!.id,
        eventId,
        score
      });

      participant.score = score;

      await loadResults();

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
      <Table headers={[t('common.profilePicture'), t('common.title'), t('common.author'), t('common.student'), t('common.document'), t('common.score')]} empty={!loading && items.length === 0}>
        {items.map(participant => (
          <tr key={participant.id}>
            <td className={cell}>
              <div className="flex items-center gap-3">
                <UserAvatar user={participant} />

                <div className="min-w-0">
                  <div className="font-medium">{participant.fullName}</div>
                  <div className="text-xs text-fg-subtle break-all">{participant.email}</div>
                </div>
              </div>
            </td>
            <td className={`${cell} font-medium`}>{participant.title}</td>
            <td className={cell}>{participant.author}</td>
            <td className={cell}>{participant.fullName ?? t('participants.userFallback', { id: participant.userId })}</td>
            <td className={cell}>
              {participant.documentId
                ? <ImagePreview mediaId={participant.documentId} />
                : <span className="text-fg-subtle">—</span>}
            </td>
            <td className={cell}>
              {participant.score !== null && participant.score !== undefined ? (
                <span className="inline-flex flex-wrap items-center gap-2 font-semibold text-success">
                  <StarRating
                    value={participant.score}
                    readOnly
                    label={t('jury.scored', { score: participant.score })}
                  />
                  <span className="inline-flex items-center gap-1">
                    <CircleCheck className="h-4 w-4" aria-hidden />
                    {t('jury.scored', { score: participant.score })}
                  </span>
                </span>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <StarRating
                    value={scores[participant.id] ?? null}
                    onChange={score =>
                      setScores(s => ({ ...s, [participant.id]: score }))
                    }
                    disabled={busyId === participant.id}
                    label={t('common.score')}
                  />

                  <Button
                    small
                    icon={busyId === participant.id ? LoaderCircle : Star}
                    disabled={busyId === participant.id || !scores[participant.id]}
                    onClick={() => submit(participant)}
                  >
                    {t('jury.submit')}
                  </Button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </Table>
      <h2 className="mb-3 mt-10 flex items-center gap-2 text-lg font-semibold">
        <Trophy className="h-5 w-5" aria-hidden />
        {t('participants.results')}
      </h2>
      <div className="mb-4 flex justify-end">
        <Button
          icon={Printer}
          variant="secondary"
          onClick={handlePrint}
          disabled={printing}
        >
          {printing ? 'Preparing...' : 'Print'}
        </Button>
      </div>
      <Table
        headers={[
          t('participants.col.rank'),
          t('common.title'),
          t('common.author'),
          t('common.student'),
          t('participants.col.average')
        ]}
        empty={results.length === 0}
      >
        {results.map((result, index) => (
          <tr key={`${result.title}-${index}`}>
            <td className={`${cell} font-bold`}>{index + 1}</td>
            <td className={cell}>{result.title}</td>
            <td className={cell}>{result.author}</td>
            <td className={cell}>
              {result.userName} {result.userLastName}
            </td>
            <td className={`${cell} font-semibold`}>
              {result.averageScore.toFixed(2)}
            </td>
          </tr>
        ))}
      </Table>
      <Pagination page={page} onChange={setPageNumber} />
      <div id="printable-table" className="hidden print:block">
        <h1 className="mb-4 text-xl font-bold">
          Participants
        </h1>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border p-2">#</th>
              <th className="border p-2">Title</th>
              <th className="border p-2">Author</th>
              <th className="border p-2">Student</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Score</th>
            </tr>
          </thead>

          <tbody>
            {printItems.map((participant, index) => (
              <tr key={participant.id}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{participant.title}</td>
                <td className="border p-2">{participant.author}</td>
                <td className="border p-2">{participant.fullName}</td>
                <td className="border p-2">{participant.email}</td>
                <td className="border p-2">
                  {participant.score ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
