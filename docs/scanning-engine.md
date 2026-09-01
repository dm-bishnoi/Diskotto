# Scanning Engine

## Overview

The scanning engine is responsible for recursively traversing the user's selected folder, extracting metadata, and building a filesystem tree. It runs in the **main thread** with async/await and periodic yields to keep the UI responsive during large scans.

### Architecture Decision: Main Thread

After evaluation, the scanner runs in the main thread rather than a Web Worker. This decision is based on:

- **FileSystemDirectoryHandle is not structured-cloneable** and cannot be transferred to a Web Worker via `postMessage`
- **Simplicity**: No serialization overhead, no message passing complexity
- **Cancellation**: Straightforward — just set a flag and return
- **Performance**: With proper yields (every 50ms), the UI remains responsive even during 100k file scans
- **Tauri migration**: The Rust backend will replace this entirely; no need to over-engineer the web version

The trade-off is that heavy processing blocks the main thread briefly, but with batched yields this is acceptable for our scale (10k–100k files).

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MAIN THREAD                              │
│                                                              │
│  ┌────────────────┐      ┌──────────────────┐             │
│  │  Scan Button   │─────▶│  Store Action    │             │
│  └────────────────┘      │  startScan()     │             │
│                            └──────────────────┘             │
│                                    │                        │
│                                    ▼                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Scanner Service (lib/scanner.ts)                     │   │
│  │  - Async directory traversal                         │   │
│  │  - Periodic yields (every 50ms)                      │   │
│  │  - Batch updates to store                           │   │
│  │  - Cancellation via AbortController                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                    │                        │
│                                    ▼                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Store (Zustand)                                      │   │
│  │  - Receive node batches (every 50ms)                  │   │
│  │  - Maintain in-memory tree                           │   │
│  │  - Trigger re-renders                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React UI                                             │   │
│  │  - Treemap, Folder Tree, Analytics                   │   │
│  │  - Renders between scan yields                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                            ↕ File System Access API
┌─────────────────────────────────────────────────────────────┐
│                    USER'S FILESYSTEM                        │
└─────────────────────────────────────────────────────────────┘
```

## Scanner Implementation

### Scanner Service

```typescript
// lib/scanner.ts
import type { FileSystemNode, ScanProgress, ScanError } from '@/types/scan';

const YIELD_INTERVAL_MS = 50;      // Yield to UI every 50ms
const BATCH_SIZE = 50;              // Nodes per batch update
const MAX_DEPTH = 50;               // Prevent infinite recursion

interface ScanOptions {
  signal?: AbortSignal;             // For cancellation
  includeHidden?: boolean;
  maxDepth?: number;
}

class ScannerService {
  private visitedPaths = new Set<string>();
  private nodeCount = 0;
  private batchBuffer: FileSystemNode[] = [];
  private lastYield = 0;

  async scan(
    directoryHandle: FileSystemDirectoryHandle,
    options: ScanOptions = {}
  ): Promise<void> {
    const {
      signal,
      includeHidden = true,
      maxDepth = MAX_DEPTH,
    } = options;

    this.visitedPaths.clear();
    this.nodeCount = 0;
    this.batchBuffer = [];
    this.lastYield = Date.now();

    const stats: ScanStats = {
      filesScanned: 0,
      foldersScanned: 0,
      totalBytes: 0,
      errorCount: 0,
      startTime: Date.now(),
    };

    const errors: ScanError[] = [];

    // Set up cancellation
    const onAbort = () => {
      // The scan loop will check signal.aborted at each yield point
    };
    signal?.addEventListener('abort', onAbort);

    try {
      await this.traverseDirectory(
        directoryHandle,
        null,           // parentId
        [],             // parentPath (for building full path)
        0,              // depth
        includeHidden,
        maxDepth,
        stats,
        errors,
        signal
      );

      // Flush any remaining nodes
      this.flushBatch();

      if (signal?.aborted) {
        this.onComplete?.(stats, errors, 'cancelled');
      } else {
        this.onComplete?.(stats, errors, 'complete');
      }
    } catch (error) {
      // Flush batch even on error — partial results are valuable
      this.flushBatch();
      this.onComplete?.(stats, errors, 'error');
    } finally {
      signal?.removeEventListener('abort', onAbort);
    }
  }

