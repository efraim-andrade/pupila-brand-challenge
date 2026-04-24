'use client';

import { Folder, Palette, Pencil, Send, Trash2, X } from 'lucide-react';
import {
  type ChangeEvent,
  type JSX,
  type KeyboardEvent,
  useEffect,
  useState,
} from 'react';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import type { Group, Image, Tag } from '@/types';

interface ImageLightboxProps {
  image: Image;
  group: Group | undefined;
  tags: Tag[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (image: Image) => void;
  onCreatePalette: (image: Image) => void;
  onAddComment: (text: string) => void;
  onUpdateComment: (commentId: string, text: string) => void;
  onDeleteComment: (commentId: string) => void;
}

function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(isoString));
}

interface CommentItemProps {
  text: string;
  createdAt: string;
  onUpdate: (text: string) => void;
  onDelete: () => void;
}

function CommentItem({
  text,
  createdAt,
  onUpdate,
  onDelete,
}: CommentItemProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== text) onUpdate(trimmed);
    setIsEditing(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSaveEdit();
    }
    if (event.key === 'Escape') {
      setEditText(text);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 p-2">
        <textarea
          value={editText}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            setEditText(event.target.value)
          }
          onKeyDown={handleKeyDown}
          autoFocus
          rows={2}
          className="w-full resize-none rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="px-2"
            onClick={() => {
              setEditText(text);
              setIsEditing(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="xs"
            className="px-2"
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
    <div className="group flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50 p-2">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-800 whitespace-pre-wrap break-words">
          {text}
        </p>
        <p className="mt-1 text-[10px] text-gray-400">
          {formatDate(createdAt)}
        </p>
      </div>
      <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => {
            setEditText(text);
            setIsEditing(true);
          }}
          className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
          aria-label="Edit comment"
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
          aria-label="Delete comment"
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function ImageLightbox({
  image,
  group,
  tags,
  onClose,
  onDelete,
  onEdit,
  onCreatePalette,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: ImageLightboxProps): JSX.Element {
  const [newComment, setNewComment] = useState('');
  const imageTags = tags.filter((tag) => image.tagIds.includes(tag.id));

  const handleAddComment = () => {
    const text = newComment.trim();
    if (text) {
      onAddComment(text);
      setNewComment('');
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-h-[90vh] max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:flex-row"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
          aria-label="Close lightbox"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image area */}
        <div className="flex min-h-48 flex-1 items-center justify-center overflow-hidden bg-gray-900">
          <img
            src={image.url}
            alt={image.name}
            className="max-h-[55vh] w-full object-contain sm:max-h-[90vh]"
            onError={(event) => {
              event.currentTarget.src = `https://placehold.co/800x600/e2e8f0/94a3b8?text=${encodeURIComponent(image.name)}`;
            }}
          />
        </div>

        {/* Details panel */}
        <div className="flex w-full flex-col border-t border-gray-100 sm:w-72 sm:shrink-0 sm:border-l sm:border-t-0">
          {/* Metadata */}
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-sm font-semibold text-gray-900">{image.name}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {group && (
                <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                  <Folder className="h-2.5 w-2.5" />
                  {group.name}
                </span>
              )}
              {imageTags.map((tag) => (
                <Badge key={tag.id} color={tag.color}>
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-gray-700">
                Comments{' '}
                {image.comments.length > 0 && (
                  <span className="text-gray-400">
                    ({image.comments.length})
                  </span>
                )}
              </span>
              {image.comments.length > 0 ? (
                <div className="flex max-h-32 flex-col gap-1.5 overflow-y-auto">
                  {image.comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      text={comment.text}
                      createdAt={comment.createdAt}
                      onUpdate={(text) => onUpdateComment(comment.id, text)}
                      onDelete={() => onDeleteComment(comment.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No comments yet</p>
              )}
              <div className="flex gap-2">
                <textarea
                  value={newComment}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                    setNewComment(event.target.value)
                  }
                  onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleAddComment();
                    }
                  }}
                  placeholder="Add a comment…"
                  rows={2}
                  className="flex-1 resize-none rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="self-end rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onCreatePalette(image)}
                aria-label="Create palette from image"
              >
                <Palette className="h-4 w-4 shrink-0" />
                Create palette
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 justify-center"
                  onClick={() => onEdit(image)}
                  aria-label="Edit image"
                >
                  <Pencil className="h-4 w-4 shrink-0" />
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1 justify-center"
                  onClick={() => onDelete(image.id)}
                  aria-label="Delete image"
                >
                  <Trash2 className="h-4 w-4 shrink-0" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
