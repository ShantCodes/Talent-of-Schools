import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { disciplines } from '../features/landing/disciplines';
import { OrnamentBand } from './heritage/Ornaments';
import { Logo } from './Logo';

const linkClass = 'text-fg-muted transition-colors hover:text-primary';
const headingClass = 'text-sm font-semibold uppercase tracking-wide text-fg';
const year = new Date().getFullYear();

export function Footer() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();

  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <OrnamentBand />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-primary">
            <Logo className="h-8 w-8" />
            {t('brand')}
          </Link>
          <p className="mt-3 max-w-xs text-sm text-fg-muted">{t('footer.tagline')}</p>
        </div>

        <nav aria-label={t('footer.explore')}>
          <h2 className={headingClass}>{t('footer.explore')}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/" className={linkClass}>{t('footer.home')}</Link></li>
            {isAuthenticated ? (
              <li><Link to="/events" className={linkClass}>{t('nav.events')}</Link></li>
            ) : (
              <>
                <li><Link to="/login" className={linkClass}>{t('nav.login')}</Link></li>
                <li><Link to="/signup" className={linkClass}>{t('login.signUp')}</Link></li>
              </>
            )}
          </ul>
        </nav>

        <div>
          <h2 className={headingClass}>{t('footer.disciplines')}</h2>
          <ul className="mt-4 space-y-2 text-sm text-fg-muted">
            {disciplines.map(({ key, icon: Icon }) => (
              <li key={key} className="inline-flex w-full items-center gap-2">
                <Icon className="h-4 w-4 text-heritage-red" aria-hidden />
                {t(`discipline.${key}.name` as const)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-fg-subtle">
          <p>{t('footer.rights', { year, brand: t('brand') })}</p>
          <p>{t('footer.heritage')}</p>
        </div>
      </div>
    </footer>
  );
}
