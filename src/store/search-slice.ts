import { type StateCreator } from "zustand";
import type { DiskottoStoreFull } from "@/types/store";
import type { SearchResult, FilterState } from "@/types/filesystem";
import { DEFAULT_FILTERS } from "@/lib/constants";

/**
 * Search slice — manages search query, results, and filter state.
 * From architecture.md: State Layer with Zustand slice pattern.
 *
 * Note: The actual search execution (minisearch) lives outside the store
 * per ADR-006. This slice only holds the user-facing query/results state.
 */
export interface SearchSlice {
  // Search state
  searchQuery: string;
  searchResults: SearchResult[];

  // Filter state
  activeFilters: FilterState;

  // Actions
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  clearSearch: () => void;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
}

export const createSearchSlice: StateCreator<
  DiskottoStoreFull,
  [],
  [],
  SearchSlice
> = (set) => ({
  // Initial state
  searchQuery: "",
  searchResults: [],
  activeFilters: { ...DEFAULT_FILTERS } as FilterState,

  setSearchQuery: (query) =>
    set(() => ({
      searchQuery: query,
    })),

  setSearchResults: (results) =>
    set(() => ({
      searchResults: results,
    })),

  clearSearch: () =>
    set(() => ({
      searchQuery: "",
      searchResults: [],
    })),

  setFilters: (filters) =>
    set((state) => ({
      activeFilters: { ...state.activeFilters, ...filters },
    })),

  clearFilters: () =>
    set(() => ({
      activeFilters: { ...DEFAULT_FILTERS } as FilterState,
    })),
});
