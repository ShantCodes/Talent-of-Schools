import { useEffect, useState } from 'react';
import { KeyRound, LoaderCircle, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { authApi } from '../../features/auth/authApi';
import { apiUrl, buildHeaders } from '../../lib/api';
import { authStore } from '../../features/auth/authStore';
import { useAuth } from '../../context/AuthContext';
import { roleList, useI18n } from '../../i18n/I18nContext';
import { Alert, Button, Field, PageHeader, PasswordInput, errorText } from '../../components/ui';

export function AccountPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    if (user?.profilePictureMediaId) {
      let url: string | null = null;
      const fetchImage = async () => {
        try {
          const response = await fetch(apiUrl(`/api/media/download/${user.profilePictureMediaId}`), {
            headers: buildHeaders({}, authStore.getToken()),
          });
          if (response.ok) {
            const blob = await response.blob();
            url = URL.createObjectURL(blob);
            setProfilePic(url);
          }
        } catch (e) {
          console.error('Failed to fetch profile picture:', e);
        }
      };
      fetchImage();
    } else {
      setProfilePic(null);
    }
  }, [user?.profilePictureMediaId]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(''); setNotice('');
    if (password.length < 8) { setError(t('error.passwordLength')); return; }
    if (password !== confirmPassword) { setError(t('error.passwordMismatch')); return; }
    setBusy(true);
    try {
      await authApi.changePassword(password);
      setNotice(t('account.passwordChanged'));
      setPassword(''); setConfirmPassword('');
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  if (!user) return null;

  return (
    <main className="mx-auto max-w-xl p-4 sm:p-6">
      <PageHeader title={t('account.title')} />
      <div className="flex gap-6 mb-8 items-start">
        {(profilePic || user.profilePictureUrl) && (
          <img
            src={(profilePic || user.profilePictureUrl) || undefined}
            alt="Profile"
            className="h-24 w-24 rounded-full object-cover border border-line"
          />
        )}
        <dl className="flex-1 grid grid-cols-[auto_1fr] gap-y-2 rounded-2xl border border-line p-5 text-sm">
          <dt className="text-fg-subtle">{t('users.col.name')}</dt><dd>{user.fullName}</dd>
          <dt className="text-fg-subtle">{t('common.email')}</dt><dd className="break-all">{user.email}</dd>
          <dt className="text-fg-subtle">{t('common.school')}</dt><dd>{user.schoolName ?? '—'}</dd>
          <dt className="text-fg-subtle">{t('common.roles')}</dt><dd>{user.roles.length > 0 ? roleList(user.roles) : '—'}</dd>
        </dl>
      </div>

      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><KeyRound className="h-5 w-5" aria-hidden />{t('account.changePassword')}</h2>
      <form onSubmit={submit} className="space-y-4">
        <Alert message={error} />
        <Alert message={notice} kind="success" />
        <Field label={t('common.newPassword')}><PasswordInput value={password} onChange={e => setPassword(e.target.value)} required maxLength={72} autoComplete="new-password" /></Field>
        <Field label={t('common.confirmNewPassword')}><PasswordInput value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required maxLength={72} autoComplete="new-password" /></Field>
        <Button disabled={busy} icon={busy ? LoaderCircle : Save}>{busy ? t('common.saving') : t('account.changePassword')}</Button>
      </form>
    </main>
  );
}
