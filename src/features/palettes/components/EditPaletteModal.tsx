'use client'

import { useState, useMemo, useEffect, type JSX, type SyntheticEvent, type ChangeEvent } from 'react'
import { Modal } from '@/shared/ui/Modal'
import { CommentsSection } from '@/shared/components/CommentsSection'
import { GroupSelector } from '@/shared/components/GroupSelector'
import { TagPicker } from '@/shared/components/TagPicker'
import { useAppStore } from '@/store'
import { ColorEditor, type ColorItem, createColorItem } from './ColorEditor'
import { isValidHex } from '@/lib/colorUtils'
import type { ColorPalette } from '@/types'

interface EditPaletteModalProps {
  open: boolean
  palette: ColorPalette | null
  onClose: () => void
}

export function EditPaletteModal({ open, palette, onClose }: EditPaletteModalProps): JSX.Element {
  const updatePalette = useAppStore((store) => store.updatePalette)
  const addPaletteComment = useAppStore((store) => store.addPaletteComment)
  const updatePaletteComment = useAppStore((store) => store.updatePaletteComment)
  const deletePaletteComment = useAppStore((store) => store.deletePaletteComment)
  const allGroups = useAppStore((store) => store.groups)
  const allTags = useAppStore((store) => store.tags)

  const livePalette = useAppStore((store) =>
    store.palettes.find((p) => p.id === palette?.id)
  )

  const paletteGroups = useMemo(
    () => allGroups.filter((group) => group.type === 'palette' || group.type === 'shared'),
    [allGroups]
  )

  const [name, setName] = useState('')
  const [colorItems, setColorItems] = useState<ColorItem[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  useEffect(() => {
    if (open && palette) {
      setName(palette.name)
      setColorItems(
        palette.colors.map((color) => createColorItem(color.hex))
          .map((item, index) => ({
            ...item,
            name: palette.colors[index]?.name ?? '',
          }))
      )
      setSelectedGroupId(palette.groupId)
      setSelectedTagIds(palette.tagIds)
    }
  }, [open, palette])

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((previous) =>
      previous.includes(tagId)
        ? previous.filter((id) => id !== tagId)
        : [...previous, tagId]
    )
  }

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!palette) return

    updatePalette(palette.id, {
      name: name.trim() || 'Untitled',
      colors: colorItems
        .filter((item) => isValidHex(item.hex))
        .map((item) => ({ hex: item.hex, ...(item.name ? { name: item.name } : {}) })),
      groupId: selectedGroupId,
      tagIds: selectedTagIds,
    })

    onClose()
  }

  const comments = livePalette?.comments ?? []

  return (
    <Modal open={open} onClose={onClose} title="Edit palette" size="xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="edit-palette-name" className="text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="edit-palette-name"
            type="text"
            value={name}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
            placeholder="My palette"
            autoFocus
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Colors</span>
          <ColorEditor items={colorItems} onChange={setColorItems} />
        </div>

        <GroupSelector
          groups={paletteGroups}
          selectedGroupId={selectedGroupId}
          onSelect={setSelectedGroupId}
          groupType="palette"
          inputId="edit-palette-group"
        />

        <TagPicker
          tags={allTags}
          selectedTagIds={selectedTagIds}
          onToggle={handleTagToggle}
        />

        <div className="border-t border-gray-100 pt-4">
          <CommentsSection
            comments={comments}
            onAdd={(text) => palette && addPaletteComment(palette.id, text)}
            onUpdate={(commentId, text) => palette && updatePaletteComment(palette.id, commentId, text)}
            onDelete={(commentId) => palette && deletePaletteComment(palette.id, commentId)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Save changes
          </button>
        </div>
      </form>
    </Modal>
  )
}
