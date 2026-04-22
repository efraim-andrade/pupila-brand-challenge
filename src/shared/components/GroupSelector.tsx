'use client'

import { useState, type JSX, type ChangeEvent, type KeyboardEvent } from 'react'
import { useAppStore } from '@/store'
import type { Group } from '@/types'

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

interface GroupSelectorProps {
  groups: Group[]
  selectedGroupId: string | null
  onSelect: (groupId: string | null) => void
  groupType: 'image' | 'palette'
  inputId?: string
}

export function GroupSelector({
  groups,
  selectedGroupId,
  onSelect,
  groupType,
  inputId = 'group-select',
}: GroupSelectorProps): JSX.Element {
  const addGroup = useAppStore((store) => store.addGroup)

  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])

  const handleCreate = () => {
    const trimmed = newName.trim()
    if (!trimmed) {
      setCreating(false)
      return
    }
    const created = addGroup({ name: trimmed, type: groupType, color: newColor })
    onSelect(created.id)
    setCreating(false)
    setNewName('')
    setNewColor(PRESET_COLORS[0])
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleCreate()
    }
    if (event.key === 'Escape') {
      setCreating(false)
      setNewName('')
    }
  }

  const handleCancel = () => {
    setCreating(false)
    setNewName('')
    setNewColor(PRESET_COLORS[0])
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        Group
      </label>

      <select
        id={inputId}
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

      {creating ? (
        <div className="flex flex-col gap-2 rounded-lg border border-indigo-200 bg-indigo-50/50 p-2.5">
          <input
            type="text"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Group name"
            autoFocus
            className="w-full rounded border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewColor(color)}
                  className={`h-4 w-4 rounded-full transition-transform ${
                    newColor === color ? 'scale-125 ring-2 ring-gray-400 ring-offset-1' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            <div className="ml-auto flex gap-1">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="self-start text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
        >
          + New group
        </button>
      )}
    </div>
  )
}
