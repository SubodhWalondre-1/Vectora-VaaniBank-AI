/*
   VaaniBank AI — Spinner Component
   Union Bank of India | Team Vectora
   */

const colorMap = {
  red: {
    track: 'border-red-200 dark:border-red-900/40',
    spinner: 'border-t-brand-red',
  },
  blue: {
    track: 'border-blue-200 dark:border-blue-900/40',
    spinner: 'border-t-brand-blue dark:border-t-brand-blue-mid',
  },
  white: {
    track: 'border-white/20',
    spinner: 'border-t-white',
  },
  current: {
    track: 'border-current/20',
    spinner: 'border-t-current',
  },
};

const sizeMap = {
  xs: { container: 'w-4 h-4', border: 'border-2' },
  sm: { container: 'w-5 h-5', border: 'border-2' },
  md: { container: 'w-8 h-8', border: 'border-[3px]' },
  lg: { container: 'w-12 h-12', border: 'border-4' },
  xl: { container: 'w-16 h-16', border: 'border-4' },
};

export default function Spinner({
  size = 'md',
  color = 'blue',
  className = '',
  label = 'Loading',
}) {
  const c = colorMap[color] || colorMap.blue;
  const s = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={['inline-flex items-center justify-center', className].filter(Boolean).join(' ')}
      role="status"
      aria-label={label}
    >
      <div
        className={[
          'rounded-full animate-spin',
          s.container,
          s.border,
          c.track,
          c.spinner,
        ].join(' ')}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
