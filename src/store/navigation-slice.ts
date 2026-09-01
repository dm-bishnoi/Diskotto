import { type StateCreator } from "zustand";
import type { DiskottoStoreFull } from "@/types/store";

/**
 * Navigation slice — manages path, selection, and expanded folders.
 * From architecture.md: State Layer with Zustand slice pattern.
 */
export interface NavigationSlice {
  // Navigation state
  currentPath: string[]; // Array of node IDs from root to current
  selectedNodeId: string | null;
  expandedFolders: Set<string>; // For folder tree UI state

  // Actions
  selectNode: (id: string | null) => void;
  drillDown: (id: string) => void;
  navigateUp: () => void;
  toggleFolder: (id: string) => void;
  setCurrentPath: (path: string[]) => void;
}

export const createNavigationSlice: StateCreator<
  DiskottoStoreFull,
  [],
  [],
  NavigationSlice
> = (set) => ({
  // Initial state
  currentPath: [],
  selectedNodeId: null,
  expandedFolders: new Set(),

  selectNode: (id) =>
    set(() => ({
      selectedNodeId: id,
    })),

  drillDown: (id) =>
    set((state) => ({
      currentPath: [...state.currentPath, id],
      selectedNodeId: id,
    })),

  navigateUp: () =>
    set((state) => {
      if (state.currentPath.length <= 1) return state;
      const newPath = state.currentPath.slice(0, -1);
      return {
        currentPath: newPath,
        selectedNodeId: newPath[newPath.length - 1] ?? null,
      };
    }),

  toggleFolder: (id) =>
    set((state) => {
      const newExpanded = new Set(state.expandedFolders);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return { expandedFolders: newExpanded };
    }),

  setCurrentPath: (path) =>
    set(() => ({
      currentPath: path,
    })),
});
