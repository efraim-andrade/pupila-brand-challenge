'use client';

import { LayoutGrid, List, Plus, Search } from 'lucide-react';
import { type JSX, useMemo } from 'react';
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
  const groupOptions = useMemo(
    () =>
      groups.map(
        (group): SelectOption => ({ label: group.name, value: group.id })
      ),
    [groups]
  );
  const countLabel = buildCountLabel(filteredCount, totalCount, entityType);
  const searchPlaceholder =
    entityType === 'palettes' ? 'Search palettes\u2026' : 'Search images\u2026';
  const addButtonLabel =
    entityType === 'palettes' ? 'New palette' : 'Add image';

  return (
    <div className="shadow-border bg-surface">
      {/* Top row: search + actions */}
      <div className="flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-4">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={filter.search}
            onChange={(event) => onFilterChange({ search: event.target.value })}
            className="w-full rounded-md bg-surface-subtle py-2 pl-9 pr-3 text-sm text-text-primary placeholder-text-muted shadow-border focus:bg-surface focus:outline-none focus:ring-2 focus:ring-focus"
          />
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className="hidden text-xs text-text-muted sm:inline">
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

          <div className="flex overflow-hidden rounded-md shadow-border">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 ${
                viewMode === 'grid'
                  ? 'bg-surface-subtle text-text-primary'
                  : 'bg-surface text-text-muted hover:bg-surface-subtle'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 ${
                viewMode === 'list'
                  ? 'bg-surface-subtle text-text-primary'
                  : 'bg-surface text-text-muted hover:bg-surface-subtle'
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
            <label className="shrink-0 text-xs font-medium text-text-tertiary">
              Group:
            </label>
            <Select
              options={groupOptions}
              value={filter.groupId ?? ''}
              onChange={(value) => onFilterChange({ groupId: value })}
              placeholder="All groups"
              showPlaceholder={false}
              className="shrink-0 rounded-md bg-surface-subtle py-1.5 pl-3 pr-8 text-sm text-text-primary"
            />
          </>
        )}

        <div className="flex shrink-0 items-center gap-1.5">
          {tags.length > 0 && (
            <span className="shrink-0 text-xs font-medium text-text-tertiary">
              Tags:
            </span>
          )}
          {tags.map((tag) => {
            const isActive = filter.tagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  const nextTagIds = isActive
                    ? filter.tagIds.filter((tagId) => tagId !== tag.id)
                    : [...filter.tagIds, tag.id];
                  onFilterChange({ tagIds: nextTagIds });
                }}
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-text-primary text-surface'
                    : 'bg-surface text-text-tertiary shadow-border hover:bg-surface-subtle'
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:hidden">
          <span className="text-xs text-text-muted">{countLabel}</span>
          {hasActiveFilter && (
            <Button
              variant="ghost"
              size="xs"
              className="rounded-md"
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
