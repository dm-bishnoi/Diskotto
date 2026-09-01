"use client";

import * as React from "react";
import { HardDrive, AlertTriangle, FileWarning, FolderOpen } from "lucide-react";
import { useCurrentNode } from "@/store";
import { ExtensionBreakdown } from "./extension-breakdown";
import { cn, formatBytes } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FileSystemNode, FileCategory } from "@/types/filesystem";

interface InsightCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
}

function InsightCard({ icon, title, description, severity }: InsightCardProps) {
  const borderColor = severity === "critical"
    ? "border-l-error"
    : severity === "warning"
      ? "border-l-warning"
      : "border-l-info";

  return (
    <div className={cn("border-l-3 pl-3 py-1.5", borderColor)}>
      <div className="flex items-start gap-2">
        <span className="shrink-0 mt-0.5">{icon}</span>
        <div>
          <p className="text-body-sm font-medium text-text-primary">{title}</p>
          <p className="text-caption text-text-muted">{description}</p>
        </div>
      </div>
    </div>
  );
}

interface AnalyticsPanelProps {
  extensionStats: {
    extension: string;
    category: FileCategory;
    fileCount: number;
    totalSize: number;
    percentage: number;
  }[];
  largestFiles: FileSystemNode[];
  largestFolders: FileSystemNode[];
  insights: {
    id: string;
    type: string;
    title: string;
    description: string;
    severity: "info" | "warning" | "critical";
  }[];
}

/**
 * AnalyticsPanel — Right sidebar with storage breakdown and insights.
 * From SPEC.md: AnalyticsPanel component
 */
export function AnalyticsPanel({
  extensionStats,
  largestFiles,
  largestFolders,
  insights,
}: AnalyticsPanelProps) {
  const currentNode = useCurrentNode();

  // Compute totals
  const totalSize = currentNode?.totalSize ?? 0;
  const totalFiles = currentNode?.fileCount ?? 0;
  const totalFolders = currentNode?.folderCount ?? 0;

  return (
    <aside
      className="w-80 shrink-0 border-l border-border bg-surface flex flex-col overflow-hidden"
      aria-label="Storage analytics"
    >
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-h4 font-semibold text-text-primary flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-primary" aria-hidden="true" />
          Analytics
        </h2>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-6">
          {/* Storage Summary */}
          <section aria-labelledby="storage-summary-heading">
            <h3
              id="storage-summary-heading"
              className="text-caption font-semibold uppercase tracking-wider text-text-muted mb-3"
            >
              Storage Summary
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-elevated rounded-md p-3">
                <p className="text-caption text-text-muted">Total Size</p>
                <p className="text-h4 font-semibold text-text-primary font-mono">
                  {formatBytes(totalSize)}
                </p>
              </div>
              <div className="bg-surface-elevated rounded-md p-3">
                <p className="text-caption text-text-muted">Items</p>
                <p className="text-h4 font-semibold text-text-primary font-mono">
                  {(totalFiles + totalFolders).toLocaleString()}
                </p>
              </div>
              <div className="bg-surface-elevated rounded-md p-3">
                <p className="text-caption text-text-muted">Files</p>
                <p className="text-h4 font-semibold text-text-primary font-mono">
                  {totalFiles.toLocaleString()}
                </p>
              </div>
              <div className="bg-surface-elevated rounded-md p-3">
                <p className="text-caption text-text-muted">Folders</p>
                <p className="text-h4 font-semibold text-text-primary font-mono">
                  {totalFolders.toLocaleString()}
                </p>
              </div>
            </div>
          </section>

          {/* By Extension */}
          <section aria-labelledby="by-extension-heading">
            <h3
              id="by-extension-heading"
              className="text-caption font-semibold uppercase tracking-wider text-text-muted mb-3"
            >
              By Extension
            </h3>
            <ExtensionBreakdown data={extensionStats} />
          </section>

          {/* Largest Files */}
          {largestFiles.length > 0 && (
            <section aria-labelledby="largest-files-heading">
              <h3
                id="largest-files-heading"
                className="text-caption font-semibold uppercase tracking-wider text-text-muted mb-3"
              >
                Largest Files
              </h3>
              <div className="space-y-1.5">
                {largestFiles.slice(0, 5).map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between text-body-sm py-1 border-b border-border/50 last:border-0"
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-text-primary truncate">{file.name}</p>
                    </div>
                    <span className="font-mono text-text-secondary shrink-0">
                      {formatBytes(file.totalSize)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Largest Folders */}
          {largestFolders.length > 0 && (
            <section aria-labelledby="largest-folders-heading">
              <h3
                id="largest-folders-heading"
                className="text-caption font-semibold uppercase tracking-wider text-text-muted mb-3"
              >
                Largest Folders
              </h3>
              <div className="space-y-1.5">
                {largestFolders.slice(0, 5).map((folder) => (
                  <div
                    key={folder.id}
                    className="flex items-center justify-between text-body-sm py-1 border-b border-border/50 last:border-0"
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-text-primary truncate">{folder.name}</p>
                    </div>
                    <span className="font-mono text-text-secondary shrink-0">
                      {formatBytes(folder.totalSize)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Insights */}
          {insights.length > 0 && (
            <section aria-labelledby="insights-heading">
              <h3
                id="insights-heading"
                className="text-caption font-semibold uppercase tracking-wider text-text-muted mb-3"
              >
                Insights
              </h3>
              <div className="space-y-3">
                {insights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    icon={
                      insight.type === "LARGE_FOLDERS" ? (
                        <FolderOpen className="w-4 h-4 text-warning" aria-hidden="true" />
                      ) : insight.type === "LARGE_FILES" ? (
                        <FileWarning className="w-4 h-4 text-warning" aria-hidden="true" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-info" aria-hidden="true" />
                      )
                    }
                    title={insight.title}
                    description={insight.description}
                    severity={insight.severity}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
