'use client';

import { Pencil, Trash2 } from 'lucide-react';
import {
  type ChangeEvent,
  type JSX,
  type KeyboardEvent,
  useState,
} from 'react';
import { Button } from '@/shared/ui/Button';
import type { Comment } from '@/types';

interface CommentItemProps {
  comment: Comment;
  compact?: boolean;
  onUpdate: (text: string) => void;
  onDelete: () => void;
}

function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(isoString));
}

export function CommentItem({
  comment,
  compact,
  onUpdate,
  onDelete,
}: CommentItemProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [editCommentText, setEditCommentText] = useState(comment.text);

  const textSize = compact ? 'text-xs' : 'text-sm';
  const padding = compact ? 'p-2' : 'p-3';
  const dateSize = compact ? 'text-2xs' : 'text-xs';
  const iconSize = compact ? 'h-3 w-3' : 'h-3.5 w-3.5';

  const handleSaveCommentEdit = () => {
    const trimmedText = editCommentText.trim();
    if (trimmedText && trimmedText !== comment.text) onUpdate(trimmedText);
    setIsEditing(false);
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSaveCommentEdit();
    }
    if (event.key === 'Escape') {
      setEditCommentText(comment.text);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div
        className={`flex flex-col gap-1.5 rounded-md bg-surface-subtle shadow-border ${padding}`}
      >
        <textarea
          value={editCommentText}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setEditCommentText(e.target.value)
          }
          onKeyDown={handleEditKeyDown}
          rows={2}
          className={`w-full resize-none rounded-md bg-surface px-2 py-1 ${textSize} text-text-primary shadow-border focus:outline-none focus:ring-2 focus:ring-focus`}
        />
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="px-2"
            onClick={() => {
              setEditCommentText(comment.text);
              setIsEditing(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="xs"
            className="px-2"
            onClick={handleSaveCommentEdit}
            disabled={!editCommentText.trim()}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-start gap-2 rounded-md bg-surface-subtle shadow-border ${padding}`}
    >
      <div className="min-w-0 flex-1">
        <p
          className={`${textSize} text-text-primary whitespace-pre-wrap break-words`}
        >
          {comment.text}
        </p>
        <p className={`mt-1 ${dateSize} text-text-muted`}>
          {formatDate(comment.createdAt)}
        </p>
      </div>
      <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => {
            setEditCommentText(comment.text);
            setIsEditing(true);
          }}
          className="rounded p-1 text-text-muted hover:bg-surface-muted hover:text-text-primary"
          aria-label="Edit comment"
        >
          <Pencil className={iconSize} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded p-1 text-text-muted hover:bg-red-50 hover:text-red-500"
          aria-label="Delete comment"
        >
          <Trash2 className={iconSize} />
        </button>
      </div>
    </div>
  );
}
