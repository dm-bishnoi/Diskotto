"use client";

import * as React from "react";
import { X, FolderOpen, Copy, FolderInput, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatBytes, formatDate, formatRelativeTime, formatPercentage } from "@/lib/utils";
import type { FileSystemNode } from "@/types/filesystem";

interface FolderDetailsProps {
  folder: FileSystemNode;
  onClose: () => void;
  onDrillDown: () => void;
  onNavigateToParent?: () => void;
  parentSize?: number;
  theme?: "light" | "dark";
}

/**
 * FolderDetails — Detailed panel for selected folder.
 * From SPEC.md: FolderDetails component
 */
export function FolderDetails({
  folder,
  onClose,
  onDrillDown,
  onNavigateToParent,
  parentSize,
  theme: _theme,
}: FolderDetailsProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyPath = async () => {
    try {
      await navigator.clipboard.writeText(folder.path);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const percentage = parentSize
    ? formatPercentage(folder.totalSize, parentSize)
    : null;

  return (
    <div
      className="flex flex-col h-full"
      role="dialog"
      aria-label={`Folder details: ${folder.name}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <FolderOpen
            className="w-5 h-5 shrink-0 text-category-folder-light dark:text-category-folder-dark"
            aria-hidden="true"
          />
          <h2
            className="text-h4 font-semibold text-text-primary truncate"
            title={folder.name}
          >
            {folder.name}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close details"
          className="shrink-0 ml-2"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats grid */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-body-sm">
          <div>
            <dt className="text-text-muted">Size</dt>
            <dd className="text-text-primary font-medium font-mono mt-0.5">
              {formatBytes(folder.totalSize)}
            </dd>
          </div>

          <div>
            <dt className="text-text-muted">Files</dt>
            <dd className="text-text-primary font-medium font-mono mt-0.5">
              {folder.fileCount.toLocaleString()}
            </dd>
          </div>

          <div>
            <dt className="text-text-muted">Folders</dt>
            <dd className="text-text-primary font-medium font-mono mt-0.5">
              {folder.folderCount.toLocaleString()}
            </dd>
          </div>

          <div>
            <dt className="text-text-muted">Modified</dt>
            <dd className="text-text-primary font-medium mt-0.5">
              {folder.modifiedAt ? (
                <span title={formatDate(folder.modifiedAt)}>
                  {formatRelativeTime(folder.modifiedAt)}
                </span>
              ) : (
                "Unknown"
              )}
            </dd>
          </div>

          {percentage !== null && (
            <div className="col-span-2">
              <dt className="text-text-muted">% of Parent</dt>
              <dd className="mt-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-text-primary font-medium font-mono">
                    {percentage}
                  </span>
                  <Progress
                    value={parseFloat(percentage)}
                    max={100}
                    className="flex-1 h-1.5"
                  />
                </div>
              </dd>
            </div>
          )}
        </dl>

        {/* Full path */}
        <div>
          <h3 className="text-caption font-semibold text-text-muted uppercase tracking-wider mb-1">
            Path
          </h3>
          <p
            className="text-body-sm text-text-primary font-mono break-all bg-surface-elevated rounded px-2 py-1.5"
            title={folder.path}
          >
            {folder.path}
          </p>
        </div>

        {/* Contents summary */}
        <div>
          <h3 className="text-caption font-semibold text-text-muted uppercase tracking-wider mb-2">
            Contents
          </h3>
          <div className="grid grid-cols-2 gap-2 text-body-sm">
            <div className="bg-surface-elevated rounded px-3 py-2 text-center">
              <p className="text-h3 font-bold text-text-primary font-mono">
                {folder.fileCount.toLocaleString()}
              </p>
              <p className="text-caption text-text-muted">Files</p>
            </div>
            <div className="bg-surface-elevated rounded px-3 py-2 text-center">
              <p className="text-h3 font-bold text-text-primary font-mono">
                {folder.folderCount.toLocaleString()}
              </p>
              <p className="text-caption text-text-muted">Folders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border shrink-0 space-y-2">
        <Button
          variant="default"
          size="sm"
          onClick={onDrillDown}
          className="w-full"
        >
          <ArrowRight className="w-4 h-4" />
          Open Folder
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyPath}
            className="flex-1"
            aria-label={copied ? "Path copied" : "Copy path"}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Path
              </>
            )}
          </Button>

          {onNavigateToParent && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToParent}
              className="flex-1"
            >
              <FolderInput className="w-4 h-4" />
              Parent
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
