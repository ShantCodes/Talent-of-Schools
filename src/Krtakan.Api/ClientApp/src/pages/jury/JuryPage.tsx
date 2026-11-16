import { useCallback, useEffect, useState } from 'react';
import { CircleCheck, LoaderCircle, Star, Trophy, Printer, Filter, X } from 'lucide-react';
import { eventsApi, participantsApi, schoolsApi, scoringApi } from '../../lib/endpoints';
import type { EventItem, Participant } from '../../lib/endpoints';
import { downloadMedia } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { Alert, Button, PageHeader, Pagination, Table, cell, errorText, selectClass, usePaged } from '../../components/ui';
import { StarRating } from '../../components/StarRating';
import { UserAvatar } from '../../components/Avatar';
import { ImagePreview } from '../../components/ImagePreview';
import type { ParticipantResult } from '../../lib/endpoints';
import type { School } from '../../features/auth/types';
import { div } from 'framer-motion/client';

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
    <main className="mx-auto w-full max-w-5xl min-w-0 p-3 sm:p-6">
      <PageHeader title={t('jury.title')} subtitle={t('jury.subtitle')} />
      <Alert message={error} onClose={() => setError('')} />
      <label className="mb-6 block w-full sm:max-w-sm text-sm font-medium text-fg">
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
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);

  const [draftSchoolIds, setDraftSchoolIds] = useState<number[]>([]);
  const [appliedSchoolIds, setAppliedSchoolIds] = useState<number[]>([]);


  const { t } = useI18n();
  const { user } = useAuth();
  const { items, page, loading, error, setError, setPageNumber } =
    usePaged(
      (pageNumber: number) =>
        participantsApi.byEvent(eventId, pageNumber, 10, appliedSchoolIds),
      [eventId, appliedSchoolIds]
    );

  useEffect(() => {
    if (!showFilterModal) return;

    setDraftSchoolIds(appliedSchoolIds);

    if (schools.length > 0) return;

    setLoadingSchools(true);

    schoolsApi.list(1, 1000)
      .then(result => setSchools(result.items))
      .catch(e => setError(errorText(e)))
      .finally(() => setLoadingSchools(false));

  }, [showFilterModal]);
  const [scores, setScores] = useState<Record<number, number>>({});
  // const [submitted, setSubmitted] = useState<Record<number, number>>({});
  const [busyId, setBusyId] = useState<number | null>(null);

  const [printItems, setPrintItems] = useState<Participant[]>([]);
  const [printing, setPrinting] = useState(false);

  function toggleSchool(schoolId: number) {
    setDraftSchoolIds(current =>
      current.includes(schoolId)
        ? current.filter(id => id !== schoolId)
        : [...current, schoolId]
    );
  }

  function applySchoolFilter() {
    setAppliedSchoolIds(draftSchoolIds);
    setPageNumber(1);
    setShowFilterModal(false);
  }

  async function handlePrint() {
    setPrinting(true);
    setError('');

    try {
      const result = await participantsApi.results(eventId);
      setResults(result);

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
      <div className="mb-4 flex justify-end">
        <Button
          icon={Filter}
          variant="secondary"
          onClick={() => setShowFilterModal(true)}
        >
          Sort by School
          {appliedSchoolIds.length > 0 && ` (${appliedSchoolIds.length})`}
        </Button>
      </div>

      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-2 sm:p-4">
          <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-2xl sm:rounded-xl border border-border bg-white p-4 sm:p-6 text-gray-900 shadow-xl dark:bg-gray-900 dark:text-gray-100">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Prioritize Schools
              </h2>

              <button
                onClick={() => setShowFilterModal(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingSchools ? (
              <div className="flex items-center justify-center gap-2 p-8 text-sm text-gray-500">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Loading schools...
              </div>
            ) : schools.length === 0 ? (
              <p className="p-4 text-center text-sm text-gray-500">
                No schools found.
              </p>
            ) : (
              <>
                {/* Selected schools */}
                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-semibold">
                    Priority Order
                  </h3>

                  {draftSchoolIds.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-gray-500">
                      Select schools below to set their priority.
                    </p>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      {draftSchoolIds.map((id, index) => {
                        const school = schools.find(s => s.id === id);
                        if (!school) return null;

                        return (
                          <div
                            key={id}
                            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200"
                          >
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-200 text-xs font-bold dark:bg-blue-800">
                              {index + 1}
                            </span>

                            <span>{school.name}</span>

                            <button
                              type="button"
                              onClick={() => toggleSchool(id)}
                              className="rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800"
                              aria-label={`Remove ${school.name}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Available schools */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold">
                    All Schools
                  </h3>

                  <div className="flex max-h-60 flex-wrap gap-2 overflow-y-auto rounded-lg border border-border p-3">
                    {schools
                      .filter(school => !draftSchoolIds.includes(school.id))
                      .map(school => (
                        <button
                          key={school.id}
                          type="button"
                          onClick={() => toggleSchool(school.id)}
                          className="rounded-full border border-border bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-200"
                        >
                          + {school.name}
                        </button>
                      ))}

                    {schools.every(school => draftSchoolIds.includes(school.id)) && (
                      <p className="text-sm text-gray-500">
                        All schools have been selected.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            <p className="mt-3 text-xs text-gray-500">
              Participants from the first school will appear first, followed by the second, and so on. Other participants will remain below.
            </p>

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
              <Button
                variant="secondary"
                onClick={() => setDraftSchoolIds([])}
              >
                Clear Selection
              </Button>

              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowFilterModal(false)}
                >
                  Cancel
                </Button>

                <Button
                  onClick={applySchoolFilter}
                  disabled={loadingSchools}
                >
                  Apply Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="w-full overflow-x-auto rounded-lg">
        <Table headers={[t('common.profilePicture'), t('common.title'), t('common.author'), t('common.school'), t('common.document'), t('common.score')]} empty={!loading && items.length === 0}>
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
              <td className={cell}>{participant.school ?? '—'}</td>
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
      </div>
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
      <div className="w-full overflow-x-auto rounded-lg">
        <Table
          headers={[
            t('participants.col.rank'),
            t('common.title'),
            t('common.author'),
            t('common.school'),
            t('participants.col.average')
          ]}
          empty={results.length === 0}
        >
          {results.map((result, index) => (
            <tr key={`${result.title}-${index}`}>
              <td className={`${cell} font-bold`}>{index + 1}</td>
              <td className={cell}>{result.title}</td>
              <td className={cell}>{result.author}</td>
              <td className={cell}>{result.school ?? '—'}</td>
              <td className={`${cell} font-semibold`}>
                {result.averageScore.toFixed(2)}
              </td>
            </tr>
          ))}
        </Table>
      </div>
      <Pagination page={page} onChange={setPageNumber} />
      <div id="printable-table" className="hidden print:block">
        <h1 className="mb-4 text-xl font-bold">
          Participants
        </h1>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border p-2">#</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">school</th>
              <th className="border p-2">Title</th>
              <th className="border p-2">Author</th>
              <th className="border p-2">Score</th>
            </tr>
          </thead>

          <tbody>
            {results.map((result, index) => (
              <tr key={`${result.title}-${index}`}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">
                  {[result.userName, result.userLastName].filter(Boolean).join(' ')}
                </td>
                <td className="border p-2">{result.school ?? '—'}</td>
                <td className="border p-2">{result.title}</td>
                <td className="border p-2">{result.author}</td>
                <td className="border p-2">
                  {result.averageScore.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
