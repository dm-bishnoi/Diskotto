import { type StateCreator } from "zustand";
import type { DiskottoStoreFull } from "@/types/store";
import type { ScanStatus, ScanStats, ScanError } from "@/types/scan";
import type { FileSystemNode } from "@/types/filesystem";

/**
 * Scan slice — manages scan state, progress, and node storage.
 * From architecture.md: State Layer with Zustand slice pattern.
 */
export interface ScanSlice {
  // Node storage — Record<string, FileSystemNode>, NOT Map
  // Critical: Zustand uses shallow equality; records update correctly with spread
  nodes: Record<string, FileSystemNode>;
  rootId: string | null;

  // Scan state
  scanStatus: ScanStatus;
  scanStats: ScanStats | null;
  scanErrors: ScanError[];

  // Actions
  addNodes: (nodes: FileSystemNode[]) => void;
  setScanStatus: (status: ScanStatus) => void;
  setScanStats: (stats: ScanStats) => void;
  addScanError: (error: ScanError) => void;
  resetScan: () => void;
  setRootNode: (node: FileSystemNode) => void;
  startScan: (handle: FileSystemDirectoryHandle) => Promise<void>;
  cancelScan: () => void;
}

export const createScanSlice: StateCreator<
  DiskottoStoreFull,
  [],
  [],
  ScanSlice
> = (set) => ({
  // Initial state
  nodes: {},
  rootId: null,
  scanStatus: "idle",
  scanStats: null,
  scanErrors: [],

  // Add nodes using Record spread — creates new reference for Zustand shallow equality
  addNodes: (nodes) =>
    set((state) => ({
      nodes: {
        ...state.nodes,
        ...Object.fromEntries(nodes.map((n) => [n.id, n])),
      },
    })),

  setScanStatus: (status) =>
    set(() => ({
      scanStatus: status,
    })),

  setScanStats: (stats) =>
    set(() => ({
      scanStats: stats,
    })),

  addScanError: (error) =>
    set((state) => ({
      scanErrors: [...state.scanErrors, error],
    })),

  resetScan: () =>
    set(() => ({
      nodes: {},
      rootId: null,
      scanStatus: "idle",
      scanStats: null,
      scanErrors: [],
    })),

  // Stub for Phase 1 — real implementation in Phase 5
  startScan: async (_handle: FileSystemDirectoryHandle) => {
    // Phase 5: implement real scanner
    console.warn("startScan not implemented yet (Phase 5)");
  },

  // Stub for Phase 1 — real implementation in Phase 5
  cancelScan: () => {
    // Phase 5: implement real cancellation
    console.warn("cancelScan not implemented yet (Phase 5)");
  },

  setRootNode: (node) =>
    set(() => ({
      rootId: node.id,
    })),
});
