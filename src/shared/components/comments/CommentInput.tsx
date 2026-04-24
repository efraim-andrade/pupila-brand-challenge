'use client';

import { Send } from 'lucide-react';
import {
  type ChangeEvent,
  type JSX,
  type KeyboardEvent,
  useState,
} from 'react';
import { Button } from '@/shared/ui/Button';

interface CommentInputProps {
  compact?: boolean;
  onAdd: (text: string) => void;
}

export function CommentInput({
  compact,
  onAdd,
}: CommentInputProps): JSX.Element {
  const [commentText, setCommentText] = useState('');

  const handleCommentSubmit = () => {
    const trimmedText = commentText.trim();
    if (!trimmedText) return;
    onAdd(trimmedText);
    setCommentText('');
  };

  const handleCommentInputKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleCommentSubmit();
    }
  };

  if (compact) {
    return (
      <div className="mt-2 flex gap-2">
        <textarea
          value={commentText}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setCommentText(e.target.value)
          }
          onKeyDown={handleCommentInputKeyDown}
          placeholder="Add a comment…"
          rows={2}
          className="flex-1 resize-none rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={handleCommentSubmit}
          disabled={!commentText.trim()}
          className="self-end rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        value={commentText}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          setCommentText(e.target.value)
        }
        onKeyDown={handleCommentInputKeyDown}
        placeholder="Add a comment… (Enter to submit, Shift+Enter for new line)"
        rows={2}
        className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <div className="flex justify-end">
        <Button
          type="button"
          size="xs"
          className="rounded-lg px-3 py-1.5"
          onClick={handleCommentSubmit}
          disabled={!commentText.trim()}
        >
          Add comment
        </Button>
      </div>
    </div>
  );
}
