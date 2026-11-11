import { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Download, Trash2, Trophy, UsersRound } from 'lucide-react';
import { downloadMedia } from '../../../lib/api';
import { eventsApi, findById, participantsApi } from '../../../lib/endpoints';
import type { EventItem, Participant, ParticipantResult } from '../../../lib/endpoints';
import { useI18n } from '../../../i18n/I18nContext';
import { Alert, BackLink, Button, PageHeader, Pagination, Table, cell, errorText, useConfirm, useLoaded, usePaged } from '../../../components/ui';

export function EventParticipantsPage() {
  const { t } = useI18n();
  const eventId = Number(useParams().id);
  const passed = (useLocation().state as { event?: EventItem } | null)?.event;
  const { data: event } = useLoaded(async () => passed ?? await findById(eventsApi.list, eventId), [eventId]);
  const [notice, setNotice] = useState('');
  const [confirmDialog, ask] = useConfirm();
  const { items, page, loading, error, setError, reload, setPageNumber } =
    usePaged((pageNumber: number) => participantsApi.byEvent(eventId, pageNumber), [eventId]);

  const [results, setResults] = useState<ParticipantResult[]>([]);
  const loadResults = useCallback(() => {
    participantsApi.results(eventId).then(setResults).catch(e => setError(errorText(e)));
  }, [eventId, setError]);
  useEffect(loadResults, [loadResults]);

  const studentName = (participant: Participant) => participant.fullName ?? t('participants.userFallback', { id: participant.userId });

  async function remove(participant: Participant) {
    const ok = await ask({
      title: t('participants.removeTitle'),
      message: t('participants.removeMessage', { title: participant.title, name: studentName(participant) }),
      confirmLabel: t('common.remove'),
      variant: 'danger',
      icon: Trash2,
    });
    if (!ok) return;
    try {
      await participantsApi.remove(participant.id);
      setNotice(t('participants.removed'));
      await reload();
      loadResults();
    } catch (e) {
      setError(`${errorText(e)} ${t('participants.removeHint')}`);
    }
  }

  async function download(participant: Participant) {
    try { await downloadMedia(participant.documentId!, `${participant.title || 'document'}`); }
    catch (e) { setError(errorText(e)); }
  }

  return (
    <>
      <BackLink to="/admin/events">{t('events.back')}</BackLink>
      <div className="mt-2">
        <PageHeader title={event?.name ?? t('participants.eventFallback', { id: eventId })} subtitle={t('participants.subtitle')} />
      </div>
      <Alert message={error} onClose={() => setError('')} />
      <Alert message={notice} kind="success" onClose={() => setNotice('')} />

      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><UsersRound className="h-5 w-5" aria-hidden />{t('participants.heading')}</h2>
      <Table headers={[t('common.title'), t('common.author'), t('common.student'), t('common.document'), '']} empty={!loading && items.length === 0}>
        {items.map(participant => (
          <tr key={participant.id}>
            <td className={`${cell} font-medium`}>{participant.title}</td>
            <td className={cell}>{participant.author}</td>
            <td className={cell}>
              <div>{studentName(participant)}</div>
              <div className="text-xs text-fg-subtle">{participant.email}</div>
            </td>
            <td className={cell}>
              {participant.documentId
                ? <Button small variant="secondary" icon={Download} onClick={() => download(participant)}>{t('common.download')}</Button>
                : <span className="text-fg-subtle">—</span>}
            </td>
            <td className={`${cell} text-end`}>
              <Button small variant="danger" icon={Trash2} onClick={() => remove(participant)}>{t('common.remove')}</Button>
            </td>
          </tr>
        ))}
      </Table>
      <Pagination page={page} onChange={setPageNumber} />

      <h2 className="mb-3 mt-10 flex items-center gap-2 text-lg font-semibold"><Trophy className="h-5 w-5" aria-hidden />{t('participants.results')}</h2>
      <Table headers={[t('participants.col.rank'), t('common.title'), t('common.author'), t('common.student'), t('participants.col.average')]} empty={results.length === 0}>
        {results.map((result, index) => (
          <tr key={`${result.title}-${index}`}>
            <td className={`${cell} font-bold`}>{index + 1}</td>
            <td className={cell}>{result.title}</td>
            <td className={cell}>{result.author}</td>
            <td className={cell}>{result.userName} {result.userLastName}</td>
            <td className={`${cell} font-semibold`}>{result.averageScore.toFixed(2)}</td>
          </tr>
        ))}
      </Table>
      {confirmDialog}
    </>
  );
}
