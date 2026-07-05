/**
 * Zustand store for undo / redo history.
 *
 * @remarks
 * Maintains a stack of past and future canvas snapshots.  The history is
 * capped at `maxHistory` entries (default 50).  Snapshots are opaque
 * `CanvasHistoryEntry` objects that the consumer serialises.
 *
 * @packageDocumentation
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { CanvasHistoryEntry } from '@/types/canvas';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface HistoryState {
  /** Snapshots that can be undone (most recent last). */
  past: CanvasHistoryEntry[];
  /** Snapshots that can be redone (most recent last). */
  future: CanvasHistoryEntry[];
  /** Maximum number of past entries before the oldest is dropped. */
  maxHistory: number;

  // ---- Actions -----------------------------------------------------------

  /** Push a new snapshot onto the history stack and clear the future. */
  pushState: (entry: CanvasHistoryEntry) => void;
  /**
   * Pop the latest snapshot from `past`.
   * @returns the entry to restore, or `null` if nothing to undo.
   */
  undo: () => CanvasHistoryEntry | null;
  /**
   * Pop the latest snapshot from `future`.
   * @returns the entry to restore, or `null` if nothing to redo.
   */
  redo: () => CanvasHistoryEntry | null;
  /** Wipe the entire history stack. */
  clear: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useHistoryStore = create<HistoryState>()(
  immer((set, get) => ({
    past: [],
    future: [],
    maxHistory: 50,

    pushState: (entry) => {
      set((state) => {
        state.past.push(entry);
        // Enforce the cap — drop oldest entries
        while (state.past.length > state.maxHistory) {
          state.past.shift();
        }
        // Any new action invalidates the redo stack
        state.future = [];
      });
    },

    undo: () => {
      const { past } = get();
      if (past.length === 0) return null;

      const entry = past[past.length - 1]!;
      set((state) => {
        state.past = state.past.slice(0, -1);
        state.future.push(entry);
      });
      return entry;
    },

    redo: () => {
      const { future } = get();
      if (future.length === 0) return null;

      const entry = future[future.length - 1]!;
      set((state) => {
        state.future = state.future.slice(0, -1);
        state.past.push(entry);
      });
      return entry;
    },

    clear: () => {
      set((state) => {
        state.past = [];
        state.future = [];
      });
    },
  })),
);
