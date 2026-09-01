"use client";

import * as React from "react";
import { hierarchy, treemap, type HierarchyRectangularNode } from "d3-hierarchy";
import { useDiskottoStore, useCurrentNode } from "@/store";
import { useTheme } from "next-themes";
import { TreemapTooltip } from "./treemap-tooltip";
import { TreemapNodeRect } from "./treemap-node";
import type { FileSystemNode } from "@/types/filesystem";
import type { TreemapNode } from "@/types/filesystem";

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
  const { nodes, drillDown, selectNode, toggleDetailsPanel } = useDiskottoStore();
  const currentNode = useCurrentNode();
  const { resolvedTheme } = useTheme();
  const theme: "light" | "dark" = resolvedTheme === "dark" ? "dark" : "light";

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = React.useState<TooltipState>({ node: null, x: 0, y: 0 });
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  // Measure container using polling — more reliable than ResizeObserver in edge cases
  React.useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let rafId: number;
    let tick = 0;

    const measure = () => {
      const rect = container.getBoundingClientRect();
      const w = rect.width || container.clientWidth;
      const h = rect.height || container.clientHeight;
      if (w > 0 && h > 0) {
        setDimensions({ width: w, height: h });
      } else {
        // Keep polling for up to 3 seconds
        if (tick < 30) {
          rafId = requestAnimationFrame(measure);
          tick++;
        }
      }
    };

    rafId = requestAnimationFrame(measure);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.target.clientWidth,
          height: entry.target.clientHeight,
        });
      }
    });

    observer.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  // Compute treemap layout
  const treemapNodes = React.useMemo(() => {
    if (!currentNode || dimensions.width === 0 || dimensions.height === 0) {
      return [];
    }

    // Build the treemap data from the current folder
    const children = currentNode.childrenIds
      .map((id) => nodes[id])
      .filter(Boolean) as FileSystemNode[];

    if (children.length === 0) return [];

    const data: TreemapNode = {
      id: currentNode.id,
      name: currentNode.name,
      value: currentNode.totalSize,
      category: "folder",
      type: "folder",
      path: currentNode.path,
      children: children.map((child) => ({
        id: child.id,
        name: child.name,
        value: child.totalSize,
        category: child.category ?? "other",
        type: child.type === "folder" ? "folder" : "file",
        path: child.path,
        extension: child.extension,
      })),
    };

    // Compute D3 layout
    const root = hierarchy(data)
      .sum((d) => (d.type === "file" ? d.value : d.children ? 0 : 0))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    const layout = treemap<TreemapNode>()
      .size([dimensions.width, dimensions.height])
      .padding(2)
      .round(true);

    const layoutResult = layout(root);

    // Return leaf nodes with positions
    return layoutResult.leaves() as HierarchyRectangularNode<TreemapNode>[];
  }, [currentNode, dimensions, nodes]);

  const handleNodeHover = (
    node: FileSystemNode | null,
    event?: React.MouseEvent
  ) => {
    if (node && event) {
      setHoveredId(node.id);
      setTooltip({ node, x: event.clientX, y: event.clientY });
    } else {
      setHoveredId(null);
      setTooltip({ node: null, x: 0, y: 0 });
    }
  };

  const handleNodeClick = (node: FileSystemNode) => {
    selectNode(node.id);
    toggleDetailsPanel();
  };

  const handleNodeDoubleClick = (node: FileSystemNode) => {
    if (node.type === "folder") {
      drillDown(node.id);
    }
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
    setTooltip({ node: null, x: 0, y: 0 });
  };

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

  if (treemapNodes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted text-body-sm">
        Calculating layout...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      onMouseLeave={handleMouseLeave}
    >
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="block"
        role="tree"
        aria-label={`Storage treemap for ${currentNode.name}`}
      >
        {treemapNodes.map((leaf) => {
          const node = nodes[leaf.data.id];
          if (!node) return null;

          const width = (leaf.x1 ?? 0) - (leaf.x0 ?? 0);
          const height = (leaf.y1 ?? 0) - (leaf.y0 ?? 0);
          const nodeData: TreemapNode = leaf.data;

          return (
            <TreemapNodeRect
              key={leaf.data.id}
              node={nodeData}
              nodeId={node.id}
              x={leaf.x0 ?? 0}
              y={leaf.y0 ?? 0}
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

      {tooltip.node && (
        <TreemapTooltip node={tooltip.node} x={tooltip.x} y={tooltip.y} />
      )}
    </div>
  );
}
