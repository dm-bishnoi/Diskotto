# ADR-004: Zustand for State Management

## Status

**Accepted** - 2026-09-01

## Context

Diskotto requires sophisticated state management for:
- Scan progress and results
- Current navigation state
- Search and filter state
- UI state (theme, modals, panels)
- File system tree data
- User selections

We need a state management solution that is:
- TypeScript-first
- Performant with large datasets
- Minimal boilerplate
- Easy to test
- Works well with React 18

### Options Considered

1. **Zustand**
2. **Redux Toolkit**
3. **Jotai**
4. **Recoil**
5. **React Context + useReducer**
6. **Valtio**

## Decision

We will use **Zustand** for state management.

## Rationale

### Why Zustand

#### Minimal API
- **No boilerplate** - No actions, reducers, dispatchers
- **Direct mutations** - Just set state
- **Hooks-based** - Familiar React pattern
- **Less code** - 90% less than Redux

```typescript
// Zustand
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// vs Redux Toolkit
const slice = createSlice({
  name: 'counter',
  initialState: { count: 0 },
  reducers: {
    increment: (state) => {
      state.count += 1;
    },
  },
});
```

#### TypeScript-First
- **Excellent type inference** - No manual types
- **Type-safe actions** - Caught at compile time
- **Autocomplete** - Full IDE support
- **No `any`** - Everything typed

```typescript
interface Store {
  count: number;
  increment: () => void;
  setCount: (n: number) => void;
}

const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  setCount: (n) => set({ count: n }),
}));

// Full type safety, autocomplete, refactoring
```

#### Performance
- **No provider** - No re-render issues
- **Selector-based** - Subscribe to specific slices
- **Shallow comparison** - Default equality check
- **Memoized** - Built-in optimization
- **No Context overhead** - Direct subscription

```typescript
// Only re-render when count changes
const count = useStore((state) => state.count);
```

#### Bundle Size
- **Tiny** - 1.1KB gzipped
- **No dependencies** - Pure JavaScript
- **Tree-shakeable** - Only what you use

#### Testing
- **Easy to test** - Just a function
- **No provider** - No wrapper needed
- **Direct access** - `useStore.getState()`

```typescript
test('increment works', () => {
  const { increment } = useStore.getState();
  increment();
  expect(useStore.getState().count).toBe(1);
});
```

#### DevTools
- **Redux DevTools** - Works out of the box
- **Time travel** - Built-in
- **Action logging** - See state changes

#### Persistence
- **Middleware** - Built-in persist
- **LocalStorage** - Easy integration
- **Selective** - Choose what to persist

### Why Not Redux Toolkit

#### Boilerplate
- **Too much code** - Slices, reducers, actions, selectors
- **Slower development** - More files, more concepts
- **Overkill** - For our use case

#### Verbose
```typescript
// Redux Toolkit
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
  },
});

export const { increment } = counterSlice.actions;
export default counterSlice.reducer;

// In store
export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});

// In component
const count = useSelector((state) => state.counter.value);
const dispatch = useDispatch();
dispatch(increment());

// vs Zustand
const count = useStore((state) => state.count);
const increment = useStore((state) => state.increment);
increment();
```

#### Learning Curve
- **More concepts** - Actions, reducers, dispatch, selectors
- **Steeper** - For new developers
- **Documentation** - More to read

#### Performance
- **Context-based** - Can cause re-renders
- **Use selectors** - Requires care
- **Zustand** - Better out of the box

### Why Not Jotai

#### Atomic Model
- **Different paradigm** - Atomic state
- **More files** - One atom per concept
- **Overkill** - For our centralized state

#### Bundle Size
- **Larger** - 3.5KB vs 1.1KB
- **More dependencies** - utils, etc.

#### TypeScript
- **Good** - But not as good as Zustand
- **Inference** - Sometimes manual

### Why Not Recoil