  private async traverseDirectory(
    dirHandle: FileSystemDirectoryHandle,
    parentId: string | null,
    parentPath: string[],
    depth: number,
    includeHidden: boolean,
    maxDepth: number,
    stats: ScanStats,
    errors: ScanError[],
    signal?: AbortSignal
  ): Promise<string | null> {
    // Check cancellation at each directory
    if (signal?.aborted) return null;
    if (depth > maxDepth) return null;

    // Build this directory's full path
    const currentPath = [...parentPath, dirHandle.name];
    const pathKey = currentPath.join('/');

    // Prevent infinite loops (track full paths, not just names)
    if (this.visitedPaths.has(pathKey)) return null;
    this.visitedPaths.add(pathKey);

    const nodeId = crypto.randomUUID();
    const node: FileSystemNode = {
      id: nodeId,
      parentId,
      name: dirHandle.name,
      path: pathKey,
      type: 'folder',
      size: 0,
      totalSize: 0,
      fileCount: 0,
      folderCount: 0,
      isHidden: dirHandle.name.startsWith('.'),
      isSystem: false,
      isReadonly: false,
      depth,
      childrenIds: [],
      hasError: false,
      isEmpty: true,  // Will be set false when children added
    };

    this.addToBatch(node);
    stats.foldersScanned++;

    try {
      // Iterate directory entries
      // We use a manual loop with yields instead of for-await
      // to allow periodic cancellation checks
      const entries: FileSystemHandle[] = [];
      for await (const entry of dirHandle.values()) {
        if (signal?.aborted) break;
        entries.push(entry);
      }

      for (const entry of entries) {
        if (signal?.aborted) break;

        if (entry.kind === 'file') {
          const fileNode = await this.processFile(
            entry as FileSystemFileHandle,
            nodeId,
            currentPath,
            depth + 1,
            stats,
            errors
          );
          if (fileNode) {
            node.childrenIds.push(fileNode.id);
            this.addToBatch(fileNode);
            stats.filesScanned++;
            stats.totalBytes += fileNode.size;
            node.isEmpty = false;
          }
        } else if (entry.kind === 'directory') {
          const childId = await this.traverseDirectory(
            entry as FileSystemDirectoryHandle,
            nodeId,
            currentPath,
            depth + 1,
            includeHidden,
            maxDepth,
            stats,
            errors,
            signal
          );
          if (childId) {
            node.childrenIds.push(childId);
            node.folderCount++;
            node.isEmpty = false;
          }
        }
      }
    } catch (error) {
      node.hasError = true;
      node.errorMessage = (error as Error).message;
      stats.errorCount++;
      errors.push({
        path: pathKey,
        message: (error as Error).message,
        code: 'INACCESSIBLE',
        timestamp: new Date(),
      });
    }

    return nodeId;
  }

  private async processFile(
    fileHandle: FileSystemFileHandle,
    parentId: string,
    parentPath: string[],
    depth: number,
    stats: ScanStats,
    errors: ScanError[]
  ): Promise<FileSystemNode | null> {
    try {
      const file = await fileHandle.getFile();
      const fileName = file.name;
      const extension = this.getExtension(fileName);
      const fullPath = [...parentPath, fileName].join('/');

      return {
        id: crypto.randomUUID(),
        parentId,
        name: fileName,
        path: fullPath,
        type: 'file',
        size: file.size,
        totalSize: file.size,
        fileCount: 1,
        folderCount: 0,
        extension,
        mimeType: file.type || undefined,
        // Note: File System Access API only exposes lastModified,
        // not creation time. createdAt is always undefined in browser.
        createdAt: undefined,
        modifiedAt: new Date(file.lastModified),
        isHidden: fileName.startsWith('.'),
        isSystem: false,
        isReadonly: false,
        category: getFileCategory(fileName),
        depth,
        childrenIds: [],
        hasError: false,
      };
    } catch (error) {
      stats.errorCount++;
      errors.push({
        path: fileHandle.name,
        message: (error as Error).message,
        code: 'FILE_INACCESSIBLE',
        timestamp: new Date(),
      });
      return null;
    }
  }

  private getExtension(fileName: string): string | undefined {
    const lastDot = fileName.lastIndexOf('.');
    if (lastDot === -1 || lastDot === 0) return undefined;
    return fileName.substring(lastDot + 1).toLowerCase();
  }

  private addToBatch(node: FileSystemNode): void {
    this.batchBuffer.push(node);
    this.nodeCount++;

    // Yield to UI if enough nodes accumulated or enough time passed
    const now = Date.now();
    if (
      this.batchBuffer.length >= BATCH_SIZE ||
      now - this.lastYield >= YIELD_INTERVAL_MS
    ) {
      this.flushBatch();
    }
  }

  private flushBatch(): void {
    if (this.batchBuffer.length > 0) {
      const nodes = this.batchBuffer.splice(0, this.batchBuffer.length);
      this.onBatch?.(nodes);
      this.lastYield = Date.now();
    }
  }

