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

interface CommentsSectionProps {
  comments: Comment[];
  onAdd: (text: string) => void;
  onUpdate: (commentId: string, text: string) => void;
  onDelete: (commentId: string) => void;
}

function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(isoString));
}

function CommentItem({
  comment,
  onUpdate,
  onDelete,
}: {
  comment: Comment;
  onUpdate: (text: string) => void;
  onDelete: () => void;
}): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== comment.text) onUpdate(trimmed);
    setIsEditing(false);
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSaveEdit();
    }
    if (event.key === 'Escape') {
      setEditText(comment.text);
      setIsEditing(false);
    }
  };

  const handleStartEdit = () => {
    setEditText(comment.text);
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
        <textarea
          value={editText}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            setEditText(event.target.value)
          }
          onKeyDown={handleEditKeyDown}
          rows={2}
          className="w-full resize-none rounded border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <div className="flex justify-end gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="px-2.5"
            onClick={() => {
              setEditText(comment.text);
              setIsEditing(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="xs"
            className="px-2.5"
            onClick={handleSaveEdit}
            disabled={!editText.trim()}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
          {comment.text}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {formatDate(comment.createdAt)}
        </p>
      </div>
      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={handleStartEdit}
          className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
          aria-label="Edit comment"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
          aria-label="Delete comment"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function CommentsSection({
  comments,
  onAdd,
  onUpdate,
  onDelete,
}: CommentsSectionProps): JSX.Element {
  const [newCommentText, setNewCommentText] = useState('');

  const submitNewComment = () => {
    const trimmed = newCommentText.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setNewCommentText('');
  };

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitNewComment();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-gray-700">
        Comments{' '}
        {comments.length > 0 && (
          <span className="text-gray-400">({comments.length})</span>
        )}
      </span>

      {comments.length > 0 && (
        <div className="flex flex-col gap-2">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onUpdate={(text) => onUpdate(comment.id, text)}
              onDelete={() => onDelete(comment.id)}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <textarea
          value={newCommentText}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            setNewCommentText(event.target.value)
          }
          onKeyDown={handleTextareaKeyDown}
          placeholder="Add a comment… (Enter to submit, Shift+Enter for new line)"
          rows={2}
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <div className="flex justify-end">
          <Button
            type="button"
            size="xs"
            className="rounded-lg px-3 py-1.5"
            onClick={submitNewComment}
            disabled={!newCommentText.trim()}
          >
            Add comment
          </Button>
        </div>
      </div>
    </div>
  );
}
