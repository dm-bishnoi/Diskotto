# Design System

## Overview

Diskotto's design system is built on three foundations:
1. **Consistency** - Every component follows the same rules
2. **Clarity** - Information is always readable and accessible
3. **Performance** - Lightweight, optimized, tree-shakeable

Built with **Tailwind CSS** + **shadcn/ui** + **Lucide React** for maximum flexibility and minimal bundle size.

## Design Tokens

### Color Tokens

#### Light Theme
```typescript
const colors = {
  // Surfaces
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceElevated: '#F5F5F5',

  // Borders
  border: '#E5E5E5',
  borderStrong: '#D4D4D4',

  // Text
  textPrimary: '#171717',
  textSecondary: '#525252',
  textMuted: '#A3A3A3',

  // Brand
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  primaryActive: '#1E40AF',

  // Status
  success: '#16A34A',
  warning: '#CA8A04',
  error: '#DC2626',
  info: '#3B82F6',
};
```

#### Dark Theme
```typescript
const colors = {
  // Surfaces
  background: '#0A0A0A',
  surface: '#171717',
  surfaceElevated: '#262626',

  // Borders
  border: '#303030',
  borderStrong: '#404040',

  // Text
  textPrimary: '#FAFAFA',
  textSecondary: '#A3A3A3',
  textMuted: '#737373',

  // Brand
  primary: '#3B82F6',
  primaryHover: '#60A5FA',
  primaryActive: '#93C5FD',

  // Status
  success: '#22C55E',
  warning: '#EAB308',
  error: '#EF4444',
  info: '#60A5FA',
};
```

#### File Category Colors
```typescript
const categoryColors = {
  video: { light: '#8B5CF6', dark: '#A78BFA' },
  image: { light: '#EC4899', dark: '#F472B6' },
  audio: { light: '#F97316', dark: '#FB923C' },
  document: { light: '#3B82F6', dark: '#60A5FA' },
  archive: { light: '#EAB308', dark: '#FACC15' },
  application: { light: '#10B981', dark: '#34D399' },
  code: { light: '#06B6D4', dark: '#22D3EE' },
  system: { light: '#6366F1', dark: '#818CF8' },
  folder: { light: '#78716C', dark: '#A8A29E' },
  other: { light: '#9CA3AF', dark: '#9CA3AF' },
};
```

### Spacing Tokens

```typescript
const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};
```

### Typography Tokens

```typescript
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Courier New', 'monospace'],
  },
  fontSize: {
    h1: ['28px', { lineHeight: '1.2', fontWeight: '700' }],
    h2: ['22px', { lineHeight: '1.3', fontWeight: '600' }],
    h3: ['18px', { lineHeight: '1.4', fontWeight: '600' }],
    h4: ['16px', { lineHeight: '1.4', fontWeight: '600' }],
    body: ['14px', { lineHeight: '1.5', fontWeight: '400' }],
    bodySm: ['12px', { lineHeight: '1.5', fontWeight: '400' }],
    caption: ['11px', { lineHeight: '1.4', fontWeight: '400' }],
  },
};
```

### Border Radius

```typescript
const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};
```

### Shadows

```typescript
const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.07)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.10)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
};
```

## Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          active: 'var(--color-primary-active)',
        },
        // ... other tokens
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        h1: ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        // ... other sizes
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        // ... other spacing
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        // ... other radii
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 250ms ease-out',
        'slide-down': 'slideDown 250ms ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

## Component Patterns

### Button Variants

```typescript
// Primary
<button className="
  bg-primary text-white
  hover:bg-primary-hover
  active:bg-primary-active
  px-4 py-2
  rounded-md
  font-medium
  transition-colors
  focus:outline-none focus:ring-2 focus:ring-primary
">
  Primary Action
</button>

// Secondary
<button className="
  bg-surface-elevated text-text-primary
  hover:bg-border
  border border-border
  px-4 py-2
  rounded-md
  font-medium
  transition-colors
">
  Secondary Action
</button>

// Ghost
<button className="
  text-text-secondary
  hover:text-text-primary
  hover:bg-surface-elevated
  px-4 py-2
  rounded-md
  font-medium
  transition-colors
">
  Ghost Action
</button>

// Destructive
<button className="
  bg-error text-white
  hover:bg-red-700
  px-4 py-2
  rounded-md
  font-medium
  transition-colors
">
  Delete
</button>
```

### Card Pattern

```typescript
<div className="
  bg-surface
  border border-border
  rounded-lg
  p-4
  shadow-sm
  hover:shadow-md
  transition-shadow
">
  <h3 className="text-h4 font-semibold text-text-primary">
    Card Title
  </h3>
  <p className="mt-2 text-body text-text-secondary">
    Card description
  </p>
</div>
```

### Input Pattern

