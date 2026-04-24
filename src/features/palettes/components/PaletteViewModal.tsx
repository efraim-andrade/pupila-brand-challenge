'use client'

import { useState, useCallback, type JSX } from 'react'
import type { Color, ColorPalette, Group, Tag } from '@/types'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'

interface PaletteViewModalProps {
  open: boolean
  palette: ColorPalette | null
  group: Group | undefined
  tags: Tag[]
  onClose: () => void
  onEdit: (palette: ColorPalette) => void
  onDelete: (id: string) => void
}

interface ColorStripeProps {
  color: Color
  justCopied: boolean
  onCopy: (hex: string) => void
}

function ColorStripe({ color, justCopied, onCopy }: ColorStripeProps): JSX.Element {
  return (
    <div
      className="group relative flex-1 cursor-pointer"
      style={{ backgroundColor: color.hex }}
      onClick={() => onCopy(color.hex)}
      title={`Click to copy ${color.hex}`}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 transition-all duration-150 group-hover:bg-black/40">
        {justCopied ? (
          <span className="text-sm font-semibold text-white drop-shadow">Copied!</span>
        ) : (
          <>
            <span className="font-mono text-xs font-medium text-white/50 drop-shadow transition-all duration-150 group-hover:text-sm group-hover:font-semibold group-hover:text-white">
              {color.hex}
            </span>
            {color.name && (
              <span className="mt-1 text-center text-xs text-white/30 drop-shadow transition-all duration-150 group-hover:text-white/80">
                {color.name}
              </span>
            )}
            <svg
              className="mt-2 h-4 w-4 text-white/0 drop-shadow transition-all duration-150 group-hover:text-white/70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </>
        )}
      </div>
    </div>
  )
}

export function PaletteViewModal({ open, palette, group, tags, onClose, onEdit, onDelete }: PaletteViewModalProps): JSX.Element | null {
  const [copiedHex, setCopiedHex] = useState<string | null>(null)

  const handleCopy = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopiedHex(hex)
      setTimeout(() => setCopiedHex(null), 1500)
    })
  }, [])

  if (!open || !palette) return null

  const paletteTags = tags.filter((tag) => palette.tagIds.includes(tag.id))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-h-[90vh] max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:h-[50vh] sm:flex-row"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
          aria-label="Close"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Color stripes */}
        <div className="flex min-h-48 flex-1 overflow-hidden sm:min-h-0">
          {palette.colors.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <p className="text-sm text-gray-400">No colors in this palette</p>
            </div>
          ) : (
            palette.colors.map((color, index) => (
              <ColorStripe
                key={index}
                color={color}
                justCopied={copiedHex === color.hex}
                onCopy={handleCopy}
              />
            ))
          )}
        </div>

        {/* Details panel */}
        <div className="flex w-full flex-col border-t border-gray-100 sm:w-72 sm:shrink-0 sm:border-l sm:border-t-0">
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-sm font-semibold text-gray-900">{palette.name}</p>
            <p className="mt-0.5 text-xs text-gray-400">
              {palette.colors.length} color{palette.colors.length !== 1 ? 's' : ''}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {group && (
                <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                  <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                  {group.name}
                </span>
              )}
              {paletteTags.map((tag) => (
                <Badge key={tag.id} color={tag.color}>
                  {tag.name}
                </Badge>
              ))}
            </div>
            {palette.comments.length > 0 && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                <span>{palette.comments.length} comment{palette.comments.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 p-4">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 justify-center"
                onClick={() => onEdit(palette)}
                aria-label="Edit palette"
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                </svg>
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="flex-1 justify-center"
                onClick={() => onDelete(palette.id)}
                aria-label="Delete palette"
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
