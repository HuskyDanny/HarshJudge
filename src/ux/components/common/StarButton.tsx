import { type FC } from 'react';

interface StarButtonProps {
  /** Whether the item is starred */
  starred: boolean;
  /** Callback when clicked */
  onClick: () => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the button is disabled */
  disabled?: boolean;
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

/**
 * Star toggle button for marking favorites
 */
export const StarButton: FC<StarButtonProps> = ({
  starred,
  onClick,
  size = 'md',
  disabled = false,
}) => {
  const sizeClass = SIZE_CLASSES[size];

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      className={`
        p-1 rounded transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700 cursor-pointer'}
        ${starred ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-400'}
      `}
      aria-label={starred ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={starred}
      title={starred ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className={sizeClass}
        fill={starred ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    </button>
  );
};
