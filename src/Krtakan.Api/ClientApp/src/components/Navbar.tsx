
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  CalendarDays, Gavel, LogIn, LogOut, Moon, Shield,
  Sun, UserRound, Menu, X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Roles, useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { LanguageMenu } from './LanguageMenu';
import { Logo } from './Logo';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-1.5 text-sm ${isActive
    ? 'font-semibold text-primary'
    : 'text-fg-muted hover:text-fg'
  }`;

const icon = 'h-4 w-4';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/login');
  };

  return (
    <nav className="bg-surface border-b border-line px-4 py-2 sticky top-0 z-40 transition-colors duration-300">
      <div className="flex justify-between items-center gap-3">
        {/* Logo and desktop navigation */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            onClick={closeMenu}
            className="inline-flex items-center gap-2 text-xl font-bold text-primary"
          >
            <Logo className="h-8 w-8" />
            {t('brand')}
          </Link>

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-4">
              {hasRole(Roles.Student, Roles.Admin, Roles.Juror) && (
                <NavLink to="/events" className={linkClass}>
                  <CalendarDays className={icon} />
                  {t('nav.events')}
                </NavLink>
              )}

              {hasRole(Roles.Juror, Roles.Admin) && (
                <NavLink to="/jury" className={linkClass}>
                  <Gavel className={icon} />
                  {t('nav.jury')}
                </NavLink>
              )}

              {hasRole(Roles.Admin) && (
                <NavLink to="/admin" className={linkClass}>
                  <Shield className={icon} />
                  {t('nav.admin')}
                </NavLink>
              )}
            </div>
          )}
        </div>

        {/* Desktop actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden md:block">
            <LanguageMenu />
          </div>

          <div className="hidden md:flex items-center gap-3 sm:gap-4">
            {isAuthenticated ? (
              <>
                <NavLink to="/account" className={linkClass}>
                  <UserRound className={icon} />
                  <span className="whitespace-nowrap">
                    {user?.fullName}
                  </span>
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 text-fg-muted px-3 py-2 rounded-md hover:bg-danger-soft hover:text-danger transition-colors"
                  title={t('nav.logout')}
                >
                  <LogOut className={icon} />
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 bg-primary text-primary-fg px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                <LogIn className={icon} />
                {t('nav.login')}
              </Link>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-surface-muted text-fg-muted transition-colors"
            aria-label={t('nav.toggleTheme')}
            title={t('nav.toggleTheme')}
          >
            {theme === 'light'
              ? <Moon className="h-5 w-5" />
              : <Sun className="h-5 w-5" />}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-surface-muted text-fg-muted"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen
              ? <X className="h-5 w-5" />
              : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}

      {/* Mobile dropdown menu */}
      <div
        className={`md:hidden grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${menuOpen
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0'
          }`}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className="overflow-hidden">
          <div
            className={`border-t border-line mt-2 pt-3 pb-2 flex flex-col gap-3 transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-y-0' : '-translate-y-3'
              }`}
          >
            <div className="px-2 pb-2">
              <LanguageMenu />
            </div>

            {isAuthenticated && (
              <>
                {hasRole(Roles.Student, Roles.Admin, Roles.Juror) && (
                  <NavLink to="/events" onClick={closeMenu} className={({ isActive }) =>
                    `${linkClass({ isActive })} px-3 py-2 rounded-md hover:bg-surface-muted`
                  }>
                    <CalendarDays className={icon} />
                    {t('nav.events')}
                  </NavLink>
                )}

                {hasRole(Roles.Juror, Roles.Admin) && (
                  <NavLink to="/jury" onClick={closeMenu} className={({ isActive }) =>
                    `${linkClass({ isActive })} px-3 py-2 rounded-md hover:bg-surface-muted`
                  }>
                    <Gavel className={icon} />
                    {t('nav.jury')}
                  </NavLink>
                )}

                {hasRole(Roles.Admin) && (
                  <NavLink to="/admin" onClick={closeMenu} className={({ isActive }) =>
                    `${linkClass({ isActive })} px-3 py-2 rounded-md hover:bg-surface-muted`
                  }>
                    <Shield className={icon} />
                    {t('nav.admin')}
                  </NavLink>
                )}

                <NavLink to="/account" onClick={closeMenu} className={({ isActive }) =>
                  `${linkClass({ isActive })} px-3 py-2 rounded-md hover:bg-surface-muted`
                }>
                  <UserRound className={icon} />
                  {user?.fullName}
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 text-danger px-3 py-2 rounded-md hover:bg-danger-soft text-sm"
                >
                  <LogOut className={icon} />
                  {t('nav.logout')}
                </button>
              </>
            )}

            {!isAuthenticated && (
              <Link
                to="/login"
                onClick={closeMenu}
                className="inline-flex items-center gap-2 bg-primary text-primary-fg px-3 py-2 rounded-md"
              >
                <LogIn className={icon} />
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      </div>

    </nav>
  );
};
