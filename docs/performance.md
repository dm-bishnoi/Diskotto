# Performance Strategy

## Performance Goals

Diskotto must handle **hundreds of thousands of files** smoothly while maintaining a responsive UI. This document outlines our performance strategy and targets.

## Performance Targets

### Initial Load
- **Time to First Byte (TTFB)**: < 200ms
- **First Contentful Paint (FCP)**: < 1s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3s
- **Bundle size**: < 500KB gzipped

### Scanning Performance
- **10,000 files**: < 30s
- **100,000 files**: < 5min
- **Scan start latency**: < 500ms
- **Progress update rate**: 20fps (50ms intervals)

### UI Performance
- **Treemap render (10k nodes)**: < 500ms
- **Search response (10k items)**: < 100ms
- **Filter application**: < 200ms
- **Tree expansion**: < 100ms
- **Detail panel open**: < 150ms

### Memory
- **10,000 files**: < 50MB
- **100,000 files**: < 500MB
- **1,000,000 files**: < 5GB (theoretical)

## Optimization Strategies

### 1. Code Splitting

Route-level and component-level code splitting to reduce initial bundle size.

```typescript
// Lazy load heavy components
const StorageTreemap = lazy(() => import('./StorageTreemap'));
const AnalyticsPanel = lazy(() => import('./AnalyticsPanel'));
const FileDetails = lazy(() => import('./FileDetails'));

// Route-based splitting (if multi-page)
const Settings = lazy(() => import('./pages/Settings'));
```

### 2. Main Thread with Periodic Yields

Filesystem scanning runs in the main thread (async/await) with periodic yields to keep the UI responsive. This is required because `FileSystemDirectoryHandle` cannot be transferred to a Web Worker.

```typescript
// Scanner yields every 50ms or 50 nodes, allowing React to render
const YIELD_INTERVAL_MS = 50;
const BATCH_SIZE = 50;

private async addToBatch(node: FileSystemNode): Promise<void> {
  this.batchBuffer.push(node);
  const now = Date.now();
  if (
    this.batchBuffer.length >= BATCH_SIZE ||
    now - this.lastYield >= YIELD_INTERVAL_MS
  ) {
    this.flushBatch();
    // Yield to event loop — this allows React to render
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}
```

### 3. Virtualization

Large lists are virtualized to only render visible items.

```typescript
// Folder tree
import { FixedSizeList } from 'react-window';

// Search results
import { VariableSizeList } from 'react-window';

// File lists
const VirtualizedFileList = ({ files }) => (
  <FixedSizeList
    height={600}
    itemCount={files.length}
    itemSize={48}
  >
    {({ index, style }) => (
      <FileCard file={files[index]} style={style} />
    )}
  </FixedSizeList>
);
```

### 4. Memoization

Expensive computations are memoized to avoid recalculation.

```typescript
// Memoize treemap layout
const treemapData = useMemo(
  () => computeTreemapLayout(rootNode, currentPath),
  [rootNode, currentPath]
);

// Memoize search results
const searchResults = useMemo(
  () => searchTree(rootNode, searchQuery, filters),
  [rootNode, searchQuery, filters]
);

// Memoize callbacks
const handleNodeClick = useCallback(
  (nodeId: string) => drillDown(nodeId),
  [drillDown]
);
```

### 5. Debouncing & Throttling

User input is debounced to avoid excessive re-renders.

```typescript
// Search input
const debouncedSearch = useDebouncedValue(searchQuery, 300);

// Scroll events
const throttledScroll = useThrottle(handleScroll, 16); // 60fps

// Window resize
const debouncedResize = useDebouncedCallback(handleResize, 250);
```

### 6. Incremental Updates

UI updates incrementally as scan progresses, rather than waiting for completion.

```typescript
// Scanner flushes batches via callback
scanner.onBatch = (nodes) => {
  store.addNodes(nodes); // Incremental update, triggers Zustand subscribers
};

// Store triggers re-render only for new nodes
const newNodes = useStore(state => state.nodes);
```

### 7. Efficient Data Structures

Using optimized data structures for fast queries.

```typescript
// Map for O(1) lookups
const nodesById = new Map<string, FileSystemNode>();

// Set for O(1) membership checks
const selectedIds = new Set<string>();

// Indexes for fast filtering
const byExtension = new Map<string, Set<string>>();
const byCategory = new Map<FileCategory, Set<string>>();
```

### 8. D3 Performance

D3 treemap performance optimizations:

```typescript
// Squarify algorithm is O(n log n)
// For 10k nodes: ~10ms
// For 100k nodes: ~100ms

// Use D3 update pattern
const update = treemap
  .size([width, height])
  .padding(2)
  .round(true);

const root = d3.hierarchy(data)
  .sum(d => d.value)
  .sort((a, b) => b.value - a.value);

update(root);
```

### 9. Image Optimization

No images are loaded, but icons are SVG-based and tree-shakeable.

```typescript
// Lucide icons are tree-shakeable
import { Folder, File } from 'lucide-react';
// Only imports icons you use
```

### 10. Bundle Optimization

```typescript
// next.config.js
{
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
}
```

## Performance Monitoring

### Web Vitals

Track Core Web Vitals **locally** for development and performance debugging. We use `web-vitals` purely as a measurement library — it does not transmit data anywhere by itself. No external endpoint is configured.

```typescript
// Development: log to console
// Production: optionally forward to a same-origin /api/metrics endpoint (no third-party service)
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

if (process.env.NODE_ENV === 'development') {
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
}
```

**Privacy note**: We never configure `web-vitals` to send to Google Analytics or any third-party service. Any aggregation must go to a same-origin endpoint we control, or remain in `performance.measure` for in-browser debugging only. This is consistent with our privacy policy.

