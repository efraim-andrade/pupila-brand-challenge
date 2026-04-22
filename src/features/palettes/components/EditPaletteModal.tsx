'use client'

import { useState, useMemo, useEffect, type JSX, type FormEvent, type ChangeEvent } from 'react'
import { Modal } from '@/shared/ui/Modal'
import { CommentsSection } from '@/shared/components/CommentsSection'
import { useAppStore } from '@/store'
import { ColorEditor, type ColorItem, createColorItem } from './ColorEditor'
import { isValidHex } from '@/lib/colorUtils'
import type { ColorPalette, Group, Tag } from '@/types'

interface EditPaletteModalProps {
  open: boolean
  palette: ColorPalette | null
  onClose: () => void
}

function GroupSelector({
  groups,
  selectedGroupId,
  onSelect,
}: {
  groups: Group[]
  selectedGroupId: string | null
  onSelect: (groupId: string | null) => void
}): JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="edit-palette-group" className="text-sm font-medium text-gray-700">
        Group
      </label>
      <select
        id="edit-palette-group"
        value={selectedGroupId ?? ''}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => onSelect(event.target.value || null)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="">No group</option>
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
      </select>
    </div>
  )
}

function TagPicker({
  tags,
  selectedTagIds,
  onToggle,
}: {
  tags: Tag[]
  selectedTagIds: string[]
  onToggle: (tagId: string) => void
}): JSX.Element {
  if (tags.length === 0) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-gray-700">Tags</span>
        <p className="text-xs text-gray-400">No tags available yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-700">Tags</span>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id)
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onToggle(tag.id)}
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
  )
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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
