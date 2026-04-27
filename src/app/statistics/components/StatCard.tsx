import type { JSX } from 'react';

interface StatCardProps {
  title: string;
  value: number;
}

export function StatCard({ title, value }: StatCardProps): JSX.Element {
  return (
    <div className="rounded-lg bg-white px-5 py-4 shadow-card">
      <p className="text-sm text-text-tertiary">{title}</p>
      <p className="mt-1 text-2xl font-semibold tracking-[-0.96px] text-text-primary">
        {value}
      </p>
    </div>
  );
}
