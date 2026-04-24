'use client';

import type { JSX } from 'react';
import {
  buildCountLabel,
  type EntityToolbarProps,
  Toolbar,
} from '@/shared/ui/Toolbar';
import type { FilterState, Group, Tag, ViewMode } from '@/types';

export type { FilterState, Group, Tag, ViewMode };
export function buildPaletteCountLabel(
  filteredCount: number,
  totalCount: number
): string {
  return buildCountLabel(filteredCount, totalCount, 'palettes');
}

type PalettesToolbarProps = Omit<
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
  onAddPalette: () => void;
};

export function PalettesToolbar({
  totalCount,
  filteredCount,
  filter,
  viewMode,
  groups,
  tags,
  onFilterChange,
  onResetFilter,
  onViewModeChange,
  onAddPalette,
}: PalettesToolbarProps): JSX.Element {
  return (
    <Toolbar
      entityType="palettes"
      totalCount={totalCount}
      filteredCount={filteredCount}
      filter={filter}
      viewMode={viewMode}
      groups={groups}
      tags={tags}
      onFilterChange={onFilterChange}
      onResetFilter={onResetFilter}
      onViewModeChange={onViewModeChange}
      onAdd={onAddPalette}
    />
  );
}
