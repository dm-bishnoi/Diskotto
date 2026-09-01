# Testing Strategy

## Overview

Diskotto employs a comprehensive testing strategy covering unit tests, integration tests, end-to-end tests, performance tests, and accessibility tests. We aim for high confidence in releases while maintaining fast feedback loops.

## Testing Pyramid

```
        /\
       /E2E\         Few, high value
      /-----\        - User flows
     /-------\       - Critical paths
    /Integr.  \
   /-----------\     Moderate coverage
  /-------------\    - Component integration
 /------Unit Tests  - Store + components
/-----------------\ 
Many, fast        - Pure functions
                   - Utilities
                   - Calculations
```

## Test Types

### 1. Unit Tests (Vitest)

Coverage Target: 80%+

**What to test**:
- Pure functions (formatters, calculations)
- Store actions and selectors
- Utility functions
- File type detection
- Path manipulation
- Tree algorithms
- Search algorithms
- Filter logic

**Example - Formatters**:
```typescript
// lib/formatters.test.ts
import { describe, it, expect } from 'vitest';
import { formatBytes, formatPercentage } from './formatters';

describe('formatBytes', () => {
  it('formats bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
  });

  it('handles large sizes', () => {
    expect(formatBytes(1024 ** 5)).toBe('1 PB');
  });

  it('respects decimal precision', () => {
    expect(formatBytes(1536, 0)).toBe('2 KB');
    expect(formatBytes(1536, 3)).toBe('1.5 KB');
  });
});
```

**Example - File Type Detection**:
```typescript
// lib/file-utils.test.ts
import { describe, it, expect } from 'vitest';
import { getFileCategory } from './file-utils';

describe('getFileCategory', () => {
  it('detects video files', () => {
    expect(getFileCategory('mp4')).toBe('video');
    expect(getFileCategory('MP4')).toBe('video');
    expect(getFileCategory('mkv')).toBe('video');
  });

  it('detects image files', () => {
    expect(getFileCategory('jpg')).toBe('image');
    expect(getFileCategory('png')).toBe('image');
    expect(getFileCategory('webp')).toBe('image');
  });

  it('returns other for unknown extensions', () => {
    expect(getFileCategory('xyz')).toBe('other');
    expect(getFileCategory('')).toBe('other');
    expect(getFileCategory(undefined)).toBe('other');
  });
});
```

**Example - Store Actions**:
```typescript
// store/scan-slice.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useDiskottoStore } from './index';

describe('scan slice', () => {
  beforeEach(() => {
    useDiskottoStore.getState().reset();
  });

  it('starts scan', () => {
    const { startScan } = useDiskottoStore.getState();
    startScan(mockDirectoryHandle);
    expect(useDiskottoStore.getState().scanStatus).toBe('scanning');
  });

  it('adds nodes incrementally', () => {
    const { addNodes } = useDiskottoStore.getState();
    addNodes([mockNode1, mockNode2]);
    const nodes = useDiskottoStore.getState().nodes;
    // Zustand store uses Record<string, FileSystemNode>, not Map
    expect(Object.keys(nodes).length).toBe(2);
  });

  it('cancels scan', () => {
    const { startScan, cancelScan } = useDiskottoStore.getState();
    startScan(mockDirectoryHandle);
    cancelScan();
    expect(useDiskottoStore.getState().scanStatus).toBe('cancelled');
  });
});
```

### 2. Integration Tests (Vitest + Testing Library)

Coverage Target: 60%+

**What to test**:
- Component + Store interactions
- Scanner + Store flow
- Search + Filter combinations
- Navigation flows
- User interactions

**Example - Component with Store**:
```typescript
// components/StorageTreemap.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StorageTreemap } from './StorageTreemap';
import { useDiskottoStore } from '@/store';

describe('StorageTreemap', () => {
  it('renders treemap nodes', () => {
    render(<StorageTreemap data={mockTreemapData} />);
    expect(screen.getByText('Downloads')).toBeInTheDocument();
  });

  it('drills down on node click', () => {
    const { drillDown } = useDiskottoStore.getState();
    render(<StorageTreemap data={mockTreemapData} />);
    fireEvent.click(screen.getByText('Downloads'));
    expect(drillDown).toHaveBeenCalled();
  });

  it('shows tooltip on hover', async () => {
    render(<StorageTreemap data={mockTreemapData} />);
    fireEvent.mouseEnter(screen.getByText('Downloads'));
    expect(await screen.findByText('89.4 GB')).toBeInTheDocument();
  });
});
```

