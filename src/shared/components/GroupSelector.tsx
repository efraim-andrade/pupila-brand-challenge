'use client';

import {
  type ChangeEvent,
  type JSX,
  type KeyboardEvent,
  useState,
} from 'react';
import { DEFAULT_TAG_COLOR } from '@/lib/colors';
import { Button } from '@/shared/ui/Button';
import { useAppStore } from '@/store';
import type { Group } from '@/types';

interface GroupSelectorProps {
  groups: Group[];
  selectedGroupId: string | null;
  onSelect: (groupId: string | null) => void;
  inputId?: string;
}

export function GroupSelector({
  groups,
  selectedGroupId,
  onSelect,
  inputId = 'group-select',
}: GroupSelectorProps): JSX.Element {
  const addGroup = useAppStore((store) => store.addGroup);

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState(DEFAULT_TAG_COLOR);

  const handleCreateGroup = () => {
    const trimmedName = newGroupName.trim();
    if (!trimmedName) {
      setIsCreatingGroup(false);
      return;
    }
    const created = addGroup({
      name: trimmedName,
      type: 'shared',
      color: newGroupColor,
    });
    onSelect(created.id);
    setIsCreatingGroup(false);
    setNewGroupName('');
    setNewGroupColor(DEFAULT_TAG_COLOR);
  };

  const handleGroupInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleCreateGroup();
    }
    if (event.key === 'Escape') {
      setIsCreatingGroup(false);
      setNewGroupName('');
    }
  };

  const handleCancelGroupCreation = () => {
    setIsCreatingGroup(false);
    setNewGroupName('');
    setNewGroupColor(DEFAULT_TAG_COLOR);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        Group
      </label>

      <select
        id={inputId}
        value={selectedGroupId ?? ''}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          onSelect(event.target.value || null)
        }
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="">No group</option>
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
      </select>

      {isCreatingGroup ? (
        <div className="flex flex-col gap-2 rounded-lg border border-indigo-200 bg-indigo-50/50 p-2.5">
          <input
            type="text"
            value={newGroupName}
            onChange={(event) => setNewGroupName(event.target.value)}
            onKeyDown={handleGroupInputKeyDown}
            placeholder="Group name"
            className="w-full rounded border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleCancelGroupCreation}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="xs"
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim()}
            >
              Create
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsCreatingGroup(true)}
          className="self-start text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
        >
          + New group
        </button>
      )}
    </div>
  );
}
