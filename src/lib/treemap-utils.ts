import { hierarchy, treemap, type HierarchyRectangularNode } from "d3-hierarchy";
import type { FileSystemNode, TreemapNode } from "@/types/filesystem";
import { TREEMAP_AGGREGATION_THRESHOLD } from "./constants";

type LayoutNode = HierarchyRectangularNode<TreemapNode>;

/**
 * D3 treemap layout boundary.
 *
 * Per ADR-002 and architecture.md:
 * - D3 layout is read-only (never mutates the store)
 * - The treemap is a 2D space-filling layout (cannot be virtualized)
 * - We use aggregation for folders with >1,000 children
 *
 * This module owns the layout math; React components consume the output.
 */

export interface TreemapLayoutNode {
  id: string;
  name: string;
  value: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  category: string;
  type: "file" | "folder";
  path: string;
  hasOverflow?: boolean;
  overflowCount?: number;
}

/**
 * Convert a FileSystemNode tree into a TreemapNode tree for D3.
 */
function toTreemapNode(node: FileSystemNode, getChild: (id: string) => FileSystemNode | undefined): TreemapNode {
  const children: TreemapNode[] = [];
  for (const childId of node.childrenIds) {
    const child = getChild(childId);
    if (child) {
      children.push(toTreemapNode(child, getChild));
    }
  }
  return {
    id: node.id,
    name: node.name,
    value: node.totalSize,
    category: node.category ?? "other",
    type: node.type === "drive" ? "folder" : node.type,
    path: node.path,
    extension: node.extension,
    children: children.length > 0 ? children : undefined,
  };
}

/**
 * Aggregate small items into an "Other" cell for folders with too many children.
 * Returns a new tree — does not mutate the input.
 */
function aggregateSmallItems(root: TreemapNode, threshold: number): TreemapNode {
  if (!root.children || root.children.length === 0) return root;

  // For folders with too many children, group items contributing <0.1% of total into "Other"
  if (root.children.length > threshold) {
    const totalValue = root.value;
    const thresholdValue = totalValue * 0.001; // 0.1%

    const significant: TreemapNode[] = [];
    const small: TreemapNode[] = [];
    for (const child of root.children) {
      if (child.value >= thresholdValue) {
        significant.push(child);
      } else {
        small.push(child);
      }
    }

    if (small.length > 0) {
      const otherValue = small.reduce((sum, c) => sum + c.value, 0);
      const otherNode: TreemapNode = {
        id: `${root.id}__other`,
        name: `Other (${small.length})`,
        value: otherValue,
        category: "other",
        type: "folder",
        path: root.path,
      };
      return {
        ...root,
        children: [...significant, otherNode],
      };
    }
  }

  return {
    ...root,
    children: root.children.map((c) => aggregateSmallItems(c, threshold)),
  };
}

/**
 * Compute the treemap layout for a folder.
 *
 * Returns a list of leaf rectangles with computed positions.
 * Does NOT mutate any state.
 */
export function computeTreemapLayout(
  root: FileSystemNode,
  getChild: (id: string) => FileSystemNode | undefined,
  width: number,
  height: number
): TreemapLayoutNode[] {
  if (root.totalSize === 0 || width === 0 || height === 0) return [];

  // Build a fresh tree — D3 hierarchy is non-mutating on the input
  const data = toTreemapNode(root, getChild);

  // Apply aggregation on a copy
  const aggregated = aggregateSmallItems(data, TREEMAP_AGGREGATION_THRESHOLD);

  // Compute layout
  const rootHierarchy = hierarchy<TreemapNode>(aggregated)
    .sum((d) => (d.type === "file" ? d.value : 0))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  const layout = treemap<TreemapNode>().size([width, height]).padding(2).round(true);
  const layoutResult = layout(rootHierarchy);

  // Extract leaf rectangles (layoutResult.leaves() returns HierarchyRectangularNode[])
  return layoutResult.leaves().map((leaf) => ({
    id: leaf.data.id,
    name: leaf.data.name,
    value: leaf.value ?? 0,
    x0: leaf.x0 ?? 0,
    y0: leaf.y0 ?? 0,
    x1: leaf.x1 ?? 0,
    y1: leaf.y1 ?? 0,
    category: leaf.data.category,
    type: leaf.data.type,
    path: leaf.data.path,
  }));
}

/**
 * Compute layout for a folder including overflow indicator cells.
 */
export function computeTreemapLayoutWithOverflow(
  root: FileSystemNode,
  getChild: (id: string) => FileSystemNode | undefined,
  width: number,
  height: number
): { nodes: TreemapLayoutNode[]; totalChildren: number; visibleChildren: number } {
  const nodes = computeTreemapLayout(root, getChild, width, height);
  return {
    nodes,
    totalChildren: root.childrenIds.length,
    visibleChildren: nodes.length,
  };
}

/**
 * Type-safe wrapper for the D3 hierarchy node.
 */
export type TreemapHierarchyNode = LayoutNode;
