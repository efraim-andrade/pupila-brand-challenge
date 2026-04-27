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
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium ${
        color ? '' : 'bg-badge-bg text-badge-text shadow-border'
      } ${className}`}
      style={style}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 rounded-full hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-focus"
          aria-label="Remove"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