```typescript
<input className="
  w-full
  bg-surface
  border border-border
  rounded-md
  px-3 py-2
  text-body
  text-text-primary
  placeholder:text-text-muted
  focus:outline-none
  focus:border-primary
  focus:ring-2 focus:ring-primary/20
  transition-colors
" />
```

## Icon System

### Icon Library
**Lucide React** - 1,000+ consistent, tree-shakeable icons

### Icon Usage Guidelines

```typescript
import { Folder, File, ChevronRight } from 'lucide-react';

// Size variants
<Folder className="w-6 h-6" />        // 24px - primary
<Folder className="w-5 h-5" />        // 20px - secondary
<Folder className="w-4 h-4" />        // 16px - inline
<Folder className="w-3 h-3" />        // 12px - compact

// Color variants
<Folder className="text-primary" />
<Folder className="text-text-secondary" />
<Folder className="text-category-folder" />
```

### Icon Mapping

| Context | Icon | Size |
|---------|------|------|
| Folder (closed) | `Folder` | 16-20px |
| Folder (open) | `FolderOpen` | 16-20px |
| File (generic) | `File` | 16-20px |
| Video file | `FileVideo` | 16-20px |
| Image file | `FileImage` | 16-20px |
| Audio file | `FileAudio` | 16-20px |
| Document | `FileText` | 16-20px |
| Archive | `FileArchive` | 16-20px |
| Code | `FileCode` | 16-20px |
| Search | `Search` | 20px |
| Settings | `Settings` | 20px |
| Close | `X` | 16-20px |
| Menu | `Menu` | 20px |
| Back | `ArrowLeft` | 20px |
| Forward | `ArrowRight` | 20px |
| Chevron right | `ChevronRight` | 16px |
| Chevron down | `ChevronDown` | 16px |
| External link | `ExternalLink` | 16px |
| Copy | `Copy` | 16px |
| Download | `Download` | 20px |
| Warning | `AlertCircle` | 20-24px |
| Error | `XCircle` | 20-24px |
| Success | `CheckCircle` | 20-24px |
| Info | `Info` | 20-24px |
| Lock | `Lock` | 20-24px |

## Animation System

### Standard Animations

```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Slide down */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale in */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### Animation Durations

```typescript
const durations = {
  fast: '150ms',      // Hover, focus
  normal: '250ms',    // Panels, dropdowns
  slow: '300ms',      // Page transitions
  slowest: '400ms',   // Major animations
};
```

### Easing Functions

```typescript
const easings = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  enter: 'cubic-bezier(0, 0, 0.2, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
};
```

### Reduced Motion

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

## Component Library (shadcn/ui)

### Configuration

```typescript
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

### Components to Install

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add toast
```

## Theme System

### CSS Variables

```css
/* globals.css */
@layer base {
  :root {
    --color-background: #FAFAFA;
    --color-surface: #FFFFFF;
    --color-surface-elevated: #F5F5F5;
    --color-border: #E5E5E5;
    --color-border-strong: #D4D4D4;
    --color-text-primary: #171717;
    --color-text-secondary: #525252;
    --color-text-muted: #A3A3A3;
    --color-primary: #2563EB;
    --color-primary-hover: #1D4ED8;
    --color-primary-active: #1E40AF;
    --color-success: #16A34A;
    --color-warning: #CA8A04;
    --color-error: #DC2626;
    --color-info: #3B82F6;
  }

  .dark {
    --color-background: #0A0A0A;
    --color-surface: #171717;
    --color-surface-elevated: #262626;
    --color-border: #303030;
    --color-border-strong: #404040;
    --color-text-primary: #FAFAFA;
    --color-text-secondary: #A3A3A3;
    --color-text-muted: #737373;
    --color-primary: #3B82F6;
    --color-primary-hover: #60A5FA;
    --color-primary-active: #93C5FD;
    --color-success: #22C55E;
    --color-warning: #EAB308;
    --color-error: #EF4444;
    --color-info: #60A5FA;
  }
}
```

### Theme Provider

```typescript
// providers.tsx
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
```

## File Type Categories

### Category Detection Logic

```typescript
const FILE_CATEGORIES = {
  video: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v', 'mpg', 'mpeg'],
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'heic'],
  audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus'],
  document: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'pages', 'md', 'epub'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso', 'dmg'],
  application: ['exe', 'msi', 'app', 'deb', 'rpm', 'apk'],
  code: ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'go', 'rs', 'php', 'rb', 'swift', 'kt'],
  system: ['dll', 'sys', 'ini', 'log', 'tmp', 'bak'],
};

