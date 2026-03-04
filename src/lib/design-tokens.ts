/**
 * InvoiceFlow Design Tokens
 * Single source of truth for all design values.
 * CSS counterpart lives in globals.css — keep them in sync.
 */

export const tokens = {
  colors: {
    background: '#ffffff',
    surface: '#ffffff',
    surfaceSecondary: '#f5f5f7',
    border: '#e5e5e5',
    borderSubtle: '#f0f0f0',

    text: {
      primary: '#0a0a0a',
      secondary: '#525252',
      tertiary: '#a3a3a3',
    },

    primary: {
      default: '#2563eb',
      hover: '#1d4ed8',
      light: '#dbeafe',
      lighter: '#eff6ff',
      ring: 'rgba(37, 99, 235, 0.2)',
      subtle: '#dbeafe',
      foreground: '#ffffff',
    },

    sidebar: {
      bg: '#f5f5f7',
      text: '#737373',
      textActive: '#2563eb',
      hover: '#eaeaed',
      active: 'rgba(37, 99, 235, 0.08)',
    },

    status: {
      paid: { text: '#059669', bg: '#ecfdf5' },
      pending: { text: '#d97706', bg: '#fffbeb' },
      overdue: { text: '#dc2626', bg: '#fef2f2' },
      draft: { text: '#737373', bg: '#f5f5f5' },
      scheduled: { text: '#4f46e5', bg: '#eef2ff' },
      cancelled: { text: '#737373', bg: '#f5f5f5' },
    },

    destructive: '#dc2626',
  },

  typography: {
    fontSans: 'var(--font-geist-sans)',
    fontMono: 'var(--font-geist-mono)',
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.8125rem',  // 13px
      base: '0.875rem', // 14px
      lg: '1rem',       // 16px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '2rem',    // 32px
    },
    letterSpacing: {
      tight: '-0.02em',
      normal: '-0.01em',
    },
  },

  spacing: {
    pagePadding: '2rem',
    pagePaddingMobile: '1rem',
  },

  layout: {
    sidebarWidth: '240px',
    sidebarCollapsedWidth: '64px',
    contentMaxWidth: '1200px',
  },

  radius: {
    sm: '0.375rem',  // 6px — buttons, inputs
    md: '0.5rem',    // 8px — cards
    lg: '0.75rem',   // 12px — modals
    full: '9999px',  // pills
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
  },

  transitions: {
    fast: '100ms',
    base: '150ms',
    slow: '200ms',
  },

  components: {
    buttonHeight: '2.25rem',   // 36px
    inputHeight: '2.5rem',     // 40px
    navItemHeight: '2.25rem',  // 36px
    tableRowHeight: '3.25rem', // 52px
    iconSize: '1.125rem',      // 18px
  },
} as const;