### Custom Metrics

Track app-specific metrics:

```typescript
// Scan duration
performance.mark('scan-start');
// ... scan logic
performance.mark('scan-end');
performance.measure('scan', 'scan-start', 'scan-end');

// Treemap render time
performance.mark('treemap-render');
// ... render
performance.mark('treemap-end');
performance.measure('treemap', 'treemap-render', 'treemap-end');
```

### Performance Observer

```typescript
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.duration);
  }
});

observer.observe({ entryTypes: ['measure', 'navigation'] });
```

## Performance Testing

### Lighthouse

Target scores:
- **Performance**: > 90
- **Accessibility**: > 95
- **Best Practices**: > 90
- **SEO**: > 80

### Load Testing

```typescript
// Generate mock data
const generateLargeTree = (count: number) => {
  // Generate 100k nodes
  const nodes = [];
  for (let i = 0; i < count; i++) {
    nodes.push(generateMockNode(i));
  }
  return nodes;
};

// Benchmark
const start = performance.now();
const treemap = computeTreemapLayout(largeTree, [0, 0, 1000, 800]);
const duration = performance.now() - start;
console.log(`Treemap render: ${duration}ms`);
```

### Memory Profiling

```typescript
// Chrome DevTools Memory tab
// Heap snapshots before/after operations

// Programmatic
if (performance.memory) {
  console.log({
    used: performance.memory.usedJSHeapSize,
    total: performance.memory.totalJSHeapSize,
    limit: performance.memory.jsHeapSizeLimit,
  });
}
```

## Optimization Checklist

### Initial Load
- [x] Code splitting
- [x] Tree shaking
- [x] Minification
- [x] Compression (gzip/brotli)
- [x] Font subsetting
- [x] Image optimization (N/A)
- [x] Critical CSS inlined

### Runtime
- [x] Main thread with periodic yields for scanner (not Web Worker)
- [x] Virtualization for long lists (folder tree, search results — not treemap)
- [x] Memoization for expensive computations
- [x] Debouncing for user input
- [x] Incremental updates (batched to store)
- [x] Efficient data structures (Record<string, Node>)

### Rendering
- [x] React.memo for pure components
- [x] useCallback for stable references
- [x] useMemo for computed values
- [x] Key prop for lists
- [x] Avoid layout thrashing

### Network
- [x] No unnecessary requests
- [x] Resource hints (preload, prefetch)
- [x] Service worker for static assets
- [x] HTTP/2 multiplexing

## Bottleneck Identification

### Common Bottlenecks

1. **Large lists without virtualization**
   - Solution: Use react-window

2. **Expensive re-renders**
   - Solution: React.memo, useCallback, useMemo

3. **Blocking main thread during scan**
   - Solution: Periodic yields (every 50ms/50 nodes) using `await setTimeout(0)` — note: this is intentional; FileSystemDirectoryHandle requires main thread
   - The scanner is designed to yield frequently enough that the UI remains responsive

4. **Memory leaks**
   - Solution: Proper cleanup in useEffect

5. **Inefficient algorithms**
   - Solution: Use Map/Set, avoid nested loops

6. **Large bundle size**
   - Solution: Code splitting, tree shaking

### Profiling Tools

- Chrome DevTools Performance tab
- React DevTools Profiler
- Lighthouse CI (local audit only — never uploads to Lighthouse servers)
- WebPageTest
- Bundle Analyzer

## Performance Budget

### Bundle Size Budget

| Resource | Budget (gzipped) |
|----------|------------------|
| JavaScript | < 300KB |
| CSS | < 50KB |
| Fonts | < 100KB |
| Total | < 500KB |

### Runtime Budget

| Metric | Budget |
|--------|--------|
| Main thread work | < 50ms per task |
| Long tasks | < 10% of time |
| Memory | < 500MB |
| CPU | < 80% sustained |

## Mobile Performance

### Mobile-Specific Optimizations

1. **Touch optimization**: Larger hit targets, no hover
2. **Reduced animations**: Respect prefers-reduced-motion
3. **Image optimization**: Lower resolution on mobile
4. **Network awareness**: Adaptive loading based on connection
5. **Battery awareness**: Reduce work on low battery

### Mobile Performance Targets

- **First paint**: < 2s on 3G
- **Interactive**: < 4s on 3G
- **Scan (10k files)**: < 60s on mobile
- **Memory**: < 200MB on mobile

## Future Optimizations

### Phase 2
- IndexedDB for offline scan cache
- OffscreenCanvas for non-blocking rendering
- SharedArrayBuffer for parallel aggregation (if performance requires)

### Phase 3
- GPU acceleration for treemap rendering
- WebAssembly for metadata parsing (future, not needed for MVP)
- Predictive preloading
- Adaptive quality based on device

## Monitoring & Alerts

### Production Monitoring

Track in production (when we have users):
- Real User Monitoring (RUM) — local measurement only; no third-party service
- Error rates (in-page error tracking, no external service)
- Performance metrics (web-vitals local collection)
- User feedback (voluntary, in-app form)

> **Privacy guarantee**: We do not and will not integrate with any third-party monitoring or analytics service. All measurement is local; no data leaves the user's device without explicit opt-in (and even then, only when a future optional sync feature is added).

### Alert Thresholds

- **Page load > 5s**: Alert
- **Error rate > 1%**: Alert
- **Memory > 1GB**: Warning
- **Scan time > 5min for 100k files**: Investigate

## Performance Culture

### Performance as a Feature

Performance is treated as a first-class feature:
- Performance tests in CI/CD
- Performance budgets enforced
- Regular performance reviews
- Performance regression tests

### Continuous Improvement

- Monthly performance audits
- Quarterly optimization sprints
- User feedback integration
- A/B testing for optimizations
