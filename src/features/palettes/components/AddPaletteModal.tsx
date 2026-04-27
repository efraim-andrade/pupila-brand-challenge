'use client';

import {
  type ChangeEvent,
  type JSX,
  type SyntheticEvent,
  useRef,
  useState,
} from 'react';
import { GroupSelector } from '@/shared/components/GroupSelector';
import { TagPicker } from '@/shared/components/TagPicker';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { useAppStore } from '@/store';
import { colorItemsToColors, toggleTagId } from '../lib/colorEditorUtils';
import { ColorEditor, type ColorItem } from './ColorEditor';
import { DuplicateNameDialog } from './DuplicateNameDialog';

interface AddPaletteModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddPaletteModal({
  open,
  onClose,
}: AddPaletteModalProps): JSX.Element {
  const addPalette = useAppStore((store) => store.addPalette);
  const deletePalette = useAppStore((store) => store.deletePalette);
  const palettes = useAppStore((store) => store.palettes);
  const allGroups = useAppStore((store) => store.groups);
  const allTags = useAppStore((store) => store.tags);

  const [name, setName] = useState('');
  const [colorItems, setColorItems] = useState<ColorItem[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
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

    const conflictingPalette = palettes.find(
      (palette) =>
        palette.name.toLowerCase() === resolvedPaletteName.toLowerCase()
    );
    if (conflictingPalette) {
      setConflictingPaletteName(resolvedPaletteName);
      return;
    }

    addPalette({
      name: resolvedPaletteName,
      colors: colorItemsToColors(colorItems),
      groupId: selectedGroupId,
      tagIds: selectedTagIds,
      comments: [],
    });

    resetForm();
    onClose();
  };

  const handleReplaceConflictingPalette = () => {
    const conflictingPalette = palettes.find(
      (palette) =>
        palette.name.toLowerCase() === resolvedPaletteName.toLowerCase()
    );
    if (conflictingPalette) {
      deletePalette(conflictingPalette.id);
    }

    addPalette({
      name: resolvedPaletteName,
      colors: colorItemsToColors(colorItems),
      groupId: selectedGroupId,
      tagIds: selectedTagIds,
      comments: [],
    });

    setConflictingPaletteName(null);
    resetForm();
    onClose();
  };

  const handleRenameNewPalette = () => {
    setConflictingPaletteName(null);
    nameInputRef.current?.focus();
  };

  const handleDismissConflict = () => {
    setConflictingPaletteName(null);
  };

  const resetForm = () => {
    setName('');
    setColorItems([]);
    setSelectedGroupId(null);
    setSelectedTagIds([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Modal open={open} onClose={handleClose} title="New palette" size="lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="palette-name"
              className="text-sm font-medium text-text-primary"
            >
              Name
            </label>
            <input
              id="palette-name"
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setName(event.target.value)
              }
              placeholder="My palette"
              className="w-full rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-muted shadow-border focus:outline-none focus:ring-2 focus:ring-focus"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-primary">
              Colors
            </span>
            <ColorEditor items={colorItems} onChange={setColorItems} />
          </div>

          <GroupSelector
            groups={allGroups}
            selectedGroupId={selectedGroupId}
            onSelect={setSelectedGroupId}
            inputId="palette-group"
          />

          <TagPicker
            tags={allTags}
            selectedTagIds={selectedTagIds}
            onToggle={handleTagToggle}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Create palette</Button>
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
