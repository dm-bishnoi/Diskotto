# Diskotto - Storage Analyzer

## 1. Concept & Vision

**Diskotto** is a modern, privacy-first storage analyzer that transforms filesystem complexity into visual clarity. It answers the universal question: "Where did all my storage go?" through an intuitive, information-dense interface that feels like a professional desktop utility, not a generic web dashboard.

The experience is defined by **honesty** (real filesystem data, not approximations), **speed** (progressive scanning with instant visual feedback), and **clarity** (every byte accounted for, every path visible). Diskotto respects user privacy by processing everything locally—no uploads, no cloud dependency, no surprises.

---

## 2. Design Language

### Aesthetic Direction
**Reference**: Professional storage utility meets modern data visualization. Think WinDirStat's utility meets Linear's polish. Dense information display with generous use of color-coding for instant category recognition. The interface should feel like a precision instrument—capable and trustworthy.

### Color Palette

#### Light Theme
| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#FAFAFA` | Page background |
| `surface` | `#FFFFFF` | Cards, panels |
| `surface-elevated` | `#F5F5F5` | Hover states, subtle elevation |
| `border` | `#E5E5E5` | Dividers, borders |
| `border-strong` | `#D4D4D4` | Active borders |
| `text-primary` | `#171717` | Headings, primary text |
| `text-secondary` | `#525252` | Secondary text |
| `text-muted` | `#A3A3A3` | Tertiary, hints |
| `primary` | `#2563EB` | Primary actions, links |
| `primary-hover` | `#1D4ED8` | Primary hover state |
| `success` | `#16A34A` | Positive states |
| `warning` | `#CA8A04` | Caution states |
| `error` | `#DC2626` | Error states |

#### Dark Theme
| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#0A0A0A` | Page background |
| `surface` | `#171717` | Cards, panels |
| `surface-elevated` | `#262626` | Hover states |
| `border` | `#303030` | Dividers, borders |
| `border-strong` | `#404040` | Active borders |
| `text-primary` | `#FAFAFA` | Headings, primary text |
| `text-secondary` | `#A3A3A3` | Secondary text |
| `text-muted` | `#737373` | Tertiary, hints |
| `primary` | `#3B82F6` | Primary actions |
| `primary-hover` | `#60A5FA` | Primary hover state |
| `success` | `#22C55E` | Positive states |
| `warning` | `#EAB308` | Caution states |
| `error` | `#EF4444` | Error states |

#### Category Colors (File Types)
| Category | Light | Dark | Examples |
|----------|-------|------|----------|
| `video` | `#8B5CF6` | `#A78BFA` | .mp4, .mkv, .avi, .mov |
| `image` | `#EC4899` | `#F472B6` | .jpg, .png, .gif, .webp |
| `audio` | `#F97316` | `#FB923C` | .mp3, .wav, .flac, .aac |
| `document` | `#3B82F6` | `#60A5FA` | .pdf, .doc, .docx, .txt |
| `archive` | `#EAB308` | `#FACC15` | .zip, .rar, .7z, .tar |
| `application` | `#10B981` | `#34D399` | .exe, .msi, .dmg |
| `code` | `#06B6D4` | `#22D3EE` | .js, .ts, .py, .java |
| `system` | `#6366F1` | `#818CF8` | .dll, .sys, .ini |
| `folder` | `#78716C` | `#A8A29E` | Directories |
| `other` | `#9CA3AF` | `#9CA3AF` | Uncategorized |

### Typography
| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| `h1` | Inter | 28px | 700 | 1.2 |
| `h2` | Inter | 22px | 600 | 1.3 |
| `h3` | Inter | 18px | 600 | 1.4 |
| `body` | Inter | 14px | 400 | 1.5 |
| `body-sm` | Inter | 12px | 400 | 1.5 |
| `mono` | JetBrains Mono | 13px | 400 | 1.4 |

### Spacing System
Base unit: `4px`

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight gaps |
| `sm` | 8px | Component internal |
| `md` | 16px | Standard gaps |
| `lg` | 24px | Section spacing |
| `xl` | 32px | Major sections |
| `2xl` | 48px | Page margins |

