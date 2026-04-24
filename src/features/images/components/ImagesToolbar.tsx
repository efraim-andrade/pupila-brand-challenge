'use client';

import type { JSX } from 'react';
import {
  buildCountLabel,
  type EntityToolbarProps,
  Toolbar,
} from '@/shared/ui/Toolbar';
import type { FilterState, Group, Tag, ViewMode } from '@/types';

export type { FilterState, Group, Tag, ViewMode };

export function buildImageCountLabel(
  filteredCount: number,
  totalCount: number
): string {
  return buildCountLabel(filteredCount, totalCount, 'images');
}

type ImagesToolbarProps = Omit<
  EntityToolbarProps,
  | 'entityType'
  | 'onAdd'
  | 'onFilterChange'
  | 'onResetFilter'
  | 'onViewModeChange'
> & {
  onFilterChange: (filter: Partial<EntityToolbarProps['filter']>) => void;
  onResetFilter: () => void;
  onViewModeChange: (mode: EntityToolbarProps['viewMode']) => void;
  onAddImage: () => void;
};

export function ImagesToolbar({
  totalCount,
  filteredCount,
  filter,
  viewMode,
  groups,
  tags,
  onFilterChange,
  onResetFilter,
  onViewModeChange,
  onAddImage,
}: ImagesToolbarProps): JSX.Element {
  return (
    <Toolbar
      entityType="images"
      totalCount={totalCount}
      filteredCount={filteredCount}
      filter={filter}
      viewMode={viewMode}
      groups={groups}
      tags={tags}
      onFilterChange={onFilterChange}
      onResetFilter={onResetFilter}
      onViewModeChange={onViewModeChange}
      onAdd={onAddImage}
    />
  );
}
