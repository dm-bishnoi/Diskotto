"use client";

import { useDiskottoStore } from "@/store";
import { formatBytes } from "@/lib/utils";

/**
 * StatusBar — Bottom bar showing scan progress and stats.
 * From SPEC.md: Status Bar
 */
export function StatusBar() {
  const { scanStatus, scanStats } = useDiskottoStore();

  if (scanStatus === "idle" || !scanStats) {
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

  return (
    <footer
      className="h-10 shrink-0 border-t border-border bg-surface flex items-center px-md text-body-sm text-text-secondary"
      role="status"
      aria-live="polite"
    >
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
