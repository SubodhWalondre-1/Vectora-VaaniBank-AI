/* ============================================
   VaaniBank AI — Button Component
   Union Bank of India | Team Vectora
   ============================================ */

import { motion } from 'framer-motion';

const variants = {
  primary: {
    base: 'bg-brand-red hover:bg-brand-red-dark text-white shadow-md hover:shadow-lg',
    focus: 'focus-visible:ring-brand-red/40',
  },
  secondary: {
    base: 'bg-brand-blue hover:bg-brand-blue-mid text-white shadow-md hover:shadow-lg',
    focus: 'focus-visible:ring-brand-blue/40',
  },
  danger: {
    base: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg',
    focus: 'focus-visible:ring-red-500/40',
  },
  ghost: {
    base: 'bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300',
    focus: 'focus-visible:ring-gray-400/40',
  },
  outline: {
    base: 'bg-transparent border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white dark:border-brand-blue-mid dark:text-brand-blue-mid dark:hover:bg-brand-blue-mid dark:hover:text-white',
    focus: 'focus-visible:ring-brand-blue/40',
  },
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  children,
  fullWidth = false,
  icon: Icon,
  className = '',
  type = 'button',
  ...rest
}) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      className={[
        'inline-flex items-center justify-center font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'dark:focus-visible:ring-offset-gray-900',
        v.base,
        v.focus,
        s,
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{typeof children === 'string' ? children : 'Loading…'}</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
          {children}
        </>
      )}
    </motion.button>
  );
}
