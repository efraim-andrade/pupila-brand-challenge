import { X } from 'lucide-react';
import type { JSX, ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  color?: string;
  onRemove?: () => void;
  className?: string;
}

export function Badge({
  children,
  color,
  onRemove,
  className = '',
}: BadgeProps): JSX.Element {
  const style = color
    ? { backgroundColor: `${color}22`, color, borderColor: `${color}44` }
    : undefined;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
        color ? '' : 'border-gray-200 bg-gray-100 text-gray-600'
      } ${className}`}
      style={style}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 rounded-full hover:opacity-70"
          aria-label="Remove"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
