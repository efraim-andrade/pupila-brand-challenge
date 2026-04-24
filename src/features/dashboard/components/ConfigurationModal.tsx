'use client';

import { Folder, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  type ChangeEvent,
  type JSX,
  type KeyboardEvent,
  useState,
} from 'react';
import { DEFAULT_TAG_COLOR, TAG_COLORS } from '@/lib/colors';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { useAppStore } from '@/store';

const PRESET_COLORS = Object.values(TAG_COLORS);

type Tab = 'groups' | 'tags';

interface EditingState {
  id: string;
  name: string;
  color: string;
}

interface CreatingState {
  name: string;
  color?: string;
}

interface ConfigurationModalProps {
  open: boolean;
  onClose: () => void;
}

export function ConfigurationModal({
  open,
  onClose,
}: ConfigurationModalProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>('groups');

  const groups = useAppStore((store) => store.groups);
  const tags = useAppStore((store) => store.tags);
  const images = useAppStore((store) => store.images);
  const palettes = useAppStore((store) => store.palettes);
  const addGroup = useAppStore((store) => store.addGroup);
  const updateGroup = useAppStore((store) => store.updateGroup);
  const deleteGroup = useAppStore((store) => store.deleteGroup);
  const addTag = useAppStore((store) => store.addTag);
  const updateTag = useAppStore((store) => store.updateTag);
  const deleteTag = useAppStore((store) => store.deleteTag);

  const [editing, setEditing] = useState<EditingState | null>(null);
  const [creating, setCreating] = useState<CreatingState | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const resetTabState = () => {
    setEditing(null);
    setCreating(null);
    setPendingDeleteId(null);
  };

  const handleTabChange = (tab: Tab) => {
    resetTabState();
    setActiveTab(tab);
  };

  const groupUsageCount = (groupId: string) =>
    images.filter((image) => image.groupId === groupId).length +
    palettes.filter((palette) => palette.groupId === groupId).length;

  const tagUsageCount = (tagId: string) =>
    images.filter((image) => image.tagIds.includes(tagId)).length +
    palettes.filter((palette) => palette.tagIds.includes(tagId)).length;

  const startEditing = (id: string) => {
    const item =
      activeTab === 'groups'
        ? groups.find((group) => group.id === id)
        : tags.find((tag) => tag.id === id);
    if (!item) return;
    if (activeTab === 'groups') {
      setEditing({ id, name: item.name, color: '' });
    } else {
      setEditing({
        id,
        name: item.name,
        color: item.color ?? DEFAULT_TAG_COLOR,
      });
    }
  };

  const commitEdit = () => {
    if (!editing) return;
    const trimmed = editing.name.trim();
    if (trimmed) {
      if (activeTab === 'groups') updateGroup(editing.id, { name: trimmed });
      else updateTag(editing.id, { name: trimmed, color: editing.color });
    }
    setEditing(null);
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitEdit();
    }
    if (event.key === 'Escape') setEditing(null);
  };

  const commitCreate = () => {
    if (!creating) return;
    const trimmed = creating.name.trim();
    if (trimmed) {
      if (activeTab === 'groups') addGroup({ name: trimmed, type: 'shared' });
      else
        addTag({ name: trimmed, color: creating.color ?? DEFAULT_TAG_COLOR });
    }
    setCreating(null);
  };

  const handleCreateKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitCreate();
    }
    if (event.key === 'Escape') setCreating(null);
  };

  const handleDelete = (id: string) => {
    if (activeTab === 'groups') deleteGroup(id);
    else deleteTag(id);
    setPendingDeleteId(null);
  };

  const items = activeTab === 'groups' ? groups : tags;
  const usageCount = activeTab === 'groups' ? groupUsageCount : tagUsageCount;
  const deleteWarning = (id: string) => {
    const count = usageCount(id);
    if (count === 0) return null;
    return activeTab === 'groups'
      ? `${count} item${count !== 1 ? 's' : ''} will be ungrouped`
      : `removed from ${count} item${count !== 1 ? 's' : ''}`;
  };

  const newItemPlaceholder = activeTab === 'groups' ? 'Group name' : 'Tag name';
  const newItemLabel = activeTab === 'groups' ? 'New group' : 'New tag';

  return (
    <Modal open={open} onClose={onClose} title="Configuration" size="md">
      <div className="flex flex-col gap-4">
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {(['groups', 'tags'] as Tab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {items.length === 0 && !creating ? (
            <p className="py-6 text-center text-sm text-gray-400">
              No {activeTab} yet. Create one below.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {items.map((item) => {
                const isEditing = editing?.id === item.id;
                const isConfirmingDelete = pendingDeleteId === item.id;
                const warning = deleteWarning(item.id);
                const count = usageCount(item.id);

                if (isEditing) {
                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50/50 p-2.5"
                    >
                      {activeTab === 'tags' && (
                        <div className="flex gap-1">
                          {PRESET_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() =>
                                setEditing((prev) =>
                                  prev ? { ...prev, color } : null
                                )
                              }
                              className={`h-4 w-4 shrink-0 rounded-full transition-transform ${
                                editing.color === color
                                  ? 'scale-125 ring-2 ring-gray-400 ring-offset-1'
                                  : ''
                              }`}
                              style={{ backgroundColor: color }}
                              aria-label={`Select color ${color}`}
                            />
                          ))}
                        </div>
                      )}
                      <input
                        type="text"
                        value={editing.name}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setEditing((prev) =>
                            prev ? { ...prev, name: event.target.value } : null
                          )
                        }
                        onKeyDown={handleEditKeyDown}
                        className="min-w-0 flex-1 rounded border border-gray-200 bg-white px-2 py-1 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <Button
                        type="button"
                        size="xs"
                        className="shrink-0 px-2.5"
                        onClick={commitEdit}
                        disabled={!editing.name.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        className="shrink-0"
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </Button>
                    </li>
                  );
                }

                if (isConfirmingDelete) {
                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5"
                    >
                      <span className="flex-1 text-sm text-red-700">
                        Delete &ldquo;{item.name}&rdquo;
                        {warning && (
                          <span className="ml-1 text-xs text-red-500">
                            ({warning})
                          </span>
                        )}
                      </span>
                      <Button
                        type="button"
                        variant="danger"
                        size="xs"
                        className="shrink-0 px-2.5"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        className="shrink-0"
                        onClick={() => setPendingDeleteId(null)}
                      >
                        Cancel
                      </Button>
                    </li>
                  );
                }

                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50"
                  >
                    {activeTab === 'tags' ? (
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{
                          backgroundColor: item.color ?? DEFAULT_TAG_COLOR,
                        }}
                      />
                    ) : (
                      <Folder className="h-3 w-3 shrink-0 text-gray-400" />
                    )}
                    <span className="flex-1 text-sm text-gray-800">
                      {item.name}
                    </span>
                    {count >= 0 && (
                      <span className="text-xs text-gray-400">
                        {count} item{count !== 1 ? 's' : ''}
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEditing(item.id)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                        aria-label={`Edit ${item.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(item.id)}
                        className="rounded p-1 text-red-500 hover:bg-red-50"
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {creating ? (
            activeTab === 'groups' ? (
              <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50/50 p-2.5">
                <input
                  type="text"
                  value={creating.name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setCreating((prev) =>
                      prev ? { ...prev, name: event.target.value } : null
                    )
                  }
                  onKeyDown={handleCreateKeyDown}
                  placeholder={newItemPlaceholder}
                  className="min-w-0 flex-1 rounded border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="shrink-0"
                  onClick={() => setCreating(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="xs"
                  className="shrink-0"
                  onClick={commitCreate}
                  disabled={!creating.name.trim()}
                >
                  Create
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50/50 p-2.5">
                <div className="flex gap-1">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setCreating((prev) =>
                          prev ? { ...prev, color } : null
                        )
                      }
                      className={`h-4 w-4 shrink-0 rounded-full transition-transform ${
                        creating.color === color
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
                  value={creating.name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setCreating((prev) =>
                      prev ? { ...prev, name: event.target.value } : null
                    )
                  }
                  onKeyDown={handleCreateKeyDown}
                  placeholder={newItemPlaceholder}
                  className="min-w-0 flex-1 rounded border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="shrink-0"
                  onClick={() => setCreating(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="xs"
                  className="shrink-0"
                  onClick={commitCreate}
                  disabled={!creating.name.trim()}
                >
                  Create
                </Button>
              </div>
            )
          ) : (
            <button
              type="button"
              onClick={() => setCreating({ name: '', color: undefined })}
              className="flex items-center gap-1.5 self-start rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 transition-colors hover:border-indigo-400 hover:text-indigo-600"
            >
              <Plus className="h-4 w-4" />
              {newItemLabel}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
