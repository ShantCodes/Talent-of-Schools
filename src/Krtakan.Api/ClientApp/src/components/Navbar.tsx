import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { CalendarDays, Gavel, LogIn, LogOut, Moon, Shield, Sun, UserRound } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Roles, useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { LanguageMenu } from './LanguageMenu';
import { Logo } from './Logo';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-1.5 text-sm ${isActive ? 'font-semibold text-primary' : 'text-fg-muted hover:text-fg'}`;

const icon = 'h-4 w-4';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <nav className="bg-surface border-b border-line px-4 py-2 flex justify-between items-center gap-3 sticky top-0 z-40 transition-colors duration-300">
      <div className="flex items-center gap-6">
        <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-primary">
          <Logo className="h-8 w-8" />
          {t('brand')}
        </Link>
        {isAuthenticated && (
          <div className="flex items-center gap-4">
            {hasRole(Roles.Student, Roles.Admin, Roles.Juror) && (
              <NavLink to="/events" className={linkClass} title={t('nav.events')}><CalendarDays className={icon} /><span className="hidden sm:inline">{t('nav.events')}</span></NavLink>
            )}
            {hasRole(Roles.Juror, Roles.Admin) && (
              <NavLink to="/jury" className={linkClass} title={t('nav.jury')}><Gavel className={icon} /><span className="hidden sm:inline">{t('nav.jury')}</span></NavLink>
            )}
            {hasRole(Roles.Admin) && (
              <NavLink to="/admin" className={linkClass} title={t('nav.admin')}><Shield className={icon} /><span className="hidden sm:inline">{t('nav.admin')}</span></NavLink>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <LanguageMenu />
        {isAuthenticated ? (
          <div className="flex items-center gap-3 sm:gap-4">
            <NavLink to="/account" className={linkClass}>
              <UserRound className={icon} /><span className="hidden whitespace-nowrap lg:inline">{user?.fullName}</span>
            </NavLink>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="inline-flex items-center gap-1.5 text-fg-muted px-3 py-2 rounded-md hover:bg-danger-soft hover:text-danger transition-colors"
              title={t('nav.logout')}
            >
              <LogOut className={icon} /><span className="hidden sm:inline">{t('nav.logout')}</span>
            </button>
          </div>
        ) : (
          <Link to="/login" className="inline-flex items-center gap-1.5 bg-primary text-primary-fg px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
            <LogIn className={icon} />{t('nav.login')}
          </Link>
        )}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-surface-muted text-fg-muted transition-colors"
          aria-label={t('nav.toggleTheme')}
          title={t('nav.toggleTheme')}
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
      </div>
    </nav>
  );
};
