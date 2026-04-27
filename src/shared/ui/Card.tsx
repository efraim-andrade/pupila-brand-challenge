import type { JSX, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  className = '',
  onClick,
}: CardProps): JSX.Element {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-lg bg-surface shadow-card transition-shadow hover:shadow-card-hover ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