### Motion Philosophy
- **Purpose**: Motion communicates state changes, not decoration
- **Duration**: 150ms for micro-interactions, 250ms for panel transitions, 400ms for page-level changes
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` for standard, `cubic-bezier(0, 0, 0.2, 1)` for enter, `cubic-bezier(0.4, 0, 1, 1)` for exit
- **Treemap**: Smooth zoom on drill-down (300ms), no animation on size updates during scan
- **Lists**: Staggered fade-in for virtualization (50ms between items, max 10 items)

### Visual Assets
- **Icons**: Lucide React (24px default, 16px inline, 20px compact)
- **Decorative**: Minimal—category color badges, subtle gradients only on empty states
- **No images**: Pure data visualization, no stock photos or illustrations

---

## 3. Layout & Structure

### Desktop Layout (≥1024px)
```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER: Logo | Drive Selector | Search | Scan Button | Settings   │
├─────────────────────────────────────────────────────────────────────┤
│  BREADCRUMB: C:\ > Users > Dharmender > Downloads        [Copy Path]│
├──────────────┬────────────────────────────┬─────────────────────────┤
│              │                            │                         │
│  FOLDER TREE │        TREEMAP             │    ANALYTICS PANEL      │
│   (280px)    │      (flexible)            │       (320px)          │
│              │                            │                         │
│  - Expandable│   Primary visualization    │  - Storage by type      │
│  - Virtualized│   Interactive nodes       │  - Largest files        │
│  - Size + %  │   Hover details           │  - Insights             │
│              │   Click to drill          │                         │
│              │                            │                         │
├──────────────┴────────────────────────────┴─────────────────────────┤
│  STATUS BAR: Scanning... | 12,847 files | 342 folders | 127.4 GB   │
└─────────────────────────────────────────────────────────────────────┘
```

### Tablet Layout (768px - 1023px)
```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER: Logo | Search | Menu                                        │
├─────────────────────────────────────────────────────────────────────┤
│  BREADCRUMB + Path Actions                                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                      TREEMAP (full width)                           │
│                      Height: 50vh                                  │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  TABS: Folders | Files | Types | Insights                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Tab content (scrollable list/grid)                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (<768px)
```
┌─────────────────────┐
│  HEADER + Menu     │
├─────────────────────┤
│  STORAGE SUMMARY   │
│  ████░░░░ 78%      │
│  245.8 GB / 316 GB │
├─────────────────────┤
│  CURRENT PATH      │
│  C:\Users\Dhar...  │
├─────────────────────┤
│                     │
│  TREEMAP           │
│  (touch-zoom)      │
│  Height: 40vh      │
│                     │
├─────────────────────┤
│  DETAILS PANEL     │
│  (bottom sheet)    │
├─────────────────────┤
│  QUICK ACTIONS     │
│  Files | Folders   │
├─────────────────────┤
│  ANALYTICS         │
│  (collapsible)     │
└─────────────────────┘
```

### Visual Pacing
- **Header**: Compact (56px), always visible
- **Content**: Maximum density, no wasted space
- **Treemap**: Dominant visual element, minimum 40% of viewport height
- **Status bar**: Minimal (40px), progress-focused
- **Mobile**: Single-column flow, bottom sheet for details

---

## 4. Features & Interactions

### A. Folder Selection & Scanning

#### User Flow
1. User clicks "Select Folder" button
2. Browser native folder picker opens (File System Access API)
3. User grants permission to selected folder
4. Scanning begins immediately
5. Progress shown in status bar and treemap
6. Results populate progressively

#### Permission States
| State | UI | Action |
|-------|-----|--------|
| `idle` | "Select Folder to Scan" button | Await user action |
| `requesting` | Button shows spinner | Browser permission dialog |
| `denied` | Error toast + "Grant Permission" link | Explain and retry |
| `granted` | Scan progress | Begin scanning |

#### Scan Progress Display
```
Scanning: C:\Users\Dharmender\Downloads
━━━━━━━━━━░░░░░░░░░░░░░░░░ 34%
12,847 files | 342 folders | 89.4 GB | 2,340 items/sec
[Cancel Scan]
```

### B. Treemap Interaction

#### Hover State
- Node border highlights (2px primary color)
- Tooltip appears with:
  - Full name
  - Type/extension
  - Exact size (formatted)
  - Full path
  - Children count (if folder)
  - Percentage of parent

#### Click Behavior
- **Folder**: Drill into folder, update breadcrumb, treemap re-renders with folder contents
- **File**: Select file, show details panel
- **Back gesture**: Click breadcrumb root or press Escape

#### Zoom Levels
- Smooth zoom transition (300ms)
- Breadcrumb click returns to parent
- Double-click node to drill down
- Pinch-to-zoom on touch devices

#### Node Label Rules
| Available Width | Label |
|----------------|-------|
| >150px | Full name + size |
| 100-150px | Abbreviated name + size |
| 60-100px | Abbreviated name only |
| <60px | No label (tooltip only) |

### C. Folder Tree (Desktop)

