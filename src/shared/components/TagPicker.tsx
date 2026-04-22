'use client'

import { useState, type JSX, type KeyboardEvent } from 'react'
import { useAppStore } from '@/store'
import type { Tag } from '@/types'

const PRESET_COLORS = [
  '#6366f1',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#f97316',
  '#14b8a6',
]

interface TagPickerProps {
  tags: Tag[]
  selectedTagIds: string[]
  onToggle: (tagId: string) => void
}

export function TagPicker({ tags, selectedTagIds, onToggle }: TagPickerProps): JSX.Element {
  const addTag = useAppStore((store) => store.addTag)

  const [inputVisible, setInputVisible] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])

  const handleCreate = () => {
    const trimmed = newName.trim()
    if (!trimmed) {
      setInputVisible(false)
      return
    }
    const created = addTag({ name: trimmed, color: newColor })
    onToggle(created.id)
    setNewName('')
    setNewColor(PRESET_COLORS[0])
    setInputVisible(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleCreate()
    }
    if (event.key === 'Escape') {
      setInputVisible(false)
      setNewName('')
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-700">Tags</span>

      <div className="flex flex-wrap items-center gap-1.5">
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

        {inputVisible ? (
          <div className="flex items-center gap-1.5 rounded-xl border border-indigo-300 bg-indigo-50 px-2.5 py-1">
            <div className="flex gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewColor(color)}
                  className={`h-3 w-3 rounded-full transition-transform ${
                    newColor === color ? 'scale-125 ring-2 ring-gray-400 ring-offset-1' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            <input
              type="text"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tag name"
              autoFocus
              className="w-20 bg-transparent text-xs text-gray-900 placeholder-gray-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="text-indigo-600 hover:text-indigo-800 disabled:opacity-40"
              aria-label="Create tag"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => { setInputVisible(false); setNewName('') }}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Cancel"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setInputVisible(true)}
            className="rounded-full border border-dashed border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-400 transition-colors hover:border-indigo-400 hover:text-indigo-600"
          >
            + New tag
          </button>
        )}
      </div>
    </div>
  )
}
