import { type JSX, useMemo } from 'react';
import type { TagStat } from '@/app/statistics/types';

interface TagsTableProps {
  stats: TagStat[];
  unusedCount: number;
}

export function TagsTable({ stats, unusedCount }: TagsTableProps): JSX.Element {
  const sorted = useMemo(
    () => [...stats].sort((tagA, tagB) => tagB.total - tagA.total),
    [stats]
  );

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-2">
        {sorted.map((stat) => (
          <div key={stat.id} className="flex items-center gap-3">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: stat.color }}
            />
            <div className="w-24 truncate text-sm text-gray-700">
              {stat.name}
            </div>
            <div className="flex flex-1 items-center gap-1">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full"
                  style={{
                    width: `${(stat.total / Math.max(stats[0]?.total ?? 1, 1)) * 100}%`,
                    backgroundColor: stat.color,
                  }}
                />
              </div>
            </div>
            <span className="w-12 text-right text-sm font-medium text-gray-900">
              {stat.total}
            </span>
          </div>
        ))}
      </div>
      {unusedCount > 0 && (
        <p className="mt-3 text-xs text-amber-600">{unusedCount} tags unused</p>
      )}
    </div>
  );
}
