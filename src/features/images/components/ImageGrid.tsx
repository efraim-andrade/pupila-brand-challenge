'use client';

import {
  Image as ImageIcon,
  MessageCircle,
  Pencil,
  Trash2,
} from 'lucide-react';
import { type JSX, useCallback, useMemo, useState } from 'react';
import { DEFAULT_GROUP_COLOR } from '@/lib/colors';
import { Badge } from '@/shared/ui/Badge';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { useAppStore } from '@/store';
import type { Group, Image as ImageType, Tag, ViewMode } from '@/types';
import { ImageCard } from './ImageCard';
import { ImageLightbox } from './ImageLightbox';

interface ImageGridProps {
  images: ImageType[];
  groups: Group[];
  tags: Tag[];
  viewMode: ViewMode;
  onDeleteImage: (id: string) => void;
  onEditImage: (image: ImageType) => void;
  onCreatePalette: (image: ImageType) => void;
}

function EmptyState(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <ImageIcon className="h-8 w-8 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-700">No images found</p>
      <p className="mt-1 text-xs text-gray-400">
        Try adjusting your filters or add a new image
      </p>
    </div>
  );
}

interface ImageListRowProps {
  image: ImageType;
  group: Group | undefined;
  tags: Tag[];
  onDelete: (id: string) => void;
  onEdit: (image: ImageType) => void;
  onExpand: (id: string) => void;
}

function ImageListRow({
  image,
  group,
  tags,
  onDelete,
  onEdit,
  onExpand,
}: ImageListRowProps): JSX.Element {
  const imageTags = useMemo(
    () => tags.filter((tag) => image.tagIds.includes(tag.id)),
    [tags, image.tagIds]
  );

  return (
    <div className="group flex items-center gap-4 px-6 py-3 hover:bg-gray-50">
      <button
        className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100"
        onClick={() => onExpand(image.id)}
        aria-label={`Expand ${image.name}`}
      >
        <img
          src={image.url}
          alt={image.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = `https://placehold.co/80x56/e2e8f0/94a3b8?text=${encodeURIComponent(image.name)}`;
          }}
        />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">
          {image.name}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {group && (
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${group.color ?? DEFAULT_GROUP_COLOR}22`,
                color: group.color ?? DEFAULT_GROUP_COLOR,
              }}
            >
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

      {image.comments.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <MessageCircle className="h-3.5 w-3.5" />
          {image.comments.length}
        </div>
      )}

      <div className="flex items-center gap-1 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
        <button
          onClick={() => onEdit(image)}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-200"
          aria-label="Edit image"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(image.id)}
          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
          aria-label="Delete image"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
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
  const [expandedImageId, setExpandedImageId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const storeImages = useAppStore((store) => store.images);
  const expandedImage =
    storeImages.find((img) => img.id === expandedImageId) ?? null;

  const addImageComment = useAppStore((store) => store.addImageComment);
  const updateImageComment = useAppStore((store) => store.updateImageComment);
  const deleteImageComment = useAppStore((store) => store.deleteImageComment);

  const handleDeleteRequest = useCallback((id: string) => {
    setPendingDeleteId(id);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!pendingDeleteId) return;
    onDeleteImage(pendingDeleteId);
    if (expandedImageId === pendingDeleteId) setExpandedImageId(null);
    setPendingDeleteId(null);
  }, [pendingDeleteId, onDeleteImage, expandedImageId]);

  const handleDeleteCancel = useCallback(() => {
    setPendingDeleteId(null);
  }, []);

  const groupsById = useMemo(
    () => Object.fromEntries(groups.map((group) => [group.id, group])),
    [groups]
  );

  if (images.length === 0) return <EmptyState />;

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
              onDelete={handleDeleteRequest}
              onEdit={onEditImage}
              onExpand={setExpandedImageId}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 md:grid-cols-3 xl:grid-cols-4">
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              group={image.groupId ? groupsById[image.groupId] : undefined}
              tags={tags}
              onDelete={handleDeleteRequest}
              onEdit={onEditImage}
              onExpand={setExpandedImageId}
              onCreatePalette={onCreatePalette}
            />
          ))}
        </div>
      )}

      {expandedImage && (
        <ImageLightbox
          image={expandedImage}
          group={
            expandedImage.groupId
              ? groupsById[expandedImage.groupId]
              : undefined
          }
          tags={tags}
          onClose={() => setExpandedImageId(null)}
          onDelete={handleDeleteRequest}
          onEdit={onEditImage}
          onCreatePalette={onCreatePalette}
          onAddComment={(text) =>
            expandedImage && addImageComment(expandedImage.id, text)
          }
          onUpdateComment={(commentId, text) =>
            expandedImage &&
            updateImageComment(expandedImage.id, commentId, text)
          }
          onDeleteComment={(commentId) =>
            expandedImage && deleteImageComment(expandedImage.id, commentId)
          }
        />
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete image"
        message="Are you sure you want to delete this image? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
