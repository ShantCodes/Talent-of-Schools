import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoaderCircle, UserPlus, X } from 'lucide-react';
import { rolesApi, schoolsApi, usersApi } from '../../../lib/endpoints';
import type { Role, School } from '../../../features/auth/types';
import { Roles } from '../../../context/AuthContext';
import { useI18n } from '../../../i18n/I18nContext';
import { Alert, Button, Field, FormCard, PasswordInput, errorText, selectClass } from '../../../components/ui';
import { normalizeIranMobile, phoneInputProps } from '../../../lib/phone';
import { RoleCheckboxes } from './RoleCheckboxes';

export function UserCreatePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [form, setForm] = useState({ name: '', lastName: '', email: '', phoneNumber: '', password: '' });
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [roleIds, setRoleIds] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm(f => ({ ...f, [key]: e.target.value }));

  useEffect(() => {
    rolesApi.list(1, 100)
      .then(result => { setRoles(result.items); setRoleIds(result.items.filter(r => r.name === Roles.Student).map(r => r.id)); })
      .catch(e => setError(errorText(e)));
    schoolsApi.list(1, 100).then(result => setSchools(result.items)).catch(() => {});
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const phoneNumber = normalizeIranMobile(form.phoneNumber);
    if (!phoneNumber) { setError(t('error.invalidPhone')); return; }
    if (form.password.length < 8) { setError(t('error.passwordLength')); return; }
    setBusy(true); setError('');
    try {
      const { user } = await usersApi.create({ ...form, phoneNumber, schoolId });
      await usersApi.approve(user.id, true);
      if (roleIds.length > 0) await usersApi.setRoles(user.id, roleIds);
      navigate('/admin/users', { state: { notice: t('users.createdNotice', { name: user.fullName }) } });
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  }

  return (
    <FormCard title={t('users.add')} subtitle={t('users.addSubtitle')} backTo="/admin/users" backLabel={t('users.back')}>
      <form onSubmit={submit} className="space-y-4">
        <Alert message={error} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t('common.firstName')}><input value={form.name} onChange={set('name')} required maxLength={100} /></Field>
          <Field label={t('common.lastName')}><input value={form.lastName} onChange={set('lastName')} required maxLength={100} /></Field>
          <Field label={t('common.email')}><input type="email" value={form.email} onChange={set('email')} required /></Field>
          <Field label={t('common.phone')}><input {...phoneInputProps} value={form.phoneNumber} onChange={set('phoneNumber')} required /></Field>
        </div>
        <Field label={t('common.password')}><PasswordInput value={form.password} onChange={set('password')} required minLength={8} maxLength={72} autoComplete="new-password" /></Field>
        <Field label={t('common.school')}>
          <select className={selectClass} value={schoolId ?? ''} onChange={e => setSchoolId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">{t('common.noSchool')}</option>
            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t('common.roles')}</p>
          <RoleCheckboxes roles={roles} selected={roleIds} onChange={setRoleIds} />
        </div>
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" icon={X} onClick={() => navigate('/admin/users')}>{t('common.cancel')}</Button>
          <Button disabled={busy} icon={busy ? LoaderCircle : UserPlus}>{busy ? t('users.creating') : t('users.create')}</Button>
        </div>
      </form>
    </FormCard>
  );
}
