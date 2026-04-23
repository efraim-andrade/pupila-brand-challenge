'use client'

import { useState, useCallback, type JSX } from 'react'
import { Modal } from '@/shared/ui/Modal'
import type { Color, ColorPalette } from '@/types'

interface PaletteViewModalProps {
  open: boolean
  palette: ColorPalette | null
  onClose: () => void
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

export function PaletteViewModal({ open, palette, onClose }: PaletteViewModalProps): JSX.Element {
  const [copiedHex, setCopiedHex] = useState<string | null>(null)

  const handleCopy = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopiedHex(hex)
      setTimeout(() => setCopiedHex(null), 1500)
    })
  }, [])

  return (
    <Modal open={open} onClose={onClose} title={palette?.name} size="2xl">
      {palette && (
        <div className="-mx-6 -mb-6 -mt-2">
          {palette.colors.length === 0 ? (
            <div className="flex h-48 items-center justify-center bg-gray-50">
              <p className="text-sm text-gray-400">No colors in this palette</p>
            </div>
          ) : (
            <div className="flex h-72 overflow-hidden rounded-b-xl">
              {palette.colors.map((color, index) => (
                <ColorStripe
                  key={index}
                  color={color}
                  justCopied={copiedHex === color.hex}
                  onCopy={handleCopy}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
