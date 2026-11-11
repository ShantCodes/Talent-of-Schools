import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Ban, Check, KeyRound, ShieldCheck, Trash2 } from 'lucide-react';
import { findById, rolesApi, usersApi } from '../../../lib/endpoints';
import type { Role, User } from '../../../features/auth/types';
import { useAuth } from '../../../context/AuthContext';
import { roleList, useI18n } from '../../../i18n/I18nContext';
import { Alert, Button, Field, FormCard, PasswordInput, errorText, formatDate, useConfirm, useLoaded } from '../../../components/ui';
import { RoleCheckboxes } from './RoleCheckboxes';

const sectionTitle = 'mb-3 text-base font-semibold text-gray-900 dark:text-white';

/** The API only allows changing a user's approval, roles and password, so those are what this page edits. */
export function UserEditPage() {
  const { t } = useI18n();
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const passed = (useLocation().state as { user?: User } | null)?.user;
  const { data: user, setData: setUser, loading, error: loadError } =
    useLoaded(async () => passed ?? await findById((p, s) => usersApi.list('all', p, s), id), [id]);

  const [roles, setRoles] = useState<Role[]>([]);
  const [roleIds, setRoleIds] = useState<number[]>([]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDialog, ask] = useConfirm();
  const isSelf = user?.id === currentUser?.id;

  useEffect(() => { rolesApi.list(1, 100).then(result => setRoles(result.items)).catch(e => setError(errorText(e))); }, []);
  useEffect(() => { if (user) setRoleIds(roles.filter(r => user.roles.includes(r.name)).map(r => r.id)); }, [user, roles]);

  async function run(action: () => Promise<User | void>, message: string) {
    setBusy(true); setError(''); setNotice('');
    try {
      const updated = await action();
      if (updated) setUser(updated);
      setNotice(message);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  function savePassword(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError(t('error.passwordLength')); return; }
    run(async () => { await usersApi.setPassword(user!.email, password); setPassword(''); }, t('users.passwordChanged'));
  }

  async function saveRoles() {
    const names = roles.filter(r => roleIds.includes(r.id)).map(r => r.name);
    const ok = await ask({
      title: t('users.changeRolesTitle'),
      confirmLabel: t('users.changeRolesConfirm'),
      icon: ShieldCheck,
      message: (
        <div className="space-y-2">
          <p>{t('users.changeRolesIntro', { name: user!.fullName, email: user!.email })}</p>
          <p><span className="text-gray-500">{t('users.from')}</span> {roleList(user!.roles)}</p>
          <p><span className="text-gray-500">{t('users.to')}</span> <strong>{roleList(names)}</strong></p>
        </div>
      ),
    });
    if (ok) run(() => usersApi.setRoles(user!.id, roleIds), t('users.rolesSaved'));
  }

  async function revoke() {
    const ok = await ask({
      title: t('users.revokeTitle'),
      message: t('users.revokeMessage', { name: user!.fullName }),
      confirmLabel: t('users.revoke'),
      variant: 'danger',
      icon: Ban,
    });
    if (ok) run(() => usersApi.approve(user!.id, false), t('users.approvalRevoked'));
  }

  async function remove() {
    if (!user) return;
    const ok = await ask({
      title: t('users.deleteTitle'),
      message: t('users.deleteMessage', { name: user.fullName, email: user.email }),
      confirmLabel: t('users.deleteConfirm'),
      variant: 'danger',
      icon: Trash2,
    });
    if (!ok) return;
    try {
      await usersApi.remove(user.id);
      navigate('/admin/users', { state: { notice: t('users.deletedNotice', { name: user.fullName }) } });
    } catch (e) {
      setError(errorText(e));
    }
  }

  return (
    <FormCard title={user ? t('users.editTitle', { name: user.fullName }) : t('users.editFallbackTitle')} backTo="/admin/users" backLabel={t('users.back')}>
      {loading && <p className="text-gray-500">{t('common.loading')}</p>}
      {!loading && !user && <Alert message={loadError} />}
      {user && (
        <div className="space-y-8">
          <Alert message={error} onClose={() => setError('')} />
          <Alert message={notice} kind="success" onClose={() => setNotice('')} />

          <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
            <dt className="text-gray-500">{t('common.email')}</dt><dd className="break-all">{user.email}</dd>
            <dt className="text-gray-500">{t('common.school')}</dt><dd>{user.schoolName ?? '—'}</dd>
            <dt className="text-gray-500">{t('common.registered')}</dt><dd>{formatDate(user.registerDate)}</dd>
          </dl>

          <section>
            <h2 className={sectionTitle}>{t('users.section.approval')}</h2>
            <div className="flex flex-wrap items-center gap-4">
              <span className={user.isApproved ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}>
                {user.isApproved ? t('users.approvedText') : t('users.pendingText')}
              </span>
              {user.isApproved
                ? <Button small variant="secondary" icon={Ban} disabled={busy || isSelf} onClick={revoke}>{t('users.revoke')}</Button>
                : <Button small variant="success" icon={Check} disabled={busy} onClick={() => run(() => usersApi.approve(user.id, true), t('users.userApproved'))}>{t('users.approve')}</Button>}
            </div>
          </section>

          <section>
            <h2 className={sectionTitle}>{t('common.roles')}</h2>
            <RoleCheckboxes roles={roles} selected={roleIds} onChange={setRoleIds} />
            <p className="mt-2 text-xs text-gray-500">{t('users.firstRoleHint')}</p>
            <Button className="mt-3" small icon={ShieldCheck} disabled={busy || roles.length === 0} onClick={saveRoles}>{t('users.saveRoles')}</Button>
          </section>

          <section>
            <h2 className={sectionTitle}>{t('users.section.password')}</h2>
            <form onSubmit={savePassword} className="flex flex-wrap items-end gap-3">
              <div className="min-w-[14rem] flex-1">
                <Field label={t('common.newPassword')}><PasswordInput value={password} onChange={e => setPassword(e.target.value)} required minLength={8} maxLength={72} autoComplete="new-password" /></Field>
              </div>
              <Button small icon={KeyRound} disabled={busy}>{t('users.setPassword')}</Button>
            </form>
          </section>

          <section className="border-t border-gray-200 pt-6 dark:border-gray-800">
            <h2 className={sectionTitle}>{t('users.section.delete')}</h2>
            <Button small variant="danger" icon={Trash2} disabled={isSelf} onClick={remove}>{t('users.deleteConfirm')}</Button>
            {isSelf && <p className="mt-2 text-xs text-gray-500">{t('users.cannotDeleteSelf')}</p>}
          </section>
        </div>
      )}
      {confirmDialog}
    </FormCard>
  );
}