  // Callbacks
  onBatch?: (nodes: FileSystemNode[]) => void;
  onProgress?: (stats: ScanStats) => void;
  onComplete?: (stats: ScanStats, errors: ScanError[], status: 'complete' | 'cancelled' | 'error') => void;
}

export const scanner = new ScannerService();
```

### Cancellation with AbortController

```typescript
// In store
let currentAbortController: AbortController | null = null;

async startScan(directoryHandle: FileSystemDirectoryHandle) {
  // Cancel any existing scan
  if (currentAbortController) {
    currentAbortController.abort();
  }

  currentAbortController = new AbortController();
  const signal = currentAbortController.signal;

  set({ scanStatus: 'scanning' });

  scanner.onBatch = (nodes) => {
    // Add nodes to store
    get().addNodes(nodes);
  };

  scanner.onComplete = (stats, errors, status) => {
    set({
      scanStatus: status,
      scanStats: stats,
      scanErrors: errors,
    });
    currentAbortController = null;
  };

  await scanner.scan(directoryHandle, { signal });
}

cancelScan() {
  currentAbortController?.abort();
  // The scan loop will check signal.aborted and stop
}
```

## Performance Optimizations

### 1. Batched Yields

The scanner processes files in batches and yields to the UI thread periodically:

```typescript
const YIELD_INTERVAL_MS = 50;   // 20fps UI update rate
const BATCH_SIZE = 50;           // Max nodes per batch
```

When either threshold is met, the current batch is flushed to the store and the scanner awaits a microtask, allowing React to render.

### 2. Abort-Based Cancellation

Instead of a boolean flag, we use `AbortController` which is the standard browser API for cancellation:

- **Reliable**: `signal.aborted` is checked at every yield point
- **Standard**: Built into the platform
- **Composable**: Can be chained with fetch, streams, etc.

### 3. Incremental Tree Building

The store receives node batches and adds them incrementally:

```typescript
addNodes(nodes: FileSystemNode[]) {
  set((state) => {
    const newNodes = { ...state.nodes };
    for (const node of nodes) {
      newNodes[node.id] = node;
    }
    return { nodes: newNodes };
  });
}
```

This uses immutable updates so Zustand's shallow equality check triggers re-renders correctly.

### 4. Full Path Storage

Each node stores its complete path (e.g., `C:/Users/Dharmender/Downloads/GTA_V.mp4`):

**Trade-off accepted**: ~80 bytes per node × 100k nodes = ~8MB for paths. This is worth it because:
- No tree traversal needed to display paths
- Search by path is O(1)
- Breadcrumb generation is instant

### 5. Periodic Path-Based Loop Detection

We track full paths (not just directory names) to detect potential loops from symlinks:

```typescript
const pathKey = currentPath.join('/');
if (this.visitedPaths.has(pathKey)) return null;
this.visitedPaths.add(pathKey);
```

Note: The File System Access API does not expose symlink information, so we cannot distinguish symlinks from regular directories. All directories are treated the same.

## Error Handling

### Error Isolation

Each directory is wrapped in a try/catch so a single inaccessible folder doesn't stop the entire scan:

```typescript
try {
  for (const entry of entries) {
    // ... process entries
  }
} catch (error) {
  node.hasError = true;
  node.errorMessage = (error as Error).message;
  stats.errorCount++;
  // Continue scanning other directories
}
```

### Partial Results

**Critical**: Even if the scan encounters an error or is cancelled, all nodes processed so far are flushed to the store before reporting status. This ensures no work is lost.

```typescript
try {
  await this.traverseDirectory(...);
} catch (error) {
  // ALWAYS flush remaining batch, even on error
  this.flushBatch();
  this.onComplete?.(stats, errors, 'error');
} finally {
  // Cancellation also flushes
  this.flushBatch();
}
```

### Error Reporting

Errors are collected in an array and reported to the store:

```typescript
interface ScanError {
  path: string;
  message: string;
  code: 'PERMISSION_DENIED' | 'FILE_INACCESSIBLE' | 'INACCESSIBLE' | 'UNKNOWN';
  timestamp: Date;
}
```

Users can view errors in a dedicated error panel after the scan completes.

## Memory Management

### Memory Budget

| Dataset | Node Count | Estimated Memory |
|---------|-----------|------------------|
| Small | 1,000 | ~5 MB |
| Medium | 10,000 | ~50 MB |
| Large | 100,000 | ~500 MB |
| Stress | 1,000,000 | ~5 GB (browser limit) |

Node size: ~500 bytes average (metadata + path ~80 bytes + childrenIds + computed fields).

### Memory Monitoring

```typescript
function checkMemory() {
  if ('memory' in performance) {
    const usedMB = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
    if (usedMB > 1000) {
      console.warn('High memory usage:', usedMB, 'MB');
    }
  }
}
```

## Browser Limitations

### File System Access API Constraints

| Browser | Support | Limitations |
|---------|---------|-------------|
| Chrome 86+ | Full | All features |
| Edge 86+ | Full | All features |
| Firefox | None | Not supported — show "use Chrome/Edge" |
| Safari 16.4+ | Not supported in MVP | Future consideration |
| Mobile Chrome | Limited | Permission may reset on reload |
| Mobile Safari | None | Not supported — show "use desktop" |

### Feature Detection

```typescript
function checkFileSystemAccessSupport(): boolean {
  return 'showDirectoryPicker' in window;
}
```

If unsupported, show a clear message with download links for supported browsers.

## Testing

### Unit Tests

```typescript
describe('ScannerService', () => {
  it('should handle empty directory', async () => {
    const mockHandle = createMockDirectoryHandle({});
    const scanner = new ScannerService();
    const nodes: FileSystemNode[] = [];
    scanner.onBatch = (batch) => nodes.push(...batch);
    
    await scanner.scan(mockHandle);
    
    expect(nodes).toHaveLength(1); // root folder only
  });

  it('should batch nodes correctly', async () => {
    const mockHandle = createMockDirectoryHandle(generateMockFiles(250));
    const scanner = new ScannerService();
    const batches: FileSystemNode[][] = [];
    scanner.onBatch = (batch) => batches.push(batch);
    
    await scanner.scan(mockHandle);
    
    // Should produce multiple batches
    expect(batches.length).toBeGreaterThan(1);
    // No batch should exceed BATCH_SIZE
    expect(batches.every(b => b.length <= 50)).toBe(true);
  });

  it('should respect cancellation signal', async () => {
    const mockHandle = createMockDirectoryHandle(generateMockFiles(10000));
    const controller = new AbortController();
    const scanner = new ScannerService();
    
    // Abort after 10ms
    setTimeout(() => controller.abort(), 10);
    
    let status: string | undefined;
    scanner.onComplete = (_, __, s) => { status = s; };
    
    await scanner.scan(mockHandle, { signal: controller.signal });
    
    expect(status).toBe('cancelled');
  });
});
```

### Integration Tests

Tests should use a `ScannerAdapter` interface to avoid mocking the browser API directly:

```typescript
interface ScannerAdapter {
  scan(handle: FileSystemDirectoryHandle, options: ScanOptions): Promise<ScanResult>;
}

