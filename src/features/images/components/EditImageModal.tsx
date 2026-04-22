'use client'

import { useState, useMemo, useEffect, type JSX, type FormEvent, type ChangeEvent } from 'react'
import { Modal } from '@/shared/ui/Modal'
import { CommentsSection } from '@/shared/components/CommentsSection'
import { useAppStore } from '@/store'
import type { Image, Group, Tag } from '@/types'

interface EditImageModalProps {
  open: boolean
  image: Image | null
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
      <label htmlFor="edit-image-group" className="text-sm font-medium text-gray-700">
        Group
      </label>
      <select
        id="edit-image-group"
        value={selectedGroupId ?? ''}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          onSelect(event.target.value || null)
        }
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

export function EditImageModal({ open, image, onClose }: EditImageModalProps): JSX.Element {
  const updateImage = useAppStore((store) => store.updateImage)
  const addImageComment = useAppStore((store) => store.addImageComment)
  const updateImageComment = useAppStore((store) => store.updateImageComment)
  const deleteImageComment = useAppStore((store) => store.deleteImageComment)
  const allGroups = useAppStore((store) => store.groups)
  const allTags = useAppStore((store) => store.tags)

  const liveImage = useAppStore((store) => store.images.find((img) => img.id === image?.id))

  const imageGroups = useMemo(
    () => allGroups.filter((group) => group.type === 'image' || group.type === 'shared'),
    [allGroups]
  )

  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [urlError, setUrlError] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  useEffect(() => {
    if (open && image) {
      setUrl(image.url)
      setName(image.name)
      setUrlError('')
      setSelectedGroupId(image.groupId)
      setSelectedTagIds(image.tagIds)
    }
  }, [open, image])

  const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value)
    setUrlError('')
  }

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

    try {
      new URL(url)
    } catch {
      setUrlError('Please enter a valid URL.')
      return
    }

    updateImage(image.id, {
      url: url.trim(),
      name: name.trim() || 'Untitled',
      groupId: selectedGroupId,
      tagIds: selectedTagIds,
    })

    onClose()
  }

  const comments = liveImage?.comments ?? []

  return (
    <Modal open={open} onClose={onClose} title="Edit image" size="xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="edit-image-url" className="text-sm font-medium text-gray-700">
            Image URL
          </label>
          <input
            id="edit-image-url"
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://example.com/photo.jpg"
            autoFocus
            className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 ${
              urlError
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          />
          {urlError && <p className="text-xs text-red-500">{urlError}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="edit-image-name" className="text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="edit-image-name"
            type="text"
            value={name}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
            placeholder="My image"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {url && !urlError && (
          <div className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="Preview"
              className="mx-auto max-h-40 w-full object-contain"
              onError={(event) => {
                event.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}

        <GroupSelector
          groups={imageGroups}
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
            onAdd={(text) => image && addImageComment(image.id, text)}
            onUpdate={(commentId, text) => image && updateImageComment(image.id, commentId, text)}
            onDelete={(commentId) => image && deleteImageComment(image.id, commentId)}
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
            disabled={!url.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save changes
          </button>
        </div>
      </form>
    </Modal>
  )
}
