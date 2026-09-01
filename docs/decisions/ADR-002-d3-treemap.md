# ADR-002: D3.js for Treemap Visualization

## Status

**Accepted** - 2026-09-01

## Context

The treemap is the primary visualization in Diskotto. It needs to:
- Render accurate proportional boxes based on file sizes
- Support thousands of nodes
- Allow drill-down navigation
- Provide interactive features (hover, click, zoom)
- Be performant on large datasets
- Be customizable and extensible

### Options Considered

1. **D3.js** (with custom treemap)
2. **Recharts** (with built-in treemap)
3. **Chart.js** (no native treemap)
4. **Visx** (D3 + React)
5. **Custom Canvas/WebGL implementation**
6. **Other libraries** (react-d3-tree, react-vis, etc.)

## Decision

We will use **D3.js** for the treemap implementation, with React as the wrapper.

## Rationale

### D3 Strengths
- **Industry standard** - Battle-tested, widely used
- **Powerful algorithms** - Squarify, slice, dice, strip algorithms
- **Full control** - Complete customization possible
- **Excellent performance** - SVG-based, optimized
- **Large ecosystem** - Plugins, examples, community
- **Documentation** - Comprehensive, well-maintained
- **Flexibility** - Can create any visualization

### Why Not Recharts
- **Limited treemap support** - Basic implementation
- **Less customizable** - Opinionated styling
- **React-only** - Tied to React ecosystem
- **No drill-down** - Would need custom implementation
- **Performance** - Not optimized for large datasets

### Why Not Chart.js
- **No native treemap** - Would need plugin
- **Canvas-based** - Less accessible
- **Limited interactivity** - Hard to customize

### Why Not Visx
- **Newer** - Smaller community
- **D3 + React wrapper** - Adds abstraction
- **Overkill** - For our use case, raw D3 is fine
- **Performance** - Slight overhead from abstraction

### Why Not Custom
- **Time-consuming** - Reinventing the wheel
- **Bug risk** - Visualization algorithms are complex
- **Maintenance** - Long-term burden

## Implementation Approach

### Hybrid D3 + React

```typescript
// D3 handles calculations
const layout = d3.treemap<TreemapNode>()
  .size([width, height])
  .padding(2)
  .round(true);

const root = d3.hierarchy(data)
  .sum(d => d.value)
  .sort((a, b) => b.value! - a.value!);

layout(root);

// React handles rendering
return (
  <svg width={width} height={height}>
    {root.leaves().map(leaf => (
      <g key={leaf.data.id} transform={`translate(${leaf.x0},${leaf.y0})`}>
        <rect width={leaf.x1! - leaf.x0!} height={leaf.y1! - leaf.y0!} />
        <text>{leaf.data.name}</text>
      </g>
    ))}
  </svg>
);
```

### Benefits of This Approach
- **D3 for math** - Layout calculations
- **React for UI** - Component lifecycle, state
- **Best of both worlds** - Performance + DX

## Consequences

### Positive
- **Proven solution** - D3 is reliable
- **Excellent performance** - Handles thousands of nodes
- **Full customization** - Can adapt to any design
- **Smooth animations** - D3 transitions
- **Accessible** - Can add ARIA, keyboard nav
- **Future-proof** - Large community, long-term support

### Negative
- **Learning curve** - D3 is complex
- **Bundle size** - ~100KB gzipped (large)
- **Imperative style** - Different from React paradigm
- **Documentation** - Can be overwhelming

### Mitigation Strategies

1. **Learning curve**
   - Start with simple examples
   - Build incrementally
   - Use D3's modular imports
   - Document patterns

2. **Bundle size**
   - Tree-shake D3 modules
   - Import only what we need
   - Code splitting
   - Lazy load

3. **Imperative style**
   - Use D3 only for calculations
   - React handles DOM
   - Clean separation of concerns

4. **Documentation**
   - Create internal docs
   - Add code comments
   - Share knowledge across team

## Performance Considerations

### D3 Treemap Performance
- **1k nodes**: <10ms layout
- **10k nodes**: <100ms layout
- **100k nodes**: <1s layout (may need aggregation)

### Optimization Strategies
- **Memoization** - Cache layout calculations per `[data, width, height]`
- **Incremental updates** - Recompute only when the underlying tree or current path changes
- **Aggregation** - Group items <0.1% of folder total into a single "Other" cell for folders with >1,000 children
- **Level-of-detail** - Skip text labels for nodes <60px on either side

