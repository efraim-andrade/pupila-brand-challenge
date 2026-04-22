'use client'

import { useState, useEffect, useMemo, type JSX, type FormEvent, type ChangeEvent } from 'react'
import { nanoid } from 'nanoid'
import { Modal } from '@/shared/ui/Modal'
import { useAppStore } from '@/store'
import { ColorEditor, type ColorItem } from '@/features/palettes/components/ColorEditor'
import { extractDominantColors, isValidHex } from '@/lib/colorUtils'
import type { Image } from '@/types'

interface CreatePaletteFromImageModalProps {
  open: boolean
  image: Image | null
  onClose: () => void
}

function ExtractionStatus({ isExtracting }: { isExtracting: boolean }): JSX.Element | null {
  if (!isExtracting) return null
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Extracting colors…
    </div>
  )
}

export function CreatePaletteFromImageModal({ open, image, onClose }: CreatePaletteFromImageModalProps): JSX.Element {
  const addPalette = useAppStore((store) => store.addPalette)
  const updateImage = useAppStore((store) => store.updateImage)
  const allGroups = useAppStore((store) => store.groups)
  const allTags = useAppStore((store) => store.tags)

  const paletteGroups = useMemo(
    () => allGroups.filter((group) => group.type === 'palette' || group.type === 'shared'),
    [allGroups]
  )

  const [name, setName] = useState('')
  const [colorItems, setColorItems] = useState<ColorItem[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [isExtracting, setIsExtracting] = useState(false)

  useEffect(() => {
    if (!open || !image) return

    setName(image.name)
    setColorItems([])
    setSelectedGroupId(null)
    setSelectedTagIds([])
    setIsExtracting(true)

    extractDominantColors(image.url).then((hexColors) => {
      setColorItems(hexColors.map((hex) => ({ id: nanoid(), hex, name: '' })))
      setIsExtracting(false)
    })
  }, [open, image])

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((previous) =>
      previous.includes(tagId)
        ? previous.filter((id) => id !== tagId)
        : [...previous, tagId]
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!image) return

    const palette = {
      name: name.trim() || `${image.name} palette`,
      colors: colorItems
        .filter((item) => isValidHex(item.hex))
        .map((item) => ({ hex: item.hex, ...(item.name ? { name: item.name } : {}) })),
      groupId: selectedGroupId,
      tagIds: selectedTagIds,
      comments: [],
      sourceImageId: image.id,
    }

    addPalette(palette)

    const createdPaletteIdPlaceholder = image.extractedPaletteId
    if (!createdPaletteIdPlaceholder) {
      updateImage(image.id, { extractedPaletteId: 'pending' })
    }

    onClose()
  }

  const handleClose = () => {
    setName('')
    setColorItems([])
    setSelectedGroupId(null)
    setSelectedTagIds([])
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Create palette from image" size="lg">
      {image && (
        <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          <img
            src={image.url}
            alt={image.name}
            className="h-36 w-full object-cover"
            onError={(event) => {
              event.currentTarget.src = `https://placehold.co/600x200/e2e8f0/94a3b8?text=${encodeURIComponent(image.name)}`
            }}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="palette-name-from-image" className="text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="palette-name-from-image"
            type="text"
            value={name}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
            placeholder="My palette"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Colors</span>
            <ExtractionStatus isExtracting={isExtracting} />
          </div>
          <ColorEditor items={colorItems} onChange={setColorItems} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="palette-group-from-image" className="text-sm font-medium text-gray-700">
            Group
          </label>
          <select
            id="palette-group-from-image"
            value={selectedGroupId ?? ''}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => setSelectedGroupId(event.target.value || null)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">No group</option>
            {paletteGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Tags</span>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id)
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                      isSelected
                        ? 'border-transparent bg-indigo-100 text-indigo-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {tag.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isExtracting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Create palette
          </button>
        </div>
      </form>
    </Modal>
  )
}
