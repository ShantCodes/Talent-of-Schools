import { Pencil, Plus, Trash2, UsersRound } from 'lucide-react';
import { eventsApi } from '../../../lib/endpoints';
import type { EventItem } from '../../../lib/endpoints';
import { useI18n } from '../../../i18n/I18nContext';
import { Alert, Button, LinkButton, PageHeader, Pagination, Table, cell, errorText, formatDate, useConfirm, useFlashNotice, usePaged } from '../../../components/ui';
import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { AddEventParticipantModal } from '../../../components/EventParticipantModal';


export function EventListPage() {
  const { t } = useI18n();
  const { items, page, loading, error, setError, reload, setPageNumber } = usePaged(eventsApi.list);
  const [notice, setNotice] = useFlashNotice();
  const [confirmDialog, ask] = useConfirm();
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  async function remove(event: EventItem) {
    const ok = await ask({
      title: t('events.deleteTitle'),
      message: t('events.deleteMessage', { name: event.name }),
      confirmLabel: t('events.deleteConfirm'),
      variant: 'danger',
      icon: Trash2,
    });
    if (!ok) return;
    try {
      await eventsApi.remove(event.id);
      setNotice(t('events.deleted'));
      await reload();
    } catch (e) {
      setError(`${errorText(e)} ${t('events.deleteHint')}`);
    }
  }

  return (
    <>
      <PageHeader
        title={t('events.title')}
        subtitle={t('events.subtitle')}
        action={<LinkButton to="/admin/events/new" variant="primary" icon={Plus}>{t('events.add')}</LinkButton>}
      />
      <Alert message={error} onClose={() => setError('')} />
      <Alert message={notice} kind="success" onClose={() => setNotice('')} />
      <div className="w-full overflow-x-auto rounded-lg">
        <Table headers={[t('common.name'), t('events.col.starts'), t('events.col.ends'), t('events.col.birthRange'), '']} empty={!loading && items.length === 0}>
          {items.map(event => (
            <tr key={event.id}>
              <td className={`${cell} whitespace-nowrap`}>
                <div className="min-w-[140px] font-medium">{event.name}</div>
                <div className="line-clamp-1 max-w-[220px] text-xs text-fg-subtle">
                  {event.description}
                </div>
              </td>
              <td className={`${cell} whitespace-nowrap`}>{formatDate(event.startDate)}</td>
              <td className={`${cell} whitespace-nowrap`}>{formatDate(event.endDate)}</td>
              <td className={`${cell} whitespace-nowrap`}>{event.minBirthDate || event.maxBirthDate ? `${event.minBirthDate ?? '…'} – ${event.maxBirthDate ?? '…'}` : t('common.any')}</td>
              <td className={`${cell} whitespace-nowrap text-end`}>
                <div className="flex min-w-[320px] flex-wrap justify-start gap-2 sm:min-w-0 sm:justify-end">
                  <Button
                    small
                    variant="secondary"
                    icon={UserPlus}
                    onClick={() => setSelectedEvent(event)}
                  >
                  </Button>
                  <LinkButton small icon={UsersRound} to={`/admin/events/${event.id}`} state={{ event }}>{t('events.participants')}</LinkButton>
                  <LinkButton small icon={Pencil} to={`/admin/events/${event.id}/edit`} state={{ event }}>{t('common.edit')}</LinkButton>
                  <Button small variant="danger" icon={Trash2} onClick={() => remove(event)}>{t('common.delete')}</Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </div>
      <Pagination page={page} onChange={setPageNumber} />
      {selectedEvent && (
        <AddEventParticipantModal
          eventId={selectedEvent.id}
          onClose={() => setSelectedEvent(null)}
          onSaved={() => {
            setSelectedEvent(null);
            setNotice('Participant added successfully.');
          }}
        />
      )}
      {confirmDialog}
    </>
  );
}
