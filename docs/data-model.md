# Data Model

## Overview

Diskotto's data model is designed for efficient storage, fast querying, and accurate representation of filesystem hierarchies. The model balances completeness with performance, using immutable updates throughout to ensure compatibility with Zustand's shallow equality checks.

## Core Entities

### FileSystemNode

The fundamental entity representing any filesystem item (file, folder, or drive root).

```typescript
interface FileSystemNode {
  // Identity
  id: string;                    // UUID v4
  parentId: string | null;       // Parent node ID (null for root)

  // Basic Info
  name: string;                  // Display name (e.g., "Downloads")
  path: string;                  // Full path with OS separator (e.g., "C:/Users/Dharmender/Downloads")
  type: 'file' | 'folder' | 'drive';

  // Size Information
  size: number;                  // Own size in bytes (file: actual size, folder: 0, drive: total capacity)
  totalSize: number;             // Inclusive size (folder: sum of all children, file: same as size)
  fileCount: number;             // Number of files in this subtree (0 for files)
  folderCount: number;           // Number of subfolders in this subtree (0 for files)

  // File-Specific
  extension?: string;            // File extension without dot (e.g., "mp4")
  mimeType?: string;             // Detected MIME type (e.g., "video/mp4")

  // Timestamps
  createdAt?: undefined;         // NOT available in browser File API
                                  // Always undefined in web version
                                  // Populated in Tauri desktop version
  modifiedAt?: Date;             // Last modified timestamp (from file.lastModified)

  // Metadata
  isHidden: boolean;             // Hidden file/folder
  isSystem: boolean;             // System file/folder
  isReadonly: boolean;           // Read-only file/folder
  isEmpty?: boolean;             // Folder has no children (folders only)

  // Computed (cached for performance)
  category?: FileCategory;       // File category (video, image, etc.)
  percentageOfParent?: number;   // 0-100, size as % of parent
  depth: number;                 // Depth in tree (0 = root)

  // Children
  childrenIds: string[];         // Direct children IDs (empty for files)

  // Error State
  hasError: boolean;             // If node had errors during scan
  errorMessage?: string;         // Error details if hasError
}
```

### FileCategory Enum

```typescript
type FileCategory =
  | 'video'
  | 'image'
  | 'audio'
  | 'document'
  | 'archive'
  | 'application'
  | 'code'
  | 'system'
  | 'folder'
  | 'other';
```

### ScanStats

Tracks scan progress and results.

```typescript
interface ScanStats {
  filesScanned: number;          // Total files scanned
  foldersScanned: number;        // Total folders scanned
  totalBytes: number;            // Total bytes processed
  errorCount: number;            // Number of errors encountered
  startTime: number;             // Scan start timestamp
  endTime?: number;              // Scan end timestamp
  durationMs?: number;           // Total scan duration
}

type ScanStatus =
  | 'idle'         // Not started
  | 'scanning'     // Active scan
  | 'cancelled'    // Cancelled by user
  | 'complete'     // Successfully completed
  | 'error';       // Failed with critical error
```

### ScanError

```typescript
interface ScanError {
  path: string;                  // Path that caused error
  message: string;               // Human-readable error
  code: ErrorCode;               // Error code
  timestamp: Date;               // When error occurred
}

type ErrorCode =
  | 'PERMISSION_DENIED'
  | 'FILE_INACCESSIBLE'
  | 'INACCESSIBLE'
  | 'UNKNOWN';
```

### TreemapNode

Specialized node for D3 treemap rendering.

```typescript
interface TreemapNode {
  id: string;
  name: string;
  value: number;                 // Size for treemap layout
  category: FileCategory;
  type: 'file' | 'folder';
  path: string;
  extension?: string;

  // Computed by D3
  x0?: number;                   // Left edge (px)
  y0?: number;                   // Top edge (px)
  x1?: number;                   // Right edge (px)
  y1?: number;                   // Bottom edge (px)
  depth?: number;                // Depth in treemap

  // For drill-down
  children?: TreemapNode[];      // Nested children (for folders)
  parentId?: string;             // Parent in treemap
}
```

### ExtensionStats

Aggregated statistics for a file extension.

```typescript
interface ExtensionStats {
  extension: string;             // File extension (lowercase, without dot)
  category: FileCategory;        // File category
  fileCount: number;             // Number of files
  totalSize: number;             // Total size in bytes
  percentage: number;            // % of total scanned size
  averageSize: number;           // Average file size
  largestFile?: {
    name: string;
    path: string;
    size: number;
  };
}
```

### FileInsight

Cleanup opportunity insights.

```typescript
interface FileInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  estimatedSize: number;        // Potential space to free
  itemCount: number;             // Number of items
  fileIds?: string[];            // Related file/folder IDs
  actionLabel?: string;          // Suggested action
}

type InsightType =
  | 'LARGE_FOLDERS'              // Folders > 10 GB
  | 'LARGE_FILES'                // Files > 1 GB
  | 'OLD_FILES'                  // Unmodified in 2+ years
  | 'UNUSED_ARCHIVES'            // Archive files > 100 MB
  | 'LARGE_VIDEOS'               // Video files > 500 MB
  | 'EMPTY_FOLDERS';             // Empty directories
```

