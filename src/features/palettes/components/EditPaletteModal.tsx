'use client';

import {
  type ChangeEvent,
  type JSX,
  type SyntheticEvent,
  useEffect,
  useState,
} from 'react';
import { CommentsSection } from '@/shared/components/comments';
import { GroupSelector } from '@/shared/components/GroupSelector';
import { TagPicker } from '@/shared/components/TagPicker';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { useAppStore } from '@/store';
import type { ColorPalette } from '@/types';
import {
  colorItemsToColors,
  paletteColorsToItems,
  toggleTagId,
} from '../lib/colorEditorUtils';
import { ColorEditor, type ColorItem } from './ColorEditor';

interface EditPaletteModalProps {
  open: boolean;
  palette: ColorPalette | null;
  onClose: () => void;
}

export function EditPaletteModal({
  open,
  palette,
  onClose,
}: EditPaletteModalProps): JSX.Element {
  const updatePalette = useAppStore((store) => store.updatePalette);
  const addPaletteComment = useAppStore((store) => store.addPaletteComment);
  const updatePaletteComment = useAppStore(
    (store) => store.updatePaletteComment
  );
  const deletePaletteComment = useAppStore(
    (store) => store.deletePaletteComment
  );
  const allGroups = useAppStore((store) => store.groups);
  const allTags = useAppStore((store) => store.tags);

  const livePalette = useAppStore((store) =>
    store.palettes.find((palette) => palette.id === palette?.id)
  );

  const [name, setName] = useState('');
  const [colorItems, setColorItems] = useState<ColorItem[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  useEffect(() => {
    if (open && palette) {
      setName(palette.name);
      setColorItems(paletteColorsToItems(palette.colors));
      setSelectedGroupId(palette.groupId);
      setSelectedTagIds(palette.tagIds);
    }
  }, [open, palette]);

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((previous) => toggleTagId(previous, tagId));
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!palette) return;

    updatePalette(palette.id, {
      name: name.trim() || 'Untitled',
      colors: colorItemsToColors(colorItems),
      groupId: selectedGroupId,
      tagIds: selectedTagIds,
    });

    onClose();
  };

  const comments = livePalette?.comments ?? [];

  return (
    <Modal open={open} onClose={onClose} title="Edit palette" size="xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="edit-palette-name"
            className="text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            id="edit-palette-name"
            type="text"
            value={name}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setName(event.target.value)
            }
            placeholder="My palette"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Colors</span>
          <ColorEditor items={colorItems} onChange={setColorItems} />
        </div>

        <GroupSelector
          groups={allGroups}
          selectedGroupId={selectedGroupId}
          onSelect={setSelectedGroupId}
          inputId="edit-palette-group"
        />

        <TagPicker
          tags={allTags}
          selectedTagIds={selectedTagIds}
          onToggle={handleTagToggle}
        />

        <div className="border-t border-gray-100 pt-4">
          <CommentsSection
            comments={comments}
            onAdd={(text) => palette && addPaletteComment(palette.id, text)}
            onUpdate={(commentId, text) =>
              palette && updatePaletteComment(palette.id, commentId, text)
            }
            onDelete={(commentId) =>
              palette && deletePaletteComment(palette.id, commentId)
            }
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </Modal>
  );
}
