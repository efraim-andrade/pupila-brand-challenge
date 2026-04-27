import type { ButtonHTMLAttributes, JSX } from 'react';
import { twMerge } from 'tailwind-merge';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'xs' | 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-text-primary text-surface hover:bg-black',
  secondary:
    'bg-surface text-text-primary shadow-border hover:bg-surface-subtle',
  ghost: 'text-text-tertiary hover:bg-surface-subtle hover:text-text-primary',
  danger: 'bg-surface text-red-600 shadow-border hover:bg-danger-bg',
};

const sizeClasses: Record<Size, string> = {
  xs: 'rounded-md px-2 py-1 text-xs',
  sm: 'rounded-md px-2.5 py-1.5 text-[14px]',
  md: 'rounded-md px-4 py-2 text-[14px]',
};

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
        'focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