function getFileCategory(extension: string): FileCategory {
  const ext = extension.toLowerCase().replace(/^\./, '');
  for (const [category, extensions] of Object.entries(FILE_CATEGORIES)) {
    if (extensions.includes(ext)) return category as FileCategory;
  }
  return 'other';
}
```

## Mock Data

### Realistic Filesystem Structure

```typescript
// data/mock-data.ts
export const MOCK_ROOT = {
  id: 'root',
  name: 'C:\\',
  path: 'C:\\',
  type: 'drive',
  size: 500_000_000_000, // 500 GB
  children: [
    {
      id: 'users',
      name: 'Users',
      path: 'C:\\Users',
      type: 'folder',
      size: 250_000_000_000, // 250 GB
      fileCount: 125_847,
      folderCount: 342,
      children: [
        {
          id: 'dharmender',
          name: 'Dharmender',
          path: 'C:\\Users\\Dharmender',
          type: 'folder',
          size: 180_000_000_000, // 180 GB
          children: [
            {
              id: 'downloads',
              name: 'Downloads',
              path: 'C:\\Users\\Dharmender\\Downloads',
              type: 'folder',
              size: 89_400_000_000, // 89.4 GB
              fileCount: 847,
              folderCount: 12,
              children: [
                {
                  id: 'gta-v',
                  name: 'GTA_V_Final_4K.mp4',
                  path: 'C:\\Users\\Dharmender\\Downloads\\GTA_V_Final_4K.mp4',
                  type: 'file',
                  size: 78_400_000_000, // 78.4 GB
                  extension: 'mp4',
                  category: 'video',
                  modifiedAt: new Date('2026-08-28'),
                },
                {
                  id: 'project-backup',
                  name: 'Project_Backup_2026.zip',
                  path: 'C:\\Users\\Dharmender\\Downloads\\Project_Backup_2026.zip',
                  type: 'file',
                  size: 11_000_000_000, // 11 GB
                  extension: 'zip',
                  category: 'archive',
                  modifiedAt: new Date('2026-08-15'),
                },
                {
                  id: 'software-iso',
                  name: 'software.iso',
                  path: 'C:\\Users\\Dharmender\\Downloads\\software.iso',
                  type: 'file',
                  size: 4_700_000_000, // 4.7 GB
                  extension: 'iso',
                  category: 'archive',
                  modifiedAt: new Date('2026-07-20'),
                },
              ],
            },
            {
              id: 'documents',
              name: 'Documents',
              path: 'C:\\Users\\Dharmender\\Documents',
              type: 'folder',
              size: 24_300_000_000, // 24.3 GB
              fileCount: 1240,
              folderCount: 45,
            },
            {
              id: 'pictures',
              name: 'Pictures',
              path: 'C:\\Users\\Dharmender\\Pictures',
              type: 'folder',
              size: 18_700_000_000, // 18.7 GB
              fileCount: 3421,
              folderCount: 28,
            },
            {
              id: 'videos',
              name: 'Videos',
              path: 'C:\\Users\\Dharmender\\Videos',
              type: 'folder',
              size: 42_800_000_000, // 42.8 GB
              fileCount: 234,
              folderCount: 15,
            },
            {
              id: 'projects',
              name: 'Projects',
              path: 'C:\\Users\\Dharmender\\Projects',
              type: 'folder',
              size: 4_800_000_000, // 4.8 GB
              fileCount: 8932,
              folderCount: 67,
            },
          ],
        },
      ],
    },
    {
      id: 'windows',
      name: 'Windows',
      path: 'C:\\Windows',
      type: 'folder',
      size: 180_000_000_000, // 180 GB
      fileCount: 89_234,
      folderCount: 1243,
    },
    {
      id: 'program-files',
      name: 'Program Files',
      path: 'C:\\Program Files',
      type: 'folder',
      size: 45_000_000_000, // 45 GB
      fileCount: 12_847,
      folderCount: 234,
    },
    {
      id: 'projects',
      name: 'Projects',
      path: 'C:\\Projects',
      type: 'folder',
      size: 25_000_000_000, // 25 GB
      fileCount: 8932,
      folderCount: 67,
    },
  ],
};
```

## Utility Functions

### Size Formatting

```typescript
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatBytesShort(bytes: number): string {
  if (bytes === 0) return '0';
  const k = 1024;
  const sizes = ['B', 'K', 'M', 'G', 'T', 'P'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)}${sizes[i]}`;
}
```

### Percentage Formatting

```typescript
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}
```

### Date Formatting

```typescript
export function formatDate(date: Date | undefined): string {
  if (!date) return 'Unknown';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}
```

## Implementation Status

- [x] Design tokens defined
- [x] Color system specified
- [x] Typography scale defined
- [x] Spacing system defined
- [x] Component patterns documented
- [x] Icon system specified
- [x] Animation system defined
- [x] Theme system designed
- [x] Mock data structure created
- [x] Utility functions specified

**Ready for Phase 1 implementation.**
