'use client'

import { useState, type JSX, type KeyboardEvent, type ChangeEvent } from 'react'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { useAppStore } from '@/store'

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

type Tab = 'groups' | 'tags'

interface EditingState {
  id: string
  name: string
  color: string
}

interface CreatingState {
  name: string
  color: string
}

interface ConfigurationModalProps {
  open: boolean
  onClose: () => void
}

export function ConfigurationModal({ open, onClose }: ConfigurationModalProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>('groups')

  const groups = useAppStore((store) => store.groups)
  const tags = useAppStore((store) => store.tags)
  const images = useAppStore((store) => store.images)
  const palettes = useAppStore((store) => store.palettes)
  const addGroup = useAppStore((store) => store.addGroup)
  const updateGroup = useAppStore((store) => store.updateGroup)
  const deleteGroup = useAppStore((store) => store.deleteGroup)
  const addTag = useAppStore((store) => store.addTag)
  const updateTag = useAppStore((store) => store.updateTag)
  const deleteTag = useAppStore((store) => store.deleteTag)

  const [editing, setEditing] = useState<EditingState | null>(null)
  const [creating, setCreating] = useState<CreatingState | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const resetTabState = () => {
    setEditing(null)
    setCreating(null)
    setPendingDeleteId(null)
  }

  const handleTabChange = (tab: Tab) => {
    resetTabState()
    setActiveTab(tab)
  }

  const groupUsageCount = (groupId: string) =>
    images.filter((i) => i.groupId === groupId).length +
    palettes.filter((p) => p.groupId === groupId).length

  const tagUsageCount = (tagId: string) =>
    images.filter((i) => i.tagIds.includes(tagId)).length +
    palettes.filter((p) => p.tagIds.includes(tagId)).length

  const startEditing = (id: string) => {
    const item =
      activeTab === 'groups'
        ? groups.find((g) => g.id === id)
        : tags.find((t) => t.id === id)
    if (!item) return
    setEditing({ id, name: item.name, color: item.color ?? PRESET_COLORS[0] })
  }

  const commitEdit = () => {
    if (!editing) return
    const trimmed = editing.name.trim()
    if (trimmed) {
      if (activeTab === 'groups') updateGroup(editing.id, { name: trimmed, color: editing.color })
      else updateTag(editing.id, { name: trimmed, color: editing.color })
    }
    setEditing(null)
  }

  const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') { event.preventDefault(); commitEdit() }
    if (event.key === 'Escape') setEditing(null)
  }

  const commitCreate = () => {
    if (!creating) return
    const trimmed = creating.name.trim()
    if (trimmed) {
      if (activeTab === 'groups') addGroup({ name: trimmed, type: 'shared', color: creating.color })
      else addTag({ name: trimmed, color: creating.color })
    }
    setCreating(null)
  }

  const handleCreateKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') { event.preventDefault(); commitCreate() }
    if (event.key === 'Escape') setCreating(null)
  }

  const handleDelete = (id: string) => {
    if (activeTab === 'groups') deleteGroup(id)
    else deleteTag(id)
    setPendingDeleteId(null)
  }

  const items = activeTab === 'groups' ? groups : tags
  const usageCount = activeTab === 'groups' ? groupUsageCount : tagUsageCount
  const deleteWarning = (id: string) => {
    const count = usageCount(id)
    if (count === 0) return null
    return activeTab === 'groups'
      ? `${count} item${count !== 1 ? 's' : ''} will be ungrouped`
      : `removed from ${count} item${count !== 1 ? 's' : ''}`
  }

  const newItemPlaceholder = activeTab === 'groups' ? 'Group name' : 'Tag name'
  const newItemLabel = activeTab === 'groups' ? 'New group' : 'New tag'

  return (
    <Modal open={open} onClose={onClose} title="Configuration" size="md">
      <div className="flex flex-col gap-4">
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {(['groups', 'tags'] as Tab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {items.length === 0 && !creating ? (
            <p className="py-6 text-center text-sm text-gray-400">
              No {activeTab} yet. Create one below.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {items.map((item) => {
                const isEditing = editing?.id === item.id
                const isConfirmingDelete = pendingDeleteId === item.id
                const warning = deleteWarning(item.id)
                const count = usageCount(item.id)

                if (isEditing) {
                  return (
                    <li key={item.id} className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50/50 p-2.5">
                      <div className="flex gap-1">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setEditing((prev) => prev ? { ...prev, color } : null)}
                            className={`h-4 w-4 shrink-0 rounded-full transition-transform ${
                              editing.color === color ? 'scale-125 ring-2 ring-gray-400 ring-offset-1' : ''
                            }`}
                            style={{ backgroundColor: color }}
                            aria-label={`Select color ${color}`}
                          />
                        ))}
                      </div>
                      <input
                        type="text"
                        value={editing.name}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setEditing((prev) => prev ? { ...prev, name: event.target.value } : null)
                        }
                        onKeyDown={handleEditKeyDown}
                        autoFocus
                        className="min-w-0 flex-1 rounded border border-gray-200 bg-white px-2 py-1 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <Button
                        type="button"
                        size="xs"
                        className="shrink-0 px-2.5"
                        onClick={commitEdit}
                        disabled={!editing.name.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        className="shrink-0"
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </Button>
                    </li>
                  )
                }

                if (isConfirmingDelete) {
                  return (
                    <li key={item.id} className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                      <span className="flex-1 text-sm text-red-700">
                        Delete &ldquo;{item.name}&rdquo;
                        {warning && <span className="ml-1 text-xs text-red-500">({warning})</span>}
                      </span>
                      <Button
                        type="button"
                        variant="danger"
                        size="xs"
                        className="shrink-0 px-2.5"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        className="shrink-0"
                        onClick={() => setPendingDeleteId(null)}
                      >
                        Cancel
                      </Button>
                    </li>
                  )
                }

                return (
                  <li key={item.id} className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color ?? PRESET_COLORS[0] }}
                    />
                    <span className="flex-1 text-sm text-gray-800">{item.name}</span>
                    {count > 0 && (
                      <span className="text-xs text-gray-400">{count} item{count !== 1 ? 's' : ''}</span>
                    )}
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => startEditing(item.id)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                        aria-label={`Edit ${item.name}`}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(item.id)}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        aria-label={`Delete ${item.name}`}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {creating ? (
            activeTab === 'groups' ? (
              <div className="flex flex-col gap-2 rounded-lg border border-indigo-200 bg-indigo-50/50 p-2.5">
                <input
                  type="text"
                  value={creating.name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setCreating((prev) => prev ? { ...prev, name: event.target.value } : null)
                  }
                  onKeyDown={handleCreateKeyDown}
                  placeholder={newItemPlaceholder}
                  autoFocus
                  className="w-full rounded border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setCreating((prev) => prev ? { ...prev, color } : null)}
                        className={`h-4 w-4 rounded-full transition-transform ${
                          creating.color === color ? 'scale-125 ring-2 ring-gray-400 ring-offset-1' : ''
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                  <div className="ml-auto flex gap-1">
                    <Button type="button" variant="ghost" size="xs" onClick={() => setCreating(null)}>Cancel</Button>
                    <Button type="button" size="xs" onClick={commitCreate} disabled={!creating.name.trim()}>Create</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50/50 p-2.5">
                <div className="flex gap-1">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCreating((prev) => prev ? { ...prev, color } : null)}
                      className={`h-4 w-4 shrink-0 rounded-full transition-transform ${
                        creating.color === color ? 'scale-125 ring-2 ring-gray-400 ring-offset-1' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  value={creating.name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setCreating((prev) => prev ? { ...prev, name: event.target.value } : null)
                  }
                  onKeyDown={handleCreateKeyDown}
                  placeholder={newItemPlaceholder}
                  autoFocus
                  className="min-w-0 flex-1 rounded border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <Button type="button" variant="ghost" size="xs" className="shrink-0" onClick={() => setCreating(null)}>Cancel</Button>
                <Button type="button" size="xs" className="shrink-0" onClick={commitCreate} disabled={!creating.name.trim()}>Create</Button>
              </div>
            )
          ) : (
            <button
              type="button"
              onClick={() => setCreating({ name: '', color: PRESET_COLORS[0] })}
              className="flex items-center gap-1.5 self-start rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 transition-colors hover:border-indigo-400 hover:text-indigo-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {newItemLabel}
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