### SearchResult

```typescript
interface SearchResult {
  node: FileSystemNode;
  matchType: 'name' | 'path' | 'extension';
  matchPosition: number;         // Position in matched string
  highlightedName: string;       // Name with <mark> tags
  score: number;                 // Relevance score from search index
}
```

### FilterState

```typescript
interface FilterState {
  sizeFilters: SizeFilter[];
  typeFilters: FileCategory[];
  dateFilters: DateFilter[];
}

type SizeFilter = '>100MB' | '>500MB' | '>1GB' | '>5GB' | '>10GB';
type DateFilter = 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'older';
```

## Storage Architecture

### Zustand Store Shape

The store uses plain objects (not Maps) for compatibility with Zustand's shallow equality:

```typescript
interface DiskottoStore {
  // Node storage - Record (plain object) not Map
  // This is critical for Zustand re-render optimization
  nodes: Record<string, FileSystemNode>;
  rootId: string | null;
  
  // Navigation
  currentPath: string[];         // Breadcrumb segments
  selectedNodeId: string | null;
  expandedFolders: Set<string>;  // For folder tree UI state
  
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
  theme: 'light' | 'dark' | 'system';
  
  // Actions
  startScan: (handle: FileSystemDirectoryHandle) => Promise<void>;
  cancelScan: () => void;
  addNodes: (nodes: FileSystemNode[]) => void;
  selectNode: (id: string | null) => void;
  drillDown: (id: string) => void;
  navigateUp: () => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  toggleTheme: () => void;
}
```

### Why Record, Not Map

We use `Record<string, FileSystemNode>` instead of `Map<string, FileSystemNode>` because:

- **Zustand re-renders**: Zustand uses `Object.is` (reference equality). Mutating a Map doesn't change its reference, so subscribers won't be notified.
- **Immutability**: With `Record`, each update creates a new object reference, which is what Zustand expects.
- **Serialization**: Plain objects are JSON-serializable (useful for future IndexedDB caching).
- **Performance**: For our scale (<1M items), object property access is comparable to Map.get().

```typescript
// Correct pattern with Zustand
addNodes(nodes: FileSystemNode[]) {
  set((state) => ({
    nodes: { ...state.nodes, ...Object.fromEntries(nodes.map(n => [n.id, n])) }
  }));
}
```

### Why Store Full Path

Each node stores its complete path string (e.g., `C:/Users/Dharmender/Downloads/GTA_V.mp4`).

**Trade-off**:
- Memory cost: ~80 bytes per node × 100k nodes = ~8MB
- Benefit: O(1) path lookup, no tree traversal needed for breadcrumbs or search

This trade-off is worth it for our use case. If memory becomes constrained, we can add a separate `Map<id, string>` for paths while keeping nodes immutable.

## Search Index

We use a search index for fast queries. Rather than building a custom inverted index, we use `minisearch` (lightweight full-text search library, ~8KB gzipped).

```typescript
import MiniSearch from 'minisearch';

class SearchIndex {
  private index: MiniSearch<FileSystemNode>;
  
  constructor() {
    this.index = new MiniSearch({
      fields: ['name', 'path', 'extension'],
      storeFields: ['id', 'name', 'path', 'type', 'size', 'category'],
      searchOptions: {
        boost: { name: 2, extension: 1.5 },
        fuzzy: 0.2,
      },
    });
  }
  
  addNode(node: FileSystemNode): void {
    this.index.add(node);
  }
  
  addNodes(nodes: FileSystemNode[]): void {
    this.index.addAll(nodes);
  }
  
  search(query: string): SearchResult[] {
    return this.index.search(query, {
      filter: (result) => true,
    });
  }
  
  removeNode(id: string): void {
    const node = this.index.getStoredFields(id);
    if (node) this.index.remove(node);
  }
}
```

The search index is built incrementally as nodes are scanned, so search is available immediately after the first batch.

## Data Flow

### Scan Flow

```
File System Access API
    ↓
ScannerService (main thread)
    ↓
Extract metadata
    ↓
Generate FileSystemNode
    ↓
Batch (50 nodes or 50ms)
    ↓
Store: addNodes()
    ↓
SearchIndex: addNodes()
    ↓
React re-render
```

### Aggregation Flow

After scan completes, bottom-up aggregation:

```
1. Leaf files (no children)
   - totalSize = size
   - fileCount = 1
   - folderCount = 0

2. Parent folders (bottom-up)
   - totalSize = sum(children.totalSize)
   - fileCount = sum(children.fileCount)
   - folderCount = sum(children.folderCount) + 1
   - percentageOfParent = (totalSize / parent.totalSize) * 100
```

