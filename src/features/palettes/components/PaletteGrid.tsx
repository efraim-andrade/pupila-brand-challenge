'use client';

import { MessageCircle, Palette, Pencil, Trash2 } from 'lucide-react';
import type { JSX } from 'react';
import { DEFAULT_GROUP_COLOR } from '@/lib/colors';
import { Badge } from '@/shared/ui/Badge';
import type { ColorPalette, Group, Tag, ViewMode } from '@/types';
import { PaletteCard } from './PaletteCard';

interface PaletteGridProps {
  palettes: ColorPalette[];
  groups: Group[];
  tags: Tag[];
  viewMode: ViewMode;
  onDeletePalette: (id: string) => void;
  onEditPalette: (palette: ColorPalette) => void;
  onViewPalette: (palette: ColorPalette) => void;
}

function EmptyState(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <Palette className="h-8 w-8 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-700">No palettes found</p>
      <p className="mt-1 text-xs text-gray-400">
        Try adjusting your filters or create a new palette
      </p>
    </div>
  );
}

interface PaletteListRowProps {
  palette: ColorPalette;
  group: Group | undefined;
  tags: Tag[];
  onDelete: (id: string) => void;
  onEdit: (palette: ColorPalette) => void;
  onView: (palette: ColorPalette) => void;
}

function PaletteListRow({
  palette,
  group,
  tags,
  onDelete,
  onEdit,
  onView,
}: PaletteListRowProps): JSX.Element {
  const paletteTags = tags.filter((tag) => palette.tagIds.includes(tag.id));

  return (
    <div
      className="group flex cursor-pointer items-center gap-4 px-6 py-3 hover:bg-gray-50"
      onClick={() => onView(palette)}
    >
      <div className="flex h-10 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100">
        {palette.colors.length === 0 ? (
          <div className="h-full w-full bg-gray-100" />
        ) : (
          palette.colors
            .slice(0, 8)
            .map((color, index) => (
              <div
                key={index}
                className="flex-1"
                style={{ backgroundColor: color.hex }}
                title={color.name ?? color.hex}
              />
            ))
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">
          {palette.name}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-400">
            {palette.colors.length} colors
          </span>
          {group && (
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: (group.color ?? DEFAULT_GROUP_COLOR) + '22',
                color: group.color ?? DEFAULT_GROUP_COLOR,
              }}
            >
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

      {palette.comments.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <MessageCircle className="h-3.5 w-3.5" />
          {palette.comments.length}
        </div>
      )}

      <div className="flex items-center gap-1 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(palette);
          }}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-200"
          aria-label="Edit palette"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(palette.id);
          }}
          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
          aria-label="Delete palette"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function PaletteGrid({
  palettes,
  groups,
  tags,
  viewMode,
  onDeletePalette,
  onEditPalette,
  onViewPalette,
}: PaletteGridProps): JSX.Element {
  if (palettes.length === 0) return <EmptyState />;

  const groupsById = Object.fromEntries(
    groups.map((group) => [group.id, group])
  );

  if (viewMode === 'list') {
    return (
      <div className="divide-y divide-gray-100">
        {palettes.map((palette) => (
          <PaletteListRow
            key={palette.id}
            palette={palette}
            group={palette.groupId ? groupsById[palette.groupId] : undefined}
            tags={tags}
            onDelete={onDeletePalette}
            onEdit={onEditPalette}
            onView={onViewPalette}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 md:grid-cols-3 xl:grid-cols-4">
      {palettes.map((palette) => (
        <PaletteCard
          key={palette.id}
          palette={palette}
          group={palette.groupId ? groupsById[palette.groupId] : undefined}
          tags={tags}
          onDelete={onDeletePalette}
          onEdit={onEditPalette}
          onView={onViewPalette}
        />
      ))}
    </div>
  );
}
