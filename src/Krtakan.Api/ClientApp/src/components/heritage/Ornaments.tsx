import { useId } from 'react';
import type { ReactNode } from 'react';

/** Repeating band of stepped diamonds, in the style of Armenian carpet borders. */
export function OrnamentBand({ className = '' }: { className?: string }) {
  const id = `band${useId().replace(/[^\w-]/g, '')}`;
  return (
    <svg aria-hidden className={`block h-6 w-full ${className}`}>
      <defs>
        <pattern id={id} width="48" height="24" patternUnits="userSpaceOnUse">
          <rect width="48" height="1.5" className="fill-heritage-blue" />
          <rect y="22.5" width="48" height="1.5" className="fill-heritage-blue" />
          <polygon points="24,3 33,12 24,21 15,12" className="fill-heritage-red" />
          <polygon points="24,7 29,12 24,17 19,12" className="fill-heritage-apricot" />
          <polygon points="24,10 26,12 24,14 22,12" className="fill-heritage-blue" />
          <polygon points="0,7 5,12 0,17" className="fill-heritage-blue" />
          <polygon points="48,7 43,12 48,17" className="fill-heritage-blue" />
          <circle cx="9" cy="6" r="1.5" className="fill-heritage-apricot" />
          <circle cx="39" cy="6" r="1.5" className="fill-heritage-apricot" />
          <circle cx="9" cy="18" r="1.5" className="fill-heritage-apricot" />
          <circle cx="39" cy="18" r="1.5" className="fill-heritage-apricot" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Eight-pointed star common in Armenian stone carving and carpets; children are drawn in its center. */
export function EightPointStar({ className = '', children }: { className?: string; children?: ReactNode }) {
  return (
    <span className={`inline-grid place-items-center ${className}`}>
      <svg aria-hidden viewBox="0 0 100 100" className="col-start-1 row-start-1 h-full w-full">
        <rect x="18" y="18" width="64" height="64" rx="6" className="fill-current" />
        <rect x="18" y="18" width="64" height="64" rx="6" transform="rotate(45 50 50)" className="fill-current" />
        <circle cx="50" cy="50" r="27" className="fill-surface/15" />
      </svg>
      <span className="col-start-1 row-start-1">{children}</span>
    </span>
  );
}