**Example - Search and Filter**:
```typescript
// hooks/use-search.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearch } from './use-search';

describe('useSearch', () => {
  it('finds files by name', () => {
    const { result } = renderHook(() => useSearch(mockTree));
    act(() => result.current.search('GTA'));
    expect(result.current.results).toHaveLength(1);
  });

  it('finds files by extension', () => {
    const { result } = renderHook(() => useSearch(mockTree));
    act(() => result.current.search('.mp4'));
    expect(result.current.results.length).toBeGreaterThan(0);
  });

  it('applies filters', () => {
    const { result } = renderHook(() => useSearch(mockTree));
    act(() => result.current.searchWithFilters('.*', {
      sizeFilters: ['>1GB'],
    }));
    expect(result.current.results.every(r => r.size > 1024 ** 3)).toBe(true);
  });
});
```

### 3. End-to-End Tests (Playwright)

Coverage Target: All critical user flows

**What to test**:
- Folder selection
- Scan completion
- Treemap interaction
- Drill-down navigation
- Search functionality
- Filter application
- Mobile responsive flow
- Error states
- Theme switching

**Example - Full User Flow**:
```typescript
// e2e/folder-analysis.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Folder Analysis Flow', () => {
  test('user can select and analyze a folder', async ({ page }) => {
    await page.goto('/');

    // Initial state
    await expect(page.getByText('No folder selected yet')).toBeVisible();

    // Set up filechooser handler BEFORE clicking (Playwright needs this pre-registered)
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: /select folder/i }).click(),
    ]);

    // Accept the filechooser — since we're testing the folder picker, we can
    // either use setFiles (for <input>) or in newer Playwright use setDirectory.
    // For the File System Access API showDirectoryPicker, we mock it directly:
    await page.evaluate(() => {
      // Mock showDirectoryPicker to return our test directory handle
      const mockHandle = createMockDirectoryHandle();
      jest.fn().mockResolvedValue(mockHandle);
      Object.defineProperty(window, 'showDirectoryPicker', {
        writable: true,
        value: () => Promise.resolve(mockHandle),
      });
    });

    // Wait for scan to complete
    await expect(page.getByText(/scanning/i)).toBeVisible();
    await expect(page.getByText(/complete/i)).toBeVisible({ timeout: 30000 });

    // Verify treemap renders
    await expect(page.locator('[data-testid="treemap"]')).toBeVisible();

    // Click on a node
    await page.getByText('Downloads').first().click();

    // Verify breadcrumb updated
    await expect(page.getByText('Downloads').first()).toBeVisible();
  });

  test('user can search for files', async ({ page }) => {
    await page.goto('/');
    // ... setup scan ...

    // Focus search
    await page.keyboard.press('/');

    // Type query
    await page.keyboard.type('GTA');

    // Verify results
    await expect(page.getByText('GTA_V_Final_4K.mp4')).toBeVisible();
  });

  test('user can apply filters', async ({ page }) => {
    await page.goto('/');
    // ... setup scan ...

    // Open filters
    await page.getByRole('button', { name: /filters/i }).click();

    // Apply size filter
    await page.getByText('>1GB').click();

    // Verify filtered results
    // ... assertions ...
  });
});
```

> **Note on `filechooser` vs `showDirectoryPicker`**: Playwright's `page.waitForEvent('filechooser')` works for `<input type="file" webkitdirectory>`. For the File System Access API's `showDirectoryPicker()`, the standard approach is to mock `window.showDirectoryPicker` via `page.evaluate`. The mock returns a `FileSystemDirectoryHandle`-compatible object with an `entries()` iterator that yields our test files. This is testable, executable, and avoids relying on a non-existent `setDirectory` API.

**Example - Mobile Flow**:
```typescript
// e2e/mobile.spec.ts
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 375, height: 812 } });

test('mobile user can navigate and view details', async ({ page }) => {
  await page.goto('/');

  // Verify mobile layout
  await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();

  // ... test mobile interactions ...
});
```

### 4. Performance Tests

**Targets**:
- 10k file scan: < 30s
- 100k file scan: < 5min
- Treemap render (10k nodes): < 500ms
- Search (10k items): < 100ms
- Memory (100k files): < 500MB

