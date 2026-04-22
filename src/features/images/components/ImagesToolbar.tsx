'use client'

import type { JSX } from 'react'
import type { Group, Tag, FilterState, ViewMode } from '@/types'

interface ImagesToolbarProps {
  totalCount: number
  filteredCount: number
  filter: FilterState
  viewMode: ViewMode
  groups: Group[]
  tags: Tag[]
  onFilterChange: (filter: Partial<FilterState>) => void
  onResetFilter: () => void
  onViewModeChange: (mode: ViewMode) => void
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
  const hasActiveFilter = filter.search || filter.groupId || filter.tagIds.length > 0
  const countLabel = filteredCount === totalCount
    ? `${totalCount} image${totalCount !== 1 ? 's' : ''}`
    : `${filteredCount} of ${totalCount}`

  return (
    <div className="border-b border-gray-200 bg-white">
      {/* Top row: search + actions */}
      <div className="flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-4">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search images…"
            value={filter.search}
            onChange={(event) => onFilterChange({ search: event.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className="hidden text-xs text-gray-400 sm:inline">{countLabel}</span>

          {hasActiveFilter && (
            <button
              onClick={onResetFilter}
              className="hidden rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 sm:block"
            >
              Clear
            </button>
          )}

          <div className="flex overflow-hidden rounded-lg border border-gray-200">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              aria-label="Grid view"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              aria-label="List view"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </button>
          </div>

          <button
            onClick={onAddImage}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 sm:px-3"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="hidden sm:inline">Add image</span>
          </button>
        </div>
      </div>

      {/* Bottom row: group select + tags (scrollable on mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto px-4 pb-3 sm:px-6 sm:pb-4">
        <select
          value={filter.groupId ?? ''}
          onChange={(event) => onFilterChange({ groupId: event.target.value || null })}
          className="shrink-0 rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-3 pr-8 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All groups</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>

        <div className="flex shrink-0 gap-1.5">
          {tags.map((tag) => {
            const isActive = filter.tagIds.includes(tag.id)
            return (
              <button
                key={tag.id}
                onClick={() => {
                  const nextTagIds = isActive
                    ? filter.tagIds.filter((tagId) => tagId !== tag.id)
                    : [...filter.tagIds, tag.id]
                  onFilterChange({ tagIds: nextTagIds })
                }}
                className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? 'border-transparent bg-indigo-100 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {tag.name}
              </button>
            )
          })}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:hidden">
          <span className="text-xs text-gray-400">{countLabel}</span>
          {hasActiveFilter && (
            <button
              onClick={onResetFilter}
              className="rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
