# Accessibility

## Overview

Diskotto is committed to being accessible to all users, including those who use assistive technologies. We follow WCAG 2.1 Level AA standards and continuously test with screen readers and keyboard navigation.

## Accessibility Principles

1. **Perceivable**: Information is presented in ways users can perceive
2. **Operable**: Interface components are operable by all users
3. **Understandable**: Information and operation are understandable
4. **Robust**: Content is compatible with assistive technologies

## Keyboard Navigation

### Global Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `Tab` | Next focusable element | Global |
| `Shift+Tab` | Previous focusable element | Global |
| `Esc` | Close panel/modal/cancel action | Global |
| `/` | Focus search | Global |
| `Ctrl+K` | Focus search (alternate) | Global |
| `Ctrl+F` | Open filters | Global |
| `Ctrl+,` | Open settings | Global |
| `Backspace` | Navigate to parent folder | In treemap |
| `?` | Show keyboard shortcuts | Global |

### Folder Tree Navigation

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate between items |
| `→` | Expand folder or move to first child |
| `←` | Collapse folder or move to parent |
| `Enter` | Select item |
| `Space` | Toggle expand/collapse |
| `Home` | Jump to first item |
| `End` | Jump to last item |

### Treemap Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move to next node |
| `Shift+Tab` | Move to previous node |
| `Enter` | Drill into folder or select file |
| `Esc` | Go to parent folder |
| `Arrow keys` | Navigate between nodes |

### Search Results Navigation

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate results |
| `Enter` | Open selected result |
| `Esc` | Close search |

### Modal/Dialog Navigation

| Key | Action |
|-----|--------|
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Enter` | Confirm |
| `Esc` | Cancel |
| Focus is trapped within modal |

## Screen Reader Support

### ARIA Labels

All interactive elements have descriptive labels:

```html
<button aria-label="Select folder to scan">
  <FolderIcon aria-hidden="true" />
  Select Folder
</button>

<div role="tree" aria-label="Folder tree">
  <div role="treeitem" aria-expanded="true" aria-selected="true">
    Downloads
  </div>
</div>

<div role="tree" aria-label="Storage treemap">
  <div role="treeitem" aria-label="GTA_V_Final_4K.mp4, 78.4 GB, video file">
    <!-- Treemap node -->
  </div>
</div>
```

### Live Regions

Scan progress is announced to screen readers:

```html
<div aria-live="polite" aria-atomic="true">
  Scanning: 12,847 files, 89.4 GB
</div>

<div aria-live="assertive" role="alert">
  Scan complete
</div>
```

### Semantic HTML

Using proper HTML elements:

```html
<header> <!-- Top navigation --> </header>
<nav> <!-- Breadcrumb --> </nav>
<main> <!-- Main content --> </main>
<aside> <!-- Sidebar --> </aside>
<footer> <!-- Status bar --> </footer>

<h1> <!-- Page title --> </h1>
<h2> <!-- Section title --> </h2>

<button> <!-- Interactive button --> </button>
<a> <!-- Link --> </a>

<ul> <li> <!-- Lists --> </li> </ul>
```

## Visual Accessibility

### Color Contrast

All text meets WCAG AA standards:

| Element | Min Ratio | Our Ratio |
|---------|-----------|-----------|
| Body text | 4.5:1 | 7:1 |
| Large text (18px+) | 3:1 | 7:1 |
| UI components | 3:1 | 4.5:1 |
| Focus indicators | 3:1 | 4.5:1 |

**Tested combinations**:
- Light theme: `#171717` on `#FFFFFF` = 16.1:1 ✓
- Dark theme: `#FAFAFA` on `#0A0A0A` = 18.9:1 ✓
- Primary: `#2563EB` on `#FFFFFF` = 8.6:1 ✓

### Color Independence

Information is never conveyed by color alone:

```typescript
// Category colors are paired with icons
<div>
  <VideoIcon aria-hidden="true" /> {/* Visual indicator */}
  <span>Videos</span> {/* Text label */}
  <span className="text-category-video">86.2 GB</span> {/* Color coding */}
</div>

// Status uses icons + text + color
<div>
  <CheckCircleIcon aria-hidden="true" />
  <span>Scan complete</span>
</div>

<div>
  <AlertCircleIcon aria-hidden="true" />
  <span>3 folders need attention</span>
</div>
```

### Focus Indicators

Clear, visible focus states:

```css
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  *:focus-visible {
    outline: 3px solid;
  }
}
```

### Text Sizing

Text scales properly:

```css
html {
  font-size: 16px; /* Base */
}

/* User can zoom up to 200% without breaking layout */
```

