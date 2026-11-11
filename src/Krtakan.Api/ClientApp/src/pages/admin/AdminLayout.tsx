import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { CalendarDays, Clock, List, Menu, Pencil, Plus, School, Shield, UserPlus, Users, UsersRound, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import type { MessageKey } from '../../i18n/I18nContext';

type SidebarLink = { to: string; label: MessageKey; icon: LucideIcon };
type Section = { title: MessageKey; base: string; icon: LucideIcon; links: SidebarLink[] };

const sections: Section[] = [
  {
    title: 'admin.section.events',
    base: '/admin/events',
    icon: CalendarDays,
    links: [
      { to: '/admin/events', label: 'admin.link.allEvents', icon: List },
      { to: '/admin/events/new', label: 'admin.link.addEvent', icon: Plus },
    ],
  },
  {
    title: 'admin.section.users',
    base: '/admin/users',
    icon: Users,
    links: [
      { to: '/admin/users', label: 'admin.link.allUsers', icon: List },
      { to: '/admin/users?filter=pending', label: 'admin.link.pending', icon: Clock },
      { to: '/admin/users/new', label: 'admin.link.addUser', icon: UserPlus },
    ],
  },
  {
    title: 'admin.section.roles',
    base: '/admin/roles',
    icon: Shield,
    links: [
      { to: '/admin/roles', label: 'admin.link.allRoles', icon: List },
      { to: '/admin/roles/new', label: 'admin.link.addRole', icon: Plus },
    ],
  },
  {
    title: 'admin.section.schools',
    base: '/admin/schools',
    icon: School,
    links: [
      { to: '/admin/schools', label: 'admin.link.allSchools', icon: List },
      { to: '/admin/schools/new', label: 'admin.link.addSchool', icon: Plus },
    ],
  },
];

const itemClass = (active: boolean) =>
  `flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${active
    ? 'bg-blue-600 font-medium text-white dark:bg-blue-500'
    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`;

function SidebarSection({ section }: { section: Section }) {
  const { t } = useI18n();
  const { pathname, search } = useLocation();
  const inSection = pathname === section.base || pathname.startsWith(`${section.base}/`);
  const exact = section.links.find(link => link.to === pathname + search);
  const isActive = (link: SidebarLink) => (exact ? link === exact : link.to === pathname);
  const onSubPage = inSection && !section.links.some(isActive);
  const isEdit = pathname.endsWith('/edit');
  const SubPageIcon = isEdit ? Pencil : UsersRound;
  const SectionIcon = section.icon;

  return (
    <div>
      <p className={`mb-1 flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wide ${inSection ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
        <SectionIcon className="h-4 w-4" aria-hidden />{t(section.title)}
      </p>
      <ul className="space-y-0.5">
        {section.links.map(link => (
          <li key={link.to}>
            <Link to={link.to} className={itemClass(isActive(link))}><link.icon className="h-4 w-4 shrink-0" aria-hidden />{t(link.label)}</Link>
          </li>
        ))}
        {onSubPage && (
          <li><span className={itemClass(true)}><SubPageIcon className="h-4 w-4 shrink-0" aria-hidden />{t(isEdit ? 'admin.link.edit' : 'admin.link.participants')}</span></li>
        )}
      </ul>
    </div>
  );
}

function SidebarNav() {
  const { t } = useI18n();
  return (
    <nav className="space-y-5" aria-label={t('admin.panel')}>
      {sections.map(section => <SidebarSection key={section.base} section={section} />)}
    </nav>
  );
}

function MobileMenu() {
  const { t } = useI18n();
  const { pathname, search } = useLocation();
  const [open, setOpen] = useState(false);
  const current = sections.find(section => pathname === section.base || pathname.startsWith(`${section.base}/`));
  const CurrentIcon = current?.icon ?? Menu;

  useEffect(() => { setOpen(false); }, [pathname, search]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="admin-drawer"
        className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-start dark:border-gray-800 dark:bg-gray-900"
      >
        <Menu className="h-5 w-5 shrink-0" aria-hidden />
        <span className="flex-1">
          <span className="block text-xs uppercase tracking-wide text-gray-500">{t('admin.menu')}</span>
          <span className="flex items-center gap-1.5 font-medium"><CurrentIcon className="h-4 w-4" aria-hidden />{current ? t(current.title) : t('nav.admin')}</span>
        </span>
      </button>

      <div className={`fixed inset-0 z-50 transition ${open ? 'visible' : 'invisible'}`} aria-hidden={!open}>
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setOpen(false)}
        />
        <aside
          id="admin-drawer"
          className={`absolute inset-y-0 start-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl transition-transform duration-200 dark:bg-gray-900 ${open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'}`}
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <span className="font-semibold">{t('admin.panel')}</span>
            <button onClick={() => setOpen(false)} className="!p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white" aria-label={t('admin.closeMenu')}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4"><SidebarNav /></div>
        </aside>
      </div>
    </div>
  );
}

export function AdminLayout() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6 md:flex-row">
      <MobileMenu />
      <aside className="hidden md:block md:w-56 md:shrink-0">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:sticky md:top-20">
          <SidebarNav />
        </div>
      </aside>
      <section className="min-w-0 flex-1">
        <Outlet />
      </section>
    </div>
  );
}
