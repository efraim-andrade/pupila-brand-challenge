'use client';

import { Sparkles, X } from 'lucide-react';
import type { JSX } from 'react';
import type { Group, Tag } from '@/types';
import type { TagSuggestions } from '../hooks/useTagSuggestions';

interface AiSuggestionBarProps {
  suggestions: TagSuggestions | null;
  isLoading: boolean;
  error: string | null;
  existingGroups: Group[];
  existingTags: Tag[];
  onApplyAll: (groupName: string | null, tagNames: string[]) => void;
  onDismiss: () => void;
}

function SparkleIcon(): JSX.Element {
  return <Sparkles width={14} height={14} strokeWidth={2} aria-hidden="true" />;
}

function LoadingDots(): JSX.Element {
  return (
    <span className="flex items-center gap-1 text-xs text-text-muted">
      <SparkleIcon />
      Analyzing image\u2026
    </span>
  );
}

export function AiSuggestionBar({
  suggestions,
  isLoading,
  error,
  onApplyAll,
  onDismiss,
}: AiSuggestionBarProps): JSX.Element | null {
  if (!isLoading && !suggestions && !error) return null;

  return (
    <div className="rounded-md bg-surface-subtle px-3 py-2.5 shadow-border">
      {isLoading && <LoadingDots />}

      {!isLoading && error && (
        <span className="text-xs text-red-500">{error}</span>
      )}

      {!isLoading && suggestions && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-medium text-text-primary">
            <SparkleIcon />
            AI suggested
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            {suggestions.group && (
              <span className="inline-flex items-center gap-1 rounded-full bg-badge-bg px-2 py-0.5 text-xs font-medium text-badge-text">
                <span className="text-text-muted">group:</span>
                {suggestions.group}
              </span>
            )}

            {suggestions.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-xs text-text-tertiary shadow-border"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onApplyAll(suggestions.group, suggestions.tags)}
              className="rounded px-2 py-1 text-xs font-medium text-text-primary hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-focus"
            >
              Apply all
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded p-1 text-text-muted hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-focus"
              aria-label="Dismiss suggestions"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
