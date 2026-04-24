'use client';

import { Folder, Palette, Pencil, Trash2, X } from 'lucide-react';
import { type JSX, useEffect, useMemo } from 'react';
import { CommentsSection } from '@/shared/components/comments';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import type { Group, Image, Tag } from '@/types';

interface ImageLightboxProps {
  image: Image;
  group: Group | undefined;
  tags: Tag[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (image: Image) => void;
  onCreatePalette: (image: Image) => void;
  onAddComment: (text: string) => void;
  onUpdateComment: (commentId: string, text: string) => void;
  onDeleteComment: (commentId: string) => void;
}

export function ImageLightbox({
  image,
  group,
  tags,
  onClose,
  onDelete,
  onEdit,
  onCreatePalette,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: ImageLightboxProps): JSX.Element {
  const imageTags = useMemo(
    () => tags.filter((tag) => image.tagIds.includes(tag.id)),
    [tags, image.tagIds]
  );

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-h-[92vh] max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[60vh] sm:flex-row sm:items-stretch"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
          aria-label="Close lightbox"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image area */}
        <div className="flex h-48 flex-shrink-0 items-center justify-center overflow-hidden bg-gray-900 sm:h-auto sm:min-h-0 sm:flex-1">
          <img
            src={image.url}
            alt={image.name}
            className="max-h-[55vh] w-full object-contain sm:max-h-full"
            onError={(event) => {
              event.currentTarget.src = `https://placehold.co/800x600/e2e8f0/94a3b8?text=${encodeURIComponent(image.name)}`;
            }}
          />
        </div>

        {/* Details panel */}
        <div className="flex min-h-0 flex-1 flex-col border-t border-gray-100 sm:w-72 sm:flex-none sm:border-l sm:border-t-0">
          {/* Header */}
          <div className="border-b border-gray-100 p-4">
            <p className="text-sm font-semibold text-gray-900">{image.name}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {group && (
                <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                  <Folder className="h-2.5 w-2.5" />
                  {group.name}
                </span>
              )}
              {imageTags.map((tag) => (
                <Badge key={tag.id} color={tag.color}>
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Comments (scrollable) */}
          <CommentsSection
            comments={image.comments}
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
                onClick={() => onCreatePalette(image)}
                aria-label="Create palette from image"
              >
                <Palette className="h-4 w-4 shrink-0" />
                Create palette
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 justify-center"
                  onClick={() => onEdit(image)}
                  aria-label="Edit image"
                >
                  <Pencil className="h-4 w-4 shrink-0" />
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1 justify-center"
                  onClick={() => onDelete(image.id)}
                  aria-label="Delete image"
                >
                  <Trash2 className="h-4 w-4 shrink-0" />
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
