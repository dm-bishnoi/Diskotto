// File category type - from data-model.md
export type FileCategory =
  | "video"
  | "image"
  | "audio"
  | "document"
  | "archive"
  | "application"
  | "code"
  | "system"
  | "folder"
  | "other";

// File system node - from data-model.md
// Identity
export interface FileSystemNode {
  id: string; // UUID v4
  parentId: string | null; // Parent node ID (null for root)

  // Basic Info
  name: string; // Display name (e.g., "Downloads")
  path: string; // Full path (e.g., "C:/Users/Dharmender/Downloads")
  type: "file" | "folder" | "drive";

  // Size Information
  size: number; // Own size in bytes (file: actual size, folder: 0)
  totalSize: number; // Inclusive size (folder: sum of all children)
  fileCount: number; // Number of files in subtree (0 for files)
  folderCount: number; // Number of subfolders in subtree (0 for files)

  // File-Specific
  extension?: string; // File extension without dot (e.g., "mp4")
  mimeType?: string; // Detected MIME type

  // Timestamps
  modifiedAt?: Date; // Last modified timestamp

  // Metadata
  isHidden: boolean; // Hidden file/folder
  isSystem: boolean; // System file/folder
  isReadonly: boolean; // Read-only file/folder
  isEmpty?: boolean; // Folder has no children (folders only)

  // Computed
  category?: FileCategory; // File category
  percentageOfParent?: number; // 0-100, size as % of parent
  depth: number; // Depth in tree (0 = root)

  // Children
  childrenIds: string[]; // Direct children IDs (empty for files)

  // Error State
  hasError: boolean; // If node had errors during scan
  errorMessage?: string; // Error details if hasError
}

// Treemap node for D3 rendering - from data-model.md
export interface TreemapNode {
  id: string;
  name: string;
  value: number; // Size for treemap layout
  category: FileCategory;
  type: "file" | "folder";
  path: string;
  extension?: string;

  // Computed by D3
  x0?: number;
  y0?: number;
  x1?: number;
  y1?: number;
  depth?: number;

  // For drill-down
  children?: TreemapNode[];
  parentId?: string;
}

// Extension stats - from data-model.md
export interface ExtensionStats {
  extension: string; // File extension (lowercase, without dot)
  category: FileCategory;
  fileCount: number;
  totalSize: number;
  percentage: number;
  averageSize: number;
  largestFile?: {
    name: string;
    path: string;
    size: number;
  };
}

// File insight - from data-model.md
export interface FileInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  estimatedSize: number;
  itemCount: number;
  fileIds?: string[];
  actionLabel?: string;
}

export type InsightType =
  | "LARGE_FOLDERS"
  | "LARGE_FILES"
  | "OLD_FILES"
  | "UNUSED_ARCHIVES"
  | "LARGE_VIDEOS"
  | "EMPTY_FOLDERS";

// Search result - from data-model.md
export interface SearchResult {
  node: FileSystemNode;
  matchType: "name" | "path" | "extension";
  matchPosition: number;
  highlightedName: string;
  score: number;
}

// Filter state - from data-model.md
export type SizeFilter = ">100MB" | ">500MB" | ">1GB" | ">5GB" | ">10GB";
export type DateFilter = "today" | "thisWeek" | "thisMonth" | "thisYear" | "older";

export interface FilterState {
  sizeFilters: SizeFilter[];
  typeFilters: string[];
  dateFilters: DateFilter[];
}