> **Not used: Virtualization**. A treemap is a 2D space-filling layout — every cell's position depends on every other cell. You cannot skip rendering of off-screen cells the way you can with a 1D list. Any pretense of "virtualizing" a treemap is really a form of aggregation (the layout is computed over a smaller set, and the missing items are summarized). We use aggregation explicitly instead.

> **Not used: Web Worker for layout**. The layout is fast enough (<1s for 100k) and runs synchronously in `useMemo` after data updates. Moving it to a worker would add postMessage round-trips that would exceed the layout cost itself. (D3 is, however, called on a **derived** copy of the store data — see `architecture.md` for the read-only invariant.)

### Example
```typescript
// Memoized treemap layout — pure function of inputs, no side effects on store
const treemapLayout = useMemo(() => {
  const layout = d3.treemap<TreemapNode>()
    .size([width, height])
    .padding(2);

  const root = d3.hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => (b.value || 0) - (a.value || 0));

  layout(root);
  return root;
}, [data, width, height]);
```

## Alternatives Detailed Analysis

### Recharts

**Pros**:
- React-native API
- Easy to use
- Good defaults
- TypeScript support

**Cons**:
- Limited treemap
- Less customizable
- Smaller community
- No drill-down support

**Verdict**: Insufficient for our needs

### Chart.js

**Pros**:
- Simple API
- Good performance
- Canvas-based
- Many chart types

**Cons**:
- No native treemap
- Plugin required
- Less customizable
- Canvas (accessibility concerns)

**Verdict**: No native support, rejected

### Visx

**Pros**:
- D3 + React best practices
- Composable
- Good TypeScript support
- Modern

**Cons**:
- Newer (less mature)
- Smaller community
- Overkill for our needs
- Adds abstraction layer

**Verdict**: Good library, but unnecessary for our use case

### Custom Canvas/WebGL

**Pros**:
- Maximum performance
- Full control
- GPU acceleration possible

**Cons**:
- Complex to build
- Accessibility challenges
- Time-consuming
- Maintenance burden
- Reinventing the wheel

**Verdict**: Too much effort, D3 is proven

## Implementation Plan

### Phase 1: Basic Treemap
- Render with mock data
- Squarify algorithm
- Basic interactivity
- No animations

### Phase 2: Interactivity
- Hover effects
- Click handlers
- Drill-down
- Breadcrumb sync

### Phase 3: Performance
- Optimization
- Aggregation (folders with >1,000 children)
- Level-of-detail rendering
- Performance profiling

### Phase 4: Polish
- Animations
- Touch gestures
- Accessibility
- Edge cases

## Bundle Size Impact

### D3 Imports
```typescript
// Full D3: ~250KB
import * as d3 from 'd3';

// Modular imports: ~100KB
import { hierarchy, treemap } from 'd3-hierarchy';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
```

### Optimization
- Use modular imports
- Code splitting
- Lazy load if needed
- Tree shaking

## Accessibility

### SVG + ARIA
```typescript
<svg role="tree" aria-label="Storage treemap">
  {nodes.map(node => (
    <g
      role="treeitem"
      aria-label={`${node.name}, ${formatBytes(node.size)}`}
      tabIndex={0}
    >
      <rect />
      <text aria-hidden="true">{node.name}</text>
    </g>
  ))}
</svg>
```

### Keyboard Navigation
- Tab through nodes
- Enter to drill down
- Escape to go back
- Arrow keys to navigate

### Screen Readers
- Each node announced with name, size, type
- Live regions for updates
- Semantic structure

## Testing

### Unit Tests
- Layout calculations
- Data transformations
- Edge cases (empty, single node, etc.)

### Integration Tests
- D3 + React integration
- State updates
- Event handling

### Performance Tests
- Large datasets
- Layout speed
- Render performance
- Memory usage

## Future Considerations

### WebGL Rendering
For 100k+ nodes, consider:
- PixiJS
- regl
- Three.js
- Custom WebGL

### Alternative Algorithms
- Circle packing
- Sunburst
- Icicle plot
- Tree visualization

### 3D Treemap
- Experimental
- Cool factor
- Probably overkill

## References

- [D3 Treemap Documentation](https://github.com/d3/d3-hierarchy#treemap)
- [D3 Examples](https://observablehq.com/@d3/treemap)
- [Squarify Algorithm](https://www.win.tue.nl/~vanwijk/stm.pdf)
- [D3 + React Best Practices](https://2019.wattenberger.com/blog/react-and-d3)
- [Performance with D3](https://www.smashingmagazine.com/2014/02/05/infinite-scroll-2/)

## Decision Makers

- Technical Lead
- UX Designer
- Frontend Architect
- Performance Engineer

## Date

2026-09-01

## Review Date

2027-03-01 (6 months)
