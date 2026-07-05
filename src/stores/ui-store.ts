/**
 * Zustand store for global UI state.
 *
 * @remarks
 * Tracks the current colour theme, sidebar panel visibility, and the
 * active side-panel tab.  Panel open/close flags default to `true` (panels
 * open) so the canvas area is framed by both sidebars on first load.
 *
 * @packageDocumentation
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ThemeMode = 'light' | 'dark';
export type ActivePanel = 'none' | 'properties' | 'search';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface UIState {
  /** Current colour theme. */
  theme: ThemeMode;
  /** Whether the left sidebar is open. */
  leftPanelOpen: boolean;
  /** Whether the right sidebar is open. */
  rightPanelOpen: boolean;
  /** Which panel tab is currently active. */
  activePanel: ActivePanel;
  /** Whether the mobile navigation sidebar is open. */
  mobileSidebarOpen: boolean;

  // ---- Actions -----------------------------------------------------------

  /** Toggle between light and dark. */
  toggleTheme: () => void;
  /** Explicitly set the theme. */
  setTheme: (theme: ThemeMode) => void;
  /** Toggle the left sidebar open/closed. */
  toggleLeftPanel: () => void;
  /** Toggle the right sidebar open/closed. */
  toggleRightPanel: () => void;
  /** Switch the active panel (or set to `'none'`). */
  setActivePanel: (panel: ActivePanel) => void;
  /** Set mobile sidebar open/closed. */
  setMobileSidebarOpen: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useUIStore = create<UIState>()(
  immer((set) => ({
    theme: 'light',
    leftPanelOpen: true,
    rightPanelOpen: true,
    activePanel: 'none',
    mobileSidebarOpen: false,

    toggleTheme: () => {
      set((state) => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
      });
    },

    setTheme: (theme) => {
      set((state) => {
        state.theme = theme;
      });
    },

    toggleLeftPanel: () => {
      set((state) => {
        state.leftPanelOpen = !state.leftPanelOpen;
      });
    },

    toggleRightPanel: () => {
      set((state) => {
        state.rightPanelOpen = !state.rightPanelOpen;
      });
    },

    setActivePanel: (panel) => {
      set((state) => {
        state.activePanel = panel;
      });
    },

    setMobileSidebarOpen: (open) => {
      set((state) => {
        state.mobileSidebarOpen = open;
      });
    },
  })),
);
