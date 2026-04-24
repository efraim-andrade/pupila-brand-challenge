'use client';

import { useEffect, useRef, useState } from 'react';

export interface TagSuggestions {
  group: string | null;
  tags: string[];
}

export interface UseTagSuggestionsResult {
  suggestions: TagSuggestions | null;
  isLoading: boolean;
  error: string | null;
  dismiss: () => void;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function useTagSuggestions(imageUrl: string): UseTagSuggestionsResult {
  const [suggestions, setSuggestions] = useState<TagSuggestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    setSuggestions(null);
    setError(null);

    if (!imageUrl || !isValidUrl(imageUrl)) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const abortController = new AbortController();

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch('/api/suggest-tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl }),
          signal: abortController.signal,
        });

        if (response.status === 503) {
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(errorBody.error ?? 'Suggestion failed');
        }

        const tagSuggestionData = await response.json();
        setSuggestions(tagSuggestionData);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(
          err instanceof Error ? err.message : 'Could not fetch suggestions'
        );
      } finally {
        setIsLoading(false);
      }
    }, 1200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortController.abort();
    };
  }, [imageUrl]);

  return { suggestions, isLoading, error, dismiss: () => setSuggestions(null) };
}