This aggregation runs once after the scan completes, in the store.

## File Type Detection

### Extension Mapping

```typescript
const FILE_CATEGORIES: Record<FileCategory, string[]> = {
  video: [
    'mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm',
    'm4v', 'mpg', 'mpeg', '3gp', 'ts', 'vob'
  ],
  image: [
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp',
    'ico', 'tiff', 'tif', 'heic', 'heif', 'raw', 'psd'
  ],
  audio: [
    'mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a',
    'opus', 'aiff', 'alac'
  ],
  document: [
    'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'pages',
    'md', 'epub', 'mobi', 'azw', 'azw3', 'fb2'
  ],
  archive: [
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz',
    'iso', 'dmg', 'pkg', 'deb', 'rpm'
  ],
  application: [
    'exe', 'msi', 'app', 'apk', 'ipa', 'jar', 'bat',
    'sh', 'command'
  ],
  code: [
    'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp',
    'cs', 'go', 'rs', 'php', 'rb', 'swift', 'kt', 'm',
    'h', 'html', 'css', 'scss', 'sass', 'less', 'json',
    'xml', 'yml', 'yaml', 'toml', 'sql', 'sh', 'ps1'
  ],
  system: [
    'dll', 'sys', 'ini', 'log', 'tmp', 'bak', 'dat',
    'bin', 'so', 'dylib', 'cab'
  ],
  folder: [],
  other: [],
};

// Compound extensions (check before single extensions)
const COMPOUND_EXTENSIONS: Record<string, FileCategory> = {
  'tar.gz': 'archive',
  'tar.bz2': 'archive',
  'tar.xz': 'archive',
  'tar.lz': 'archive',
};

function getFileCategory(fileName: string): FileCategory {
  const lower = fileName.toLowerCase();
  
  // Check compound extensions first
  for (const [ext, category] of Object.entries(COMPOUND_EXTENSIONS)) {
    if (lower.endsWith('.' + ext)) return category;
  }
  
  // Then check single extension
  const ext = lower.split('.').pop();
  if (!ext) return 'other';
  
  for (const [category, extensions] of Object.entries(FILE_CATEGORIES)) {
    if ((extensions as string[]).includes(ext)) {
      return category as FileCategory;
    }
  }
  return 'other';
}

function getExtension(fileName: string): string | undefined {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1 || lastDot === 0) return undefined;
  return fileName.substring(lastDot + 1).toLowerCase();
}
```

## Edge Cases

### Symbolic Links
- File System Access API does not expose symlink information in browsers
- All directories are treated identically
- Loop detection uses full path tracking to prevent infinite recursion

### Permission Errors
- Continue scanning on individual file/folder errors
- Log errors with context
- Show partial results
- Mark inaccessible nodes with `hasError: true`

### Very Long Paths
- Windows: 260 char limit (MAX_PATH) for the API
- Linux/macOS: 4096 char limit
- Truncate display, show full on hover

### Very Long Filenames
- Truncate display with ellipsis
- Show full name in tooltip and details

### Duplicate Names
- Allowed in filesystem
- Use path for unique identification
- Show name in UI

### Hidden Files
- Included by default
- Future: Option to exclude

### Empty Folders
- Detected via `isEmpty: true`
- Can be filtered out
- Insights may flag them

### Large Directories
- Stream processing with batched yields
- Update UI incrementally
- Show progress

## Validation

### Runtime Validation with Zod

```typescript
import { z } from 'zod';

const FileSystemNodeSchema = z.object({
  id: z.string().uuid(),
  parentId: z.string().uuid().nullable(),
  name: z.string().min(1).max(255),
  path: z.string().min(1),
  type: z.enum(['file', 'folder', 'drive']),
  size: z.number().int().min(0),
  totalSize: z.number().int().min(0),
  fileCount: z.number().int().min(0),
  folderCount: z.number().int().min(0),
  extension: z.string().optional(),
  mimeType: z.string().optional(),
  createdAt: z.undefined().optional(),  // Always undefined in browser
  modifiedAt: z.date().optional(),
  isHidden: z.boolean(),
  isSystem: z.boolean(),
  isReadonly: z.boolean(),
  isEmpty: z.boolean().optional(),
  category: z.enum([
    'video', 'image', 'audio', 'document',
    'archive', 'application', 'code', 'system',
    'folder', 'other'
  ]).optional(),
  percentageOfParent: z.number().min(0).max(100).optional(),
  depth: z.number().int().min(0),
  childrenIds: z.array(z.string().uuid()),
  hasError: z.boolean(),
  errorMessage: z.string().optional(),
});
```

## Future Enhancements

### Phase 2: Tauri Desktop
- `createdAt` will be populated from `std::fs::metadata`
- Real symlink detection
- File hash storage for duplicate detection (future)
- Persistent scan cache in IndexedDB
- File content previews (text, images)

### Phase 3
- Storage history tracking
- File tag/label system
- Custom metadata
- Cloud storage integration
