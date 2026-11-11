import React from 'react';
import { useI18n } from '../../i18n/I18nContext';

export const TopPerformances: React.FC = () => {
  const { t } = useI18n();
  return (
    <section className="py-10">
      <h2 className="text-2xl font-bold mb-4">{t('landing.topPerformances')}</h2>
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        {t('landing.topComingSoon')}
      </div>
    </section>
  );
};
