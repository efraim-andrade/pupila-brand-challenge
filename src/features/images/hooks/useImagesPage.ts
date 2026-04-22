'use client'

import { useMemo } from 'react'
import { useAppStore } from '@/store'
import type { Image, FilterState } from '@/types'

function filterImages(
  images: Image[],
  filter: FilterState,
  tagNamesById: Record<string, string>
): Image[] {
  return images.filter((image) => {
    if (filter.groupId && image.groupId !== filter.groupId) return false
    if (filter.tagIds.length > 0 && !filter.tagIds.some((tagId) => image.tagIds.includes(tagId)))
      return false
    if (filter.search) {
      const query = filter.search.toLowerCase()
      const matchesName = image.name.toLowerCase().includes(query)
      const matchesTags = image.tagIds.some((tagId) =>
        tagNamesById[tagId]?.toLowerCase().includes(query)
      )
      const matchesComments = image.comments.some((comment) =>
        comment.text.toLowerCase().includes(query)
      )
      if (!matchesName && !matchesTags && !matchesComments) return false
    }
    return true
  })
}

export function useImagesPage() {
  const images = useAppStore((store) => store.images)
  const groups = useAppStore((store) => store.groups)
  const tags = useAppStore((store) => store.tags)
  const filter = useAppStore((store) => store.imagesFilter)
  const viewMode = useAppStore((store) => store.imagesViewMode)
  const setFilter = useAppStore((store) => store.setImagesFilter)
  const resetFilter = useAppStore((store) => store.resetImagesFilter)
  const setViewMode = useAppStore((store) => store.setImagesViewMode)
  const deleteImage = useAppStore((store) => store.deleteImage)
  const openModal = useAppStore((store) => store.openModal)

  const tagNamesById = useMemo(
    () => Object.fromEntries(tags.map((tag) => [tag.id, tag.name])),
    [tags]
  )

  const imageGroups = useMemo(
    () => groups.filter((group) => group.type === 'image' || group.type === 'shared'),
    [groups]
  )

  const filteredImages = useMemo(
    () => filterImages(images, filter, tagNamesById),
    [images, filter, tagNamesById]
  )

  return {
    images: filteredImages,
    totalCount: images.length,
    groups: imageGroups,
    tags,
    filter,
    viewMode,
    setFilter,
    resetFilter,
    setViewMode,
    deleteImage,
    openModal,
  }
}
