"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";

interface ScanProgressProps {
  status: "idle" | "scanning" | "cancelled" | "complete" | "error";
  currentPath?: string;
  filesScanned?: number;
  foldersScanned?: number;
  totalSize?: number;
  percentage?: number;
  onCancel?: () => void;
  className?: string;
}

/**
 * ScanProgress — Progress indicator during scanning.
 * From SPEC.md: ScanProgress component
 */
export function ScanProgress({
  status,
  currentPath,
  filesScanned = 0,
  foldersScanned = 0,
  totalSize = 0,
  percentage,
  onCancel,
  className,
}: ScanProgressProps) {
  if (status !== "scanning") return null;

  return (
    <div
      className={`px-md py-3 bg-surface border-b border-border ${className ?? ""}`}
      role="status"
      aria-live="polite"
      aria-label="Scanning progress"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-body-sm font-medium text-text-primary truncate">
            Scanning: {currentPath ?? "..."}
          </p>
        </div>
        {onCancel && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            aria-label="Cancel scan"
            className="ml-2 shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {percentage !== undefined && (
        <div className="mb-2">
          <Progress value={percentage} max={100} className="h-2" />
          <p className="text-right text-caption text-text-muted mt-1">
            {percentage.toFixed(1)}%
          </p>
        </div>
      )}

      <div className="flex items-center gap-4 text-body-sm text-text-secondary">
        <span className="tabular-nums">
          <span className="font-medium text-text-primary">{filesScanned.toLocaleString()}</span>
          {" "}files
        </span>
        <span className="tabular-nums">
          <span className="font-medium text-text-primary">{foldersScanned.toLocaleString()}</span>
          {" "}folders
        </span>
        <span className="tabular-nums">
          <span className="font-medium text-text-primary">{formatBytes(totalSize)}</span>
        </span>
      </div>
    </div>
  );
}