#### Facebook Project
- **Uncertain future** - Maintenance status unclear
- **Experimental** - Was experimental for long time
- **Community** - Smaller than alternatives

#### Bundle Size
- **Larger** - 22KB
- **More dependencies**

#### Complexity
- **Atoms, selectors, families** - More concepts
- **Async patterns** - More to learn

### Why Not React Context + useReducer

#### Performance
- **Context re-renders** - All consumers re-render
- **Optimization required** - Memo, useMemo
- **Zustand** - Better by default

#### Boilerplate
- **Provider setup** - Wrap app
- **Reducer pattern** - Like Redux
- **More code** - For same result

```typescript
// Context + Reducer
const StateContext = createContext();
const DispatchContext = createContext();

function provider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// In component
const state = useContext(StateContext);
const dispatch = useContext(DispatchContext);

// vs Zustand
const state = useStore();
```

#### Testing
- **Provider required** - Wrap in tests
- **More setup** - More boilerplate

### Why Not Valtio

#### Proxy-Based
- **Different paradigm** - Proxy state
- **Less React-like** - More imperative
- **Learning curve** - New pattern

#### TypeScript
- **Good** - But proxy magic can be confusing
- **Debugging** - Harder to inspect

#### Community
- **Smaller** - Less popular
- **Documentation** - Less comprehensive

## Implementation

### Store Structure

```typescript
// store/index.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createScanSlice, ScanSlice } from './scan-slice';
import { createNavigationSlice, NavigationSlice } from './navigation-slice';
import { createUISlice, UISlice } from './ui-slice';

type Store = ScanSlice & NavigationSlice & UISlice;

export const useStore = create<Store>()(
  devtools(
    persist(
      (...a) => ({
        ...createScanSlice(...a),
        ...createNavigationSlice(...a),
        ...createUISlice(...a),
      }),
      {
        name: 'diskotto-store',
        partialize: (state) => ({
          // Only persist UI preferences
          theme: state.theme,
        }),
      }
    )
  )
);
```

### Slice Pattern

```typescript
// store/scan-slice.ts
export interface ScanSlice {
  // State
  scanStatus: ScanStatus;
  currentScan: ScanSession | null;
  rootNode: FileSystemNode | null;
  
  // Actions
  startScan: (handle: FileSystemDirectoryHandle) => Promise<void>;
  cancelScan: () => void;
  addNodes: (nodes: FileSystemNode[]) => void;
  updateProgress: (progress: ScanProgress) => void;
  completeScan: () => void;
  resetScan: () => void;
}

export const createScanSlice: StateCreator<
  Store,
  [],
  [],
  ScanSlice
> = (set, get) => ({
  scanStatus: 'idle',
  currentScan: null,
  rootNode: null,
  
  startScan: async (handle) => {
    set({ scanStatus: 'scanning' });
    // ... start scan
  },
  
  cancelScan: () => {
    set({ scanStatus: 'cancelled' });
    // ... cancel
  },
  
  addNodes: (nodes) => {
    set((state) => ({
      rootNode: mergeNodes(state.rootNode, nodes),
    }));
  },
  
  // ... other actions
});
```

### Selectors

```typescript
// store/selectors.ts
export const useCurrentPath = () =>
  useStore((state) => state.currentPath);

export const useSelectedNode = () =>
  useStore((state) =>
    state.selectedNodeId
      ? state.nodes[state.selectedNodeId] ?? null  // Record access, not Map.get
      : null
  );

export const useSearchResults = () =>
  useStore((state) => {
    // Memoized computation
    return computeSearchResults(state.rootNode, state.searchQuery);
  });
```

### Usage in Components

