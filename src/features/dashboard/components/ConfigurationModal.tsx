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

  const [editingEntity, setEditingEntity] = useState<EditingState | null>(null);
  const [creatingEntity, setCreatingEntity] = useState<CreatingState | null>(
    null
  );
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const resetTabState = () => {
    setEditingEntity(null);
    setCreatingEntity(null);
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

  const handleStartEditingEntity = (id: string) => {
    const targetEntity =
      activeTab === 'groups'
        ? groups.find((group) => group.id === id)
        : tags.find((tag) => tag.id === id);
    if (!targetEntity) return;
    if (activeTab === 'groups') {
      setEditingEntity({ id, name: targetEntity.name, color: '' });
    } else {
      setEditingEntity({
        id,
        name: targetEntity.name,
        color: targetEntity.color ?? DEFAULT_TAG_COLOR,
      });
    }
  };

  const handleCommitEntityEdit = () => {
    if (!editingEntity) return;
    const trimmedName = editingEntity.name.trim();
    if (trimmedName) {
      if (activeTab === 'groups')
        updateGroup(editingEntity.id, { name: trimmedName });
      else
        updateTag(editingEntity.id, {
          name: trimmedName,
          color: editingEntity.color,
        });
    }
    setEditingEntity(null);
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleCommitEntityEdit();
    }
    if (event.key === 'Escape') setEditingEntity(null);
  };

  const handleCommitEntityCreate = () => {
    if (!creatingEntity) return;
    const trimmedName = creatingEntity.name.trim();
    if (trimmedName) {
      if (activeTab === 'groups')
        addGroup({ name: trimmedName, type: 'shared' });
      else
        addTag({
          name: trimmedName,
          color: creatingEntity.color ?? DEFAULT_TAG_COLOR,
        });
    }
    setCreatingEntity(null);
  };

  const handleCreateKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleCommitEntityCreate();
    }
    if (event.key === 'Escape') setCreatingEntity(null);
  };

  const handleConfirmDeleteEntity = (id: string) => {
    if (activeTab === 'groups') deleteGroup(id);
    else deleteTag(id);
    setPendingDeleteId(null);
  };

  const currentTabItems = activeTab === 'groups' ? groups : tags;
  const usageCount = activeTab === 'groups' ? groupUsageCount : tagUsageCount;
  const getDeleteWarningMessage = (id: string) => {
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
        <div className="flex gap-1 rounded-md bg-surface-subtle p-1 shadow-border">
          {(['groups', 'tags'] as Tab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className={`flex-1 rounded-md px-3 py-1.5 text-[14px] font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-text-primary text-white'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {currentTabItems.length === 0 && !creatingEntity ? (
            <p className="py-6 text-center text-[14px] text-text-muted">
              No {activeTab} yet. Create one below.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {currentTabItems.map((currentItem) => {
                const isEditing = editingEntity?.id === currentItem.id;
                const isConfirmingDelete = pendingDeleteId === currentItem.id;
                const warning = getDeleteWarningMessage(currentItem.id);
                const count = usageCount(currentItem.id);

                if (isEditing) {
                  return (
                    <li
                      key={currentItem.id}
                      className="flex items-center gap-2 rounded-md bg-surface-subtle p-2.5 shadow-border"
                    >
                      {activeTab === 'tags' && (
                        <div className="flex gap-1">
                          {PRESET_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() =>
                                setEditingEntity((prevEntity) =>
                                  prevEntity ? { ...prevEntity, color } : null
                                )
                              }
                              className={`h-4 w-4 shrink-0 rounded-full transition-transform ${
                                editingEntity.color === color
                                  ? 'scale-125 ring-2 ring-text-primary ring-offset-1'
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
                        value={editingEntity.name}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setEditingEntity((prevEntity) =>
                            prevEntity
                              ? { ...prevEntity, name: event.target.value }
                              : null
                          )
                        }
                        onKeyDown={handleEditKeyDown}
                        className="min-w-0 flex-1 rounded-md bg-white px-2 py-1 text-[14px] text-text-primary shadow-border focus:outline-none focus:ring-2 focus:ring-focus"
                      />
                      <Button
                        type="button"
                        size="xs"
                        className="shrink-0 px-2.5"
                        onClick={handleCommitEntityEdit}
                        disabled={!editingEntity.name.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        className="shrink-0"
                        onClick={() => setEditingEntity(null)}
                      >
                        Cancel
                      </Button>
                    </li>
                  );
                }

                if (isConfirmingDelete) {
                  return (
                    <li
                      key={currentItem.id}
                      className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2.5 shadow-[0_0_0_1px_rgba(220,38,38,0.2)]"
                    >
                      <span className="flex-1 text-[14px] text-red-700">
                        Delete &ldquo;{currentItem.name}&rdquo;
                        {warning && (
                          <span className="ml-1 text-[12px] text-red-500">
                            ({warning})
                          </span>
                        )}
                      </span>
                      <Button
                        type="button"
                        variant="danger"
                        size="xs"
                        className="shrink-0 px-2.5"
                        onClick={() =>
                          handleConfirmDeleteEntity(currentItem.id)
                        }
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
                    key={currentItem.id}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-surface-subtle"
                  >
                    {activeTab === 'tags' ? (
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            currentItem.color ?? DEFAULT_TAG_COLOR,
                        }}
                      />
                    ) : (
                      <Folder className="h-3 w-3 shrink-0 text-text-muted" />
                    )}
                    <span className="flex-1 text-[14px] text-text-primary">
                      {currentItem.name}
                    </span>
                    {count >= 0 && (
                      <span className="text-[12px] text-text-muted">
                        {count} item{count !== 1 ? 's' : ''}
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEditingEntity(currentItem.id)}
                        className="rounded p-1 text-text-muted hover:bg-surface-muted hover:text-text-primary"
                        aria-label={`Edit ${currentItem.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(currentItem.id)}
                        className="rounded p-1 text-red-500 hover:bg-red-50"
                        aria-label={`Delete ${currentItem.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {creatingEntity ? (
            activeTab === 'groups' ? (
              <div className="flex items-center gap-2 rounded-md bg-surface-subtle p-2.5 shadow-border">
                <input
                  type="text"
                  value={creatingEntity.name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setCreatingEntity((prevEntity) =>
                      prevEntity
                        ? { ...prevEntity, name: event.target.value }
                        : null
                    )
                  }
                  onKeyDown={handleCreateKeyDown}
                  placeholder={newItemPlaceholder}
                  className="min-w-0 flex-1 rounded-md bg-white px-2.5 py-1.5 text-[14px] text-text-primary placeholder-text-muted shadow-border focus:outline-none focus:ring-2 focus:ring-focus"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="shrink-0"
                  onClick={() => setCreatingEntity(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="xs"
                  className="shrink-0"
                  onClick={handleCommitEntityCreate}
                  disabled={!creatingEntity.name.trim()}
                >
                  Create
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-md bg-surface-subtle p-2.5 shadow-border">
                <div className="flex gap-1">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setCreatingEntity((prevEntity) =>
                          prevEntity ? { ...prevEntity, color } : null
                        )
                      }
                      className={`h-4 w-4 shrink-0 rounded-full transition-transform ${
                        creatingEntity.color === color
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
                  value={creatingEntity.name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setCreatingEntity((prevEntity) =>
                      prevEntity
                        ? { ...prevEntity, name: event.target.value }
                        : null
                    )
                  }
                  onKeyDown={handleCreateKeyDown}
                  placeholder={newItemPlaceholder}
                  className="min-w-0 flex-1 rounded-md bg-white px-2.5 py-1.5 text-[14px] text-text-primary placeholder-text-muted shadow-border focus:outline-none focus:ring-2 focus:ring-focus"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="shrink-0"
                  onClick={() => setCreatingEntity(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="xs"
                  className="shrink-0"
                  onClick={handleCommitEntityCreate}
                  disabled={!creatingEntity.name.trim()}
                >
                  Create
                </Button>
              </div>
            )
          ) : (
            <button
              type="button"
              onClick={() => setCreatingEntity({ name: '', color: undefined })}
              className="flex items-center gap-1.5 self-start rounded-md px-3 py-2 text-[14px] text-text-tertiary transition-colors shadow-border hover:bg-surface-subtle hover:text-text-primary"
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
