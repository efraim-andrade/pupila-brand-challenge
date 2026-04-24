import { type ButtonHTMLAttributes, type JSX } from 'react'
import { twMerge } from 'tailwind-merge'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'xs' | 'sm' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'border border-gray-200 text-gray-600 hover:bg-gray-50',
  ghost: 'text-gray-500 hover:bg-gray-100',
  danger: 'border border-red-200 bg-white text-red-600 hover:bg-red-50',
}

const sizeClasses: Record<Size, string> = {
  xs: 'rounded px-2 py-1 text-xs',
  sm: 'rounded-lg px-2.5 py-1.5 text-sm',
  md: 'rounded-lg px-4 py-2 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      className={twMerge(
        'inline-flex items-center justify-center gap-1.5 font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