#### Node Display
```
▼ 📁 Downloads          89.4 GB   28%
  ▼ 📁 Movies            45.2 GB   51%
    ▶ 📁 Old             12.1 GB   27%
    ▶ 📁 New             33.1 GB   73%
  📄 GTA_V_Final_4K.mp4  78.4 GB   88%
  📄 Project_Backup.zip  11.0 GB   12%
```

#### Interactions
- Click folder: Expand/collapse + select
- Double-click: Drill into treemap
- Right-click: Context menu (Open, Copy Path, Properties)
- Drag: Not supported (read-only)

### D. Search

#### Search Input
- Global search bar in header
- Keyboard shortcut: `/` or `Ctrl+K`
- Debounce: 300ms

#### Search Scope
- File names
- Folder names
- File extensions
- Full paths

#### Results Display
```
Search: "project"
Found 23 items in 1.2s

📁 Projects                     C:\Users\Dharmender\Projects
📁 Project_Backups              C:\Users\Dharmender\Backups
📄 project_notes.pdf            C:\Users\Dharmender\Documents
📄 project_budget.xlsx          C:\Users\Dharmender\Documents
📄 project_backup_2026.zip      C:\Users\Dharmender\Downloads
```

#### Filtering
- Size filters: >100MB, >500MB, >1GB, >10GB
- Type filters: Videos, Images, Documents, Audio, Archives, Applications, Code
- Date filters: Modified today, this week, this month, this year

### E. File/Folder Details Panel

#### Folder Details
```
┌─────────────────────────────────────────┐
│  📁 Downloads                      [✕]  │
├─────────────────────────────────────────┤
│  Size         89.4 GB                    │
│  Files       847                        │
│  Folders     12                         │
│  % of Parent  28%                      │
│  Path        C:\Users\Dharmender\...    │
│  Modified    Aug 15, 2026               │
├─────────────────────────────────────────┤
│  [Open Location]  [Copy Path]  [Details] │
└─────────────────────────────────────────┘
```

#### File Details
```
┌─────────────────────────────────────────┐
│  📄 GTA_V_Final_4K.mp4              [✕]  │
├─────────────────────────────────────────┤
│  Type         Video (MP4)               │
│  Size         78.4 GB                   │
│  Extension    .mp4                      │
│  Path         C:\Users\Dharmender\...   │
│  Folder       Downloads                 │
│  Created      Jan 12, 2024              │
│  Modified     Aug 28, 2026              │
├─────────────────────────────────────────┤
│  [Open]  [Show in Folder]  [Copy Path]  │
└─────────────────────────────────────────┘
```

### F. Analytics Panel

#### Storage by Extension
```
┌─────────────────────────────┐
│  BY EXTENSION               │
├─────────────────────────────┤
│  ████ .mp4     86.2 GB  28%│
│  ████ .zip     42.8 GB  14%│
│  ████ .iso     38.1 GB  12%│
│  ████ .jpg     24.3 GB   8%│
│  ████ .pdf     18.7 GB   6%│
│  ████ Other   101.3 GB  32%│
│                             │
│  [View All 47 Types]        │
└─────────────────────────────┘
```

#### Insights
```
┌─────────────────────────────┐
│  INSIGHTS                   │
├─────────────────────────────┤
│  ⚠️  3 folders > 50 GB      │
│  📄  127 videos > 1 GB      │
│  📦  12 unused archives     │
│  🕐  89 files unmodified   │
│      in 2+ years            │
└─────────────────────────────┘
```

### G. Empty, Loading, and Error States

#### Empty State (No Scan)
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                        [Folder Icon]                         │
│                                                               │
│              No folder selected yet                          │
│                                                               │
│     Select a folder to analyze your storage usage.           │
│     Your data stays on your device — nothing is uploaded.    │
│                                                               │
│                    [Select Folder]                           │
│                                                               │
│     ┌─────────────────────────────────────────────────────┐   │
│     │  Supports: Local folders, USB drives, cloud drives │   │
│     │  (when mounted locally)                            │   │
│     └─────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

#### Scanning State
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                      [Scanning Animation]                     │
│                                                               │
│              Scanning Downloads...                            │
│                                                               │
│     ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░  34%            │
│                                                               │
│     12,847 files | 342 folders | 89.4 GB                     │
│                                                               │
│     Current: GTA_V_Final_4K.mp4                               │
│                                                               │
│                     [Cancel Scan]                            │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

#### Error State (Permission Denied)
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                        [Lock Icon]                            │
│                                                               │
│              Permission Required                              │
│                                                               │
│     Diskotto needs access to your folder to analyze it.      │
│     Click below to grant permission again.                   │
│                                                               │
│                 [Grant Permission]                            │
│                                                               │
│     ┌─────────────────────────────────────────────────────┐   │
│     │  Why this is needed: To read folder structure and   │   │
│     │  file metadata (not file contents). All processing   │   │
│     │  happens locally on your device.                    │   │
│     └─────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 5. Component Inventory

