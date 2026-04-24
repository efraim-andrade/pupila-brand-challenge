export const TAG_COLORS = {
  indigo: '#6366f1',
  blue: '#3b82f6',
  emerald: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  violet: '#8b5cf6',
  orange: '#f97316',
  teal: '#14b8a6',
} as const;

export const DEFAULT_TAG_COLOR = TAG_COLORS.indigo;
export const DEFAULT_GROUP_COLOR = TAG_COLORS.indigo;

export type TagColor = (typeof TAG_COLORS)[keyof typeof TAG_COLORS];
