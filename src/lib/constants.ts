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

// Default filter state
import type { FilterState } from "@/types/filesystem";
export const DEFAULT_FILTERS: FilterState = {
  sizeFilters: [],
  typeFilters: [],
  dateFilters: [],
};
