# UI/UX Design Specification

## Design Philosophy

Diskotto follows a **utility-first** design philosophy. The interface should feel like a precision instrument—capable, trustworthy, and information-dense. Every pixel serves a purpose. The aesthetic is professional without being cold, modern without being trendy.

## Design Principles

### 1. Visual First
The treemap is the hero. It should dominate the visual hierarchy and communicate information instantly.

### 2. Exact Information
No rounding away important details. Users see exact byte counts, full paths, and precise names.

### 3. Honest Data
Never fake or approximate. If metadata is unavailable, say so clearly.

### 4. Density with Clarity
Maximize information per square pixel without sacrificing readability.

### 5. Privacy by Default
No data leaves the device. No tracking. No cookies.

## Information Architecture

### Navigation Hierarchy
```
Diskotto
├── Dashboard (Default View)
│   ├── Treemap (Primary)
│   ├── Folder Tree (Secondary)
│   └── Analytics Panel (Tertiary)
├── Folder Details (Drill-Down)
│   ├── Treemap (Folder Contents)
│   ├── Subfolder List
│   └── File List
├── File Details
│   └── Metadata + Actions
├── Largest Files
│   └── Sorted List
├── Extensions View
│   └── Category Breakdown
├── Search Results
│   └── Filtered List
├── Settings
│   ├── Theme
│   └── About
└── Error States
    ├── Permission Denied
    ├── Browser Unsupported
    └── Scan Failed
```

### User Flows

#### Flow 1: Quick Storage Analysis
1. Land on dashboard
2. Click "Select Folder"
3. Grant permission
4. Watch scan progress
5. Explore treemap
6. Drill into largest folder
7. Identify large files
8. Done

#### Flow 2: Find Specific File
1. Land on dashboard
2. Press `/` to focus search
3. Type file name
4. Select result
5. View details
6. Copy path
7. Done

#### Flow 3: Cleanup Investigation
1. Land on dashboard
2. Select Downloads folder
3. Review analytics panel
4. See "Large Videos" insight
5. Filter by Videos
6. Sort by size
7. Identify candidates
8. Done (no deletion in MVP)

## Layout System

### Desktop (≥1024px)

**Grid System**:
```
┌─────────────────────────────────────────────────────────────┐
│ Header (56px height, full width)                          │
├─────────────────────────────────────────────────────────────┤
│ Breadcrumb (40px height, full width)                      │
├──────────┬────────────────────────────┬───────────────────┤
│          │                            │                   │
│ Sidebar  │  Main Content             │  Right Panel     │
│ (280px)  │  (flex-1)                  │  (320px)         │
│          │                            │                   │
│          │                            │                   │
│          │                            │                   │
├──────────┴────────────────────────────┴───────────────────┤
│ Status Bar (40px height, full width)                     │
└─────────────────────────────────────────────────────────────┘
```

**Spacing**:
- Header padding: 16px horizontal
- Sidebar: 12px internal padding
- Treemap: 16px padding from edges
- Right panel: 16px padding

### Tablet (768px - 1023px)

**Two-column with collapsible sidebar**:
```
┌─────────────────────────────────────────────────────────────┐
│ Header (56px)                                               │
├─────────────────────────────────────────────────────────────┤
│ Breadcrumb (40px) + Actions                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Main Content (Treemap + Tabs)                              │
│ Full width                                                   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ [Folders] [Files] [Types] [Insights]                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Tab Content (scrollable)                                    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ Status Bar (40px)                                           │
└─────────────────────────────────────────────────────────────┘
```

### Mobile (<768px)

**Single-column flow**:
```
┌─────────────────────┐
│ Header (56px) + ☰   │
├─────────────────────┤
│ Storage Summary     │
│ (80px)              │
├─────────────────────┤
│ Current Path        │
│ (48px)              │
├─────────────────────┤
│                     │
│ Treemap             │
│ (40vh)              │
│                     │
├─────────────────────┤
│ Selected Item       │
│ Details             │
│ (auto-height)       │
├─────────────────────┤
│ Quick Actions       │
│ [Files] [Folders]   │
├─────────────────────┤
│ Analytics           │
│ (collapsible)       │
└─────────────────────┘
```

