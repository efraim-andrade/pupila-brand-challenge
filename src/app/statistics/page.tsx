'use client';

import { type JSX, useMemo } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DEFAULT_GROUP_COLOR, DEFAULT_TAG_COLOR } from '@/lib/colors';
import { useAppStore } from '@/store';
import { EmptyState } from './components/EmptyState';
import { GroupsTable } from './components/GroupsTable';
import { StatCard } from './components/StatCard';
import { TagsTable } from './components/TagsTable';
import type { ChartDataItem, GroupStat, TagStat } from './types';

export default function StatisticsPage(): JSX.Element {
  const images = useAppStore((store) => store.images);
  const palettes = useAppStore((store) => store.palettes);
  const groups = useAppStore((store) => store.groups);
  const tags = useAppStore((store) => store.tags);

  const groupStats = useMemo<GroupStat[]>(() => {
    return groups.map((group) => {
      const imageCount = images.filter(
        (img) => img.groupId === group.id
      ).length;
      const paletteCount = palettes.filter(
        (palette) => palette.groupId === group.id
      ).length;
      return {
        id: group.id,
        name: group.name,
        color: group.color ?? DEFAULT_GROUP_COLOR,
        images: imageCount,
        palettes: paletteCount,
        total: imageCount + paletteCount,
      };
    });
  }, [groups, images, palettes]);

  const tagStats = useMemo<TagStat[]>(() => {
    return tags.map((tag) => {
      const imageCount = images.filter((img) =>
        img.tagIds.includes(tag.id)
      ).length;
      const paletteCount = palettes.filter((palette) =>
        palette.tagIds.includes(tag.id)
      ).length;
      return {
        id: tag.id,
        name: tag.name,
        color: tag.color ?? DEFAULT_TAG_COLOR,
        images: imageCount,
        palettes: paletteCount,
        total: imageCount + paletteCount,
      };
    });
  }, [tags, images, palettes]);

  const tagChartData: ChartDataItem[] = useMemo(() => {
    if (tagStats.length === 0) return [];
    return tagStats.map((tag) => ({
      name: tag.name,
      value: tag.total,
      fill: tag.color,
    }));
  }, [tagStats]);

  const totalImages = images.length;
  const totalPalettes = palettes.length;
  const totalItems = totalImages + totalPalettes;

  const ungroupedImages = images.filter((img) => !img.groupId).length;
  const ungroupedPalettes = palettes.filter(
    (palette) => !palette.groupId
  ).length;

  const unusedGroups = groupStats.filter((group) => group.total === 0).length;
  const unusedTags = tagStats.filter((tag) => tag.total === 0).length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Items" value={totalItems} />
            <StatCard title="Images" value={totalImages} />
            <StatCard title="Palettes" value={totalPalettes} />
            <StatCard title="Groups" value={groups.length} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-base font-semibold text-gray-900">
                Groups Usage
              </h2>
              {groupStats.length === 0 ? (
                <EmptyState message="No groups created yet" />
              ) : (
                <>
                  <GroupsChart data={groupStats} />
                  <GroupsTable stats={groupStats} unusedCount={unusedGroups} />
                </>
              )}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-base font-semibold text-gray-900">
                Tags Usage
              </h2>
              {tagStats.length === 0 ? (
                <EmptyState message="No tags created yet" />
              ) : (
                <>
                  <TagsChart data={tagChartData} />
                  <TagsTable stats={tagStats} unusedCount={unusedTags} />
                </>
              )}
            </section>
          </div>

          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              Ungrouped Items
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <span className="text-sm text-gray-600">Ungrouped Images</span>
                <span className="text-lg font-semibold text-gray-900">
                  {ungroupedImages}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <span className="text-sm text-gray-600">
                  Ungrouped Palettes
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {ungroupedPalettes}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}): JSX.Element {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }): JSX.Element {
  return (
    <div className="flex h-48 items-center justify-center">
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

function GroupsTable({
  stats,
  unusedCount,
}: {
  stats: GroupStat[];
  unusedCount: number;
}): JSX.Element {
  const sorted = useMemo(
    () => [...stats].sort((a, b) => b.total - a.total),
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

function TagsTable({
  stats,
  unusedCount,
}: {
  stats: TagStat[];
  unusedCount: number;
}): JSX.Element {
  const sorted = useMemo(
    () => [...stats].sort((a, b) => b.total - a.total),
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
