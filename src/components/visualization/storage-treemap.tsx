"use client";

import * as React from "react";
import { useDiskottoStore, useCurrentNode } from "@/store";
import { useTheme } from "next-themes";
import { TreemapTooltip } from "./treemap-tooltip";
import { TreemapNodeRect } from "./treemap-node";
import { computeTreemapLayout } from "@/lib/treemap-utils";
import type { FileSystemNode, FileCategory, TreemapNode } from "@/types/filesystem";

/**
 * StorageTreemap — Primary D3-powered interactive treemap visualization.
 * From SPEC.md: StorageTreemap component
 *
 * D3 layout is read-only (never mutates store). React handles rendering.
 * Per ADR-002 and architecture.md.
 */

interface TooltipState {
  node: FileSystemNode | null;
  x: number;
  y: number;
}

export function StorageTreemap() {
  const nodes = useDiskottoStore((state) => state.nodes);
  const drillDown = useDiskottoStore((state) => state.drillDown);
  const selectNode = useDiskottoStore((state) => state.selectNode);
  const toggleDetailsPanel = useDiskottoStore((state) => state.toggleDetailsPanel);
  const currentNode = useCurrentNode();
  const { resolvedTheme } = useTheme();
  const theme: "light" | "dark" = resolvedTheme === "dark" ? "dark" : "light";

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = React.useState<TooltipState>({ node: null, x: 0, y: 0 });
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  // Measure container dimensions and update state on changes
  React.useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let timeoutId: number | undefined;

    const checkDimensions = () => {
      const rect = container.getBoundingClientRect();
      const w = rect.width || container.clientWidth;
      const h = rect.height || container.clientHeight;
      setDimensions((prev) => {
        if (prev.width === w && prev.height === h) return prev;
        return { width: w, height: h };
      });
    };

    const debouncedCheck = () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(checkDimensions, 100);
    };

    // Check immediately on mount
    checkDimensions();

    // Set up ResizeObserver for container changes
    const observer = new ResizeObserver(debouncedCheck);
    observer.observe(container);

    // Fallback for window resize
    window.addEventListener("resize", debouncedCheck);

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      observer.disconnect();
      window.removeEventListener("resize", debouncedCheck);
    };
  }, []);

  // Extract only the necessary children nodes to prevent unnecessary re-renders.
  // Custom equality check: compare by reference identity of each element.
  const children = useDiskottoStore((state) => {
    if (!currentNode) return [];
    return currentNode.childrenIds
      .map((id) => state.nodes[id])
      .filter(Boolean) as FileSystemNode[];
  }, (oldVal, newVal) => {
    if (oldVal.length !== newVal.length) return false;
    for (let i = 0; i < oldVal.length; i++) {
      if (oldVal[i] !== newVal[i]) return false;
    }
    return true;
  });

  // Compute treemap layout using utility that aggregates small items.
  // Dependencies: currentNode (which folder), dimensions (size), children (the actual nodes).
  // `nodes` is intentionally excluded — `children` already captures all changes to child nodes.
  // The getChild lookup inside computeTreemapLayout uses `nodes` as a fallback for subtree
  // traversal beyond direct children, but those won't change without `children` changing too.
  /* eslint-disable react-hooks/exhaustive-deps */
  const layoutNodes = React.useMemo(() => {
    if (!currentNode || dimensions.width === 0 || dimensions.height === 0) {
      return [];
    }

    if (children.length === 0) return [];

    // Build a lookup from children for subtree traversal
    const childMap = new Map<string, FileSystemNode>();
    for (const child of children) {
      childMap.set(child.id, child);
    }

    const getChild = (id: string) => childMap.get(id) ?? nodes[id];

    return computeTreemapLayout(
      currentNode,
      getChild,
      dimensions.width,
      dimensions.height
    );
  }, [currentNode, dimensions, children]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const handleNodeHover = React.useCallback(
    (node: FileSystemNode | null, event?: React.MouseEvent) => {
      if (node && event) {
        setHoveredId(node.id);
        setTooltip({ node, x: event.clientX, y: event.clientY });
      } else {
        setHoveredId(null);
        setTooltip({ node: null, x: 0, y: 0 });
      }
    },
    []
  );

  const handleNodeClick = React.useCallback(
    (node: FileSystemNode) => {
      selectNode(node.id);
      toggleDetailsPanel();
    },
    [selectNode, toggleDetailsPanel]
  );

  const handleNodeDoubleClick = React.useCallback(
    (node: FileSystemNode) => {
      if (node.type === "folder") {
        drillDown(node.id);
      }
    },
    [drillDown]
  );

  const handleMouseLeave = React.useCallback(() => {
    setHoveredId(null);
    setTooltip({ node: null, x: 0, y: 0 });
  }, []);

  if (!currentNode) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted text-body-sm">
        Select a folder to view storage
      </div>
    );
  }

  if (currentNode.childrenIds.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted text-body-sm">
        This folder is empty
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      onMouseLeave={handleMouseLeave}
    >
      {layoutNodes.length === 0 ? (
        <div className="flex-1 h-full w-full flex items-center justify-center text-text-muted text-body-sm">
          Calculating layout...
        </div>
      ) : (
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="block"
          role="tree"
          aria-label={`Storage treemap for ${currentNode.name}`}
        >
        {layoutNodes.map((leaf) => {
          let node = nodes[leaf.id];
          
          // Synthesize "Other" node for aggregated items
          if (!node && leaf.id.endsWith("__other")) {
            node = {
              id: leaf.id,
              name: leaf.name,
              totalSize: leaf.value,
              size: leaf.value,
              type: "folder",
              category: "other",
              path: leaf.path,
              parentId: currentNode.id,
              depth: currentNode.depth + 1,
              fileCount: 0,
              folderCount: 0,
              childrenIds: [],
              isHidden: false,
              isSystem: false,
              isReadonly: false,
              hasError: false
            };
          }

          if (!node) return null;

          const width = leaf.x1 - leaf.x0;
          const height = leaf.y1 - leaf.y0;
          
          const nodeData: TreemapNode = {
            id: leaf.id,
            name: leaf.name,
            value: leaf.value,
            category: leaf.category as FileCategory,
            type: leaf.type,
            path: leaf.path
          };

          return (
            <TreemapNodeRect
              key={leaf.id}
              node={nodeData}
              nodeId={node.id}
              x={leaf.x0}
              y={leaf.y0}
              width={width}
              height={height}
              isHovered={hoveredId === node.id}
              theme={theme}
              onHover={(e) => handleNodeHover(node, e)}
              onClick={() => handleNodeClick(node)}
              onDoubleClick={() => handleNodeDoubleClick(node)}
            />
          );
        })}
        </svg>
      )}

      {tooltip.node && (
        <TreemapTooltip node={tooltip.node} x={tooltip.x} y={tooltip.y} />
      )}
    </div>
  );
}