## Component Design Specifications

### Header

**Visual**:
- Height: 56px
- Background: Surface color
- Border-bottom: 1px solid border color
- Position: Sticky top

**Elements**:
```
┌─────────────────────────────────────────────────────────────┐
│  [Diskotto]  [Drive: C:\]  [🔍 Search...]  [Scan] [⚙] [☀]│
└─────────────────────────────────────────────────────────────┘
```

**Spacing**:
- Logo: 24px from left
- Search: Max-width 400px, centered or left-aligned
- Actions: 16px from right, 8px between

**States**:
- Default: All elements visible
- Searching: Search input expanded
- Scanning: Scan button shows progress
- Mobile: Logo + menu icon

### Breadcrumb

**Visual**:
- Height: 40px
- Background: Surface color
- Border-bottom: 1px solid border
- Font: 14px regular

**Layout**:
```
C:\  >  Users  >  Dharmender  >  Downloads        [Copy]
```

**Interactions**:
- Click segment: Navigate to that level
- Hover: Show full path tooltip
- Overflow: Truncate middle, show "..." with hover
- Copy: Copies full path to clipboard

**Mobile**:
- Horizontal scroll
- Smaller font (12px)
- Swipe to navigate

### Folder Tree

**Visual**:
- Width: 280px (desktop)
- Background: Surface color
- Border-right: 1px solid border
- Padding: 12px

**Item Layout**:
```
▼ 📁 Downloads
   89.4 GB · 28%
   [████████████░░░░░░░░░░]
```

**States**:
- Collapsed: ▶ icon
- Expanded: ▼ icon
- Selected: Primary color background
- Hover: Surface-elevated background

**Typography**:
- Folder name: 13px medium
- Size/percentage: 11px regular, muted
- Indent: 16px per level

### Treemap

**Visual**:
- Fills available space
- Padding: 2px between nodes
- Border-radius: 4px on nodes
- Category-based fill colors

**Node Hierarchy**:
1. **Large nodes** (>150px): Full name + size
2. **Medium nodes** (100-150px): Abbreviated name + size
3. **Small nodes** (60-100px): Abbreviated name only
4. **Tiny nodes** (<60px): No label, tooltip on hover

**Interactions**:
- Hover: 2px border, tooltip appears
- Click: Drill down (folder) or select (file)
- Double-click: Drill down
- Pan: Drag with mouse
- Pinch-zoom: Touch devices

**Transitions**:
- Drill-down: 300ms ease-out
- Hover: 150ms ease
- No transition during scan updates

### Analytics Panel

**Visual**:
- Width: 320px (desktop)
- Background: Surface color
- Border-left: 1px solid border
- Padding: 16px

**Sections**:
1. **Storage Summary**: Total, used, free
2. **By Extension**: Top 10 + "View all"
3. **Largest Files**: Top 5
4. **Insights**: 3-5 cards

**Section Spacing**:
- 24px between sections
- 16px internal padding
- 8px between items

**Typography**:
- Section title: 12px uppercase, muted
- Item name: 13px medium
- Item size: 12px regular, secondary

### Details Panel

**Visual**:
- Slides in from right
- Width: 360px
- Background: Surface
- Border-left: 1px solid border
- Shadow: subtle elevation

**Content**:
```
┌─────────────────────────────────┐
│ 📁 Downloads              [✕]  │
├─────────────────────────────────┤
│ Size         89.4 GB           │
│ Files       847               │
│ Folders     12                │
│ % of Parent  28%              │
│ Path        C:\Users\...      │
│ Modified    Aug 15, 2026      │
├─────────────────────────────────┤
│ [Open Location] [Copy Path]   │
└─────────────────────────────────┘
```

**Mobile**:
- Bottom sheet
- Drag handle
- Swipe down to close
- Tap outside to close

### Search Bar

**Visual**:
- Width: 100% max 400px
- Height: 36px
- Background: Surface-elevated
- Border: 1px solid border
- Border-radius: 8px

