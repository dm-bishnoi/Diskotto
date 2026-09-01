import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createScanSlice, type ScanSlice } from "./scan-slice";
import { createNavigationSlice, type NavigationSlice } from "./navigation-slice";
import { createSearchSlice, type SearchSlice } from "./search-slice";
import { createUISlice, type UISlice } from "./ui-slice";
import type { DiskottoStoreFull } from "@/types/store";

/**
 * Zustand store using the slice pattern.
 *
 * Per ADR-004: single combined store, NOT multiple stores.
 * Each slice composes into the full store.
 *
 * Per data-model.md: nodes is Record<string, FileSystemNode>, NOT Map.
 */
function createStore() {
  return create<DiskottoStoreFull>()(
    devtools(
      persist(
        (set, get, store) => ({
          ...(createScanSlice(set, get, store as never)),
          ...(createNavigationSlice(set, get, store as never)),
          ...(createSearchSlice(set, get, store as never)),
          ...(createUISlice(set, get, store as never)),
        }),
        {
          name: "diskotto-store",
          partialize: (state) => ({
            theme: state.theme,
            sidebarCollapsed: state.sidebarCollapsed,
          }),
        }
      ),
      { name: "Diskotto Store" }
    )
  );
}

export const useDiskottoStore = createStore();

// Re-export slices for external use
export type { ScanSlice, NavigationSlice, SearchSlice, UISlice };

/**
 * Selector: get the root node from the store.
 */
export function useRootNode() {
  return useDiskottoStore((state) => {
    if (!state.rootId) return null;
    return state.nodes[state.rootId] ?? null;
  });
}

/**
 * Selector: get the current folder node from currentPath.
 */
export function useCurrentNode() {
  return useDiskottoStore((state) => {
    const currentId = state.currentPath[state.currentPath.length - 1];
    if (!currentId) return state.rootId ? state.nodes[state.rootId] ?? null : null;
    return state.nodes[currentId] ?? null;
  });
}

/**
 * Selector: get selected node.
 */
export function useSelectedNode() {
  return useDiskottoStore((state) => {
    if (!state.selectedNodeId) return null;
    return state.nodes[state.selectedNodeId] ?? null;
  });
}

/**
 * Selector: get scan status.
 */
export function useScanStatus() {
  return useDiskottoStore((state) => state.scanStatus);
}

/**
 * Selector: get scan progress stats.
 */
export function useScanStats() {
  return useDiskottoStore((state) => state.scanStats);
}

/**
 * Selector: get theme.
 */
export function useTheme() {
  return useDiskottoStore((state) => state.theme);
}
