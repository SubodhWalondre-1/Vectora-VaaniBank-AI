/* ============================================
   VaaniBank AI — Theme Toggle Component
   Union Bank of India | Team Vectora
   ============================================ */

import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export default function Toggle({
  checked = false,
  onChange,
  label = '',
  className = '',
}) {
  const isDark = checked;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={label || (isDark ? 'Switch to light mode' : 'Switch to dark mode')}
      onClick={onChange}
      className={[
        'group relative inline-flex items-center gap-2.5 cursor-pointer select-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Track */}
      <div
        className={[
          'relative w-14 h-7 rounded-full transition-colors duration-300 ease-in-out',
          isDark
            ? 'bg-brand-blue-mid shadow-inner'
            : 'bg-gray-200 dark:bg-gray-600',
        ].join(' ')}
      >
        {/* Background icons */}
        <div className="absolute inset-0 flex items-center justify-between px-1.5">
          <Sun
            size={13}
            className={[
              'transition-opacity duration-200',
              isDark ? 'opacity-30 text-yellow-200' : 'opacity-0',
            ].join(' ')}
          />
          <Moon
            size={13}
            className={[
              'transition-opacity duration-200',
              isDark ? 'opacity-0' : 'opacity-30 text-gray-500',
            ].join(' ')}
          />
        </div>

        {/* Thumb */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          className={[
            'absolute top-0.5 w-6 h-6 rounded-full shadow-md flex items-center justify-center',
            isDark
              ? 'left-[calc(100%-26px)] bg-brand-blue-dark'
              : 'left-0.5 bg-white',
          ].join(' ')}
        >
          {isDark ? (
            <Moon size={13} className="text-blue-200" />
          ) : (
            <Sun size={13} className="text-amber-500" />
          )}
        </motion.div>
      </div>

      {/* Label */}
      {label && (
        <span
          className="text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </span>
      )}
    </button>
  );
}
