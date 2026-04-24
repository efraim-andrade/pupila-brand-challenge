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
      <span className="text-sm font-medium text-gray-700">Tags</span>

      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onToggle(tag.id)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                isSelected
                  ? 'border-transparent bg-indigo-100 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {tag.name}
            </button>
          );
        })}

        {isCreatingTag ? (
          <div className="flex items-center gap-1.5 rounded-xl border border-indigo-300 bg-indigo-50 px-2.5 py-1">
            <div className="flex gap-1">
              {Object.values(TAG_COLORS).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewTagColor(color)}
                  className={`h-3 w-3 rounded-full transition-transform ${
                    newTagColor === color
                      ? 'scale-125 ring-2 ring-gray-400 ring-offset-1'
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
              className="w-20 bg-transparent text-xs text-gray-900 placeholder-gray-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCreateTag}
              disabled={!newTagName.trim()}
              className="text-indigo-600 hover:text-indigo-800 disabled:opacity-40"
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
              className="text-gray-400 hover:text-gray-600"
              aria-label="Cancel"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsCreatingTag(true)}
            className="rounded-full border border-dashed border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-400 transition-colors hover:border-indigo-400 hover:text-indigo-600"
          >
            + New tag
          </button>
        )}
      </div>
    </div>
  );
}