### AppShell
Container component managing global layout, theme, and responsive breakpoints.
- **Props**: `children`, `theme`, `sidebarCollapsed`
- **States**: Default, sidebar-collapsed (tablet), mobile-nav-open

### Header
Top navigation bar with global controls.
- **Elements**: Logo, drive selector, search input, scan button, settings button, theme toggle
- **States**: Default, searching, scanning
- **Mobile**: Hamburger menu replaces inline controls

### Breadcrumb
Path navigation with truncation and copy functionality.
- **Props**: `path: string[]`, `onNavigate: (index: number) => void`
- **States**: Default, truncated (overflow with "..."), root-only
- **Interactions**: Click segment to navigate, hover for full path tooltip, copy button

### FolderTree
Virtualized expandable folder hierarchy.
- **Props**: `nodes: TreeNode[]`, `selectedPath: string`, `onSelect: (node) => void`
- **States**: Collapsed, expanded, loading-children, selected, hovered
- **Virtualization**: react-window for 1000+ items
- **Interactions**: Click expand arrow, click row to select, double-click to drill

### FolderTreeItem
Individual folder row within FolderTree.
- **Props**: `node`, `depth`, `isSelected`, `isExpanded`, `onToggle`, `onSelect`
- **States**: Collapsed, expanded, selected, hovered
- **Visual**: Indent per depth level, folder icon, name, size, percentage bar

### StorageTreemap
Primary D3-powered interactive treemap visualization.
- **Props**: `data: TreemapNode`, `width`, `height`, `onNodeClick`, `onNodeHover`
- **States**: Loading, empty, populated, drilling-down, zooming
- **Interactions**: Hover highlights, click drills, pinch-zoom (touch), pan (desktop)
- **D3 Config**: Squarify algorithm, fixed padding 2px between nodes

### TreemapNode
Individual box within the treemap.
- **Props**: `node`, `x`, `y`, `width`, `height`, `isHovered`, `isSelected`
- **States**: Default, hovered, selected, too-small-for-label
- **Visual**: Category-based background color, border on hover/select, label truncation

### TreemapTooltip
Floating tooltip on treemap node hover.
- **Content**: Name, type, size, path, children count, percentage
- **Position**: Follow cursor with viewport edge detection
- **Timing**: 100ms delay before show, instant hide on mouseout

### AnalyticsPanel
Right sidebar with storage breakdown and insights.
- **Sections**: Storage by extension, largest files, insights
- **States**: Default, collapsed (mobile), loading
- **Interactions**: Click section header to collapse, click item to select in treemap

### ExtensionBreakdown
Horizontal bar chart of storage by file extension.
- **Props**: `data: ExtensionStats[]`, `onSelectExtension: (ext) => void`
- **States**: Default, item-hovered, item-selected
- **Visual**: Color-coded bars with extension label, size, percentage

### FileCard
Compact file representation in lists.
- **Props**: `file`, `isSelected`, `onClick`, `onAction`
- **States**: Default, hovered, selected
- **Visual**: File type icon, name, size, extension badge
- **Actions**: Open, show in folder, copy path (context menu)

### FolderCard
Compact folder representation in lists.
- **Props**: `folder`, `isSelected`, `onClick`, `onAction`
- **States**: Default, hovered, selected
- **Visual**: Folder icon, name, size, file/folder count, percentage bar

### FileDetails
Detailed panel for selected file.
- **Props**: `file`, `onClose`, `actions: Action[]`
- **States**: Default, loading-actions (platform detection)
- **Actions**: Open (if supported), Show in folder (if supported), Copy path

### FolderDetails
Detailed panel for selected folder.
- **Props**: `folder`, `onClose`, `onDrillDown`, `actions: Action[]`
- **States**: Default, loading-actions
- **Actions**: Open location, Copy path, View contents (drill down)

### SearchBar
Global search input with results dropdown.
- **Props**: `onSearch`, `results`, `isSearching`, `onResultSelect`
- **States**: Idle, focused, searching, has-results, no-results
- **Interactions**: Focus opens, type filters, arrow keys navigate, enter selects

### FilterBar
Horizontal filter chips and controls.
- **Props**: `filters`, `onFilterChange`, `activeFilters`
- **States**: Default, filter-active (chip filled)
- **Filters**: Size (dropdown), Type (multi-select), Date (dropdown)

