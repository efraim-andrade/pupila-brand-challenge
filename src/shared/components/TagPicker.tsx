'use client';

import { Check, X } from 'lucide-react';
import { type JSX, type KeyboardEvent, useState } from 'react';
import { TAG_COLORS } from '@/lib/colors';
import { useAppStore } from '@/store';
import type { Tag } from '@/types';

interface TagPickerProps {
  tags: Tag[];
  selectedTagIds: string[];
  onToggle: (tagId: string) => void;
}

export function TagPicker({
  tags,
  selectedTagIds,
  onToggle,
}: TagPickerProps): JSX.Element {
  const addTag = useAppStore((store) => store.addTag);

  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(Object.values(TAG_COLORS)[0]);

  const handleCreateTag = () => {
    const trimmedName = newTagName.trim();
    if (!trimmedName) {
      setIsCreatingTag(false);
      return;
    }
    const created = addTag({ name: trimmedName, color: newTagColor });
    onToggle(created.id);
    setNewTagName('');
    setNewTagColor(Object.values(TAG_COLORS)[0]);
    setIsCreatingTag(false);
  };

  const handleTagInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleCreateTag();
    }
    if (event.key === 'Escape') {
      setIsCreatingTag(false);
      setNewTagName('');
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[14px] font-medium text-text-primary">Tags</span>

      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onToggle(tag.id)}
              className={`rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors ${
                isSelected
                  ? 'bg-text-primary text-surface'
                  : 'bg-surface text-text-tertiary shadow-border hover:bg-surface-subtle'
              }`}
            >
              {tag.name}
            </button>
          );
        })}

        {isCreatingTag ? (
          <div className="flex items-center gap-1.5 rounded-full bg-surface-subtle px-2.5 py-1 shadow-border">
            <div className="flex gap-1">
              {Object.values(TAG_COLORS).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewTagColor(color)}
                  className={`h-3 w-3 rounded-full transition-transform ${
                    newTagColor === color
                      ? 'scale-125 ring-2 ring-text-primary ring-offset-1'
                      : ''
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            <input
              type="text"
              value={newTagName}
              onChange={(event) => setNewTagName(event.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Tag name"
              className="w-20 bg-transparent text-[12px] text-text-primary placeholder-text-muted focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCreateTag}
              disabled={!newTagName.trim()}
              className="text-text-primary hover:text-black disabled:opacity-40"
              aria-label="Create tag"
            >
              <Check className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreatingTag(false);
                setNewTagName('');
              }}
              className="text-text-muted hover:text-text-primary"
              aria-label="Cancel"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsCreatingTag(true)}
            className="rounded-full px-2.5 py-1 text-[12px] font-medium text-text-muted transition-colors shadow-border hover:bg-surface-subtle hover:text-text-primary"
          >
            + New tag
          </button>
        )}
      </div>
    </div>
  );
}
