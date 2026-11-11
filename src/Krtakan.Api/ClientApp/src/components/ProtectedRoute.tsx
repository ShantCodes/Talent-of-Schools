import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roleLabel, useI18n } from '../i18n/I18nContext';
import { PageTitle } from './PageTitle';

export const ProtectedRoute = ({ roles }: { roles?: string[] }) => {
  const { isAuthenticated, hasRole } = useAuth();
  const { t } = useI18n();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasRole(...roles)) {
    return (
      <main className="mx-auto max-w-xl p-10 text-center">
        <PageTitle title={t('access.deniedTitle')} />
        <h1 className="text-2xl font-bold">{t('access.deniedTitle')}</h1>
        <p className="mt-2 text-fg-muted">{t('access.deniedText', { roles: roles.map(roleLabel).join(', ') })}</p>
      </main>
    );
  }

  return <Outlet />;
};