**Example - Scan Performance**:
```typescript
// performance/scan-performance.test.ts
import { describe, it, expect } from 'vitest';
import { generateMockTree, runScan } from './test-utils';

describe('Scan Performance', () => {
  it('scans 10k files in under 30s', async () => {
    const tree = generateMockTree(10000);
    const start = Date.now();
    await runScan(tree);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(30000);
  });

  it('scans 100k files in under 5min', async () => {
    const tree = generateMockTree(100000);
    const start = Date.now();
    await runScan(tree);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(300000);
  });

  it('stays under 500MB for 100k files', async () => {
    const tree = generateMockTree(100000);
    await runScan(tree);
    if (performance.memory) {
      const usedMB = performance.memory.usedJSHeapSize / 1024 / 1024;
      expect(usedMB).toBeLessThan(500);
    }
  });
});
```

**Example - Render Performance**:
```typescript
// performance/render-performance.test.ts
describe('Render Performance', () => {
  it('renders treemap with 10k nodes in under 500ms', () => {
    const data = generateMockTreemap(10000);
    const start = performance.now();
    render(<StorageTreemap data={data} />);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(500);
  });

  it('searches 10k items in under 100ms', () => {
    const items = generateMockItems(10000);
    const start = performance.now();
    const results = searchTree(items, 'test');
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
    expect(results).toBeDefined();
  });
});
```

### 5. Accessibility Tests

**Tools**: jest-axe, manual testing, screen reader

**Example - Automated A11y**:
```typescript
// a11y/component-a11y.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { App } from '@/app/page';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('App has no a11y violations', async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('StorageTreemap has no a11y violations', async () => {
    const { container } = render(<StorageTreemap data={mockData} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('SearchBar has no a11y violations', async () => {
    const { container } = render(<SearchBar />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

**Manual Checklist**:
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] No information conveyed by color alone
- [ ] Touch targets are large enough
- [ ] Works with 200% zoom
- [ ] Respects prefers-reduced-motion

## Test Utilities

### Mock Data Generators

```typescript
// test-utils/mock-tree.ts
export function generateMockTree(fileCount: number): FileSystemNode {
  // Generate realistic filesystem structure
  const root: FileSystemNode = {
    id: 'root',
    name: 'C:\\',
    path: 'C:\\',
    type: 'drive',
    size: 0,
    totalSize: 0,
    fileCount: 0,
    folderCount: 0,
    isHidden: false,
    isSystem: false,
    isReadonly: false,
    depth: 0,
    childrenIds: [],
    hasError: false,
  };

  let remainingFiles = fileCount;
  // Use immutable build — don't push to root.childrenIds
  const newChildren: string[] = [];
  while (remainingFiles > 0) {
    const folder = createMockFolder(root, remainingFiles);
    newChildren.push(folder.id);
    remainingFiles -= folder.fileCount;
  }
  // Return a new root object with updated childrenIds
  return { ...root, childrenIds: newChildren };
}

export function createMockNode(overrides?: Partial<FileSystemNode>): FileSystemNode {
  return {
    id: crypto.randomUUID(),
    parentId: null,
    name: 'test.txt',
    path: 'C:\\test.txt',
    type: 'file',
    size: 1024,
    totalSize: 1024,
    fileCount: 1,
    folderCount: 0,
    extension: 'txt',
    isHidden: false,
    isSystem: false,
    isReadonly: false,
    depth: 0,
    childrenIds: [],
    hasError: false,
    ...overrides,
  };
}
```

### Mock File System Access API

```typescript
// test-utils/mock-fsa.ts
import type { FileSystemNode } from '@/types/filesystem';

interface MockEntry {
  name: string;
  kind: 'file' | 'directory';
  size?: number;
  lastModified?: number;
  children?: MockEntry[];
}

/**
 * Creates a mock FileSystemDirectoryHandle for testing.
 * Must be a thenable (Promise-like) so the real code's await works.
 */
