"use client";

import { useDiskottoStore, useRootNode, useCurrentNode } from "@/store";
import { formatBytes } from "@/lib/utils";
import { HardDrive } from "lucide-react";

/**
 * StatusBar — Bottom bar showing scan progress and stats.
 * From SPEC.md: Status Bar
 */
export function StatusBar() {
  const { scanStatus, scanStats } = useDiskottoStore();
  const rootNode = useRootNode();
  const currentNode = useCurrentNode();

  if (scanStatus === "idle" && !rootNode) {
    return (
      <footer
        className="h-10 shrink-0 border-t border-border bg-surface flex items-center px-md text-body-sm text-text-muted"
        role="status"
        aria-live="polite"
      >
        <span>No folder selected</span>
      </footer>
    );
  }

  if (scanStatus === "scanning" && scanStats) {
    return (
      <footer
        className="h-10 shrink-0 border-t border-border bg-surface flex items-center px-md text-body-sm text-text-secondary"
        role="status"
        aria-live="polite"
        aria-label="Scan progress"
      >
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
        <span>
          {scanStats.filesScanned.toLocaleString()} files
        </span>
        <span className="mx-2 text-text-muted">|</span>
        <span>
          {scanStats.foldersScanned.toLocaleString()} folders
        </span>
        <span className="mx-2 text-text-muted">|</span>
        <span>{formatBytes(scanStats.totalBytes)}</span>
        <span className="mx-2 text-text-muted">|</span>
        <span className="capitalize text-primary">{scanStatus}</span>
      </footer>
    );
  }

  // Loaded state - show stats from current view
  if (currentNode) {
    return (
      <footer
        className="h-10 shrink-0 border-t border-border bg-surface flex items-center px-md text-body-sm text-text-secondary"
        role="status"
        aria-live="polite"
      >
        <HardDrive className="w-3.5 h-3.5 text-text-muted mr-2 shrink-0" aria-hidden="true" />
        <span className="truncate">
          {currentNode.name}
        </span>
        <span className="mx-2 text-text-muted shrink-0">|</span>
        <span className="shrink-0">
          {currentNode.fileCount.toLocaleString()} files
        </span>
        <span className="mx-2 text-text-muted shrink-0">|</span>
        <span className="shrink-0">
          {currentNode.folderCount.toLocaleString()} folders
        </span>
        <span className="mx-2 text-text-muted shrink-0">|</span>
        <span className="shrink-0 font-mono">
          {formatBytes(currentNode.totalSize)}
        </span>
      </footer>
    );
  }

  return (
    <footer
      className="h-10 shrink-0 border-t border-border bg-surface flex items-center px-md text-body-sm text-text-muted"
      role="status"
      aria-live="polite"
    >
      <span>No folder selected</span>
    </footer>
  );
}