### ScanProgress
Progress indicator during scanning.
- **Props**: `progress`, `currentPath`, `filesScanned`, `foldersScanned`, `totalSize`, `onCancel`
- **States**: Scanning, paused, cancelled, complete
- **Visual**: Progress bar, live stats, current file indicator

### InsightCard
Highlight card for potential cleanup opportunities.
- **Props**: `insight`, `onAction`
- **States**: Default, hovered
- **Visual**: Warning/info icon, title, description, action button
- **Types**: Large folders, old files, unused archives, duplicate candidates

### EmptyState
Placeholder when no data is available.
- **Props**: `icon`, `title`, `description`, `action`, `actionLabel`
- **Variants**: No-scan, no-results, no-permission, error

### PermissionState
Permission request and error handling.
- **Props**: `status`, `onRequestPermission`, `onRetry`
- **States**: Idle, requesting, denied, error
- **Visual**: Lock icon, explanation text, primary action button

### BottomSheet
Mobile slide-up panel for details and actions.
- **Props**: `isOpen`, `onClose`, `title`, `children`
- **States**: Closed, opening, open, closing
- **Interactions**: Drag handle, swipe down to close, tap outside to close

### ContextMenu
Right-click action menu.
- **Props**: `x`, `y`, `items`, `onClose`
- **States**: Opening, open, closing
- **Interactions**: Click item to execute, click outside to close, escape to close

### ConfirmDialog
Modal for destructive action confirmation.
- **Props**: `title`, `message`, `confirmLabel`, `cancelLabel`, `variant`, `onConfirm`, `onCancel`
- **Variants**: Default, destructive (red confirm button)
- **Accessibility**: Focus trap, escape to cancel

---

## 6. Technical Approach

### Framework & Libraries

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| Framework | Next.js 14 | ^14.2 | App Router, Server Components, excellent DX |
| UI Library | React | ^18.3 | Component model, ecosystem |
| Language | TypeScript | ^5.5 | Type safety, excellent DX |
| Styling | Tailwind CSS | ^3.4 | Utility-first, consistent design system |
| Components | shadcn/ui | latest | Accessible, customizable, copy-to-own |
| Icons | Lucide React | ^0.400 | Consistent, tree-shakeable |
| Visualization | D3.js | ^7.9 | Industry-standard treemap, full control |
| Charts | Custom SVG components | — | Avoid extra dependency; share D3 scale/selection utilities |
| State | Zustand | ^4.5 | Minimal, performant, TypeScript-friendly |
| Search Index | minisearch | ^7.1 | Lightweight full-text search (~8KB gzipped) |
| Validation | Zod | ^3.23 | Runtime validation, inference |
| Testing | Vitest | ^1.6 | Fast, Vite-native |
| E2E | Playwright | ^1.45 | Cross-browser, reliable |
| Linting | ESLint | ^8.57 | Code quality |
| Formatting | Prettier | ^3.3 | Consistent style |

### File System Access API

The File System Access API enables folder selection:
```typescript
const dirHandle = await window.showDirectoryPicker();
// Recursively read entries using iterator
for await (const entry of dirHandle.values()) {
  // entry.kind: 'file' | 'directory'
  // entry.getFile() for metadata
  // entry.values() for children (directories)
}
```

**Browser Support**:
- Chrome 86+, Edge 86+, Opera 72+, Brave 1.20+: Full support
- Safari 16.4+: Limited support (read-only, limited handle persistence)
- Firefox: Not supported (no File System Access API)
- iOS Safari: Not supported
- Mobile browsers: Limited support (permissions reset on reload)

**Fallback Strategy**:
- Show clear message for unsupported browsers
- Future: Tauri desktop app for full support

### Data Model

```typescript
interface FileSystemNode {
  id: string;                    // UUID
  name: string;                  // Display name
  path: string;                  // Full path
  type: 'file' | 'folder' | 'drive';
  size: number;                  // Bytes
  extension?: string;            // Without dot
  mimeType?: string;             // Detected from extension
  createdAt?: Date;
  modifiedAt?: Date;
  parent?: string;               // Parent node ID
  children?: string[];           // Child node IDs (folders only)
  fileCount?: number;            // Direct files (folders)
  folderCount?: number;          // Direct subfolders (folders)
  totalSize?: number;            // Inclusive size (folders)
  percentageOfParent?: number;   // 0-100
  category?: FileCategory;       // Computed
}

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

interface ScanProgress {
  status: 'idle' | 'scanning' | 'paused' | 'cancelled' | 'complete' | 'error';
  currentPath: string;
  filesScanned: number;
  foldersScanned: number;
  totalSize: number;
  percentage?: number;           // If total can be estimated
  startedAt: Date;
  errorCount: number;
  errors: ScanError[];
}

interface ScanError {
  path: string;
  message: string;
  code: string;
}

interface TreemapNode {
  id: string;
  name: string;
  value: number;                 // Size for treemap layout
  category: FileCategory;
  type: 'file' | 'folder';
  path: string;
  children?: TreemapNode[];       // For nested folders
  percentageOfParent?: number;
}
```

