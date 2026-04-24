'use client';

import { Folder, MessageCircle, Palette, Pencil, Trash2 } from 'lucide-react';
import type { JSX } from 'react';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import type { Group, Image, Tag } from '@/types';

interface ImageCardProps {
  image: Image;
  group: Group | undefined;
  tags: Tag[];
  onDelete: (id: string) => void;
  onEdit: (image: Image) => void;
  onExpand: (id: string) => void;
  onCreatePalette: (image: Image) => void;
}

export function ImageCard({
  image,
  group,
  tags,
  onDelete,
  onEdit,
  onExpand,
  onCreatePalette,
}: ImageCardProps): JSX.Element {
  const imageTags = tags.filter((tag) => image.tagIds.includes(tag.id));

  return (
    <Card>
      <div
        className="relative aspect-video cursor-pointer overflow-hidden bg-gray-100"
        onClick={() => onExpand(image.id)}
        role="button"
        tabIndex={0}
        aria-label={`Expand ${image.name}`}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') onExpand(image.id);
        }}
      >
        <img
          src={image.url}
          alt={image.name}
          width={400}
          height={225}
          loading="lazy"
          fetchPriority="high"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-start justify-end gap-1 bg-black/0 p-2 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
          <button
            onClick={(event) => {
              event.stopPropagation();
              onCreatePalette(image);
            }}
            className="rounded-lg bg-white/90 p-1.5 text-indigo-600 shadow-sm hover:bg-white"
            aria-label="Create palette from image"
            title="Create palette from image"
          >
            <Palette className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onEdit(image);
            }}
            className="rounded-lg bg-white/90 p-1.5 text-gray-700 shadow-sm hover:bg-white"
            aria-label="Edit image"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onDelete(image.id);
            }}
            className="rounded-lg bg-white/90 p-1.5 text-red-600 shadow-sm hover:bg-white"
            aria-label="Delete image"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3">
        <p className="truncate text-sm font-medium text-gray-900">
          {image.name}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {image.comments.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <MessageCircle className="h-3 w-3" />
              {image.comments.length}
            </span>
          )}
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
    </Card>
  );
}
