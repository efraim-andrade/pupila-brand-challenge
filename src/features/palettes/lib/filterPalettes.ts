import type { ColorPalette, FilterState } from '@/types'

export function filterPalettes(
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
