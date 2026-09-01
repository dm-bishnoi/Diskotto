"use client";

import * as React from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import { useDiskottoStore } from "@/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FileCategory } from "@/types/filesystem";

interface FilterBarProps {
  className?: string;
}

const SIZE_FILTERS = [
  { value: ">100MB", label: "> 100 MB" },
  { value: ">500MB", label: "> 500 MB" },
  { value: ">1GB", label: "> 1 GB" },
  { value: ">5GB", label: "> 5 GB" },
  { value: ">10GB", label: "> 10 GB" },
] as const;

const TYPE_FILTERS: FileCategory[] = [
  "video", "image", "audio", "document", "archive", "application", "code", "system", "other",
];

/**
 * FilterBar — Horizontal filter chips and controls.
 * From SPEC.md: FilterBar component
 */
export function FilterBar({ className }: FilterBarProps) {
  const { activeFilters, setFilters, clearFilters } = useDiskottoStore();
  const [sizeOpen, setSizeOpen] = React.useState(false);
  const [typeOpen, setTypeOpen] = React.useState(false);

  const hasActiveFilters =
    activeFilters.sizeFilters.length > 0 ||
    activeFilters.typeFilters.length > 0;

  const toggleSizeFilter = (size: string) => {
    const newSizes = activeFilters.sizeFilters.includes(size as never)
      ? activeFilters.sizeFilters.filter((s) => s !== size)
      : [...activeFilters.sizeFilters, size as never];
    setFilters({ sizeFilters: newSizes });
  };

  const toggleTypeFilter = (type: FileCategory) => {
    const newTypes = activeFilters.typeFilters.includes(type)
      ? activeFilters.typeFilters.filter((t) => t !== type)
      : [...activeFilters.typeFilters, type];
    setFilters({ typeFilters: newTypes });
  };

  return (
    <div
      className={cn("flex items-center gap-2 px-md py-1.5 border-b border-border bg-surface-elevated/50", className)}
      role="toolbar"
      aria-label="Filters"
    >
      <div className="flex items-center gap-1 text-text-muted">
        <Filter className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="text-caption font-medium uppercase tracking-wider">Filters</span>
      </div>

      {/* Size filter dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setSizeOpen(!sizeOpen);
            setTypeOpen(false);
          }}
          className={cn(
            "inline-flex items-center gap-1 h-7 px-2 text-body-sm rounded-md border transition-colors",
            activeFilters.sizeFilters.length > 0
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-surface text-text-primary hover:bg-surface-elevated"
          )}
          aria-haspopup="listbox"
          aria-expanded={sizeOpen}
        >
          <span>Size</span>
          {activeFilters.sizeFilters.length > 0 && (
            <span className="text-caption font-mono">
              ({activeFilters.sizeFilters.length})
            </span>
          )}
          <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        {sizeOpen && (
          <div
            className="absolute top-full left-0 mt-1 bg-surface border border-border rounded-md shadow-lg py-1 z-30 min-w-[150px]"
            role="listbox"
            onMouseLeave={() => setSizeOpen(false)}
          >
            {SIZE_FILTERS.map((filter) => {
              const isActive = activeFilters.sizeFilters.includes(filter.value as never);
              return (
                <button
                  key={filter.value}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => toggleSizeFilter(filter.value)}
                  className={cn(
                    "w-full text-left px-3 py-1.5 text-body-sm transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "hover:bg-surface-elevated"
                  )}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Type filter dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setTypeOpen(!typeOpen);
            setSizeOpen(false);
          }}
          className={cn(
            "inline-flex items-center gap-1 h-7 px-2 text-body-sm rounded-md border transition-colors",
            activeFilters.typeFilters.length > 0
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-surface text-text-primary hover:bg-surface-elevated"
          )}
          aria-haspopup="listbox"
          aria-expanded={typeOpen}
        >
          <span>Type</span>
          {activeFilters.typeFilters.length > 0 && (
            <span className="text-caption font-mono">
              ({activeFilters.typeFilters.length})
            </span>
          )}
          <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        {typeOpen && (
          <div
            className="absolute top-full left-0 mt-1 bg-surface border border-border rounded-md shadow-lg py-1 z-30 min-w-[150px]"
            role="listbox"
            onMouseLeave={() => setTypeOpen(false)}
          >
            {TYPE_FILTERS.map((type) => {
              const isActive = activeFilters.typeFilters.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => toggleTypeFilter(type)}
                  className={cn(
                    "w-full text-left px-3 py-1.5 text-body-sm capitalize transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "hover:bg-surface-elevated"
                  )}
                >
                  {type}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto">
          {activeFilters.sizeFilters.map((size) => (
            <span
              key={`size-${size}`}
              className="inline-flex items-center gap-1 h-6 px-2 bg-primary/10 text-primary rounded text-caption font-mono"
            >
              {size}
              <button
                type="button"
                onClick={() => toggleSizeFilter(size)}
                className="hover:text-primary-hover"
                aria-label={`Remove ${size} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {activeFilters.typeFilters.map((type) => (
            <span
              key={`type-${type}`}
              className="inline-flex items-center gap-1 h-6 px-2 bg-primary/10 text-primary rounded text-caption capitalize"
            >
              {type}
              <button
                type="button"
                onClick={() => toggleTypeFilter(type as FileCategory)}
                className="hover:text-primary-hover"
                aria-label={`Remove ${type} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Clear all */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="shrink-0 ml-auto text-caption"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
