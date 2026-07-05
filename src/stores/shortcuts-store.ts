import { create } from 'zustand';

interface ShortcutsState {
  isCtrlPressed: boolean;
  lastShortcut: string | null;
  setCtrlPressed: (pressed: boolean) => void;
  setLastShortcut: (shortcut: string | null) => void;
}

export const useShortcutsStore = create<ShortcutsState>((set) => ({
  isCtrlPressed: false,
  lastShortcut: null,
  setCtrlPressed: (pressed) => set({ isCtrlPressed: pressed }),
  setLastShortcut: (shortcut) => set({ lastShortcut: shortcut }),
}));
