import { Reveal } from '../Reveal';
import { OrnamentBand } from './Ornaments';

export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Reveal className="mx-auto mb-10 max-w-2xl text-center">
      <h2 className="text-3xl font-extrabold text-fg sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-fg-muted">{subtitle}</p>}
      <OrnamentBand className="mx-auto mt-5 !w-40" />
    </Reveal>
  );
}
