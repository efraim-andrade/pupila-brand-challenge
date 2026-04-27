'use client';

import {
  type ChangeEvent,
  type JSX,
  type SyntheticEvent,
  useRef,
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
import { DuplicateNameDialog } from './DuplicateNameDialog';

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
  const deletePalette = useAppStore((store) => store.deletePalette);
  const addPaletteComment = useAppStore((store) => store.addPaletteComment);
  const updatePaletteComment = useAppStore(
    (store) => store.updatePaletteComment
  );
  const deletePaletteComment = useAppStore(
    (store) => store.deletePaletteComment
  );
  const palettes = useAppStore((store) => store.palettes);
  const allGroups = useAppStore((store) => store.groups);
  const allTags = useAppStore((store) => store.tags);

  const livePalette = useAppStore((store) =>
    store.palettes.find((p) => p.id === palette?.id)
  );

  const [name, setName] = useState(palette?.name ?? '');
  const [colorItems, setColorItems] = useState<ColorItem[]>(
    palette ? paletteColorsToItems(palette.colors) : []
  );
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    palette?.groupId ?? null
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    palette?.tagIds ?? []
  );
  const [conflictingPaletteName, setConflictingPaletteName] = useState<
    string | null
  >(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((previous) => toggleTagId(previous, tagId));
  };

  const resolvedPaletteName = name.trim() || 'Untitled';

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!palette) return;

    const conflictingPalette = palettes.find(
      (candidate) =>
        candidate.id !== palette.id &&
        candidate.name.toLowerCase() === resolvedPaletteName.toLowerCase()
    );
    if (conflictingPalette) {
      setConflictingPaletteName(resolvedPaletteName);
      return;
    }

    updatePalette(palette.id, {
      name: resolvedPaletteName,
      colors: colorItemsToColors(colorItems),
      groupId: selectedGroupId,
      tagIds: selectedTagIds,
    });

    onClose();
  };

  const handleReplaceConflictingPalette = () => {
    if (!palette) return;

    const conflictingPalette = palettes.find(
      (candidate) =>
        candidate.id !== palette.id &&
        candidate.name.toLowerCase() === resolvedPaletteName.toLowerCase()
    );
    if (conflictingPalette) {
      deletePalette(conflictingPalette.id);
    }

    updatePalette(palette.id, {
      name: resolvedPaletteName,
      colors: colorItemsToColors(colorItems),
      groupId: selectedGroupId,
      tagIds: selectedTagIds,
    });

    setConflictingPaletteName(null);
    onClose();
  };

  const handleRenameNewPalette = () => {
    setConflictingPaletteName(null);
    nameInputRef.current?.focus();
  };

  const handleDismissConflict = () => {
    setConflictingPaletteName(null);
  };

  const comments = livePalette?.comments ?? [];

  return (
    <>
      <Modal open={open} onClose={onClose} title="Edit palette" size="xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-palette-name"
              className="text-[14px] font-medium text-text-primary"
            >
              Name
            </label>
            <input
              id="edit-palette-name"
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setName(event.target.value)
              }
              placeholder="My palette"
              className="w-full rounded-md px-3 py-2 text-[14px] text-text-primary placeholder-text-muted shadow-border focus:outline-none focus:ring-2 focus:ring-focus"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[14px] font-medium text-text-primary">
              Colors
            </span>
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

      <DuplicateNameDialog
        open={conflictingPaletteName !== null}
        conflictingPaletteName={conflictingPaletteName ?? ''}
        onChooseRename={handleRenameNewPalette}
        onChooseReplace={handleReplaceConflictingPalette}
        onDismiss={handleDismissConflict}
      />
    </>
  );
}
