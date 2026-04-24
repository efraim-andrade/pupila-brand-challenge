'use client'

import { useState, useEffect, type JSX, type SyntheticEvent, type ChangeEvent } from 'react'
import { nanoid } from 'nanoid'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { GroupSelector } from '@/shared/components/GroupSelector'
import { TagPicker } from '@/shared/components/TagPicker'
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

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!image) return

    addPalette({
      name: name.trim() || `${image.name} palette`,
      colors: colorItems
        .filter((item) => isValidHex(item.hex))
        .map((item) => ({ hex: item.hex, ...(item.name ? { name: item.name } : {}) })),
      groupId: selectedGroupId,
      tagIds: selectedTagIds,
      comments: [],
      sourceImageId: image.id,
    })

    if (!image.extractedPaletteId) {
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

        <GroupSelector
          groups={allGroups}
          selectedGroupId={selectedGroupId}
          onSelect={setSelectedGroupId}
          inputId="palette-group-from-image"
        />

        <TagPicker
          tags={allTags}
          selectedTagIds={selectedTagIds}
          onToggle={handleTagToggle}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isExtracting}>
            Create palette
          </Button>
        </div>
      </form>
    </Modal>
  )
}
