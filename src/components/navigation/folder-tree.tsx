"use client";

import * as React from "react";
import { useDiskottoStore } from "@/store";
import { FolderTreeItem } from "./folder-tree-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FileSystemNode } from "@/types/filesystem";

/**
 * FolderTree — Virtualized expandable folder hierarchy.
 * From SPEC.md: FolderTree component
 */
export function FolderTree() {
  const {
    nodes,
    rootId,
    selectedNodeId,
    expandedFolders,
    currentPath,
    toggleFolder,
    selectNode,
    drillDown,
  } = useDiskottoStore();

  // Recursively render visible items based on expanded state
      const visibleItems = React.useMemo(() => {
        if (!rootId) return [];
        const items: { node: FileSystemNode; depth: number; parentTotalSize: number }[] = [];

        function walk(nodeId: string, depth: number, parentTotalSize: number) {
          const node = nodes[nodeId];
          if (!node) return;

          console.log('FolderTree walk: nodeId=', nodeId, 'node=', node?.name, 'depth=', depth);
          items.push({ node, depth, parentTotalSize });

          // If this is the root node or the node is expanded, then walk into children
          if (nodeId === rootId || expandedFolders.has(nodeId)) {
            for (const childId of node.childrenIds) {
              const child = nodes[childId];
              if (child) {
                walk(childId, depth + 1, node.totalSize);
              }
            }
          }
        }

        walk(rootId, 0, nodes[rootId]?.totalSize ?? 0);
        return items;
      }, [nodes, rootId, expandedFolders]);

  if (!rootId) {
    return (
      <div className="p-md text-body-sm text-text-muted">
        No folder loaded.
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full"
      role="tree"
      aria-label="Folder tree"
    >
      <div className="px-md py-2 border-b border-border">
        <h3 className="text-caption font-semibold uppercase tracking-wider text-text-muted">
          Folders
        </h3>
      </div>
      <ScrollArea className="flex-1 px-1 py-1">
        {visibleItems.map(({ node, depth, parentTotalSize }) => (
          <FolderTreeItem
            key={node.id}
            node={node}
            depth={depth}
            isSelected={selectedNodeId === node.id || currentPath[currentPath.length - 1] === node.id}
            isExpanded={expandedFolders.has(node.id)}
            hasChildren={node.childrenIds.length > 0}
            parentTotalSize={parentTotalSize}
            onToggle={toggleFolder}
            onSelect={selectNode}
            onDrillDown={drillDown}
          />
        ))}
      </ScrollArea>
    </div>
  );
}
