import type { Role } from '../../../features/auth/types';
import { roleLabel, useI18n } from '../../../i18n/I18nContext';

export function RoleCheckboxes({ roles, selected, onChange }: { roles: Role[]; selected: number[]; onChange: (ids: number[]) => void }) {
  const { t } = useI18n();
  if (roles.length === 0) {
    return <p className="text-sm text-amber-600 dark:text-amber-400">{t('users.rolesLoadFailed')}</p>;
  }
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2">
      {roles.map(role => (
        <label key={role.id} className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="!w-auto"
            checked={selected.includes(role.id)}
            onChange={e => onChange(e.target.checked ? [...selected, role.id] : selected.filter(id => id !== role.id))} />
          {roleLabel(role.name)}
        </label>
      ))}
    </div>
  );
}
