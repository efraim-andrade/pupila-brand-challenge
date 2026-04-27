'use client';

import { type JSX, useMemo } from 'react';
import { DEFAULT_GROUP_COLOR, DEFAULT_TAG_COLOR } from '@/lib/colors';
import { useAppStore } from '@/store';
import type { ChartDataItem, GroupStat, TagStat } from '../types';
import { EmptyState } from './EmptyState';
import { GroupsChart } from './GroupsChart';
import { GroupsTable } from './GroupsTable';
import { StatCard } from './StatCard';
import { TagsChart } from './TagsChart';
import { TagsTable } from './TagsTable';

export function StatisticsContent(): JSX.Element {
  const images = useAppStore((store) => store.images);
  const palettes = useAppStore((store) => store.palettes);
  const groups = useAppStore((store) => store.groups);
  const tags = useAppStore((store) => store.tags);

  const groupStats = useMemo<GroupStat[]>(() => {
    return groups.map((group) => {
      const imageCount = images.filter(
        (image) => image.groupId === group.id
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
      const imageCount = images.filter((image) =>
        image.tagIds.includes(tag.id)
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

  const ungroupedImages = images.filter((image) => !image.groupId).length;
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
                  <GroupsChart groupStats={groupStats} />
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
                  <TagsChart tagChartData={tagChartData} />
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
