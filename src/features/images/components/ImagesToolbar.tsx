'use client'

import type { JSX } from 'react'
import { Toolbar, type EntityToolbarProps, buildCountLabel } from '@/shared/ui/Toolbar'
import type { FilterState, ViewMode } from '@/types'
import type { Group, Tag } from '@/types'

export type { FilterState, ViewMode, Group, Tag }

export function buildImageCountLabel(
  filteredCount: number,
  totalCount: number
): string {
  return buildCountLabel(filteredCount, totalCount, 'images')
}

type ImagesToolbarProps = Omit<EntityToolbarProps, 'entityType' | 'onAdd' | 'onFilterChange' | 'onResetFilter' | 'onViewModeChange'> & {
  onFilterChange: (filter: Partial<EntityToolbarProps['filter']>) => void
  onResetFilter: () => void
  onViewModeChange: (mode: EntityToolbarProps['viewMode']) => void
  onAddImage: () => void
}

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
  )
}