### Reduced Motion

Respect motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Touch & Mobile Accessibility

### Touch Targets

Minimum 44x44px (Apple HIG) or 48x48px (Material):

```css
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}
```

### Touch Gestures

- Tap: Activate
- Long press: Context menu
- Swipe: Navigate
- Pinch: Zoom (treemap)
- Drag handle: Bottom sheet

## Component-Specific Accessibility

### Treemap

The treemap is the most complex component. Accessibility features:

```typescript
<svg role="tree" aria-label="Storage treemap">
  {nodes.map(node => (
    <g
      role="treeitem"
      aria-label={`${node.name}, ${formatBytes(node.size)}, ${node.category}`}
      aria-selected={isSelected}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <rect {...node} />
      <text aria-hidden="true">{node.name}</text>
    </g>
  ))}
</svg>
```

**Features**:
- Each node is focusable
- Keyboard navigation between nodes
- Screen reader announces name, size, type
- Visual focus indicator
- Color + text labels

### Folder Tree

```typescript
<div role="tree" aria-label="Folder tree">
  <div
    role="treeitem"
    aria-expanded={isExpanded}
    aria-selected={isSelected}
    aria-level={depth}
    tabIndex={0}
  >
    <FolderIcon aria-hidden="true" />
    <span>{folder.name}</span>
    <span aria-label={`Size: ${formatBytes(folder.size)}`}>
      {formatBytesShort(folder.size)}
    </span>
  </div>
</div>
```

### Search Bar

```html
<label for="search">Search files and folders</label>
<input
  id="search"
  type="search"
  role="combobox"
  aria-expanded={isOpen}
  aria-controls="search-results"
  aria-autocomplete="list"
/>
<ul
  id="search-results"
  role="listbox"
  aria-label="Search results"
>
  {results.map(result => (
    <li role="option" aria-selected={isSelected}>
      {result.name}
    </li>
  ))}
</ul>
```

### Modals

```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Confirm Action</h2>
  <p id="dialog-description">Are you sure?</p>
  <button>Cancel</button>
  <button>Confirm</button>
</div>
```

**Focus management**:
- Focus moves to modal on open
- Focus trapped within modal
- Focus returns to trigger on close

### Forms

```html
<label for="folder-name">Folder name</label>
<input
  id="folder-name"
  type="text"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby="folder-name-error"
/>
{hasError && (
  <span id="folder-name-error" role="alert">
    Folder name is required
  </span>
)}
```

## Testing

### Automated Testing

```typescript
// jest-axe for accessibility testing
import { axe, toHaveNoViolations } from 'jest-axe';

it('should have no accessibility violations', async () => {
  const { container } = render(<App />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing Checklist

#### Keyboard
- [ ] Tab through all interactive elements
- [ ] Activate all controls with keyboard
- [ ] Use shortcuts (`/`, `Ctrl+K`, `Esc`)
- [ ] Navigate folder tree with arrow keys
- [ ] Drill into treemap with keyboard
- [ ] Fill and submit forms

#### Screen Reader
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] Test with TalkBack (Android)
- [ ] Verify all elements have labels
- [ ] Verify live regions work
- [ ] Verify semantic structure

#### Visual
- [ ] Test with high contrast mode
- [ ] Test with 200% zoom
- [ ] Test with prefers-reduced-motion
- [ ] Test with color blindness simulators
- [ ] Verify focus indicators visible
- [ ] Verify text contrast ratios

#### Touch
- [ ] Test touch targets size
- [ ] Test gesture support
- [ ] Test on actual mobile devices
- [ ] Test with screen reader on mobile

### Tools

- **axe DevTools**: Browser extension
- **Lighthouse**: Built into Chrome
- **WAVE**: Web accessibility evaluation
- **NVDA**: Free screen reader (Windows)
- **VoiceOver**: Built into macOS/iOS

## Continuous Improvement

### Accessibility Audits

- Monthly automated tests
- Quarterly manual audits
- User feedback integration
- External accessibility consultant (when budget allows)

### User Feedback

We actively seek feedback from users with disabilities:
- Accessibility email: accessibility@diskotto.app
- GitHub issues with `a11y` label
- User testing sessions

### Documentation

- Accessibility statement published
- Known issues documented
- Roadmap for improvements

## Compliance

### Standards

- ✅ WCAG 2.1 Level AA
- ✅ Section 508 (US)
- ✅ EN 301 549 (EU)
- ✅ AODA (Canada)

### Future Goals

- WCAG 2.1 Level AAA (where possible)
- Cognitive accessibility improvements
- Multi-language accessibility

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
