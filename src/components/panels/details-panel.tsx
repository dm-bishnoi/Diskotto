"use client";

import * as React from "react";
import { FileDetails } from "./file-details";
import { FolderDetails } from "./folder-details";
import { useDiskottoStore, useSelectedNode } from "@/store";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface DetailsPanelProps {
  className?: string;
}

/**
 * DetailsPanel — Unified panel that shows FileDetails or FolderDetails.
 * From SPEC.md: Details panel (file + folder)
 */
export function DetailsPanel({ className }: DetailsPanelProps) {
  const { selectNode, drillDown, navigateUp, detailsPanelOpen, toggleDetailsPanel, nodes } =
    useDiskottoStore();
  const selectedNode = useSelectedNode();
  const { resolvedTheme } = useTheme();

  const handleClose = () => {
    toggleDetailsPanel();
    selectNode(null);
  };

  const handleDrillDown = () => {
    if (selectedNode?.type === "folder") {
      drillDown(selectedNode.id);
    }
  };

  const handleNavigateToParent = () => {
    navigateUp();
  };

  // Get parent size for percentage calculation
  const parentId = selectedNode?.parentId;
  const parentSize = parentId ? nodes[parentId]?.totalSize : undefined;

  if (!detailsPanelOpen || !selectedNode) return null;

  return (
    <aside
      className={cn(
        "w-80 shrink-0 border-l border-border bg-surface flex flex-col overflow-hidden",
        "animate-fade-in",
        className
      )}
      aria-label="Item details"
    >
      {selectedNode.type === "file" ? (
        <FileDetails
          file={selectedNode}
          onClose={handleClose}
          onDrillDown={selectedNode.parentId ? handleNavigateToParent : undefined}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
        />
      ) : (
        <FolderDetails
          folder={selectedNode}
          onClose={handleClose}
          onDrillDown={handleDrillDown}
          onNavigateToParent={selectedNode.parentId ? handleNavigateToParent : undefined}
          parentSize={parentSize}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
        />
      )}
    </aside>
  );
}
