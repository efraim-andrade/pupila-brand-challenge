'use client'

import { useState, type JSX, type SyntheticEvent, type ChangeEvent } from 'react'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { GroupSelector } from '@/shared/components/GroupSelector'
import { TagPicker } from '@/shared/components/TagPicker'
import { useAppStore } from '@/store'
import { ColorEditor, type ColorItem } from './ColorEditor'
import { colorItemsToColors, toggleTagId } from '../lib/colorEditorUtils'

interface AddPaletteModalProps {
  open: boolean
  onClose: () => void
}

export function AddPaletteModal({ open, onClose }: AddPaletteModalProps): JSX.Element {
  const addPalette = useAppStore((store) => store.addPalette)
  const allGroups = useAppStore((store) => store.groups)
  const allTags = useAppStore((store) => store.tags)


  const [name, setName] = useState('')
  const [colorItems, setColorItems] = useState<ColorItem[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((previous) => toggleTagId(previous, tagId))
  }

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    addPalette({
      name: name.trim() || 'Untitled',
      colors: colorItemsToColors(colorItems),
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
          groups={allGroups}
          selectedGroupId={selectedGroupId}
          onSelect={setSelectedGroupId}

          inputId="palette-group"
        />

        <TagPicker
          tags={allTags}
          selectedTagIds={selectedTagIds}
          onToggle={handleTagToggle}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">
            Create palette
          </Button>
        </div>
      </form>
    </Modal>
  )
}
