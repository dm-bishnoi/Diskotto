// Application-wide constants
// From architecture.md and SPEC.md

export const APP_NAME = "Diskotto";
export const APP_DESCRIPTION =
  "Privacy-first storage analyzer. Understand your storage. Respect your privacy.";

// Scanner constants - from architecture.md
export const YIELD_INTERVAL_MS = 50;
export const BATCH_SIZE = 50;

// Search constants - from ADR-006
export const SEARCH_DEBOUNCE_MS = 300;
export const SEARCH_FUZZY_THRESHOLD = 0.2;

// Theme constants
export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

// Responsive breakpoints (Tailwind defaults)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

// File size constants
export const KB = 1024;
export const MB = KB * 1024;
export const GB = MB * 1024;
export const TB = GB * 1024;
export const PB = TB * 1024;

// Treemap thresholds - from ADR-002
export const TREEMAP_AGGREGATION_THRESHOLD = 1000; // Children count
export const TREEMAP_MIN_LABEL_WIDTH = 60; // px

// Treemap label visibility thresholds (area-based, in px²)
// Tiles smaller than these thresholds will not render text labels.
// Large tiles: filename + file size
// Medium tiles: filename only
// Small/tiny tiles: no permanent text (tooltip on hover)
export const TREEMAP_LABEL_AREA_LARGE = 10000;  // px² — show name + size
export const TREEMAP_LABEL_AREA_MEDIUM = 3000;  // px² — show name only
export const TREEMAP_LABEL_AREA_MIN = 800;      // px² — minimum for any text
export const TREEMAP_LABEL_MIN_WIDTH = 60;      // px — minimum width for name label
export const TREEMAP_LABEL_MIN_HEIGHT = 22;     // px — minimum height for name label
export const TREEMAP_LABEL_SIZE_MIN_WIDTH = 80; // px — minimum width for size label
export const TREEMAP_LABEL_SIZE_MIN_HEIGHT = 32;// px — minimum height for size label
export const TREEMAP_LABEL_CHAR_WIDTH = 7;      // px — approximate character width at 12px font
export const TREEMAP_LABEL_PADDING = 8;         // px — horizontal padding for text

// Default filter state
import type { FilterState } from "@/types/filesystem";
export const DEFAULT_FILTERS: FilterState = {
  sizeFilters: [],
  typeFilters: [],
  dateFilters: [],
};
