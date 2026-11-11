import React from 'react';
import { PendingEvents } from './PendingEvents';
import { TopPerformances } from './TopPerformances';
import { useI18n } from '../../i18n/I18nContext';
import { PageTitle } from '../../components/PageTitle';

export const LandingPage: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="min-h-screen">
      <PageTitle />
      <main className="max-w-4xl mx-auto p-8">
        <header className="py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-fg mb-4">{t('landing.title')}</h1>
          <p className="text-xl text-fg-muted">{t('landing.subtitle')}</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PendingEvents />
          <TopPerformances />
        </div>
      </main>
    </div>
  );
};
