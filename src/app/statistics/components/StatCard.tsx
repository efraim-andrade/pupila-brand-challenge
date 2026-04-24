import { type JSX, useMemo } from 'react';

interface StatCardProps {
  title: string;
  value: number;
}

export function StatCard({ title, value }: StatCardProps): JSX.Element {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