```typescript
// Simple subscription
function ScanButton() {
  const scanStatus = useStore((state) => state.scanStatus);
  const startScan = useStore((state) => state.startScan);
  
  return (
    <Button onClick={() => startScan(handle)}>
      {scanStatus === 'scanning' ? 'Scanning...' : 'Select Folder'}
    </Button>
  );
}

// Multiple values
function ScanProgress() {
  const { filesScanned, totalSize } = useStore(
    (state) => ({
      filesScanned: state.currentScan?.filesScanned || 0,
      totalSize: state.currentScan?.totalBytesScanned || 0,
    }),
    shallow
  );
  
  return <Progress value={filesScanned} max={totalSize} />;
}

// Actions
function FolderTree() {
  const selectNode = useStore((state) => state.selectNode);
  
  return <Tree onSelect={selectNode} />;
}
```

## Consequences

### Positive
- **Less code** - 90% reduction vs Redux
- **Faster development** - Less boilerplate
- **TypeScript-friendly** - Excellent inference
- **Performant** - No re-render issues
- **Easy to test** - No providers needed
- **Small bundle** - 1.1KB
- **DevTools support** - Redux DevTools
- **Persistence** - Built-in middleware

### Companion: Search Index

Zustand holds the **canonical** filesystem tree. The fast search index (minisearch) lives **outside** the store as a derived view. This decision is documented in [ADR-006: Search Indexing](./ADR-006-search-indexing.md).

### Negative
- **Smaller ecosystem** - Than Redux
- **Less opinionated** - Need to establish patterns
- **Multiple stores** - Can be misused (we use slices)
- **No time travel** - Without DevTools setup

### Mitigation Strategies

1. **Patterns**
   - Document internal patterns
   - Use slice pattern for organization
   - Establish naming conventions

2. **Testing**
   - Test store actions directly
   - Use `getState()` for non-React tests
   - Test selectors in isolation

3. **Performance**
   - Use selectors for derived data
   - Shallow comparison for objects
   - Memoize expensive computations

## Patterns

### Slice Pattern

Organize store by domain:

```
store/
├── index.ts              # Combined store
├── scan-slice.ts         # Scan state
├── navigation-slice.ts   # Navigation state
├── ui-slice.ts           # UI state
└── selectors.ts          # Reusable selectors
```

### Selector Pattern

```typescript
// Good - specific selector
const count = useStore((state) => state.count);

// Bad - returns new object every time
const { count, name } = useStore((state) => ({ 
  count: state.count, 
  name: state.name 
}));

// Fix - use shallow comparison
import { shallow } from 'zustand/shallow';
const { count, name } = useStore(
  (state) => ({ count: state.count, name: state.name }),
  shallow
);
```

### Action Pattern

```typescript
// Co-locate state and actions
const useStore = create((set, get) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
  // Async actions
  fetchData: async () => {
    const data = await api.get();
    set({ data });
  },
}));
```

## Alternatives Detailed Comparison

| Feature | Zustand | Redux Toolkit | Jotai | Recoil |
|---------|---------|---------------|-------|--------|
| **Bundle Size** | 1.1KB | 12KB | 3.5KB | 22KB |
| **Boilerplate** | Low | High | Medium | Medium |
| **TypeScript** | Excellent | Good | Good | Fair |
| **Performance** | Excellent | Good | Excellent | Good |
| **DevTools** | Yes | Yes | Yes | Yes |
| **Persistence** | Built-in | Middleware | Manual | Manual |
| **Learning Curve** | Low | High | Medium | High |
| **Community** | Large | Largest | Growing | Small |
| **Documentation** | Excellent | Excellent | Good | Fair |
| **Maturity** | Mature | Mature | Mature | Uncertain |
| **Testing** | Easy | Medium | Easy | Medium |

## References

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Zustand vs Redux](https://github.com/pmndrs/zustand#comparison)
- [Zustand TypeScript Guide](https://github.com/pmndrs/zustand#typescript-usage)
- [State Management Best Practices](https://kentcdodds.com/blog/application-state-management-with-react)

## Decision Makers

- Technical Lead
- Frontend Architect
- Senior Developers

## Date

2026-09-01

## Review Date

2027-03-01 (6 months)
