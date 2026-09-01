"use client";

import * as React from "react";
import { formatBytes, formatDate } from "@/lib/utils";
import type { FileSystemNode } from "@/types/filesystem";
import { getCategoryColor } from "@/lib/file-utils";
import { useTheme } from "next-themes";

interface TreemapTooltipProps {
  node: FileSystemNode;
  x: number;
  y: number;
}

/**
 * TreemapTooltip — Floating tooltip on treemap node hover.
 * From SPEC.md: TreemapTooltip component
 */
export function TreemapTooltip({ node, x, y }: TreemapTooltipProps) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";

  // Determine category color
  const categoryColor = getCategoryColor(node.category ?? "other", theme);

  // Adjust position to stay within viewport
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ x, y });

  React.useEffect(() => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x + 12;
      let adjustedY = y + 12;

      if (adjustedX + rect.width > viewportWidth - 16) {
        adjustedX = x - rect.width - 12;
      }
      if (adjustedY + rect.height > viewportHeight - 16) {
        adjustedY = y - rect.height - 12;
      }

      setPosition({ x: adjustedX, y: adjustedY });
    }
  }, [x, y]);

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 pointer-events-none animate-fade-in"
      style={{ left: position.x, top: position.y }}
      role="tooltip"
    >
      <div className="bg-surface border border-border rounded-lg shadow-xl p-3 min-w-[240px] max-w-[320px]">
        {/* Header */}
        <div className="flex items-start gap-2 mb-2">
          <div
            className="w-3 h-3 rounded-sm mt-1 shrink-0"
            style={{ backgroundColor: categoryColor }}
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <p className="text-body-sm font-medium text-text-primary break-all leading-tight">
              {node.name}
            </p>
            <p className="text-caption text-text-muted mt-0.5 capitalize">
              {node.type === "folder" ? "Folder" : node.category ?? "File"}
              {node.extension && ` (.${node.extension})`}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-1 text-body-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Size</span>
            <span className="font-mono font-medium text-text-primary">
              {formatBytes(node.totalSize)}
            </span>
          </div>

          {node.type === "folder" && (
            <>
              <div className="flex justify-between">
                <span className="text-text-secondary">Files</span>
                <span className="font-mono font-medium text-text-primary">
                  {node.fileCount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Folders</span>
                <span className="font-mono font-medium text-text-primary">
                  {node.folderCount.toLocaleString()}
                </span>
              </div>
            </>
          )}

          {node.modifiedAt && (
            <div className="flex justify-between">
              <span className="text-text-secondary">Modified</span>
              <span className="font-mono font-medium text-text-primary">
                {formatDate(node.modifiedAt)}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-text-secondary">Path</span>
          </div>
          <p className="text-caption text-text-muted font-mono break-all leading-tight -mt-0.5">
            {node.path}
          </p>
        </div>
      </div>
    </div>
  );
}
