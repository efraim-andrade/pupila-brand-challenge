'use client';

import type { JSX } from 'react';
import type { Comment } from '@/types';
import { CommentInput } from './CommentInput';
import { CommentItem } from './CommentItem';

interface CommentsSectionProps {
  comments: Comment[];
  onAdd: (text: string) => void;
  onUpdate: (commentId: string, text: string) => void;
  onDelete: (commentId: string) => void;
  compact?: boolean;
  scrollable?: boolean;
  className?: string;
}

export function CommentsSection({
  comments,
  onAdd,
  onUpdate,
  onDelete,
  compact,
  scrollable,
  className,
}: CommentsSectionProps): JSX.Element {
  const labelSize = compact ? 'text-xs' : 'text-sm';
  const rootClass = scrollable
    ? 'flex flex-col min-h-0 flex-1'
    : 'flex flex-col gap-3';

  return (
    <div className={`${rootClass}${className ? ` ${className}` : ''}`}>
      <span className={`${labelSize} font-medium text-gray-700`}>
        Comments{' '}
        {comments.length > 0 && (
          <span className="text-gray-400">({comments.length})</span>
        )}
      </span>

      <div className={`mt-2 ${scrollable ? 'flex-1 overflow-y-auto' : ''}`}>
        {comments.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                compact={compact}
                onUpdate={(text) => onUpdate(comment.id, text)}
                onDelete={() => onDelete(comment.id)}
              />
            ))}
          </div>
        ) : (
          compact && (
            <p className="text-xs text-gray-400 italic">No comments yet</p>
          )
        )}
      </div>

      <CommentInput compact={compact} onAdd={onAdd} />
    </div>
  );
}
