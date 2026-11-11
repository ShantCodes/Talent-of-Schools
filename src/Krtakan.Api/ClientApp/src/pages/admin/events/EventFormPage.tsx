import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { LoaderCircle, Save, X } from 'lucide-react';
import { eventsApi, findById } from '../../../lib/endpoints';
import type { EventInput, EventItem } from '../../../lib/endpoints';
import { useI18n } from '../../../i18n/I18nContext';
import { Alert, Button, Field, FormCard, errorText, useLoaded } from '../../../components/ui';

const toLocalInput = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const emptyForm = { name: '', description: '', startDate: '', endDate: '', minBirthDate: '', maxBirthDate: '' };
type FormState = typeof emptyForm;

const toForm = (event: EventItem): FormState => ({
  name: event.name,
  description: event.description,
  startDate: toLocalInput(event.startDate),
  endDate: toLocalInput(event.endDate),
  minBirthDate: event.minBirthDate ?? '',
  maxBirthDate: event.maxBirthDate ?? '',
});

/** Create page at /admin/events/new, edit page at /admin/events/:id/edit. */
export function EventFormPage() {
  const { t } = useI18n();
  const id = useParams().id;
  const passed = (useLocation().state as { event?: EventItem } | null)?.event;
  const { data: event, loading, error } = useLoaded(
    async () => (id ? passed ?? await findById(eventsApi.list, Number(id)) : null), [id]);

  if (!id) return <EventForm event={null} />;
  return (
    <FormCard title={t('events.editTitle')} backTo="/admin/events" backLabel={t('events.back')}>
      {loading ? <p className="text-gray-500">{t('common.loading')}</p> : event ? <EventForm key={event.id} event={event} bare /> : <Alert message={error} />}
    </FormCard>
  );
}

function EventForm({ event, bare }: { event: EventItem | null; bare?: boolean }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(() => (event ? toForm(event) : emptyForm));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof FormState) => (e: { target: { value: string } }) => setForm(f => ({ ...f, [key]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (new Date(form.endDate) < new Date(form.startDate)) { setError(t('events.endBeforeStart')); return; }
    setBusy(true); setError('');
    const input: EventInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      minBirthDate: form.minBirthDate || null,
      maxBirthDate: form.maxBirthDate || null,
    };
    try {
      if (event) await eventsApi.update(event.id, input);
      else await eventsApi.create(input);
      navigate('/admin/events', { state: { notice: t(event ? 'events.updated' : 'events.created', { name: input.name }) } });
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  }

  const body = (
    <form onSubmit={submit} className="space-y-4">
      <Alert message={error} />
      <Field label={t('common.name')}><input value={form.name} onChange={set('name')} required maxLength={150} /></Field>
      <Field label={t('events.field.description')}>
        <textarea value={form.description} onChange={set('description')} required rows={4}
          className="w-full rounded-lg border border-slate-600 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t('events.field.start')}><input type="datetime-local" value={form.startDate} onChange={set('startDate')} required /></Field>
        <Field label={t('events.field.end')}><input type="datetime-local" value={form.endDate} onChange={set('endDate')} required /></Field>
        <Field label={t('events.field.minBirth')}><input type="date" value={form.minBirthDate} onChange={set('minBirthDate')} /></Field>
        <Field label={t('events.field.maxBirth')}><input type="date" value={form.maxBirthDate} onChange={set('maxBirthDate')} /></Field>
      </div>
      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" icon={X} onClick={() => navigate('/admin/events')}>{t('common.cancel')}</Button>
        <Button disabled={busy} icon={busy ? LoaderCircle : Save}>{busy ? t('common.saving') : event ? t('common.saveChanges') : t('events.create')}</Button>
      </div>
    </form>
  );

  if (bare) return body;
  return <FormCard title={t('events.addTitle')} subtitle={t('events.addSubtitle')} backTo="/admin/events" backLabel={t('events.back')}>{body}</FormCard>;
}
