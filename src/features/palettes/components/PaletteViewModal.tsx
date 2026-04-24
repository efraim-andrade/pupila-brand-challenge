'use client';

import { Copy, Folder, X } from 'lucide-react';
import { type JSX, useCallback, useMemo, useState } from 'react';
import { exportPaletteToJSON } from '@/lib/exportImport';
import { CommentsSection } from '@/shared/components/comments';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import type { Color, ColorPalette, Group, Tag } from '@/types';

interface PaletteViewModalProps {
  open: boolean;
  palette: ColorPalette | null;
  group: Group | undefined;
  tags: Tag[];
  onClose: () => void;
  onEdit: (palette: ColorPalette) => void;
  onDelete: (id: string) => void;
  onAddComment: (text: string) => void;
  onUpdateComment: (commentId: string, text: string) => void;
  onDeleteComment: (commentId: string) => void;
}

interface ColorStripeProps {
  color: Color;
  justCopied: boolean;
  onCopy: (hex: string) => void;
}

function ColorStripe({
  color,
  justCopied,
  onCopy,
}: ColorStripeProps): JSX.Element {
  return (
    <div
      className="group relative flex-1 cursor-pointer"
      style={{ backgroundColor: color.hex }}
      onClick={() => onCopy(color.hex)}
      title={`Click to copy ${color.hex}`}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 transition-all duration-150 group-hover:bg-black/40">
        {justCopied ? (
          <span className="text-sm font-semibold text-white drop-shadow">
            Copied!
          </span>
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
            <Copy className="mt-2 h-4 w-4 text-white/0 drop-shadow transition-all duration-150 group-hover:text-white/70" />
          </>
        )}
      </div>
    </div>
  );
}

export function PaletteViewModal({
  open,
  palette,
  group,
  tags,
  onClose,
  onEdit,
  onDelete,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: PaletteViewModalProps): JSX.Element | null {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopy = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 1500);
    });
  }, []);

  const paletteTags = useMemo(
    () =>
      palette ? tags.filter((tag) => palette.tagIds.includes(tag.id)) : [],
    [tags, palette]
  );

  if (!open || !palette) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-h-[92vh] max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[60vh] sm:flex-row"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Color stripes */}
        <div className="flex h-36 flex-shrink-0 overflow-hidden sm:h-auto sm:min-h-0 sm:flex-1">
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
        <div className="flex min-h-0 flex-1 flex-col border-t border-gray-100 sm:w-72 sm:flex-none sm:border-l sm:border-t-0">
          {/* Header */}
          <div className="border-b border-gray-100 p-4">
            <p className="text-sm font-semibold text-gray-900">
              {palette.name}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              {palette.colors.length} color
              {palette.colors.length !== 1 ? 's' : ''}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {group && (
                <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                  <Folder className="h-2.5 w-2.5" />
                  {group.name}
                </span>
              )}
              {paletteTags.map((tag) => (
                <Badge key={tag.id} color={tag.color}>
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Comments (scrollable) */}
          <CommentsSection
            comments={palette.comments}
            onAdd={onAddComment}
            onUpdate={onUpdateComment}
            onDelete={onDeleteComment}
            compact
            scrollable
            className="p-4"
          />

          {/* Footer actions */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => exportPaletteToJSON(palette)}
                aria-label="Export palette"
              >
                <svg
                  className="h-4 w-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
                Export
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 justify-center"
                  onClick={() => onEdit(palette)}
                  aria-label="Edit palette"
                >
                  <svg
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                    />
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
                  <svg
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
