import type { JSX } from 'react';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex h-48 items-center justify-center">
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}
