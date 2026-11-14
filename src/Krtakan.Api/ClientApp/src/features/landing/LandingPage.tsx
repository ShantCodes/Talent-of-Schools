import React from 'react';
import { PendingEvents } from './PendingEvents';
import { TopPerformances } from './TopPerformances';
import { DisciplinesIntro, HowItWorks } from './LandingSections';
import { useI18n } from '../../i18n/I18nContext';
import { PageTitle } from '../../components/PageTitle';
import { Reveal } from '../../components/Reveal';
import { OrnamentBand } from '../../components/heritage/Ornaments';

export const LandingPage: React.FC = () => {
  const { t } = useI18n();
  return (
    <div>
      <div
        className="relative bg-cover bg-center bg-no-repeat
    before:absolute before:inset-0 before:bg-white/50
    before:content-['']"
        style={{ backgroundImage: "url('/2026-11-14 20.18.15.jpg')" }}
      >
        <div className="relative">
          <PageTitle />
          <section className="relative mx-auto max-w-4xl overflow-hidden px-4 pb-4 pt-16 text-center">
            {/* <Logo className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 text-primary opacity-[0.06]" /> */}
            <Reveal className="relative">
              <h1 className="mb-4 text-4xl font-extrabold text-fg sm:text-5xl">{t('landing.title')}</h1>
              <p className="text-xl text-fg-muted">{t('landing.subtitle')}</p>
              <OrnamentBand className="mx-auto mt-8 !w-64" />
            </Reveal>
          </section>

          <DisciplinesIntro />

          <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-8 md:grid-cols-2">
            <Reveal><PendingEvents /></Reveal>
            <Reveal delay={0.1}><TopPerformances /></Reveal>
          </section>
        </div>
      </div>

      <HowItWorks />
    </div>
  );
};
