'use client';

import { LayoutGrid, List, Plus, Search } from 'lucide-react';
import type { JSX } from 'react';
import { Button } from '@/shared/ui/Button';
import { Select, type SelectOption } from '@/shared/ui/Select';
import type { FilterState, Group, Tag, ViewMode } from '@/types';

interface BaseToolbarProps {
  totalCount: number;
  filteredCount: number;
  filter: FilterState;
  viewMode: ViewMode;
  groups: Group[];
  tags: Tag[];
  onFilterChange: (filter: Partial<FilterState>) => void;
  onResetFilter: () => void;
  onViewModeChange: (mode: ViewMode) => void;
}

export interface EntityToolbarProps extends BaseToolbarProps {
  entityType: 'palettes' | 'images';
  onAdd: () => void;
}

export function buildCountLabel(
  filteredCount: number,
  totalCount: number,
  entityType: 'palettes' | 'images'
): string {
  const entity = entityType === 'palettes' ? 'palette' : 'image';
  if (filteredCount === totalCount) {
    return `${totalCount} ${entity}${totalCount !== 1 ? 's' : ''}`;
  }
  return `${filteredCount} of ${totalCount}`;
}

export function Toolbar({
  totalCount,
  filteredCount,
  filter,
  viewMode,
  groups,
  tags,
  onFilterChange,
  onResetFilter,
  onViewModeChange,
  entityType,
  onAdd,
}: EntityToolbarProps): JSX.Element {
  const hasActiveFilter =
    filter.search || filter.groupId || filter.tagIds.length > 0;
  const countLabel = buildCountLabel(filteredCount, totalCount, entityType);
  const searchPlaceholder =
    entityType === 'palettes' ? 'Search palettes…' : 'Search images…';
  const addButtonLabel =
    entityType === 'palettes' ? 'New palette' : 'Add image';

  return (
    <div className="border-b border-gray-200 bg-white">
      {/* Top row: search + actions */}
      <div className="flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-4">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={filter.search}
            onChange={(event) => onFilterChange({ search: event.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className="hidden text-xs text-gray-400 sm:inline">
            {countLabel}
          </span>

          {hasActiveFilter && (
            <Button
              variant="ghost"
              size="sm"
              className="hidden text-xs sm:block"
              onClick={onResetFilter}
            >
              Clear
            </Button>
          )}

          <div className="flex overflow-hidden rounded-lg border border-gray-200">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 ${
                viewMode === 'grid'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 ${
                viewMode === 'list'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Button onClick={onAdd} size="sm" className="sm:px-3">
            <Plus className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{addButtonLabel}</span>
          </Button>
        </div>
      </div>

      {/* Bottom row: group select + tags (scrollable on mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto px-4 pb-3 sm:px-6 sm:pb-4">
        {groups.length > 0 && (
          <>
            <label className="shrink-0 text-xs font-medium text-gray-500">
              Group:
            </label>
            <Select
              options={groups.map(
                (group): SelectOption => ({
                  label: group.name,
                  value: group.id,
                })
              )}
              value={filter.groupId ?? ''}
              onChange={(value) => onFilterChange({ groupId: value })}
              placeholder="All groups"
              showPlaceholder={false}
              className="shrink-0 rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-3 pr-8 text-sm text-gray-700"
            />
          </>
        )}

        <div className="flex shrink-0 items-center gap-1.5">
          {tags.length > 0 && (
            <span className="shrink-0 text-xs font-medium text-gray-500">
              Tags:
            </span>
          )}
          {tags.map((tag) => {
            const isActive = filter.tagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => {
                  const nextTagIds = isActive
                    ? filter.tagIds.filter((tagId) => tagId !== tag.id)
                    : [...filter.tagIds, tag.id];
                  onFilterChange({ tagIds: nextTagIds });
                }}
                className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? 'border-transparent bg-indigo-100 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:hidden">
          <span className="text-xs text-gray-400">{countLabel}</span>
          {hasActiveFilter && (
            <Button
              variant="ghost"
              size="xs"
              className="rounded-lg"
              onClick={onResetFilter}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
