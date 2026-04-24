import { type JSX, useMemo } from 'react';
import type { GroupStat } from '@/app/statistics/types';

interface GroupsTableProps {
  stats: GroupStat[];
  unusedCount: number;
}

export function GroupsTable({
  stats,
  unusedCount,
}: GroupsTableProps): JSX.Element {
  const sorted = useMemo(
    () => [...stats].sort((groupA, groupB) => groupB.total - groupA.total),
    [stats]
  );

  return (
    <div className="mt-4">
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-indigo-400" /> Images
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-indigo-200" /> Palettes
        </span>
        {unusedCount > 0 && (
          <span className="ml-auto text-amber-600">{unusedCount} unused</span>
        )}
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {sorted.map((stat) => (
          <div key={stat.id} className="flex items-center gap-3">
            <div className="w-24 truncate text-sm text-gray-700">
              {stat.name}
            </div>
            <div className="flex flex-1 items-center gap-1">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full bg-indigo-400"
                  style={{
                    width: `${(stat.images / Math.max(stat.total, 1)) * 100}%`,
                  }}
                />
              </div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full bg-indigo-200"
                  style={{
                    width: `${(stat.palettes / Math.max(stat.total, 1)) * 100}%`,
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
    </div>
  );
}
