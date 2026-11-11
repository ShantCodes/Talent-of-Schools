import { useState } from 'react';
import { LoaderCircle, Save, ShieldCheck, X } from 'lucide-react';
import { usersApi } from '../../../lib/endpoints';
import type { Role, User } from '../../../features/auth/types';
import { roleList, useI18n } from '../../../i18n/I18nContext';
import { Alert, Button, Modal, errorText, useConfirm } from '../../../components/ui';
import { RoleCheckboxes } from './RoleCheckboxes';

export function ChangeRoleModal({ user, roles, onClose, onSaved }:
  { user: User; roles: Role[]; onClose: () => void; onSaved: (updated: User) => void }) {
  const { t } = useI18n();
  const [selected, setSelected] = useState(() => roles.filter(r => user.roles.includes(r.name)).map(r => r.id));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDialog, ask] = useConfirm();

  const newNames = roles.filter(r => selected.includes(r.id)).map(r => r.name);
  const unchanged = [...newNames].sort().join() === [...user.roles].sort().join();

  async function save() {
    const ok = await ask({
      title: t('users.changeRolesTitle'),
      confirmLabel: t('users.changeRolesConfirm'),
      icon: ShieldCheck,
      message: (
        <div className="space-y-2">
          <p>{t('users.changeRolesIntro', { name: user.fullName, email: user.email })}</p>
          <p><span className="text-fg-subtle">{t('users.from')}</span> {roleList(user.roles)}</p>
          <p><span className="text-fg-subtle">{t('users.to')}</span> <strong>{roleList(newNames)}</strong></p>
          <p className="text-xs text-fg-subtle">{t('users.nextSignIn')}</p>
        </div>
      ),
    });
    if (!ok) return;

    setBusy(true); setError('');
    try {
      onSaved(await usersApi.setRoles(user.id, selected));
    } catch (e) {
      setError(errorText(e));
      setBusy(false);
    }
  }

  return (
    <Modal title={t('users.roleModalTitle', { name: user.fullName })} onClose={onClose}>
      <Alert message={error} />
      <p className="mb-3 text-sm text-fg-muted">{t('users.currentRoles', { roles: roleList(user.roles) })}</p>
      <RoleCheckboxes roles={roles} selected={selected} onChange={setSelected} />
      <p className="mt-4 text-xs text-fg-subtle">{t('users.firstRoleHint')}</p>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Button variant="secondary" icon={X} onClick={onClose}>{t('common.cancel')}</Button>
        <Button disabled={busy || unchanged} icon={busy ? LoaderCircle : Save} onClick={save}>{busy ? t('common.saving') : t('users.saveRoles')}</Button>
      </div>
      {confirmDialog}
    </Modal>
  );
}
