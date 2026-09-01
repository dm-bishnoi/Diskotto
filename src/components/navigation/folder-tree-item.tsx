"use client";

import * as React from "react";
import { ChevronRight, Folder, FolderOpen } from "lucide-react";
import { cn, formatBytesShort, formatPercentage } from "@/lib/utils";
import type { FileSystemNode } from "@/types/filesystem";

interface FolderTreeItemProps {
  node: FileSystemNode;
  depth: number;
  isSelected: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  parentTotalSize: number;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onDrillDown: (id: string) => void;
}

/**
 * FolderTreeItem — Individual folder row within FolderTree.
 * From SPEC.md: FolderTreeItem component
 */
export function FolderTreeItem({
  node,
  depth,
  isSelected,
  isExpanded,
  hasChildren,
  parentTotalSize,
  onToggle,
  onSelect,
  onDrillDown,
}: FolderTreeItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id);
    if (hasChildren) {
      onToggle(node.id);
    }
  };

  const handleDoubleClick = () => {
    onDrillDown(node.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (hasChildren) {
        onToggle(node.id);
      } else {
        onSelect(node.id);
      }
    } else if (e.key === "ArrowRight" && hasChildren && !isExpanded) {
      e.preventDefault();
      onToggle(node.id);
    } else if (e.key === "ArrowLeft" && isExpanded) {
      e.preventDefault();
      onToggle(node.id);
    }
  };

  const Icon = isExpanded ? FolderOpen : Folder;
  const percentage = formatPercentage(node.totalSize, parentTotalSize);

  return (
    <div
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
      aria-level={depth + 1}
      tabIndex={0}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex items-center gap-1.5 py-1 px-1.5 rounded-sm cursor-pointer select-none",
        "hover:bg-surface-elevated transition-colors group",
        isSelected && "bg-primary/10 text-primary"
      )}
      style={{ paddingLeft: `${depth * 14 + 6}px` }}
    >
      {/* Expand chevron */}
      {hasChildren ? (
        <ChevronRight
          className={cn(
            "w-3.5 h-3.5 text-text-muted shrink-0 transition-transform",
            isExpanded && "rotate-90"
          )}
          aria-hidden="true"
        />
      ) : (
        <span className="w-3.5 h-3.5 shrink-0" />
      )}

      {/* Folder icon */}
      <Icon
        className={cn(
          "w-4 h-4 shrink-0",
          isSelected ? "text-primary" : "text-category-folder-light dark:text-category-folder-dark"
        )}
        aria-hidden="true"
      />

      {/* Folder name */}
      <span
        className={cn(
          "flex-1 min-w-0 text-body-sm truncate",
          isSelected ? "font-medium" : "text-text-primary"
        )}
        title={node.path}
      >
        {node.name}
      </span>

      {/* Size and percentage */}
      <div className="flex items-center gap-1.5 text-caption text-text-muted shrink-0">
        <span className="font-mono tabular-nums">
          {formatBytesShort(node.totalSize)}
        </span>
        <span className="text-text-muted/70">·</span>
        <span className="font-mono tabular-nums w-9 text-right">
          {percentage}
        </span>
      </div>
    </div>
  );
}
