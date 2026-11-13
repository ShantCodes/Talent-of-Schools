import { useEffect, useState, useRef } from 'react';
import { KeyRound, LoaderCircle, Save, PenLine, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { authApi } from '../../features/auth/authApi';
import { schoolsApi } from '../../lib/endpoints';
import { usersApi } from '../../lib/endpoints';
import { useAuth } from '../../context/AuthContext';
import { roleList, useI18n } from '../../i18n/I18nContext';
import { Alert, Button, Field, PageHeader, PasswordInput, errorText, Modal } from '../../components/ui';

export function AccountPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [schools, setSchools] = useState<{ id: number; name: string }[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    birthDate: '',
    schoolId: '',
    grade: '',
    email: '',
    phoneNumber: '',
  });

  useEffect(() => {
    return () => {
      if (picturePreview) {
        URL.revokeObjectURL(picturePreview);
      }
    };
  }, [picturePreview]);

  useEffect(() => {
    let objectUrl: string | null = null;

    const fetchImage = async () => {
      if (!user?.profilePictureMediaId) {
        setProfilePic(null);
        return;
      }

      try {
        const blob = await usersApi.getProfilePicture(user.profilePictureMediaId);

        objectUrl = URL.createObjectURL(blob);
        setProfilePic(objectUrl);
      } catch (e) {
        console.error('Failed to fetch profile picture:', e);
        setProfilePic(null);
      }
    };

    fetchImage();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [user?.profilePictureMediaId]);

  useEffect(() => {
    if (showEditForm && user) {
      setFormData({
        name: user.name ?? '',
        lastName: user.lastName ?? '',
        birthDate: user.birthDate
          ? user.birthDate.split('T')[0]
          : '',
        schoolId: user.schoolId?.toString() ?? '',
        grade: user.grade?.toString() ?? '',
        email: user.email ?? '',
        phoneNumber: user.phoneNumber ?? '',
      });
    }
  }, [showEditForm, user]);

  useEffect(() => {
    const fetchSchools = async () => {
      const response = await schoolsApi.list();
      setSchools(response.items);
    };
    fetchSchools();
  }, []);

  useEffect(() => {
    if (user) {
      const isNameEmpty = !user.name || user.name.trim() === '';
      const isLastNameEmpty = !user.lastName || user.lastName.trim() === '';
      const isEmailEmpty = !user.email || user.email.trim() === '';
      const isPhoneEmpty = !user.phoneNumber || user.phoneNumber.trim() === '';
      const isBirthDateEmpty = !user.birthDate || user.birthDate.trim() === '';
      const isSchoolEmpty = user.schoolId === null || user.schoolId === undefined;
      const isGradeEmpty = user.grade === null || user.grade === undefined;

      if (isNameEmpty || isLastNameEmpty || isEmailEmpty || isPhoneEmpty || isBirthDateEmpty || isSchoolEmpty || isGradeEmpty) {
        setShowEditForm(true);
      }
    }
  }, [user]);


  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(''); setNotice('');
    if (password.length < 8) { setError(t('error.passwordLength')); return; }
    if (password !== confirmPassword) { setError(t('error.passwordMismatch')); return; }
    setBusy(true);
    try {
      await authApi.changePassword(password);
      setNotice(t('users.passwordChanged'));
      setPassword(''); setConfirmPassword('');
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  async function updateProfile(e: FormEvent) {
    e.preventDefault();
    setError(''); setNotice('');
    setBusy(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('Name', formData.name);
      formDataObj.append('LastName', formData.lastName);
      formDataObj.append('Email', formData.email);
      formDataObj.append('PhoneNumber', formData.phoneNumber);

      if (formData.birthDate) {
        formDataObj.append('BirthDate', formData.birthDate);
      }
      if (formData.schoolId) {
        formDataObj.append('SchoolId', formData.schoolId);
      }
      if (formData.grade) {
        formDataObj.append('Grade', formData.grade);
      }

      await usersApi.updateProfile(formDataObj);

      setNotice(t('account.profileUpdated'));
      setShowEditForm(false);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  async function uploadProfilePicture(file?: File) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image.');
      return;
    }

    setUploadingPicture(true);
    setError('');
    setNotice('');

    try {
      const data = new FormData();
      data.append('ProfilePicture', file);

      await usersApi.updateProfile(data);

      setPicturePreview(URL.createObjectURL(file));
      setNotice('Profile picture updated successfully.');
    } catch (err) {
      setError(errorText(err));
    } finally {
      setUploadingPicture(false);
    }
  }

  if (!user) return null;

  return (
    <main className="mx-auto max-w-xl p-4 sm:p-6">
      <PageHeader title={t('account.title')} />
      <div className="flex gap-6 mb-8 items-start">
        <div className="flex gap-6 mb-8 items-start">
          <div className="relative group shrink-0">
            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                uploadProfilePicture(e.target.files?.[0]);
                e.target.value = '';
              }}
            />

            <button
              type="button"
              onClick={() => profileInputRef.current?.click()}
              disabled={uploadingPicture}
              className="relative h-24 w-24 rounded-full overflow-hidden border border-line cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
              title="Change profile picture"
            >
              {picturePreview || profilePic || user.profilePictureUrl ? (
                <img
                  src={picturePreview || profilePic || user.profilePictureUrl!}
                  alt="Profile"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 h-full w-full rounded-full flex items-center justify-center bg-primary-soft text-primary text-2xl font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                  {user.lastName?.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {uploadingPicture ? (
                  <LoaderCircle className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <PenLine className="h-6 w-6 text-white" />
                )}
              </div>
            </button>
          </div>


        </div>
        <dl className="flex-1 grid grid-cols-[auto_1fr] gap-y-2 rounded-2xl border border-line p-5 text-sm">
          <dt className="text-fg-subtle">{t('users.col.name')}</dt><dd>{user.fullName}</dd>
          <dt className="text-fg-subtle">{t('common.email')}</dt><dd className="break-all">{user.email}</dd>
          <dt className="text-fg-subtle">{t('common.phone')}</dt><dd className="break-all">{user.phoneNumber}</dd>
          <dt className="text-fg-subtle">{t('common.birthDate')}</dt><dd className="break-all">{user.birthDate}</dd>
          <dt className="text-fg-subtle">{t('common.school')}</dt><dd className="break-all">{user.schoolName ?? '—'}</dd>
          <dt className="text-fg-subtle">{t('common.grade')}</dt><dd className="break-all">{user.grade ?? '—'}</dd>
          <dt className="text-fg-subtle">{t('common.roles')}</dt><dd className="break-all">{user.roles.length > 0 ? roleList(user.roles) : '—'}</dd>
        </dl>
        <Button
          variant="secondary"
          icon={showEditForm ? X : PenLine}
          onClick={() => setShowEditForm(!showEditForm)}
        >
          {showEditForm ? t('common.cancel') : t('common.edit')}
        </Button>
      </div>
      {showEditForm && (
        <Modal title={t('common.edit')} onClose={() => setShowEditForm(false)}>
          <form onSubmit={updateProfile} className="space-y-4">
            <Alert message={error} />
            <Alert message={notice} kind="success" />
            <Field label={t('common.name')}>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-fg"
                required
              />
            </Field>
            <Field label={t('common.lastName')}>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-fg"
                required
              />
            </Field>
            <Field label={t('common.email')}>
              <input
                type="text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-fg"
                required
              />
            </Field>
            <Field label={t('common.phone')}>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-fg"
                required
              />
            </Field>
            <Field label={t('common.birthDate')}>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-fg"
                required
              />
            </Field>
            <Field label={t('common.school')}>
              <select
                value={formData.schoolId}
                onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-fg"
                required
              >
                <option value="">{t('common.school')}</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('common.grade')}>
              <input
                type="number"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-fg"
                required
              />
            </Field>
            <Button disabled={busy} icon={busy ? LoaderCircle : Save}>
              {busy ? t('common.saving') : t('common.updateProfile')}
            </Button>
          </form>
        </Modal>
      )}

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
