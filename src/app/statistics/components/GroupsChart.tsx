import type { JSX } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { GroupStat } from '@/app/statistics/types';

interface GroupsChartProps {
  groupStats: GroupStat[];
}

export function GroupsChart({ groupStats }: GroupsChartProps): JSX.Element {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={groupStats}
        layout="vertical"
        margin={{ left: 80, right: 20 }}
      >
        <XAxis type="number" />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12 }}
          width={80}
        />
        <Tooltip
          content={({ payload }) => {
            if (!payload?.length) return null;
            const chartData = payload[0].payload as {
              images: number;
              palettes: number;
            };
            return (
              <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                <p className="mt-1 text-sm text-gray-600">
                  Images: {chartData.images} | Palettes: {chartData.palettes}
                </p>
              </div>
            );
          }}
        />
        <Bar dataKey="images" stackId="a" fill="#818cf8" />
        <Bar
          dataKey="palettes"
          stackId="a"
          fill="#c7d2fe"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