export function createMockDirectoryHandle(
  entries: MockEntry[]
): FileSystemDirectoryHandle {
  // The returned object must be Promise-like (have .then) for compatibility
  // with code that does `await handle`.
  let resolveHandle: (h: FileSystemDirectoryHandle) => void;
  const handlePromise = new Promise<FileSystemDirectoryHandle>((r) => {
    resolveHandle = r;
  });

  const handle = {
    kind: 'directory' as const,
    name: 'C:\\',
    get kind() { return 'directory'; },
    values: async function* () {
      for (const entry of entries) {
        if (entry.kind === 'directory') {
          yield {
            kind: 'directory',
            name: entry.name,
            get kind() { return 'directory'; },
            values: handle.values, // recursive for nested
          };
        } else {
          yield {
            kind: 'file',
            name: entry.name,
            get kind() { return 'file'; },
            getFile: async () => ({
              name: entry.name,
              size: entry.size ?? 0,
              lastModified: entry.lastModified ?? Date.now(),
              type: '',
            }),
          };
        }
      }
    },
    queryPermission: async () => 'granted' as PermissionState,
    requestPermission: async () => 'granted' as PermissionState,
    // Make it await-able so the store action can do await handle
    then: handlePromise.then.bind(handlePromise),
    catch: handlePromise.catch.bind(handlePromise),
  } as unknown as FileSystemDirectoryHandle;

  // Resolve the await-able with the actual handle
  resolveHandle!(handle);

  return handle;
}
```

## Test Organization

### File Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   └── button.test.tsx
│   └── panels/
│       ├── file-details.tsx
│       └── file-details.test.tsx
├── lib/
│   ├── formatters.ts
│   └── formatters.test.ts
├── store/
│   ├── index.ts
│   └── index.test.ts
└── hooks/
    ├── use-search.ts
    └── use-search.test.ts

e2e/
├── folder-analysis.spec.ts
├── search.spec.ts
├── mobile.spec.ts
└── error-states.spec.ts

performance/
├── scan-performance.test.ts
└── render-performance.test.ts
```

### Naming Conventions

- Unit tests: `*.test.ts` or `*.test.tsx`
- E2E tests: `*.spec.ts`
- Performance tests: `*.perf.test.ts`
- Accessibility tests: `*.a11y.test.tsx`

## Coverage Goals

| Type | Target |
|------|--------|
| Statements | 80% |
| Branches | 75% |
| Functions | 80% |
| Lines | 80% |

### Critical Paths (100% coverage)
- Scanner logic
- Store actions
- File system access
- Permission handling
- Error boundaries

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit
      - run: npm run test:coverage
      - run: npx playwright install
      - run: npm run test:e2e
      - run: npm run lighthouse
```

### Pre-commit Hooks

```json
// .husky/pre-commit
{
  "hooks": {
    "pre-commit": "lint-staged",
    "commit-msg": "commitlint -E $MSG"
  }
}

// lint-staged config
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write",
    "vitest related --run"
  ]
}
```

## Test Execution

### Local Development

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Run specific test
npm test -- StorageTreemap
```

### CI/CD

```bash
# Parallel execution
- Unit tests: 5min timeout
- Integration tests: 10min timeout
- E2E tests: 15min timeout
- Performance tests: 20min timeout
- Accessibility tests: 5min timeout
```

## Test Maintenance

### When to Update Tests

- When adding new features
- When fixing bugs (write failing test first)
- When refactoring (ensure tests still pass)
- When updating dependencies

### Test Review Checklist

- [ ] Tests are independent
- [ ] Tests are deterministic
- [ ] Tests are fast
- [ ] Tests have clear names
- [ ] Tests cover edge cases
- [ ] Tests use realistic data
- [ ] Tests are maintainable

## Bug Prevention

### Test-Driven Development (TDD)

For new features:
1. Write failing test
2. Implement feature
3. Refactor

### Regression Tests

Every bug fix includes:
- Failing test that reproduces bug
- Fix implementation
- Verification test

## Tools

### Testing Frameworks
- Vitest (unit, integration)
- Playwright (E2E)
- Testing Library (component)
- jest-axe (accessibility)

### Quality Tools
- ESLint (linting)
- Prettier (formatting)
- TypeScript (type checking)
- Husky (git hooks)
- lint-staged (staged files)

### Coverage
- c8 (coverage)
- Codecov (reporting)

### Performance
- Lighthouse CI
- Web Vitals
- Chrome DevTools

## Success Metrics

### Quality Metrics
- Test coverage: 80%+
- Passing rate: 100%
- Flaky test rate: <1%
- Mean time to detect: <5min

### Performance Metrics
- Unit test suite: <30s
- Integration test suite: <2min
- E2E test suite: <10min
- Total CI time: <20min
