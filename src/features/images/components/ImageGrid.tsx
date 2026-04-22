'use client'

import { useState, type JSX } from 'react'
import type { Image, Group, Tag, ViewMode } from '@/types'
import { Badge } from '@/shared/ui/Badge'
import { ImageCard } from './ImageCard'
import { ImageLightbox } from './ImageLightbox'

interface ImageGridProps {
  images: Image[]
  groups: Group[]
  tags: Tag[]
  viewMode: ViewMode
  onDeleteImage: (id: string) => void
  onEditImage: (image: Image) => void
  onCreatePalette: (image: Image) => void
}

function EmptyState(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5A.75.75 0 0121 3.75v16.5a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V3.75A.75.75 0 013.75 3z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-700">No images found</p>
      <p className="mt-1 text-xs text-gray-400">Try adjusting your filters or add a new image</p>
    </div>
  )
}

interface ImageListRowProps {
  image: Image
  group: Group | undefined
  tags: Tag[]
  onDelete: (id: string) => void
  onEdit: (image: Image) => void
  onExpand: (image: Image) => void
}

function ImageListRow({ image, group, tags, onDelete, onEdit, onExpand }: ImageListRowProps): JSX.Element {
  const imageTags = tags.filter((tag) => image.tagIds.includes(tag.id))

  return (
    <div className="group flex items-center gap-4 px-6 py-3 hover:bg-gray-50">
      <button
        className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100"
        onClick={() => onExpand(image)}
        aria-label={`Expand ${image.name}`}
      >
        <img
          src={image.url}
          alt={image.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = `https://placehold.co/80x56/e2e8f0/94a3b8?text=${encodeURIComponent(image.name)}`
          }}
        />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{image.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {group && (
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: (group.color ?? '#6366f1') + '22',
                color: group.color ?? '#6366f1',
              }}
            >
              {group.name}
            </span>
          )}
          {imageTags.map((tag) => (
            <Badge key={tag.id} color={tag.color}>{tag.name}</Badge>
          ))}
        </div>
      </div>

      {image.comments.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          {image.comments.length}
        </div>
      )}

      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onEdit(image)}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-200"
          aria-label="Edit image"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(image.id)}
          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
          aria-label="Delete image"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export function ImageGrid({
  images,
  groups,
  tags,
  viewMode,
  onDeleteImage,
  onEditImage,
  onCreatePalette,
}: ImageGridProps): JSX.Element {
  const [expandedImage, setExpandedImage] = useState<Image | null>(null)

  if (images.length === 0) return <EmptyState />

  const groupsById = Object.fromEntries(groups.map((group) => [group.id, group]))

  return (
    <>
      {viewMode === 'list' ? (
        <div className="divide-y divide-gray-100">
          {images.map((image) => (
            <ImageListRow
              key={image.id}
              image={image}
              group={image.groupId ? groupsById[image.groupId] : undefined}
              tags={tags}
              onDelete={onDeleteImage}
              onEdit={onEditImage}
              onExpand={setExpandedImage}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-3 xl:grid-cols-4">
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              group={image.groupId ? groupsById[image.groupId] : undefined}
              tags={tags}
              onDelete={onDeleteImage}
              onEdit={onEditImage}
              onExpand={setExpandedImage}
              onCreatePalette={onCreatePalette}
            />
          ))}
        </div>
      )}

      {expandedImage && (
        <ImageLightbox
          image={expandedImage}
          group={expandedImage.groupId ? groupsById[expandedImage.groupId] : undefined}
          tags={tags}
          onClose={() => setExpandedImage(null)}
        />
      )}
    </>
  )
}
