'use client'

import { useMemo } from 'react'
import { useAppStore } from '@/store'
import type { ColorPalette, FilterState } from '@/types'

function filterPalettes(
  palettes: ColorPalette[],
  filter: FilterState,
  tagNamesById: Record<string, string>
): ColorPalette[] {
  return palettes.filter((palette) => {
    if (filter.groupId && palette.groupId !== filter.groupId) return false
    if (filter.tagIds.length > 0 && !filter.tagIds.some((tagId) => palette.tagIds.includes(tagId)))
      return false
    if (filter.search) {
      const query = filter.search.toLowerCase()
      const matchesName = palette.name.toLowerCase().includes(query)
      const matchesTags = palette.tagIds.some((tagId) =>
        tagNamesById[tagId]?.toLowerCase().includes(query)
      )
      const matchesComments = palette.comments.some((comment) =>
        comment.text.toLowerCase().includes(query)
      )
      if (!matchesName && !matchesTags && !matchesComments) return false
    }
    return true
  })
}

export function usePalettesPage() {
  const palettes = useAppStore((store) => store.palettes)
  const groups = useAppStore((store) => store.groups)
  const tags = useAppStore((store) => store.tags)
  const filter = useAppStore((store) => store.palettesFilter)
  const viewMode = useAppStore((store) => store.palettesViewMode)
  const setFilter = useAppStore((store) => store.setPalettesFilter)
  const resetFilter = useAppStore((store) => store.resetPalettesFilter)
  const setViewMode = useAppStore((store) => store.setPalettesViewMode)
  const deletePalette = useAppStore((store) => store.deletePalette)
  const openModal = useAppStore((store) => store.openModal)

  const tagNamesById = useMemo(
    () => Object.fromEntries(tags.map((tag) => [tag.id, tag.name])),
    [tags]
  )

  const paletteGroups = useMemo(
    () => groups.filter((group) => group.type === 'palette' || group.type === 'shared'),
    [groups]
  )

  const filteredPalettes = useMemo(
    () => filterPalettes(palettes, filter, tagNamesById),
    [palettes, filter, tagNamesById]
  )

  return {
    palettes: filteredPalettes,
    totalCount: palettes.length,
    groups: paletteGroups,
    tags,
    filter,
    viewMode,
    setFilter,
    resetFilter,
    setViewMode,
    deletePalette,
    openModal,
  }
}
