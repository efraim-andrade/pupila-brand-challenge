'use client'

import { useMemo } from 'react'
import { useAppStore } from '@/store'
import type { Image, FilterState } from '@/types'
import { filterImages } from '../lib/filterImages'

export { filterImages } from '../lib/filterImages'

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
