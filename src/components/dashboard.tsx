"use client";

import * as React from "react";
import { useDiskottoStore, useRootNode, useCurrentNode } from "@/store";
import { getMockData, computeExtensionStats, getLargestFiles, getLargestFolders } from "@/data/mock-data";
import { EmptyState } from "@/components/states/empty-state";
import { LoadingState } from "@/components/states/loading-state";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { FolderTree } from "@/components/navigation/folder-tree";
import { StorageTreemap } from "@/components/visualization/storage-treemap";
import { AnalyticsPanel } from "@/components/panels/analytics-panel";
import { DetailsPanel } from "@/components/panels/details-panel";
import { ScanProgress } from "@/components/scan/scan-progress";
import { useTheme } from "next-themes";

/**
 * Dashboard — Main full-screen storage analyzer view.
 *
 * 3-pane layout:
 * - Left: Folder Tree (280px)
 * - Center: Storage Treemap (flex)
 * - Right: Analytics Panel (320px)
 *
 * Phase 2 uses mock data. Real scanner in Phase 4.
 */
export function Dashboard() {
  const { resolvedTheme } = useTheme();
  const nodes = useDiskottoStore((state) => state.nodes);
  const rootId = useDiskottoStore((state) => state.rootId);
  const scanStatus = useDiskottoStore((state) => state.scanStatus);
  const scanStats = useDiskottoStore((state) => state.scanStats);
  const detailsPanelOpen = useDiskottoStore((state) => state.detailsPanelOpen);
  const setRootNode = useDiskottoStore((state) => state.setRootNode);
  const addNodes = useDiskottoStore((state) => state.addNodes);
  const drillDown = useDiskottoStore((state) => state.drillDown);
  const rootNode = useRootNode();
  const currentNode = useCurrentNode();
  const [isLoading, setIsLoading] = React.useState(false);

  // Load mock data on mount
  React.useEffect(() => {
    if (!rootId) {
      setIsLoading(true);
      // Simulate async load
      const timer = setTimeout(() => {
        const mock = getMockData();
        addNodes(Object.values(mock.nodes));
        setRootNode(mock.root);
        // Set initial path to root
        drillDown(mock.rootId);
        setIsLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [rootId, addNodes, setRootNode, drillDown]);

  // Compute analytics data
  const extensionStats = React.useMemo(
    () => computeExtensionStats(nodes, currentNode),
    [nodes, currentNode]
  );

  const largestFiles = React.useMemo(
    () => getLargestFiles(nodes, 10, currentNode),
    [nodes, currentNode]
  );

  const largestFolders = React.useMemo(
    () => getLargestFolders(nodes, 5, currentNode),
    [nodes, currentNode]
  );

  // Debug: log store state
  React.useEffect(() => {
    console.log('Dashboard: nodes count', Object.keys(nodes).length);
    console.log('Dashboard: rootId', rootId);
    console.log('Dashboard: currentNode', currentNode);
    if (currentNode) {
      console.log('Dashboard: currentNode childrenIds length', currentNode.childrenIds.length);
      console.log('Dashboard: currentNode childrenIds', currentNode.childrenIds);
    }
  }, [nodes, rootId, currentNode]);

  // Compute insights
  const insights = React.useMemo(() => {
    const items = [];

    // Large folders
    const largeFolders = largestFolders.filter(f => f.totalSize > 10 * 1024 * 1024 * 1024);
    if (largeFolders.length > 0) {
      items.push({
        id: "large-folders",
        type: "LARGE_FOLDERS",
        title: `${largeFolders.length} large folder${largeFolders.length > 1 ? "s" : ""}`,
        description: "Folders larger than 10 GB may contain duplicates",
        severity: "warning" as const,
      });
    }

    // Large video files
    const largeVideos = largestFiles.filter(f => f.category === "video" && f.totalSize > 1024 * 1024 * 1024);
    if (largeVideos.length > 3) {
      items.push({
        id: "large-videos",
        type: "LARGE_VIDEOS",
        title: `${largeVideos.length} large video files`,
        description: "Videos over 1 GB consume significant space",
        severity: "info" as const,
      });
    }

    // Archives
    const archives = largestFiles.filter(f => f.category === "archive");
    if (archives.length > 2) {
      items.push({
        id: "archives",
        type: "UNUSED_ARCHIVES",
        title: `${archives.length} archive files`,
        description: "Consider reviewing old archives for cleanup",
        severity: "info" as const,
      });
    }

    return items;
  }, [largestFiles, largestFolders]);

  if (isLoading) {
    return (
      <LoadingState
        title="Loading storage data..."
        description="Preparing your filesystem visualization"
      />
    );
  }

  if (!rootNode) {
    return (
      <EmptyState
        variant="no-scan"
        theme={resolvedTheme === "dark" ? "dark" : "light"}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Scan progress (if scanning) */}
      {scanStatus === "scanning" && scanStats && (
        <ScanProgress
          status={scanStatus}
          currentPath={scanStats.filesScanned.toString()}
          filesScanned={scanStats.filesScanned}
          foldersScanned={scanStats.foldersScanned}
          totalSize={scanStats.totalBytes}
        />
      )}

      {/* Main 3-pane layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Folder Tree */}
        <aside
          className="w-[280px] shrink-0 border-r border-border bg-surface overflow-hidden flex flex-col"
          aria-label="Folder tree"
        >
          <FolderTree />
        </aside>

        {/* Center: Treemap */}
        <div className="flex-1 min-w-0 overflow-hidden bg-background relative">
          <StorageTreemap />
        </div>

        {/* Right: Analytics Panel */}
        {!detailsPanelOpen && (
          <AnalyticsPanel
            extensionStats={extensionStats}
            largestFiles={largestFiles}
            largestFolders={largestFolders}
            insights={insights}
          />
        )}

        {/* Details Panel (overrides analytics when open) */}
        {detailsPanelOpen && <DetailsPanel />}
      </div>
    </div>
  );
}
