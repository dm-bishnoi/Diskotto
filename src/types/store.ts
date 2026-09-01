import type { FileSystemNode } from "./filesystem";
import type { SearchResult } from "./filesystem";
import type { FilterState } from "./filesystem";
import type { ScanStatus } from "./scan";
import type { ScanStats } from "./scan";
import type { ScanError } from "./scan";

// Browser support status
export type BrowserSupport = "full" | "partial" | "unsupported";

// Complete store shape - from architecture.md and data-model.md
export interface DiskottoStore {
  // Node storage — Record (plain object) NOT Map
  // Critical for Zustand re-render optimization with shallow equality
  nodes: Record<string, FileSystemNode>;
  rootId: string | null;

  // Navigation
  currentPath: string[]; // Breadcrumb segments (node IDs)
  selectedNodeId: string | null;
  expandedFolders: Set<string>; // For folder tree UI state

  // Search
  searchQuery: string;
  searchResults: SearchResult[];

  // Filters
  activeFilters: FilterState;

  // Scan state
  scanStatus: ScanStatus;
  scanStats: ScanStats | null;
  scanErrors: ScanError[];

  // UI state
  sidebarCollapsed: boolean;
  detailsPanelOpen: boolean;
  theme: "light" | "dark" | "system";

  // Browser support
  browserSupport: BrowserSupport;
}

// Store actions interface
export interface DiskottoActions {
  // Scan actions
  startScan: (handle: FileSystemDirectoryHandle) => Promise<void>;
  cancelScan: () => void;
  resetScan: () => void;
  addNodes: (nodes: FileSystemNode[]) => void;
  setScanStatus: (status: ScanStatus) => void;
  setScanStats: (stats: ScanStats) => void;
  addScanError: (error: ScanError) => void;

  // Navigation actions
  selectNode: (id: string | null) => void;
  drillDown: (id: string) => void;
  navigateUp: () => void;
  toggleFolder: (id: string) => void;
  setCurrentPath: (path: string[]) => void;

  // Search actions
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  clearSearch: () => void;

  // Filter actions
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;

  // UI actions
  toggleSidebar: () => void;
  toggleDetailsPanel: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleTheme: () => void;
  setBrowserSupport: (support: BrowserSupport) => void;
}

// Full store type
export type DiskottoStoreFull = DiskottoStore & DiskottoActions;
