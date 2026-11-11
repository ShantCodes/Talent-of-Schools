import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { LoaderCircle, Lock, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import type { PagedResult } from '../../../features/auth/types';
import { findById } from '../../../lib/endpoints';
import { useI18n } from '../../../i18n/I18nContext';
import { Alert, Button, Field, FormCard, LinkButton, PageHeader, Pagination, Table, cell, errorText, useConfirm, useFlashNotice, useLoaded, usePaged } from '../../../components/ui';

export type NamedItem = { id: number; name: string };

export type NamedResource = {
  /** Translation key prefix; every `${prefix}.*` text used below must exist in the dictionaries. */
  prefix: 'roles' | 'schools';
  base: string;
  maxLength: number;
  isLocked?: (item: NamedItem) => boolean;
  /** How an item's name is displayed, e.g. translated built-in role names. */
  label?: (item: NamedItem) => string;
  api: {
    list: (pageNumber: number, pageSize?: number) => Promise<PagedResult<NamedItem>>;
    create: (name: string) => Promise<unknown>;
    update: (id: number, name: string) => Promise<unknown>;
    remove: (id: number) => Promise<unknown>;
  };
};

export function NamedListPage({ resource }: { resource: NamedResource }) {
  const { t } = useI18n();
  const { prefix, base, api } = resource;
  const label = resource.label ?? ((item: NamedItem) => item.name);
  const { items, page, loading, error, setError, reload, setPageNumber } = usePaged((pageNumber: number) => api.list(pageNumber), [api]);
  const [notice, setNotice] = useFlashNotice();
  const [confirmDialog, ask] = useConfirm();

  async function remove(item: NamedItem) {
    const ok = await ask({
      title: t(`${prefix}.deleteTitle`),
      message: t(`${prefix}.deleteMessage`, { name: item.name }),
      confirmLabel: t(`${prefix}.deleteConfirm`),
      variant: 'danger',
      icon: Trash2,
    });
    if (!ok) return;
    try {
      await api.remove(item.id);
      setNotice(t(`${prefix}.deleted`, { name: item.name }));
      await reload();
    } catch (e) {
      setError(`${errorText(e)} ${t(`${prefix}.deleteHint`)}`);
    }
  }

  return (
    <>
      <PageHeader title={t(`${prefix}.title`)} subtitle={t(`${prefix}.subtitle`)}
        action={<LinkButton to={`${base}/new`} variant="primary" icon={Plus}>{t(`${prefix}.add`)}</LinkButton>} />
      <Alert message={error} onClose={() => setError('')} />
      <Alert message={notice} kind="success" onClose={() => setNotice('')} />

      <Table headers={[t('common.id'), t('common.name'), '']} empty={!loading && items.length === 0}>
        {items.map(item => (
          <tr key={item.id}>
            <td className={`${cell} w-16 text-fg-subtle`}>{item.id}</td>
            <td className={`${cell} font-medium`}>{label(item)}</td>
            <td className={`${cell} text-end`}>
              {resource.isLocked?.(item)
                ? <span className="inline-flex items-center gap-1 text-xs text-fg-subtle"><Lock className="h-3.5 w-3.5" aria-hidden />{t('common.builtIn')}</span>
                : (
                  <div className="flex justify-end gap-2">
                    <LinkButton small icon={Pencil} to={`${base}/${item.id}/edit`} state={{ item }}>{t('common.edit')}</LinkButton>
                    <Button small variant="danger" icon={Trash2} onClick={() => remove(item)}>{t('common.delete')}</Button>
                  </div>
                )}
            </td>
          </tr>
        ))}
      </Table>
      <Pagination page={page} onChange={setPageNumber} />
      {confirmDialog}
    </>
  );
}

/** Create page at `${base}/new`, edit page at `${base}/:id/edit`. */
export function NamedFormPage({ resource }: { resource: NamedResource }) {
  const { t } = useI18n();
  const { prefix } = resource;
  const id = useParams().id;
  const passed = (useLocation().state as { item?: NamedItem } | null)?.item;
  const { data: item, loading, error } = useLoaded(
    async () => (id ? passed ?? await findById(resource.api.list, Number(id)) : null), [id]);

  const back = { backTo: resource.base, backLabel: t(`${prefix}.back`) };
  if (!id) {
    return <FormCard title={t(`${prefix}.addTitle`)} {...back}><NameForm resource={resource} item={null} /></FormCard>;
  }
  return (
    <FormCard title={t(`${prefix}.editTitle`)} {...back}>
      {loading && <p className="text-fg-subtle">{t('common.loading')}</p>}
      {!loading && !item && <Alert message={error} />}
      {item && (resource.isLocked?.(item)
        ? <Alert message={t(`${prefix}.locked`, { name: item.name })} />
        : <NameForm key={item.id} resource={resource} item={item} />)}
    </FormCard>
  );
}

function NameForm({ resource, item }: { resource: NamedResource; item: NamedItem | null }) {
  const { t } = useI18n();
  const { prefix } = resource;
  const navigate = useNavigate();
  const [name, setName] = useState(item?.name ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    setBusy(true); setError('');
    try {
      if (item) await resource.api.update(item.id, trimmed);
      else await resource.api.create(trimmed);
      navigate(resource.base, { state: { notice: t(item ? `${prefix}.saved` : `${prefix}.added`, { name: trimmed }) } });
    } catch (err) {
      setError(`${errorText(err)} ${t('common.nameTaken')}`);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Alert message={error} />
      <Field label={t('common.name')}><input value={name} onChange={e => setName(e.target.value)} required maxLength={resource.maxLength} autoFocus /></Field>
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="secondary" icon={X} onClick={() => navigate(resource.base)}>{t('common.cancel')}</Button>
        <Button disabled={busy} icon={busy ? LoaderCircle : item ? Save : Plus}>
          {busy ? t('common.saving') : item ? t('common.saveChanges') : t(`${prefix}.add`)}
        </Button>
      </div>
    </form>
  );
}
