# Architecture

## Overview

Diskotto follows a **client-side-first** architecture with future extensibility for a Tauri desktop application. The web application is built as a single-page app (SPA) using Next.js, with all filesystem processing happening in the browser.

The architecture has been simplified from earlier drafts based on browser API constraints: the scanner runs in the **main thread** (not a Web Worker) because `FileSystemDirectoryHandle` cannot be transferred across the worker boundary.

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    BROWSER (User's Device)                    │
│                                                                │
│  ┌───────────────────────────────────────────────────────┐    │
│  │              PRESENTATION LAYER (React)                │    │
│  │  ┌────────────┐  ┌──────────────┐  ┌──────────────┐   │    │
│  │  │  Layout    │  │ Visualization│  │    Panels    │   │    │
│  │  │ Components │  │  (D3/SVG)    │  │  (Details)  │   │    │
│  │  └────────────┘  └──────────────┘  └──────────────┘   │    │
│  └───────────────────────────────────────────────────────┘    │
│                              ▲                                 │
│                              │ State Updates (Zustand)         │
│  ┌───────────────────────────────────────────────────────┐    │
│  │              STATE LAYER (Zustand)                     │    │
│  │  - nodes: Record<string, FileSystemNode>              │    │
│  │  - Scan Progress     - Navigation                     │    │
│  │  - Search/Filters   - UI State                       │    │
│  └───────────────────────────────────────────────────────┘    │
│                              ▲                                 │
│                              │ Batched Node Updates            │
│  ┌───────────────────────────────────────────────────────┐    │
│  │              PROCESSING LAYER (Main Thread)            │    │
│  │  - ScannerService (async/await with yields)           │    │
│  │  - Aggregation (post-scan)                            │    │
│  │  - SearchIndex (minisearch)                           │    │
│  └───────────────────────────────────────────────────────┘    │
│                              ▲                                 │
│                              │ File System Access API          │
│  ┌───────────────────────────────────────────────────────┐    │
│  │              BROWSER APIs                              │    │
│  │  - File System Access API                             │    │
│  │  - AbortController (for cancellation)                 │    │
│  │  - Clipboard API                                      │    │
│  └───────────────────────────────────────────────────────┘    │
│                              ▲                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │              USER'S FILESYSTEM                         │    │
│  │  (User-granted folders only)                           │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Layered Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                          │
│  - React components                                          │
│  - Tailwind CSS styling                                     │
│  - shadcn/ui primitives                                      │
│  - D3 + custom SVG visualizations                          │
└──────────────────────────────────────────────────────────────┘
                            ↕ (subscribes to)
┌──────────────────────────────────────────────────────────────┐
│  STATE LAYER                                                 │
│  - Zustand store                                             │
│  - Immutable updates (Record spread, not Map mutation)      │
│  - Selectors for derived data                                │
└──────────────────────────────────────────────────────────────┘
                            ↕ (calls)
┌──────────────────────────────────────────────────────────────┐
│  PROCESSING LAYER                                            │
│  - ScannerService (main thread)                              │
│  - SearchIndex (minisearch)                                  │
│  - Aggregation (post-scan)                                   │
└──────────────────────────────────────────────────────────────┘
                            ↕ (uses)
┌──────────────────────────────────────────────────────────────┐
│  BROWSER API LAYER                                           │
│  - File System Access API                                    │
│  - AbortController                                           │
│  - Clipboard API                                             │
└──────────────────────────────────────────────────────────────┘
```

## Module Structure

### App Layer (`/src/app`)
Next.js 14 App Router structure:
- `layout.tsx` - Root layout with providers
- `page.tsx` - Main application entry
- `globals.css` - Global styles and Tailwind directives
- `providers.tsx` - Theme, store providers

### Component Layer (`/src/components`)
Organized by domain:
- `layout/` - Shell, header, sidebar, status bar
- `navigation/` - Breadcrumb, folder tree
- `visualization/` - Treemap, charts
- `panels/` - Details panels
- `search/` - Search UI
- `scan/` - Scanning UI
- `states/` - Empty/loading/error states

### State Layer (`/src/store`)
Zustand store using the **slice pattern** (one combined store, not multiple stores — see ADR-004):
- `index.ts` - Combined store that composes all slices
- `scan-slice.ts` - Scan state, progress, results
- `navigation-slice.ts` - Path, selection, expanded folders
- `search-slice.ts` - Search query, results, filters
- `ui-slice.ts` - Theme, panels, sidebar state
- `selectors.ts` - Reusable selectors for derived data

### Processing Layer (`/src/lib`)
- `scanner.ts` - ScannerService (main thread, async/await)
- `search-index.ts` - minisearch wrapper
- `aggregator.ts` - Post-scan aggregation
- `file-utils.ts` - File type detection
- `formatters.ts` - Size/date formatting
- `utils.ts` - General utilities

### Hooks Layer (`/src/hooks`)
- `use-scanner.ts` - Scanner integration
- `use-treemap.ts` - D3 treemap logic
- `use-keyboard-nav.ts` - Keyboard shortcuts
- `use-media-query.ts` - Responsive breakpoints

## Data Flow

### 1. Scan Initiation Flow
```
User Click → Scan Button
    ↓
Store Action: startScan()
    ↓
Create AbortController
    ↓
ScannerService.scan(directoryHandle, { signal })  [main thread, async/await]
    ↓
Recursive traversal with periodic yields (50 nodes / 50ms)
    ↓
Batch (up to 50 nodes) → onBatch callback
    ↓
Store: addNodes(batch)   [immutable Record spread]
    ↓
SearchIndex: index.addAll(batch)
    ↓
React re-renders (Zustand shallow equality)
```

### 2. Treemap Update Flow
```
Nodes added to store
    ↓
Selector: computeCurrentTreemap() (useMemo)
    ↓
D3 Layout Calculation (read-only, NO mutation of store)
    ↓ (D3 is called on a *new* data object derived from the store)
React renders SVG with computed coordinates
    ↓
User interactions trigger store actions
```

### 3. Search Flow
```
User Types in Search Bar
    ↓
Debounce (300ms)
    ↓
Store: setSearchQuery()
    ↓
SearchIndex.search(query)  [minisearch]
    ↓
Update searchResults in store
    ↓
Virtualized List Update
```

## Technology Stack Decisions

### Next.js 14
**Why**: App Router, file-based routing, excellent DX, image optimization, built-in TypeScript support.

**Alternatives Considered**:
- Vite + React Router: Faster dev server but less feature-rich
- Create React App: Deprecated
- Remix: Smaller ecosystem

### React 18
**Why**: Mature, large ecosystem, concurrent features, Server Components.

**Alternatives Considered**:
- Vue 3: Smaller ecosystem for data viz
- Svelte: Less mature for complex apps
- Solid: Smaller community

### TypeScript
**Why**: Type safety, better refactoring, excellent IDE support.

### Tailwind CSS
**Why**: Utility-first, consistent design system, no naming conflicts, small bundle with purging.

**Alternatives Considered**:
- CSS Modules: More verbose
- styled-components: Runtime overhead
- Emotion: Same as styled-components

### shadcn/ui
**Why**: Accessible, copy-to-own (no dependency lock-in), customizable, beautiful defaults.

**Alternatives Considered**:
- Material UI: Too opinionated, large bundle
- Ant Design: Heavy, dated aesthetic
- Chakra UI: Less customizable

### D3.js
**Why**: Industry standard, full control, powerful treemap algorithm, customizable.

**Alternatives Considered**:
- Recharts: Limited treemap support
- Chart.js: No treemap
- Visx: Less mature

### Zustand
**Why**: Minimal API, TypeScript-first, performant, no boilerplate.

**Alternatives Considered**:
- Redux Toolkit: Too much boilerplate
- Jotai: Atomic, less suited for complex state
- Recoil: Meta-maintained, uncertain future

### minisearch
**Why**: Lightweight full-text search (~8KB gzipped), fast queries, TypeScript support. Needed to meet <100ms search target for 10k items.

**Alternatives Considered**:
- flexsearch: Good but larger
- lunr.js: More complex API
- Custom inverted index: More work, same result
- Linear scan: Cannot meet performance target

### Main Thread Scanner (Not Web Worker)
**Why**: `FileSystemDirectoryHandle` cannot be transferred to a Web Worker (it is not structured-cloneable). Main thread with periodic yields provides responsive UI without the complexity of message passing or custom serialization.

**Alternatives Considered**:
- **Web Worker**: Cannot receive `FileSystemDirectoryHandle` — not transferable via `postMessage`
- **Comlink with custom transfer**: Complex, experimental, no real benefit
- **SharedArrayBuffer**: Requires special headers (`Cross-Origin-Opener-Policy` + `Cross-Origin-Embedder-Policy`), not deployable on all hosting
- **Service Worker**: Different use case (caching, offline) — cannot access filesystem APIs
- **Worker postMessage with file metadata only**: Would require the main thread to iterate the directory handle anyway, adding no benefit

**Yield Strategy**: The scanner yields to the UI thread every 50ms or 50 nodes (whichever comes first), using `await new Promise(resolve => setTimeout(resolve, 0))` to allow React to render between batches. This maintains ~20fps UI responsiveness during scans.

## Performance Architecture

### Yielding Strategy

The scanner yields to the UI thread every 50ms or every 50 nodes (whichever comes first):

```typescript
const YIELD_INTERVAL_MS = 50;
const BATCH_SIZE = 50;

private addToBatch(node: FileSystemNode): void {
  this.batchBuffer.push(node);
  
  const now = Date.now();
  if (
    this.batchBuffer.length >= BATCH_SIZE ||
    now - this.lastYield >= YIELD_INTERVAL_MS
  ) {
    this.flushBatch();
  }
}

private async flushBatch(): Promise<void> {
  if (this.batchBuffer.length > 0) {
    const nodes = this.batchBuffer.splice(0, this.batchBuffer.length);
    this.onBatch?.(nodes);
    this.lastYield = Date.now();
    // Yield to event loop
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}
```

This ensures 20fps UI updates even during 100k file scans.

### Lazy Loading
```typescript
// Route-level
const Settings = lazy(() => import('./pages/settings'));

// Component-level
const Treemap = lazy(() => import('./components/visualization/storage-treemap'));
```

### Memoization
```typescript
// Heavy computations
const treemapData = useMemo(
  () => computeTreemapLayout(rootNode, currentPath),
  [rootNode, currentPath]
);

// Callbacks
const handleNodeClick = useCallback((node) => {
  drillDown(node.id);
}, [drillDown]);
```

### Virtualization
Used for folder tree and search results (not treemap — see below).

```typescript
// Folder tree
import { FixedSizeList } from 'react-window';

// Search results
import { VariableSizeList } from 'react-window';
```

### Treemap Scalability (No Virtualization)

The treemap is a **2D space-filling layout** that cannot be virtualized like a 1D list. All cells must be present to compute their rectangular bounds. Instead, we use:

1. **Aggregation**: For folders with >1,000 children, group items contributing <0.1% of the folder's total size into a single "Other" cell. This is shown with a `+N more` indicator and is drillable.
2. **Level-of-detail**: Hide labels for nodes <60px (show on hover only)
3. **D3 layout performance**: 10k nodes in <500ms, 100k nodes in <5s (tested on M1, 16GB, NVMe)
4. **Memoization**: The treemap layout is recomputed only when the underlying tree or current path changes — not on every render

```typescript
// In a React component, NOT mutating the store
const treemapLayout = useMemo(() => {
  // D3's hierarchy() and treemap() create a NEW object tree
  // They do NOT mutate the input data.
  // The layout object is purely a view over the store data.
  const root = d3.hierarchy(currentFolderData)
    .sum(d => d.value)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  return d3.treemap<TreeDatum>().size([width, height]).padding(2).round(true)(root);
}, [currentFolderData, width, height]);
```

### D3 Does Not Mutate Application State

D3's layout functions (`d3.hierarchy`, `d3.treemap`) treat the input data as **read-only**. They return a brand-new tree with computed `x0, y0, x1, y1` properties. None of these layout values are written back to the Zustand store.

The contract is:
1. The store holds the **canonical** filesystem tree.
2. The treemap component subscribes to a selector, then derives a D3 hierarchy in a `useMemo`.
3. The hierarchy and its layout coordinates live entirely in component state (the `useMemo` return value) — they never enter the store.

This invariant keeps the store small (no derived layout data), the layout cheap to recompute, and Zustand's shallow equality correct.

## Security Architecture

### Content Security Policy

```typescript
// next.config.js
headers: [{
  source: '/(.*)',
  headers: [{
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'nonce-{NONCE}'",     // Nonces for Next.js generated scripts
      "style-src 'self' 'unsafe-inline'",       // Tailwind requires inline styles
      "img-src 'self' data:",
      "font-src 'self' https://fonts.gstatic.com",  // Google Fonts CDN
      "connect-src 'self'",                    // No external API calls
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  }]
}]
```

**CSP Trade-offs**:
- `'unsafe-inline'` for `style-src` is required by Tailwind CSS for utility classes — this is unavoidable with Tailwind
- `script-src 'nonce-{NONCE}'` is used instead of `'unsafe-inline'` for scripts — Next.js generates per-request nonces, so no user-supplied inline scripts are needed
- `https://fonts.gstatic.com` is required for Google Fonts (Inter, JetBrains Mono) — this is the only third-party request in the application

### Permissions
- File System Access API: User must explicitly grant
- No clipboard access without user action
- No geolocation, camera, microphone, etc.

### Data Validation
- Zod schemas for all user inputs
- Type guards for File System Access API responses
- Path sanitization for display

## Future Extensibility

### Tauri Desktop Integration

```typescript
// Future: API adapter pattern for Tauri
interface ScannerAdapter {
  scan(handle: FileSystemHandle): Promise<ScanResult>;
}

// Web implementation
class WebScannerAdapter implements ScannerAdapter {
  async scan(handle: FileSystemDirectoryHandle): Promise<ScanResult> {
    // Uses ScannerService (main thread)
  }
}

// Tauri implementation (future)
class TauriScannerAdapter implements ScannerAdapter {
  async scan(handle: FileSystemHandle): Promise<ScanResult> {
    // Calls Rust backend
    const result = await invoke('scan_directory', { path: handle.path });
    return result;
  }
}
```

The UI layer remains unchanged. Only the scanner adapter implementation differs.

### IndexedDB Caching (Future)

```typescript
// Future: Cache previous scan results
interface CachedScan {
  path: string;
  timestamp: Date;
  rootNode: FileSystemNode;
}

// Check cache before re-scanning
const cached = await getCachedScan(path);
if (cached && isRecent(cached, 1 hour)) {
  loadFromCache(cached);
} else {
  startFreshScan(path);
}
```

### Multi-Window Support (Tauri)
- Tauri allows multiple windows
- Each window can analyze different folders
- Shared state via Tauri events

## Error Handling

### Error Boundaries
```typescript
// Component-level error boundaries
<ErrorBoundary fallback={<ErrorState />}>
  <StorageTreemap />
</ErrorBoundary>
```

### Error Types
```typescript
type ErrorType =
  | 'permission-denied'
  | 'browser-unsupported'
  | 'scan-failed'
  | 'scan-cancelled'
  | 'partial-results'
  | 'memory-limit'
  | 'inaccessible-folder'
  | 'unknown';
```

### Recovery Strategies
- **Permission denied**: Show clear instructions, retry button
- **Scan failed**: Show partial results (always flushed before error)
- **Memory limit**: Suggest smaller scope
- **Inaccessible folder**: Continue scanning, log errors

## Testing Architecture

### Unit Tests (Vitest)
- Pure functions (formatters, calculations)
- Store actions and selectors
- Utility functions
- File type detection

### Integration Tests
- Scanner + Store flow (via ScannerAdapter interface)
- Search + Filter combinations
- Component + Store interactions

### E2E Tests (Playwright)
- Full user flows with real test directories
- Folder selection via filechooser event
- Scan completion
- Treemap interaction
- Search and filter
- Mobile responsive

## Deployment

### Vercel (Recommended)
- Zero-config Next.js deployment
- Edge functions for static assets
- Automatic HTTPS
- CDN distribution

### Build Optimization
- Tree shaking
- Code splitting
- Asset optimization
- Brotli compression