### State Architecture (Zustand)

```typescript
interface DiskottoStore {
  // Scan state
  scanStatus: ScanProgress['status'];
  currentScan: ScanProgress | null;
  rootNode: FileSystemNode | null;

  // Navigation state
  currentPath: string[];
  selectedNodeId: string | null;
  expandedFolders: Set<string>;

  // Search/filter state
  searchQuery: string;
  searchResults: FileSystemNode[];
  activeFilters: FilterState;

  // UI state
  sidebarCollapsed: boolean;
  detailsPanelOpen: boolean;
  theme: 'light' | 'dark' | 'system';

  // Actions
  startScan: (directoryHandle: FileSystemDirectoryHandle) => Promise<void>;
  cancelScan: () => void;
  selectNode: (nodeId: string) => void;
  drillDown: (nodeId: string) => void;
  navigateUp: () => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  toggleTheme: () => void;
}
```

### Scanner Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SCANNER ENGINE                           │
│                     (Main Thread, Async/Await)                │
├─────────────────────────────────────────────────────────────────┤
│  FileSystemDirectoryHandle                                      │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ScannerService (src/lib/scanner.ts)                    │    │
│  │  - Recursive async traversal                            │    │
│  │  - Metadata extraction                                   │    │
│  │  - Periodic yields (every 50 nodes or 50ms)            │    │
│  │  - Error isolation per path                              │    │
│  │  - Cancellation via AbortController                      │    │
│  │  - Batched updates to Zustand store                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Zustand Store (src/store/index.ts)                     │    │
│  │  - Receive node batches (every 50ms)                    │    │
│  │  - Record<string, FileSystemNode> — immutable updates   │    │
│  │  - Trigger re-renders via shallow equality              │    │
│  └─────────────────────────────────────────────────────────┘    │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Aggregation (runs after scan completes)                 │    │
│  │  - Calculate folder sizes (bottom-up)                   │    │
│  │  - Compute percentages                                   │    │
│  │  - Group by extension                                   │    │
│  │  - Find largest files                                    │    │
│  │  - Generate insights                                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Treemap + Analytics                                     │    │
│  │  - D3 treemap layout (read-only, never mutates store)    │    │
│  │  - Analytics charts (custom SVG)                         │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

> **Architecture Note**: The scanner runs in the **main thread** because `FileSystemDirectoryHandle` cannot be transferred to a Web Worker. Periodic yields (every 50ms or 50 nodes) keep the UI responsive during large scans. The UI thread is yielded to between batches, so React can render progress updates.

### API Endpoints (Future Tauri Desktop)

