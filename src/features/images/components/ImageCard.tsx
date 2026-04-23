'use client'

import type { JSX } from 'react'
import type { Image, Group, Tag } from '@/types'
import { Badge } from '@/shared/ui/Badge'
import { Card } from '@/shared/ui/Card'

interface ImageCardProps {
  image: Image
  group: Group | undefined
  tags: Tag[]
  onDelete: (id: string) => void
  onEdit: (image: Image) => void
  onExpand: (image: Image) => void
  onCreatePalette: (image: Image) => void
}

export function ImageCard({ image, group, tags, onDelete, onEdit, onExpand, onCreatePalette }: ImageCardProps): JSX.Element {
  const imageTags = tags.filter((tag) => image.tagIds.includes(tag.id))

  return (
    <Card>
      <div
        className="relative aspect-video cursor-pointer overflow-hidden bg-gray-100"
        onClick={() => onExpand(image)}
        role="button"
        tabIndex={0}
        aria-label={`Expand ${image.name}`}
        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onExpand(image) }}
      >
        <img
          src={image.url}
          alt={image.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = `https://placehold.co/400x300/e2e8f0/94a3b8?text=${encodeURIComponent(image.name)}`
          }}
        />
        <div className="absolute inset-0 flex items-start justify-end gap-1 bg-black/0 p-2 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
          <button
            onClick={(event) => { event.stopPropagation(); onCreatePalette(image) }}
            className="rounded-lg bg-white/90 p-1.5 text-indigo-600 shadow-sm hover:bg-white"
            aria-label="Create palette from image"
            title="Create palette from image"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
            </svg>
          </button>
          <button
            onClick={(event) => { event.stopPropagation(); onEdit(image) }}
            className="rounded-lg bg-white/90 p-1.5 text-gray-700 shadow-sm hover:bg-white"
            aria-label="Edit image"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
          </button>
          <button
            onClick={(event) => { event.stopPropagation(); onDelete(image.id) }}
            className="rounded-lg bg-white/90 p-1.5 text-red-600 shadow-sm hover:bg-white"
            aria-label="Delete image"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-3">
        <p className="truncate text-sm font-medium text-gray-900">{image.name}</p>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {group && (
            <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600">
              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              {group.name}
            </span>
          )}
          {imageTags.map((tag) => (
            <Badge key={tag.id} color={tag.color}>
              {tag.name}
            </Badge>
          ))}
        </div>

        {image.comments.length > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            <span>{image.comments.length} comment{image.comments.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
