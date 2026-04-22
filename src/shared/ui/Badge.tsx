import type { ReactNode, JSX } from 'react'

interface BadgeProps {
  children: ReactNode
  color?: string
  onRemove?: () => void
  className?: string
}

export function Badge({ children, color, onRemove, className = '' }: BadgeProps): JSX.Element {
  const style = color
    ? { backgroundColor: color + '22', color, borderColor: color + '44' }
    : undefined

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
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
            <path d="M4.22 4.22a.75.75 0 011.06 0L6 5.94l.72-.72a.75.75 0 011.06 1.06L7.06 7l.72.72a.75.75 0 01-1.06 1.06L6 8.06l-.72.72a.75.75 0 01-1.06-1.06L4.94 7l-.72-.72a.75.75 0 010-1.06z" />
          </svg>
        </button>
      )}
    </span>
  )
}
