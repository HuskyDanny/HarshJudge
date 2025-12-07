import { type FC } from 'react';

interface TagChipProps {
  /** Tag text to display */
  tag: string;
  /** Size variant */
  size?: 'sm' | 'md';
}

const SIZE_CLASSES: Record<'sm' | 'md', string> = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-1 text-sm',
};

/**
 * Small pill-style badge for displaying tags
 */
export const TagChip: FC<TagChipProps> = ({ tag, size = 'sm' }) => {
  return (
    <span
      className={`
        ${SIZE_CLASSES[size]}
        bg-gray-700 text-gray-300 rounded-full
        font-medium inline-block
      `}
    >
      {tag}
    </span>
  );
};
