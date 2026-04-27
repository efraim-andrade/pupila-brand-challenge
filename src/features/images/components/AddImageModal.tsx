'use client';

import {
  type ChangeEvent,
  type JSX,
  type SyntheticEvent,
  useState,
} from 'react';
import { TAG_COLORS } from '@/lib/colors';
import { GroupSelector } from '@/shared/components/GroupSelector';
import { TagPicker } from '@/shared/components/TagPicker';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { useAppStore } from '@/store';
import { useTagSuggestions } from '../hooks/useTagSuggestions';
import { AiSuggestionBar } from './AiSuggestionBar';

interface AddImageModalProps {
  open: boolean;
  onClose: () => void;
}

function deriveNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split('/').filter(Boolean).pop() ?? '';
    return filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
  } catch {
    return '';
  }
}

export function AddImageModal({
  open,
  onClose,
}: AddImageModalProps): JSX.Element {
  const addImage = useAppStore((store) => store.addImage);
  const addGroup = useAppStore((store) => store.addGroup);
  const addTag = useAppStore((store) => store.addTag);
  const allGroups = useAppStore((store) => store.groups);
  const allTags = useAppStore((store) => store.tags);

  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [urlError, setUrlError] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const {
    suggestions,
    isLoading: isSuggestionsLoading,
    error: suggestionsError,
    dismiss: dismissSuggestions,
  } = useTagSuggestions(url);

  const handleApplyTagSuggestions = (
    groupName: string | null,
    tagNames: string[]
  ) => {
    if (groupName) {
      const existingGroup = allGroups.find(
        (group) => group.name.toLowerCase() === groupName.toLowerCase()
      );
      const group =
        existingGroup ?? addGroup({ name: groupName, type: 'shared' });
      setSelectedGroupId(group.id);
    }

    const resolvedTagIds = tagNames.map((tagName) => {
      const existingTag = allTags.find(
        (tag) => tag.name.toLowerCase() === tagName.toLowerCase()
      );
      return existingTag
        ? existingTag.id
        : addTag({ name: tagName, color: Object.values(TAG_COLORS)[0] }).id;
    });

    setSelectedTagIds((previous) => [
      ...new Set([...previous, ...resolvedTagIds]),
    ]);
    dismissSuggestions();
  };

  const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextUrl = event.target.value;
    setUrl(nextUrl);
    setUrlError('');
    if (!name) {
      setName(deriveNameFromUrl(nextUrl));
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((previous) =>
      previous.includes(tagId)
        ? previous.filter((id) => id !== tagId)
        : [...previous, tagId]
    );
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      new URL(url);
    } catch {
      setUrlError('Please enter a valid URL.');
      return;
    }

    addImage({
      url: url.trim(),
      name: name.trim() || deriveNameFromUrl(url) || 'Untitled',
      groupId: selectedGroupId,
      tagIds: selectedTagIds,
      comments: [],
    });

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setUrl('');
    setName('');
    setUrlError('');
    setSelectedGroupId(null);
    setSelectedTagIds([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add image" size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="image-url"
            className="text-[14px] font-medium text-text-primary"
          >
            Image URL
          </label>
          <input
            id="image-url"
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://example.com/photo.jpg"
            className={`w-full rounded-md px-3 py-2 text-[14px] text-text-primary placeholder-text-muted shadow-border focus:outline-none focus:ring-2 ${
              urlError
                ? 'shadow-[0_0_0_1px_rgba(220,38,38,0.4)] focus:ring-red-500'
                : 'focus:ring-focus'
            }`}
          />
          {urlError && <p className="text-xs text-red-500">{urlError}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="image-name"
            className="text-[14px] font-medium text-text-primary"
          >
            Name
          </label>
          <input
            id="image-name"
            type="text"
            value={name}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setName(event.target.value)
            }
            placeholder="My image"
            className="w-full rounded-md px-3 py-2 text-[14px] text-text-primary placeholder-text-muted shadow-border focus:outline-none focus:ring-2 focus:ring-focus"
          />
        </div>

        {url && !urlError && (
          <div className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="Preview"
              className="mx-auto max-h-40 w-full object-contain"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        <AiSuggestionBar
          suggestions={suggestions}
          isLoading={isSuggestionsLoading}
          error={suggestionsError}
          existingGroups={allGroups}
          existingTags={allTags}
          onApplyAll={handleApplyTagSuggestions}
          onDismiss={dismissSuggestions}
        />

        <GroupSelector
          groups={allGroups}
          selectedGroupId={selectedGroupId}
          onSelect={setSelectedGroupId}
          inputId="image-group"
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
          <Button type="submit" disabled={!url.trim()}>
            Add image
          </Button>
        </div>
      </form>
    </Modal>
  );
}
