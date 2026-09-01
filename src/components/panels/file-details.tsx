"use client";

import * as React from "react";
import { X, File, Copy, FolderOpen, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBytes, formatDate, formatRelativeTime } from "@/lib/utils";
import { getCategoryColor } from "@/lib/file-utils";
import type { FileSystemNode } from "@/types/filesystem";

interface FileDetailsProps {
  file: FileSystemNode;
  onClose: () => void;
  onOpenLocation?: () => void;
  onDrillDown?: () => void;
  theme?: "light" | "dark";
}

/**
 * FileDetails — Detailed panel for selected file.
 * From SPEC.md: FileDetails component
 */
export function FileDetails({
  file,
  onClose,
  onOpenLocation: _onOpenLocation,
  onDrillDown,
  theme = "light",
}: FileDetailsProps) {
  const [copied, setCopied] = React.useState(false);
  const categoryColor = getCategoryColor(file.category ?? "other", theme);

  const handleCopyPath = async () => {
    try {
      await navigator.clipboard.writeText(file.path);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const parentPath = file.path.includes("\\")
    ? file.path.substring(0, file.path.lastIndexOf("\\"))
    : file.path.includes("/")
      ? file.path.substring(0, file.path.lastIndexOf("/"))
      : "";

  return (
    <div
      className="flex flex-col h-full"
      role="dialog"
      aria-label={`File details: ${file.name}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <File
            className="w-5 h-5 shrink-0"
            style={{ color: categoryColor }}
            aria-hidden="true"
          />
          <h2
            className="text-h4 font-semibold text-text-primary truncate"
            title={file.name}
          >
            {file.name}
          </h2>
          {file.category && (
            <Badge variant="secondary" className="shrink-0 capitalize">
              {file.category}
            </Badge>
          )}
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
            <dt className="text-text-muted">Type</dt>
            <dd className="text-text-primary font-medium capitalize mt-0.5">
              {file.category ?? "File"}
              {file.extension && ` (.${file.extension})`}
            </dd>
          </div>

          <div>
            <dt className="text-text-muted">Size</dt>
            <dd className="text-text-primary font-medium font-mono mt-0.5">
              {formatBytes(file.totalSize)}
            </dd>
          </div>

          <div>
            <dt className="text-text-muted">Extension</dt>
            <dd className="text-text-primary font-medium font-mono mt-0.5">
              {file.extension ? `.${file.extension}` : "None"}
            </dd>
          </div>

          <div>
            <dt className="text-text-muted">Modified</dt>
            <dd className="text-text-primary font-medium mt-0.5">
              {file.modifiedAt ? (
                <span title={formatDate(file.modifiedAt)}>
                  {formatRelativeTime(file.modifiedAt)}
                </span>
              ) : (
                "Unknown"
              )}
            </dd>
          </div>
        </dl>

        {/* Full path */}
        <div>
          <h3 className="text-caption font-semibold text-text-muted uppercase tracking-wider mb-1">
            Path
          </h3>
          <p
            className="text-body-sm text-text-primary font-mono break-all bg-surface-elevated rounded px-2 py-1.5"
            title={file.path}
          >
            {file.path}
          </p>
        </div>

        {/* Parent folder */}
        <div>
          <h3 className="text-caption font-semibold text-text-muted uppercase tracking-wider mb-1">
            Parent Folder
          </h3>
          <div className="flex items-center gap-1.5 text-body-sm text-text-primary">
            <FolderOpen className="w-4 h-4 text-text-muted shrink-0" aria-hidden="true" />
            <span className="truncate" title={parentPath}>
              {parentPath || "Root"}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border shrink-0">
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

          {onDrillDown && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDrillDown}
              className="flex-1"
            >
              <FolderOpen className="w-4 h-4" />
              Open Location
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
