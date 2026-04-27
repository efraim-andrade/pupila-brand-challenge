/**
 * Design tokens matching the Vercel-inspired system defined in globals.css.
 *
 * CSS custom properties are the source of truth for styling.
 * Use Tailwind semantic classes in components:
 *   bg-surface, bg-surface-subtle, text-text-primary, shadow-border, ring-focus, etc.
 *
 * These constants are for programmatic access (inline styles, dynamic values).
 */

export const tokens = {
  color: {
    background: '#ffffff',
    foreground: '#171717',

    surface: '#ffffff',
    surfaceSubtle: '#fafafa',
    surfaceMuted: '#ebebeb',

    border: 'rgba(0, 0, 0, 0.08)',
    borderStrong: '#ebebeb',

    textPrimary: '#171717',
    textSecondary: '#4d4d4d',
    textTertiary: '#666666',
    textMuted: '#808080',

    focus: 'hsla(212, 100%, 48%, 1)',
    selection: 'hsla(0, 0%, 95%, 1)',

    badgeBg: '#ebf5ff',
    badgeText: '#0068d6',

    danger: '#dc2626',
    dangerBg: '#fef2f2',
  },

  shadow: {
    border: '0 0 0 1px rgba(0, 0, 0, 0.08)',
    borderStrong: '0 0 0 1px #ebebeb',
    card: '0 0 0 1px rgba(0, 0, 0, 0.08), 0 2px 2px rgba(0, 0, 0, 0.04), 0 0 0 1px #fafafa',
    cardHover:
      '0 0 0 1px rgba(0, 0, 0, 0.08), 0 2px 2px rgba(0, 0, 0, 0.04), 0 8px 8px -8px rgba(0, 0, 0, 0.04), 0 0 0 1px #fafafa',
    elevated:
      '0 0 0 1px rgba(0, 0, 0, 0.08), 0 2px 2px rgba(0, 0, 0, 0.04), 0 8px 8px -8px rgba(0, 0, 0, 0.04), 0 0 0 1px #fafafa',
  },

  font: {
    sans: 'var(--font-geist), Arial, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol',
    mono: 'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Liberation Mono, DejaVu Sans Mono, Courier New',
  },
} as const;