For Phase 2 Tauri integration:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/scan/start` | POST | Start scan with path |
| `/api/scan/cancel` | POST | Cancel ongoing scan |
| `/api/scan/status` | GET | Get scan progress |
| `/api/node/:id` | GET | Get node details |
| `/api/node/:id/children` | GET | Get node children |
| `/api/search` | GET | Search nodes |
| `/api/stats` | GET | Get aggregated stats |
| `/api/insights` | GET | Get cleanup insights |

---

## 7. Accessibility

### Keyboard Navigation
| Key | Action |
|-----|--------|
| `Tab` | Navigate between major sections |
| `Arrow keys` | Navigate within tree/treemap |
| `Enter` | Select/activate node |
| `Escape` | Close panel, cancel action, go back |
| `/` | Focus search |
| `Ctrl+K` | Focus search (alternate) |
| `Ctrl+F` | Open filter panel |
| `Ctrl+,` | Open settings |
| `Backspace` | Navigate to parent folder |

### Screen Reader
- All interactive elements have accessible labels
- Treemap nodes announce: name, size, type, percentage
- Live regions for scan progress
- Semantic HTML structure
- ARIA roles for custom components

### Visual
- Minimum 4.5:1 contrast ratio for text
- Focus indicators visible (2px outline)
- No information conveyed by color alone (icons + labels)
- Reduced motion support via `prefers-reduced-motion`

---

## 8. Performance Targets

| Metric | Target |
|--------|--------|
| Initial load (3G) | < 5s |
| Time to interactive | < 3s |
| Scan start latency | < 500ms |
| Progress update rate | 60fps UI, 50ms scanner |
| 10,000 files scan | < 30s |
| 100,000 files scan | < 5min |
| Treemap render (10,000 nodes) | < 500ms |
| Search response (10,000 items) | < 100ms |
| Memory (100,000 files) | < 500MB |

---

## 9. Privacy Model

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRIVACY FLOW                             │
│                     (All on Main Thread)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐     ┌──────────────────┐     ┌──────────────┐    │
│  │ Browser  │────▶│  ScannerService  │────▶│    Store     │    │
│  │  Folder  │     │  (Main Thread,   │     │   (Zustand)  │    │
│  │  Picker  │     │   async/await)   │     │              │    │
│  └──────────┘     └──────────────────┘     └──────────────┘    │
│       │                  │                       │              │
│       │                  │                       ▼              │
│       │                  │              ┌──────────────┐        │
│       │                  │              │  Treemap /   │        │
│       │                  │              │  Analytics   │        │
│       │                  │              └──────────────┘        │
│       │                  │                       │              │
│       ▼                  ▼                       ▼              │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              LOCAL DEVICE ONLY                       │      │
│  │   No data transmitted to any server                  │      │
│  │   No file contents read (metadata only)              │      │
│  │   No cookies, tracking, or analytics                 │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Never Collected
- File contents
- File data (only metadata)
- Personal information
- Usage telemetry (MVP)

### Permissions Required
- `webkitGetAsEntry` / File System Access API: Read folder structure and file metadata
- No network requests (except Google Fonts CDN)

---

## 10. File Structure

```
/diskotto
├── SPEC.md
├── README.md
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── .eslintrc.js
├── .prettierrc
├── vitest.config.ts
├── playwright.config.ts
├── public/
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── providers.tsx
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── app-shell.tsx
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── status-bar.tsx
│   │   ├── navigation/
│   │   │   ├── breadcrumb.tsx
│   │   │   └── folder-tree.tsx
│   │   ├── visualization/
│   │   │   ├── storage-treemap.tsx
│   │   │   ├── treemap-tooltip.tsx
│   │   │   ├── extension-breakdown.tsx
│   │   │   └── insight-card.tsx
│   │   ├── panels/
│   │   │   ├── analytics-panel.tsx
│   │   │   ├── file-details.tsx
│   │   │   └── folder-details.tsx
│   │   ├── search/
│   │   │   ├── search-bar.tsx
│   │   │   ├── search-results.tsx
│   │   │   └── filter-bar.tsx
│   │   ├── scan/
│   │   │   ├── scan-button.tsx
│   │   │   ├── scan-progress.tsx
│   │   │   └── permission-state.tsx
│   │   └── states/
│   │       ├── empty-state.tsx
│   │       ├── loading-state.tsx
│   │       └── error-state.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── scanner.ts             # ScannerService (main thread)
│   │   ├── search-index.ts        # minisearch wrapper
│   │   ├── aggregator.ts          # post-scan aggregation
│   │   ├── file-utils.ts
│   │   ├── formatters.ts
│   │   └── constants.ts
│   ├── store/
│   │   ├── index.ts               # Combined Zustand store
│   │   ├── scan-slice.ts          # Slice pattern
│   │   ├── navigation-slice.ts
│   │   ├── search-slice.ts
│   │   └── ui-slice.ts
│   ├── hooks/
│   │   ├── use-scanner.ts         # Scanner + AbortController
│   │   ├── use-treemap.ts         # D3 layout via useMemo
│   │   ├── use-keyboard-nav.ts
│   │   └── use-media-query.ts
│   ├── types/
│   │   ├── filesystem.ts
│   │   ├── scan.ts
│   │   └── store.ts
│   └── data/
│       └── mock-data.ts
├── docs/
│   ├── README.md
│   ├── product-requirements.md
│   ├── architecture.md
│   ├── ui-ux.md
│   ├── design-system.md
│   ├── data-model.md
│   ├── scanning-engine.md
│   ├── privacy.md
│   ├── performance.md
│   ├── accessibility.md
│   ├── testing.md
│   ├── browser-support.md
│   ├── roadmap.md
│   └── decisions/
│       ├── ADR-001-client-side-processing.md
│       ├── ADR-002-d3-treemap.md
│       ├── ADR-003-tauri-future.md
│       ├── ADR-004-zustand-state.md
│       ├── ADR-005-shadcn-components.md
│       └── ADR-006-search-indexing.md
└── e2e/
    └── app.spec.ts
