import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Ban, Check, Pencil, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { rolesApi, usersApi } from '../../../lib/endpoints';
import type { UserFilter } from '../../../lib/endpoints';
import type { Role, User } from '../../../features/auth/types';
import { useAuth } from '../../../context/AuthContext';
import { roleLabel, roleList, useI18n } from '../../../i18n/I18nContext';
import type { MessageKey } from '../../../i18n/I18nContext';
import { Alert, Button, LinkButton, PageHeader, Pagination, Table, cell, errorText, formatDate, useConfirm, useFlashNotice, usePaged } from '../../../components/ui';
import { ChangeRoleModal } from './ChangeRoleModal';

const filters: { value: UserFilter; label: MessageKey }[] = [
  { value: 'all', label: 'users.filter.all' },
  { value: 'pending', label: 'users.filter.pending' },
  { value: 'approved', label: 'users.filter.approved' },
];

export function UserListPage() {
  const { t } = useI18n();
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = (filters.find(f => f.value === searchParams.get('filter'))?.value ?? 'all') as UserFilter;
  const { items, page, loading, error, setError, reload, setPageNumber } =
    usePaged((pageNumber: number) => usersApi.list(filter, pageNumber), [filter]);
  const [notice, setNotice] = useFlashNotice();
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleUser, setRoleUser] = useState<User | null>(null);
  const [confirmDialog, ask] = useConfirm();

  useEffect(() => { rolesApi.list(1, 100).then(result => setRoles(result.items)).catch(e => setError(errorText(e))); }, [setError]);

  async function run(action: () => Promise<unknown>, message: string) {
    try { await action(); setNotice(message); await reload(); }
    catch (e) { setError(errorText(e)); }
  }

  async function remove(user: User) {
    const ok = await ask({
      title: t('users.deleteTitle'),
      message: t('users.deleteMessage', { name: user.fullName, email: user.email }),
      confirmLabel: t('users.deleteConfirm'),
      variant: 'danger',
      icon: Trash2,
    });
    if (ok) run(() => usersApi.remove(user.id), t('users.deletedNotice', { name: user.fullName }));
  }

  async function revoke(user: User) {
    const ok = await ask({
      title: t('users.revokeTitle'),
      message: t('users.revokeMessage', { name: user.fullName }),
      confirmLabel: t('users.revoke'),
      variant: 'danger',
      icon: Ban,
    });
    if (ok) run(() => usersApi.approve(user.id, false), t('users.revokedNotice', { name: user.fullName }));
  }

  return (
    <>
      <PageHeader
        title={t('users.title')}
        subtitle={t('users.subtitle')}
        action={<LinkButton to="/admin/users/new" variant="primary" icon={UserPlus}>{t('users.add')}</LinkButton>}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map(f => (
          <Button key={f.value} small variant={filter === f.value ? 'primary' : 'secondary'}
            onClick={() => { setSearchParams(f.value === 'all' ? {} : { filter: f.value }); setPageNumber(1); }}>
            {t(f.label)}
          </Button>
        ))}
      </div>
      <Alert message={error} onClose={() => setError('')} />
      <Alert message={notice} kind="success" onClose={() => setNotice('')} />

      <Table headers={[t('users.col.name'), t('common.school'), t('common.roles'), t('common.status'), t('common.registered'), '']} empty={!loading && items.length === 0}>
        {items.map(user => (
          <tr key={user.id}>
            <td className={cell}>
              <div className="font-medium">{user.fullName}</div>
              <div className="text-xs text-fg-subtle">{user.email}</div>
            </td>
            <td className={cell}>{user.schoolName ?? '—'}</td>
            <td className={cell}>
              <div className="flex flex-wrap gap-1">
                {user.roles.length === 0 && <span className="text-xs text-fg-subtle">{t('common.none')}</span>}
                {user.roles.map(role => (
                  <span key={role} className="rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary">{roleLabel(role)}</span>
                ))}
              </div>
            </td>
            <td className={cell}>
              {user.isApproved
                ? <span className="text-success">{t('common.approved')}</span>
                : <span className="text-warning">{t('common.pending')}</span>}
            </td>
            <td className={`${cell} whitespace-nowrap`}>{formatDate(user.registerDate)}</td>
            <td className={`${cell} text-end`}>
              <div className="flex flex-wrap justify-end gap-2">
                {user.isApproved
                  ? <Button small variant="secondary" icon={Ban} disabled={user.id === currentUser?.id} onClick={() => revoke(user)}>{t('users.revoke')}</Button>
                  : <Button small variant="success" icon={Check} onClick={() => run(() => usersApi.approve(user.id, true), t('users.approvedNotice', { name: user.fullName }))}>{t('users.approve')}</Button>}
                <Button small variant="secondary" icon={ShieldCheck} disabled={roles.length === 0} onClick={() => setRoleUser(user)}>{t('users.changeRole')}</Button>
                <LinkButton small icon={Pencil} to={`/admin/users/${user.id}/edit`} state={{ user }}>{t('common.edit')}</LinkButton>
                <Button small variant="danger" icon={Trash2} disabled={user.id === currentUser?.id} onClick={() => remove(user)}>{t('common.delete')}</Button>
              </div>
            </td>
          </tr>
        ))}
      </Table>
      <Pagination page={page} onChange={setPageNumber} />

      {roleUser && (
        <ChangeRoleModal user={roleUser} roles={roles} onClose={() => setRoleUser(null)}
          onSaved={async updated => {
            setRoleUser(null);
            setNotice(t('users.rolesNow', { name: updated.fullName, roles: roleList(updated.roles) }));
            await reload();
          }} />
      )}
      {confirmDialog}
    </>
  );
}
