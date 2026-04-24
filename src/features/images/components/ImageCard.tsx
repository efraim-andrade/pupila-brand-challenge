'use client';

import { Palette, Pencil, Trash2 } from 'lucide-react';
import { type JSX, useMemo } from 'react';
import { Card } from '@/shared/ui/Card';
import { CardContent } from '@/shared/ui/CardContent';
import type { Group, Image, Tag } from '@/types';

interface ImageCardProps {
  image: Image;
  group: Group | undefined;
  tags: Tag[];
  onDeleteImage: (id: string) => void;
  onEditImage: (image: Image) => void;
  onExpandImage: (id: string) => void;
  onCreatePalette: (image: Image) => void;
}

export function ImageCard({
  image,
  group,
  tags,
  onDeleteImage,
  onEditImage,
  onExpandImage,
  onCreatePalette,
}: ImageCardProps): JSX.Element {
  const imageTags = useMemo(
    () => tags.filter((tag) => image.tagIds.includes(tag.id)),
    [tags, image.tagIds]
  );

  return (
    <Card>
      <div
        className="relative aspect-video cursor-pointer overflow-hidden bg-gray-100"
        onClick={() => onExpandImage(image.id)}
        role="button"
        tabIndex={0}
        aria-label={`Expand ${image.name}`}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ')
            onExpandImage(image.id);
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
              onEditImage(image);
            }}
            className="rounded-lg bg-white/90 p-1.5 text-gray-700 shadow-sm hover:bg-white"
            aria-label="Edit image"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onDeleteImage(image.id);
            }}
            className="rounded-lg bg-white/90 p-1.5 text-red-600 shadow-sm hover:bg-white"
            aria-label="Delete image"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <CardContent
        name={image.name}
        commentCount={image.comments.length}
        group={group}
        tags={imageTags}
      />
    </Card>
  );
}