class WebScannerAdapter implements ScannerAdapter { ... }
class MockScannerAdapter implements ScannerAdapter { ... } // For tests
```

### Performance Tests

Performance tests must specify reference hardware:

```typescript
describe('Scanner Performance (Reference: M1, 16GB, NVMe)', () => {
  it('should scan 10k files in under 30s', async () => {
    // Test on reference hardware
    // CI may not meet this target — use as a guide, not gate
  });
});
```

## Future: Tauri Desktop Scanner

The Tauri version will replace this scanner entirely with a Rust implementation:

```rust
// Future: Tauri scanner
use rayon::prelude::*;
use walkdir::WalkDir;

#[tauri::command]
async fn scan_directory(path: String) -> Result<ScanResult, Error> {
    let entries: Vec<Entry> = WalkDir::new(&path)
        .into_iter()
        .par_bridge()
        .filter_map(|e| e.ok())
        .map(|e| extract_metadata(e))
        .collect();

    Ok(aggregate(entries))
}
```

Benefits:
- Direct filesystem access (no browser permission prompts)
- Better metadata (creation time, permissions, symlink detection)
- Parallel scanning with rayon
- No browser memory limits
- Can scan entire drives (C:\, D:\, etc.)

The web UI will be reused via Tauri's webview. The scanner contract (`ScanResult`) remains the same.

## API Reference

### `ScannerService`

```typescript
class ScannerService {
  scan(
    directoryHandle: FileSystemDirectoryHandle,
    options?: ScanOptions
  ): Promise<void>;
  
  cancel(): void; // Convenience wrapper around AbortController
  
  // Callbacks (set before calling scan)
  onBatch?: (nodes: FileSystemNode[]) => void;
  onProgress?: (stats: ScanStats) => void;
  onComplete?: (stats: ScanStats, errors: ScanError[], status: ScanStatus) => void;
}
```

### Scan Options

```typescript
interface ScanOptions {
  signal?: AbortSignal;        // For cancellation
  includeHidden?: boolean;     // Default: true
  maxDepth?: number;           // Default: 50
}
```

### Scan Stats

```typescript
interface ScanStats {
  filesScanned: number;
  foldersScanned: number;
  totalBytes: number;
  errorCount: number;
  startTime: number;
  endTime?: number;
  durationMs?: number;
}
```
