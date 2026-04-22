'use client'

import { useState, type JSX, type SyntheticEvent, type ChangeEvent } from 'react'
import { Modal } from '@/shared/ui/Modal'
import { GroupSelector } from '@/shared/components/GroupSelector'
import { TagPicker } from '@/shared/components/TagPicker'
import { useAppStore } from '@/store'

interface AddImageModalProps {
  open: boolean
  onClose: () => void
}

function deriveNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname
    const filename = pathname.split('/').filter(Boolean).pop() ?? ''
    return filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
  } catch {
    return ''
  }
}

export function AddImageModal({ open, onClose }: AddImageModalProps): JSX.Element {
  const addImage = useAppStore((store) => store.addImage)
  const allGroups = useAppStore((store) => store.groups)
  const allTags = useAppStore((store) => store.tags)


  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [urlError, setUrlError] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextUrl = event.target.value
    setUrl(nextUrl)
    setUrlError('')
    if (!name) {
      setName(deriveNameFromUrl(nextUrl))
    }
  }

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((previous) =>
      previous.includes(tagId)
        ? previous.filter((id) => id !== tagId)
        : [...previous, tagId]
    )
  }

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      new URL(url)
    } catch {
      setUrlError('Please enter a valid URL.')
      return
    }

    addImage({
      url: url.trim(),
      name: name.trim() || deriveNameFromUrl(url) || 'Untitled',
      groupId: selectedGroupId,
      tagIds: selectedTagIds,
      comments: [],
    })

    resetForm()
    onClose()
  }

  const resetForm = () => {
    setUrl('')
    setName('')
    setUrlError('')
    setSelectedGroupId(null)
    setSelectedTagIds([])
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add image" size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="image-url" className="text-sm font-medium text-gray-700">
            Image URL
          </label>
          <input
            id="image-url"
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
          <label htmlFor="image-name" className="text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="image-name"
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
          groups={allGroups}
          selectedGroupId={selectedGroupId}
          onSelect={setSelectedGroupId}

          inputId="image-group"
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
            disabled={!url.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add image
          </button>
        </div>
      </form>
    </Modal>
  )
}
