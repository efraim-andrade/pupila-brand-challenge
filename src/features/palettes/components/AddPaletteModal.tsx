'use client'

import { useState, useMemo, type JSX, type FormEvent, type ChangeEvent } from 'react'
import { Modal } from '@/shared/ui/Modal'
import { useAppStore } from '@/store'
import { ColorEditor, type ColorItem } from './ColorEditor'
import { isValidHex } from '@/lib/colorUtils'
import type { Group, Tag } from '@/types'

interface AddPaletteModalProps {
  open: boolean
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
      <label htmlFor="palette-group" className="text-sm font-medium text-gray-700">
        Group
      </label>
      <select
        id="palette-group"
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

export function AddPaletteModal({ open, onClose }: AddPaletteModalProps): JSX.Element {
  const addPalette = useAppStore((store) => store.addPalette)
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

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((previous) =>
      previous.includes(tagId)
        ? previous.filter((id) => id !== tagId)
        : [...previous, tagId]
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    addPalette({
      name: name.trim() || 'Untitled',
      colors: colorItems
        .filter((item) => isValidHex(item.hex))
        .map((item) => ({ hex: item.hex, ...(item.name ? { name: item.name } : {}) })),
      groupId: selectedGroupId,
      tagIds: selectedTagIds,
      comments: [],
    })

    resetForm()
    onClose()
  }

  const resetForm = () => {
    setName('')
    setColorItems([])
    setSelectedGroupId(null)
    setSelectedTagIds([])
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="New palette" size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="palette-name" className="text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="palette-name"
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
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Create palette
          </button>
        </div>
      </form>
    </Modal>
  )
}
