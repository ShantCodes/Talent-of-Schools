const mask = 'url(/ArmenianEternity.svg) center / contain no-repeat';

/** The Armenian eternity sign, painted with the current text color so it follows the theme. */
export function Logo({ className = '' }: { className?: string }) {
  return <span aria-hidden className={`inline-block shrink-0 bg-current ${className}`} style={{ mask, WebkitMask: mask }} />;
}
