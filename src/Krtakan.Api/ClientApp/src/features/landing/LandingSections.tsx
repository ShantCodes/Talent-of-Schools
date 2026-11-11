import { motion } from 'framer-motion';
import { useI18n } from '../../i18n/I18nContext';
import { EightPointStar } from '../../components/heritage/Ornaments';
import { SectionHeading } from '../../components/heritage/SectionHeading';
import { Reveal } from '../../components/Reveal';

export function DisciplinesIntro() {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16">
      <SectionHeading title={t('landing.disciplinesTitle')} subtitle={t('landing.disciplinesSubtitle')} />
    </section>
  );
}

const steps = ['register', 'submit', 'score'] as const;
/** Armenian letters double as numerals: Ա = 1, Բ = 2, Գ = 3. */
const armenianNumerals = ['Ա', 'Բ', 'Գ'];

export function HowItWorks() {
  const { t } = useI18n();
  return (
    <section className="border-y border-line bg-surface-muted/60 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading title={t('landing.stepsTitle')} subtitle={t('landing.stepsSubtitle')} />
        <ol className="grid gap-10 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step}>
              <Reveal delay={index * 0.12} className="flex flex-col items-center text-center">
                <motion.div whileHover={{ rotate: 45 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}>
                  <EightPointStar className="h-20 w-20 text-heritage-red">
                    <span className="text-2xl font-bold text-white">{armenianNumerals[index]}</span>
                  </EightPointStar>
                </motion.div>
                <h3 className="mt-4 text-xl font-bold text-fg">{t(`landing.step.${step}.title` as const)}</h3>
                <p className="mt-2 max-w-xs text-fg-muted">{t(`landing.step.${step}.text` as const)}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