**States**:
- Empty: Placeholder text
- Focused: Primary border
- Has results: Dropdown appears
- No results: "No results found"

**Keyboard Shortcuts**:
- `/` or `Ctrl+K`: Focus search
- `Esc`: Clear and blur
- `↑/↓`: Navigate results
- `Enter`: Select result

### Scan Progress

**Visual**:
- Fixed at bottom
- Height: 80px (expanded), 40px (collapsed)
- Background: Surface-elevated
- Border-top: 1px solid border

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ Scanning: C:\Users\Dharmender\Downloads                   │
│ ████████████░░░░░░░░░░░░░░░░░░░░  34%                    │
│ 12,847 files · 342 folders · 89.4 GB · 2,340 items/sec   │
│                                              [Cancel]     │
└─────────────────────────────────────────────────────────────┘
```

**Animations**:
- Progress bar: Smooth update
- Spinner: Rotating icon
- File count: Number tick animation

## Color Usage Guidelines

### Primary Actions
- **Primary button**: `primary` background, white text
- **Hover**: `primary-hover` background
- **Active**: Darker shade
- **Disabled**: `surface-elevated` background, `text-muted` text

### Category Colors
Use category colors consistently:
- **Video**: Purple (#8B5CF6)
- **Image**: Pink (#EC4899)
- **Audio**: Orange (#F97316)
- **Document**: Blue (#3B82F6)
- **Archive**: Yellow (#EAB308)
- **Application**: Green (#10B981)
- **Code**: Cyan (#06B6D4)
- **System**: Indigo (#6366F1)
- **Folder**: Stone (#78716C)
- **Other**: Gray (#9CA3AF)

### Status Colors
- **Success**: Green (#16A34A)
- **Warning**: Yellow (#CA8A04)
- **Error**: Red (#DC2626)
- **Info**: Blue (#3B82F6)

## Typography

### Font Stack
```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Courier New', monospace;
```

### Type Scale
| Name | Size | Weight | Use |
|------|------|--------|-----|
| `h1` | 28px | 700 | Page titles |
| `h2` | 22px | 600 | Section titles |
| `h3` | 18px | 600 | Subsection titles |
| `h4` | 16px | 600 | Card titles |
| `body` | 14px | 400 | Default text |
| `body-sm` | 12px | 400 | Secondary text |
| `caption` | 11px | 400 | Tertiary text |
| `mono` | 13px | 400 | Paths, technical info |

### Line Height
- Headings: 1.2-1.3
- Body: 1.5
- Code/paths: 1.4

## Spacing System

Base unit: **4px**

| Token | Value | Use |
|-------|-------|-----|
| `xs` | 4px | Tight gaps |
| `sm` | 8px | Within components |
| `md` | 16px | Standard |
| `lg` | 24px | Sections |
| `xl` | 32px | Major sections |
| `2xl` | 48px | Page margins |

## Iconography

### Icon Library
**Lucide React** (24px default, 16px inline, 20px compact)

### Icon Usage
- **Folder**: `Folder`, `FolderOpen`, `FolderTree`
- **Files**: `File`, `FileText`, `FileImage`, `FileVideo`
- **Actions**: `Search`, `Settings`, `Copy`, `ExternalLink`
- **Status**: `CheckCircle`, `AlertCircle`, `XCircle`, `Info`
- **Navigation**: `ChevronRight`, `ChevronDown`, `ChevronUp`, `ArrowLeft`
- **UI**: `X`, `Menu`, `MoreVertical`, `Filter`, `Download`

### Icon Sizing
- **24px**: Primary actions, headers
- **20px**: Secondary actions
- **16px**: Inline with text
- **12px**: Compact UI elements

## Motion Design

### Timing
- **Micro** (150ms): Hover, focus, click feedback
- **Standard** (250ms): Panel transitions, dropdowns
- **Complex** (300-400ms): Page transitions, treemap drill-down
- **Loading**: Continuous (2s rotation)

### Easing
- **Standard**: `cubic-bezier(0.4, 0, 0.2, 1)`
- **Enter**: `cubic-bezier(0, 0, 0.2, 1)`
- **Exit**: `cubic-bezier(0.4, 0, 1, 1)`

### Reduced Motion
Respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Responsive Behavior

### Breakpoints
```typescript
const breakpoints = {
  sm: 640,   // Mobile landscape
  md: 768,   // Tablet
  lg: 1024,  // Desktop
  xl: 1280,  // Large desktop
  '2xl': 1536 // Extra large
};
```

### Mobile-First Approach
1. Design for mobile first
2. Add complexity for larger screens
3. Use container queries where appropriate

### Touch Targets
- Minimum: 44x44px (Apple HIG)
- Recommended: 48x48px
- Spacing: 8px between targets

## Empty States

### No Folder Selected
```
┌─────────────────────────────────────┐
│                                     │
│         📁                          │
│                                     │
│   No folder selected yet            │
│                                     │
│   Select a folder to analyze       │
│   your storage usage.              │
│                                     │
│   [Select Folder]                   │
│                                     │
│   Your data stays on your device.  │
│                                     │
└─────────────────────────────────────┘
```

### No Search Results
```
┌─────────────────────────────────────┐
│                                     │
│         🔍                          │
│                                     │
│   No results found                  │
│                                     │
│   Try a different search term       │
│                                     │
└─────────────────────────────────────┘
```

### Scan Complete - Empty Folder
```
┌─────────────────────────────────────┐
│                                     │
│         📂                          │
│                                     │
│   This folder is empty              │
│                                     │
│   No files or subfolders found      │
│                                     │
└─────────────────────────────────────┘
```

## Loading States

### Initial Scan
```
┌─────────────────────────────────────┐
│                                     │
│         ⏳                          │
│                                     │
│   Preparing to scan...              │
│                                     │
│   ░░░░░░░░░░░░░░░░░░░░             │
│                                     │
└─────────────────────────────────────┘
```

### Treemap Loading
- Skeleton placeholders
- Shimmer animation
- Fade-in on data ready

### Search Loading
- Inline spinner
- "Searching..." text
- Debounced (300ms)

## Error States

### Browser Unsupported
```
┌─────────────────────────────────────┐
│                                     │
│         ⚠️                          │
│                                     │
│   Browser Not Supported             │
│                                     │
│   Diskotto requires Chrome or       │
│   Edge to access your files.       │
│                                     │
│   [Download Chrome] [Learn More]   │
│                                     │
└─────────────────────────────────────┘
```

### Permission Denied
```
┌─────────────────────────────────────┐
│                                     │
│         🔒                          │
│                                     │
│   Permission Required               │
│                                     │
│   Diskotto needs access to your     │
│   folder to analyze it.             │
│                                     │
│   [Grant Permission]                │
│                                     │
│   Your data is processed locally.  │
│                                     │
└─────────────────────────────────────┘
```

### Scan Failed
```
┌─────────────────────────────────────┐
│                                     │
│         ❌                          │
│                                     │
│   Scan Failed                       │
│                                     │
│   An error occurred while scanning. │
│                                     │
│   [Try Again] [Report Issue]       │
│                                     │
└─────────────────────────────────────┘
```

## Accessibility Considerations

### Color Contrast
- Text on background: Minimum 4.5:1
- Large text (18px+): Minimum 3:1
- UI elements: Minimum 3:1

### Keyboard Navigation
- All interactive elements focusable
- Logical tab order
- Visible focus indicators (2px outline)
- Skip links for main content

### Screen Readers
- Semantic HTML structure
- ARIA labels for custom components
- Live regions for scan progress
- Descriptive alt text for icons

### Focus Management
- Focus trap in modals
- Return focus after close
- Announce state changes

## Visual Design Tokens

### Shadow System
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.07);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.10);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
```

### Border Radius
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-full: 9999px;
```

### Z-Index Scale
```css
--z-base: 0;
--z-dropdown: 1000;
--z-sticky: 1100;
--z-modal: 1200;
--z-popover: 1300;
--z-tooltip: 1400;
--z-toast: 1500;
```
