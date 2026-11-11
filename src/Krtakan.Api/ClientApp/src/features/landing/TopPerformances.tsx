import React from 'react';
import { Trophy } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

export const TopPerformances: React.FC = () => {
  const { t } = useI18n();
  return (
    <section className="h-full">
      <h2 className="mb-4 inline-flex items-center gap-2 text-2xl font-bold">
        <Trophy className="h-6 w-6 text-heritage-apricot" aria-hidden />
        {t('landing.topPerformances')}
      </h2>
      <div className="rounded-2xl border border-line bg-surface p-5 text-fg-muted shadow-sm">
        {t('landing.topComingSoon')}
      </div>
    </section>
  );
};
