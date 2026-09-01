"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { useDiskottoStore } from "@/store";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/types/filesystem";

interface SearchBarProps {
  results: SearchResult[];
  isSearching?: boolean;
  onResultSelect?: (result: SearchResult) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}

/**
 * SearchBar — Global search input with results dropdown.
 * From SPEC.md: SearchBar component
 */
export function SearchBar({
  results,
  isSearching = false,
  onResultSelect,
  onFocus,
  onBlur,
  className,
}: SearchBarProps) {
  const { searchQuery, setSearchQuery, clearSearch } = useDiskottoStore();
  const [isFocused, setIsFocused] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Global keyboard shortcut: "/" to focus
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !isFocused) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "Escape" && isFocused) {
        inputRef.current?.blur();
        clearSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocused, clearSearch]);

  // Reset highlight when results change
  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [results]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[highlightedIndex]) {
      e.preventDefault();
      onResultSelect?.(results[highlightedIndex]);
    }
  };

  const hasQuery = searchQuery.trim().length > 0;
  const showResults = isFocused && hasQuery;

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <div
        className={cn(
          "flex items-center gap-2 h-9 px-2.5 rounded-md border bg-surface-elevated transition-colors",
          isFocused ? "border-primary" : "border-border"
        )}
      >
        <Search className="w-4 h-4 text-text-muted shrink-0" aria-hidden="true" />

        <input
          ref={inputRef}
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            // delay to allow click
            setTimeout(() => setIsFocused(false), 150);
            onBlur?.();
          }}
          placeholder="Search files and folders..."
          aria-label="Search files and folders"
          aria-autocomplete="list"
          aria-controls="search-results"
          className="flex-1 bg-transparent border-0 outline-none text-body-sm text-text-primary placeholder:text-text-muted"
        />

        {isSearching && (
          <div className="shrink-0 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        )}

        {hasQuery && !isSearching && (
          <button
            type="button"
            onClick={() => {
              clearSearch();
              inputRef.current?.focus();
            }}
            className="shrink-0 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {!hasQuery && (
          <kbd
            className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-surface px-1.5 font-mono text-[10px] font-medium text-text-muted"
            aria-label="Press slash to focus"
          >
            <span>/</span>
          </kbd>
        )}
      </div>

      {/* Results dropdown */}
      {showResults && (
        <div
          id="search-results"
          className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-md shadow-lg overflow-hidden z-50 max-h-[400px] overflow-y-auto"
          role="listbox"
        >
          {results.length === 0 ? (
            <div className="px-3 py-6 text-center text-body-sm text-text-muted">
              {isSearching ? "Searching..." : "No results found"}
            </div>
          ) : (
            <ul className="py-1">
              {results.slice(0, 20).map((result, index) => (
                <li
                  key={result.node.id}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  className={cn(
                    "px-3 py-2 cursor-pointer transition-colors",
                    index === highlightedIndex ? "bg-primary/10" : "hover:bg-surface-elevated"
                  )}
                  onClick={() => onResultSelect?.(result)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        "shrink-0 w-2 h-2 rounded-sm",
                        result.node.type === "folder" ? "bg-category-folder-light dark:bg-category-folder-dark" : "bg-primary"
                      )}
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm text-text-primary truncate">
                        {result.node.name}
                      </p>
                      <p className="text-caption text-text-muted truncate font-mono">
                        {result.node.path}
                      </p>
                    </div>
                    <span className="text-caption text-text-muted shrink-0">
                      {result.node.type === "folder" ? "Folder" : result.node.category}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
