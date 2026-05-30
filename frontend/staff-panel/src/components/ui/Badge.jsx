/*
   VaaniBank AI — Badge Component
   Union Bank of India | Team Vectora
   */

import { SENTIMENTS, INTENTS, SESSION_STATUS } from '../../constants';

const presetStyles = {
  // Sentiment badges
  calm: {
    bg: 'bg-green-100 dark:bg-green-500/15',
    text: 'text-green-700 dark:text-green-400',
    dot: false,
  },
  frustrated: {
    bg: 'bg-red-100 dark:bg-red-500/15',
    text: 'text-red-700 dark:text-red-400',
    dot: false,
  },
  confused: {
    bg: 'bg-amber-100 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-400',
    dot: false,
  },
  urgent: {
    bg: 'bg-purple-100 dark:bg-purple-500/15',
    text: 'text-purple-700 dark:text-purple-400',
    dot: false,
  },

  // Status badges
  live: {
    bg: 'bg-green-100 dark:bg-green-500/15',
    text: 'text-green-700 dark:text-green-400',
    dot: true,
    dotColor: 'bg-green-500',
  },
  ready: {
    bg: 'bg-blue-100 dark:bg-blue-500/15',
    text: 'text-blue-700 dark:text-blue-400',
    dot: true,
    dotColor: 'bg-blue-500',
  },
  offline: {
    bg: 'bg-gray-100 dark:bg-gray-500/15',
    text: 'text-gray-600 dark:text-gray-400',
    dot: true,
    dotColor: 'bg-gray-400',
  },
  recording: {
    bg: 'bg-red-100 dark:bg-red-500/15',
    text: 'text-red-700 dark:text-red-400',
    dot: true,
    dotColor: 'bg-red-500',
  },
  processing: {
    bg: 'bg-amber-100 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-400',
    dot: false,
    spin: true,
  },

  // Intent badge (generic)
  intent: {
    bg: 'bg-indigo-100 dark:bg-indigo-500/15',
    text: 'text-indigo-700 dark:text-indigo-400',
    dot: false,
  },

  // Generic
  success: {
    bg: 'bg-green-100 dark:bg-green-500/15',
    text: 'text-green-700 dark:text-green-400',
    dot: false,
  },
  warning: {
    bg: 'bg-amber-100 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-400',
    dot: false,
  },
  error: {
    bg: 'bg-red-100 dark:bg-red-500/15',
    text: 'text-red-700 dark:text-red-400',
    dot: false,
  },
  info: {
    bg: 'bg-blue-100 dark:bg-blue-500/15',
    text: 'text-blue-700 dark:text-blue-400',
    dot: false,
  },
  neutral: {
    bg: 'bg-gray-100 dark:bg-gray-700/40',
    text: 'text-gray-700 dark:text-gray-300',
    dot: false,
  },
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export default function Badge({
  variant = 'neutral',
  size = 'md',
  children,
  emoji,
  icon: Icon,
  className = '',
  pulse = false,
}) {
  const style = presetStyles[variant] || presetStyles.neutral;
  const sizeClass = badgeSizes[size] || badgeSizes.md;

  // Get emoji from SENTIMENTS if variant matches
  const displayEmoji = emoji || SENTIMENTS[variant]?.emoji || null;

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 font-semibold rounded-full whitespace-nowrap',
        style.bg,
        style.text,
        sizeClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Animated dot */}
      {style.dot && (
        <span className="relative flex h-2 w-2">
          {(variant === 'live' || variant === 'recording' || pulse) && (
            <span
              className={[
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                style.dotColor,
              ].join(' ')}
            />
          )}
          <span
            className={['relative inline-flex rounded-full h-2 w-2', style.dotColor].join(' ')}
          />
        </span>
      )}

      {/* Spinner for processing */}
      {style.spin && (
        <svg
          className="animate-spin h-3 w-3"
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
      )}

      {/* Icon */}
      {Icon && <Icon size={size === 'sm' ? 10 : size === 'lg' ? 16 : 12} />}

      {/* Emoji */}
      {displayEmoji && <span>{displayEmoji}</span>}

      {/* Content */}
      {children}
    </span>
  );
}
