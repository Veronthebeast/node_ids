'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { useUIStore, type ThemeMode } from '@/stores/ui-store';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface ThemeContextValue {
  /** The current theme. */
  theme: ThemeMode;
  /** Toggle between light and dark. */
  toggleTheme: () => void;
  /** Explicitly set the theme. */
  setTheme: (mode: ThemeMode) => void;
  /** Whether dark mode is currently active. */
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a <ThemeProvider>');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useUIStore((s) => s.theme);
  const setStoreTheme = useUIStore((s) => s.setTheme);
  const toggleStoreTheme = useUIStore((s) => s.toggleTheme);

  const isDark = theme === 'dark';

  // Apply 'dark' class to <html> whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  // On first mount, read from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem('nodeids-theme') as ThemeMode | null;
    if (stored === 'light' || stored === 'dark') {
      setStoreTheme(stored);
    } else {
      // Fall back to system preference
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      setStoreTheme(prefersDark ? 'dark' : 'light');
    }
  }, [setStoreTheme]);

  // Listen for system preference changes (only applies when no stored preference)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem('nodeids-theme');
      if (!stored) {
        setStoreTheme(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [setStoreTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme: toggleStoreTheme,
      setTheme: setStoreTheme,
      isDark,
    }),
    [theme, toggleStoreTheme, setStoreTheme, isDark],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
