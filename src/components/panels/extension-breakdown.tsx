"use client";

import * as React from "react";
import { cn, formatBytes } from "@/lib/utils";
import { getCategoryColor } from "@/lib/file-utils";
import { useTheme } from "next-themes";
import type { FileCategory } from "@/types/filesystem";

interface ExtensionBreakdownProps {
  data: {
    extension: string;
    category: FileCategory;
    fileCount: number;
    totalSize: number;
    percentage: number;
  }[];
  onSelectExtension?: (extension: string) => void;
}

/**
 * ExtensionBreakdown — Horizontal bar chart of storage by file extension.
 * From SPEC.md: ExtensionBreakdown component
 */
export function ExtensionBreakdown({ data, onSelectExtension }: ExtensionBreakdownProps) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";

  if (data.length === 0) {
    return (
      <p className="text-body-sm text-text-muted py-2">No data</p>
    );
  }

  // Group by category for visual grouping
  const maxSize = Math.max(...data.map(d => d.totalSize));

  return (
    <div className="space-y-2">
      {data.slice(0, 10).map((item) => {
        const barWidth = (item.totalSize / maxSize) * 100;
        const color = getCategoryColor(item.category, theme);

        return (
          <button
            key={item.extension}
            type="button"
            onClick={() => onSelectExtension?.(item.extension)}
            className={cn(
              "w-full text-left group transition-opacity",
              onSelectExtension && "hover:opacity-80"
            )}
          >
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                <span className="text-body-sm font-mono text-text-primary">
                  {item.extension === "none" ? "(no ext)" : `.${item.extension}`}
                </span>
                <span className="text-caption text-text-muted">
                  ({item.fileCount.toLocaleString()})
                </span>
              </div>
              <div className="flex items-center gap-2 text-body-sm">
                <span className="font-mono text-text-secondary">
                  {formatBytes(item.totalSize)}
                </span>
                <span className="font-mono text-text-muted tabular-nums w-10 text-right">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: color,
                }}
                aria-hidden="true"
              />
            </div>
          </button>
        );
      })}

      {data.length > 10 && (
        <p className="text-caption text-text-muted pt-1">
          +{data.length - 10} more types
        </p>
      )}
    </div>
  );
}