```

---

## 11. Implementation Phases

### Phase 0: Discovery & Planning (Current)
- [x] Product vision defined
- [x] Technology stack confirmed
- [x] Feature scope defined
- [x] UI/UX architecture documented
- [x] Design system tokens defined
- [x] Mock data created
- [x] Architecture decisions documented (6 ADRs)
- [x] Privacy model documented
- [x] Browser support matrix documented
- [x] Performance targets with reference hardware documented
- [x] Cross-document consistency verified

### Phase 1: Project Foundation (Week 1-2)
- [ ] Next.js 14 project setup
- [ ] Tailwind + shadcn/ui configuration
- [ ] TypeScript strict mode
- [ ] ESLint + Prettier setup
- [ ] Zustand store skeleton
- [ ] Basic folder structure
- [ ] Design tokens implemented
- [ ] Theme system (light/dark)
- [ ] AppShell layout
- [ ] Responsive breakpoints

### Phase 2: Static UI (Week 2-3)
- [ ] Header component
- [ ] Breadcrumb component
- [ ] Folder tree (static data)
- [ ] Placeholder treemap
- [ ] Analytics panel
- [ ] File/folder details panels
- [ ] Search bar (UI only)
- [ ] Filter bar (UI only)
- [ ] Empty/loading states
- [ ] Mock data system

### Phase 3: Scanner Engine (Week 3-4)
- [ ] File System Access API integration
- [ ] ScannerService (main thread, async/await with yields)
- [ ] Periodic yields (every 50ms or 50 nodes)
- [ ] Progress reporting
- [ ] Error handling (per-path isolation)
- [ ] Cancellation via AbortController
- [ ] Zustand integration (slice pattern)
- [ ] Node aggregation logic (post-scan, bottom-up)
- [ ] Percentage calculations

### Phase 4: D3 Treemap (Week 4-5)
- [ ] D3 treemap integration (layout calculations only, never mutates store)
- [ ] Squarify algorithm
- [ ] Interactive nodes
- [ ] Drill-down navigation
- [ ] Hover tooltips
- [ ] Animation (constrained to drill-down only)
- [ ] Performance optimization
- [ ] Touch/zoom support
- [ ] Aggregation for folders with >1,000 children

### Phase 5: Search & Filters (Week 5-6)
- [ ] Search implementation
- [ ] Debounced input
- [ ] Results display
- [ ] Filter system
- [ ] Size filters
- [ ] Type filters
- [ ] Clear filters
- [ ] URL state sync

### Phase 6: Polish & Edge Cases (Week 6-7)
- [ ] Error states (permission denied, etc.)
- [ ] Browser compatibility
- [ ] Mobile optimizations
- [ ] Bottom sheet implementation
- [ ] Context menus
- [ ] Keyboard navigation
- [ ] Accessibility audit
- [ ] Performance profiling

### Phase 7: Testing & Launch (Week 7-8)
- [ ] Unit tests (Vitest)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Performance tests
- [ ] Accessibility tests
- [ ] PWA configuration
- [ ] SEO metadata
- [ ] Documentation
- [ ] Deploy preparation

---

## 12. Open Questions

1. **Browser Support Fallback**: For Firefox/Safari without File System Access API support, should we:
   - (A) Show clear message "Use Chrome/Edge for best experience"
   - (B) Implement fallback using `<input type="file" webkitdirectory>`
   - (C) Both A and B

2. **Treemap Performance**: With 100,000+ nodes, should we:
   - (A) Aggregate small items into "Other" category
   - (B) Implement viewport-based rendering
   - (C) Allow user to toggle aggregation

3. **Delete/Cleanup**: MVP includes only informational insights. Future:
   - (A) Move to trash (via Tauri)
   - (B) Hard delete with confirmation
   - (C) Both with clear distinction

4. **Cloud Storage**: For future Phase 2, which cloud drives to support?
   - Google Drive, OneDrive, Dropbox, iCloud, or all?

5. **Offline PWA**: Should MVP work offline after first load?
   - (A) Yes, full offline support
   - (B) Online only for simplicity
   - (C) Progressive enhancement

6. **Multi-language**: Internationalization for future?
   - (A) English only for MVP
   - (B) i18n infrastructure from start

---

## 13. Success Metrics

### MVP Launch Criteria
- [ ] Folder selection works in Chrome/Edge
- [ ] Scan completes for 10,000 file test folder
- [ ] Treemap renders correctly with proportional sizing
- [ ] Search finds files by name, extension, path
- [ ] Filters reduce displayed results correctly
- [ ] Mobile layout is usable on iOS Safari, Android Chrome
- [ ] No console errors in production build
- [ ] Lighthouse performance > 80
- [ ] All interactive elements keyboard accessible
- [ ] Privacy policy / data handling documented

---

*Document Version: 1.0*
*Last Updated: 2026-09-01*
*Status: Planning Complete, Ready for Phase 1*
