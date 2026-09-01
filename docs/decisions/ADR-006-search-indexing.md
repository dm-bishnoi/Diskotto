# ADR-006: Search Indexing with minisearch

## Status

**Proposed** - 2026-09-01

## Context

Diskotto needs fast search over potentially 100,000 filesystem nodes. Users should be able to find files by name, extension, or path in under 100ms. A linear scan over all nodes is too slow; we need an inverted index.

### Requirements
- Search by name, extension, path (prefix, substring, fuzzy)
- Return results in <100ms for 10,000 items
- Update incrementally as nodes are scanned (not just at the end)
- TypeScript support
- Small bundle size (~8KB gzipped)
- Privacy-respecting (no external service)

### Options Considered

1. **minisearch** — Lightweight in-memory full-text search
2. **FlexSearch** — Another lightweight option
3. **Lunr.js** — Full-text search library
4. **Custom inverted index** — Build our own
5. **Linear scan** — Filter from Zustand store
6. **Third-party search API** — e.g., Algolia

## Decision

We will use **minisearch** for search indexing.

## Rationale

### Why minisearch

- **Small**: ~8KB gzipped (vs FlexSearch's ~15KB)
- **Fast**: O(1) term lookup, results in <100ms for 10k items
- **TypeScript**: Good type definitions
- **Incremental**: Can add documents one at a time (not just bulk)
- **Fuzzy search**: Built-in fuzzy matching
- **No external dependency**: Runs entirely in the browser
- **Familiar API**: Simple `add()`, `remove()`, `search()`

### Why Not FlexSearch

- **Larger**: ~15KB gzipped
- **Less TypeScript-friendly**: Types are less complete
- **More features than needed**: We don't need FlexSearch's advanced options

### Why Not Lunr.js

- **Larger**: ~20KB gzipped
- **Less flexible API**: More complex for simple use case
- **No incremental updates**: Bulk index only

### Why Not Custom Inverted Index

- **Overkill**: minisearch is battle-tested
- **More bugs**: Implementing our own is error-prone
- **Same result**: We just need a simple inverted index

### Why Not Linear Scan

- **Too slow**: O(n) for 100k items = unacceptable
- **No fuzzy search**: Would need to implement Levenshtein distance ourselves
- **No ranking**: Would get back unsorted results

### Why Not Third-Party Search API

- **Privacy violation**: Would send file paths to external service
- **Cost**: Algolia, Elasticsearch, etc. all have pricing
- **Latency**: Network round-trip adds delay
- **Not offline**: Requires internet

## Implementation

### Integration with Zustand

The search index lives **outside** the Zustand store. It is a singleton instance that is updated alongside the store when nodes are added.

```typescript
// lib/search-index.ts
import MiniSearch from 'minisearch';

const index = new MiniSearch<FileSystemNode>({
  fields: ['name', 'path', 'extension'],
  storeFields: ['id', 'name', 'path', 'type', 'size', 'category'],
  searchOptions: {
    boost: { name: 2, extension: 1.5 },
    fuzzy: 0.2,
    prefix: true,
  },
});

export const searchIndex = {
  addNodes(nodes: FileSystemNode[]): void {
    index.addAll(nodes);
  },

  search(query: string): SearchResult[] {
    if (!query.trim()) return [];
    return index.search(query) as SearchResult[];
  },

  clear(): void {
    index.removeAll();
  },
};
```

### In the Scanner Flow

```typescript
// When scanner flushes a batch:
scanner.onBatch = (nodes) => {
  store.addNodes(nodes);       // Zustand
  searchIndex.addNodes(nodes); // minisearch (outside store)
};
```

### Search Results Flow

```typescript
// In the store action (or a hook):
setSearchQuery: (query: string) => {
  set({ searchQuery: query });
  if (query.trim()) {
    const results = searchIndex.search(query);
    set({ searchResults: results });
  } else {
    set({ searchResults: [] });
  }
},
```

### Why Not Inside Zustand

We intentionally keep the search index **outside** Zustand because:
1. The index is not serializable (contains inverted index data, not nodes)
2. We don't want Zustand to track changes to the index for re-renders
3. Zustand subscribers only care about the **array of results**, not the index itself
4. Splitting concerns: Zustand holds the canonical tree; the index is a derived view

## Consequences

### Positive
- Fast search (<100ms for 10k items)
- Incremental indexing
- Small bundle impact
- No external dependency
- TypeScript support
- Fuzzy search built-in

### Negative
- Additional dependency (~8KB)
- In-memory only (no persistence in MVP)
- Index rebuilds from scratch on page reload (acceptable — scan data is ephemeral)

### Trade-offs
- **Bundle size**: +8KB is acceptable vs the performance gain over linear scan
- **Memory**: Index duplicates name/path/id from nodes (+~50 bytes/node × 100k = ~5MB) — acceptable given the search speed improvement
- **Persistence**: No IndexedDB in MVP — index is lost on reload — future work to add IndexedDB cache

## Performance Targets

| Dataset | Index Size | Search Time |
|---------|-----------|-------------|
| 1,000 items | ~50KB | <5ms |
| 10,000 items | ~500KB | <20ms |
| 100,000 items | ~5MB | <100ms |

## Privacy

The search index is **local only**:
- Stored in JavaScript heap (never persisted in MVP)
- Never transmitted to any server
- No third-party service involved
- Cleared when page is closed

## References

- [minisearch](https://github.com/lucaong/minisearch)
- [Benchmark](https://github.com/lucaong/minisearch#benchmark)
- [Architecture Documentation](../architecture.md)
- [Data Model Documentation](../data-model.md)

## Decision Makers

- Technical Lead
- Frontend Architect

## Date

2026-09-01

## Review Date

2027-03-01 (6 months)
