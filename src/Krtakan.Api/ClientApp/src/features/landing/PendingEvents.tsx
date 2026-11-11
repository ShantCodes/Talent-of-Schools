import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { eventsApi } from '../../lib/endpoints';
import type { EventItem } from '../../lib/endpoints';
import { formatDate } from '../../components/ui';

export const PendingEvents: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [failed, setFailed] = useState(false);
  const [beforeLink, afterLink] = t('landing.signInPrompt').split('{link}');

  useEffect(() => {
    if (!isAuthenticated) return;
    eventsApi.list(1, 50)
      .then(result => setEvents(result.items.filter(e => new Date(e.endDate).getTime() >= Date.now()).slice(0, 5)))
      .catch(() => setFailed(true));
  }, [isAuthenticated]);

  return (
    <section className="h-full">
      <h2 className="mb-4 inline-flex items-center gap-2 text-2xl font-bold">
        <CalendarDays className="h-6 w-6 text-heritage-red" aria-hidden />
        {t('landing.pendingEvents')}
      </h2>
      <div className="space-y-3 rounded-2xl border border-line bg-surface p-5 shadow-sm">
        {!isAuthenticated && (
          <p>{beforeLink}<Link to="/login" className="text-primary hover:underline">{t('landing.signIn')}</Link>{afterLink}</p>
        )}
        {isAuthenticated && failed && <p className="text-danger">{t('landing.loadFailed')}</p>}
        {isAuthenticated && !failed && events.length === 0 && <p>{t('landing.noUpcoming')}</p>}
        {events.map(event => (
          <Link key={event.id} to="/events" className="block rounded-lg border border-line p-3 transition-colors hover:bg-surface-muted">
            <div className="font-semibold">{event.name}</div>
            <div className="text-xs text-fg-subtle">{formatDate(event.startDate)} – {formatDate(event.endDate)}</div>
          </Link>
        ))}
      </div>
    </section>
  );
};
