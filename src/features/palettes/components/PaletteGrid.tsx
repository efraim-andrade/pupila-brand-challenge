'use client'

import type { JSX } from 'react'
import type { ColorPalette, Group, Tag, ViewMode } from '@/types'
import { Badge } from '@/shared/ui/Badge'
import { PaletteCard } from './PaletteCard'

interface PaletteGridProps {
  palettes: ColorPalette[]
  groups: Group[]
  tags: Tag[]
  viewMode: ViewMode
  onDeletePalette: (id: string) => void
  onEditPalette: (palette: ColorPalette) => void
}

function EmptyState(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-700">No palettes found</p>
      <p className="mt-1 text-xs text-gray-400">Try adjusting your filters or create a new palette</p>
    </div>
  )
}

interface PaletteListRowProps {
  palette: ColorPalette
  group: Group | undefined
  tags: Tag[]
  onDelete: (id: string) => void
  onEdit: (palette: ColorPalette) => void
}

function PaletteListRow({ palette, group, tags, onDelete, onEdit }: PaletteListRowProps): JSX.Element {
  const paletteTags = tags.filter((tag) => palette.tagIds.includes(tag.id))

  return (
    <div className="group flex items-center gap-4 px-6 py-3 hover:bg-gray-50">
      <div className="flex h-10 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100">
        {palette.colors.length === 0 ? (
          <div className="h-full w-full bg-gray-100" />
        ) : (
          palette.colors.slice(0, 8).map((color, index) => (
            <div
              key={index}
              className="flex-1"
              style={{ backgroundColor: color.hex }}
              title={color.name ?? color.hex}
            />
          ))
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{palette.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-400">{palette.colors.length} colors</span>
          {group && (
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: (group.color ?? '#6366f1') + '22',
                color: group.color ?? '#6366f1',
              }}
            >
              {group.name}
            </span>
          )}
          {paletteTags.map((tag) => (
            <Badge key={tag.id} color={tag.color}>{tag.name}</Badge>
          ))}
        </div>
      </div>

      {palette.comments.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          {palette.comments.length}
        </div>
      )}

      <div className="flex items-center gap-1 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
        <button
          onClick={() => onEdit(palette)}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-200"
          aria-label="Edit palette"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(palette.id)}
          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
          aria-label="Delete palette"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export function PaletteGrid({
  palettes,
  groups,
  tags,
  viewMode,
  onDeletePalette,
  onEditPalette,
}: PaletteGridProps): JSX.Element {
  if (palettes.length === 0) return <EmptyState />

  const groupsById = Object.fromEntries(groups.map((group) => [group.id, group]))

  if (viewMode === 'list') {
    return (
      <div className="divide-y divide-gray-100">
        {palettes.map((palette) => (
          <PaletteListRow
            key={palette.id}
            palette={palette}
            group={palette.groupId ? groupsById[palette.groupId] : undefined}
            tags={tags}
            onDelete={onDeletePalette}
            onEdit={onEditPalette}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 md:grid-cols-3 xl:grid-cols-4">
      {palettes.map((palette) => (
        <PaletteCard
          key={palette.id}
          palette={palette}
          group={palette.groupId ? groupsById[palette.groupId] : undefined}
          tags={tags}
          onDelete={onDeletePalette}
          onEdit={onEditPalette}
        />
      ))}
    </div>
  )
}
