import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StorageTreemap } from "@/components/visualization/storage-treemap";
import { computeTreemapLayout } from "@/lib/treemap-utils";
import type { FileSystemNode } from "@/types/filesystem";

// Mock the store with a sample tree
vi.mock("@/store", () => {
  const root: FileSystemNode = {
    id: "root",
    parentId: null,
    name: "C:\\",
    path: "C:\\",
    type: "drive",
    size: 0,
    totalSize: 1000,
    fileCount: 3,
    folderCount: 0,
    isHidden: false,
    isSystem: false,
    isReadonly: false,
    depth: 0,
    childrenIds: ["f1", "f2", "f3"],
    hasError: false,
  };

  const f1: FileSystemNode = {
    id: "f1",
    parentId: "root",
    name: "big_file.mp4",
    path: "C:\\big_file.mp4",
    type: "file",
    size: 500,
    totalSize: 500,
    fileCount: 1,
    folderCount: 0,
    extension: "mp4",
    category: "video",
    isHidden: false,
    isSystem: false,
    isReadonly: false,
    depth: 1,
    childrenIds: [],
    hasError: false,
  };

  const f2: FileSystemNode = {
    id: "f2",
    parentId: "root",
    name: "medium.pdf",
    path: "C:\\medium.pdf",
    type: "file",
    size: 300,
    totalSize: 300,
    fileCount: 1,
    folderCount: 0,
    extension: "pdf",
    category: "document",
    isHidden: false,
    isSystem: false,
    isReadonly: false,
    depth: 1,
    childrenIds: [],
    hasError: false,
  };

  const f3: FileSystemNode = {
    id: "f3",
    parentId: "root",
    name: "small.txt",
    path: "C:\\small.txt",
    type: "file",
    size: 200,
    totalSize: 200,
    fileCount: 1,
    folderCount: 0,
    extension: "txt",
    category: "document",
    isHidden: false,
    isSystem: false,
    isReadonly: false,
    depth: 1,
    childrenIds: [],
    hasError: false,
  };

  const nodes: Record<string, FileSystemNode> = {
    [root.id]: root,
    [f1.id]: f1,
    [f2.id]: f2,
    [f3.id]: f3,
  };

  return {
    useDiskottoStore: vi.fn(() => ({
      nodes,
      rootId: root.id,
      scanStatus: "complete",
      scanStats: null,
      detailsPanelOpen: false,
      drillDown: vi.fn(),
      selectNode: vi.fn(),
      toggleDetailsPanel: vi.fn(),
    })),
    useCurrentNode: vi.fn(() => root),
  };
});

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

describe("StorageTreemap", () => {
  it("renders without crashing", () => {
    const { container } = render(<StorageTreemap />);
    expect(container).toBeTruthy();
  });
});

describe("computeTreemapLayout", () => {
  // Create a sample tree
  const root: FileSystemNode = {
    id: "root",
    parentId: null,
    name: "C:\\",
    path: "C:\\",
    type: "drive",
    size: 0,
    totalSize: 1000,
    fileCount: 3,
    folderCount: 0,
    isHidden: false,
    isSystem: false,
    isReadonly: false,
    depth: 0,
    childrenIds: ["a", "b"],
    hasError: false,
  };

  const a: FileSystemNode = {
    id: "a",
    parentId: "root",
    name: "large.mp4",
    path: "C:\\large.mp4",
    type: "file",
    size: 600,
    totalSize: 600,
    fileCount: 1,
    folderCount: 0,
    extension: "mp4",
    category: "video",
    isHidden: false,
    isSystem: false,
    isReadonly: false,
    depth: 1,
    childrenIds: [],
    hasError: false,
  };

  const b: FileSystemNode = {
    id: "b",
    parentId: "root",
    name: "small.txt",
    path: "C:\\small.txt",
    type: "file",
    size: 400,
    totalSize: 400,
    fileCount: 1,
    folderCount: 0,
    extension: "txt",
    category: "document",
    isHidden: false,
    isSystem: false,
    isReadonly: false,
    depth: 1,
    childrenIds: [],
    hasError: false,
  };

  const nodes: Record<string, FileSystemNode> = {
    [root.id]: root,
    [a.id]: a,
    [b.id]: b,
  };

  const getChild = (id: string) => nodes[id];

  it("computes layout for a simple tree", () => {
    const layout = computeTreemapLayout(root, getChild, 1000, 1000);

    // Should have 2 leaf nodes (the two files)
    expect(layout.length).toBe(2);

    // Both nodes should have non-zero positions
    for (const node of layout) {
      expect(node.x1 - node.x0).toBeGreaterThan(0);
      expect(node.y1 - node.y0).toBeGreaterThan(0);
    }
  });

  it("larger files get larger areas", () => {
    const layout = computeTreemapLayout(root, getChild, 1000, 1000);

    // Find the large file (a) and small file (b) in the layout
    const large = layout.find(n => n.id === "a");
    const small = layout.find(n => n.id === "b");

    expect(large).toBeTruthy();
    expect(small).toBeTruthy();

    if (large && small) {
      const largeArea = (large.x1 - large.x0) * (large.y1 - large.y0);
      const smallArea = (small.x1 - small.x0) * (small.y1 - small.y0);

      // Large should have bigger area (600 vs 400)
      expect(largeArea).toBeGreaterThan(smallArea);
    }
  });

  it("returns empty layout for empty root", () => {
    const emptyRoot: FileSystemNode = { ...root, totalSize: 0, childrenIds: [] };
    const layout = computeTreemapLayout(emptyRoot, getChild, 1000, 1000);
    expect(layout.length).toBe(0);
  });

  it("returns empty layout for zero dimensions", () => {
    const layout = computeTreemapLayout(root, getChild, 0, 0);
    expect(layout.length).toBe(0);
  });

  it("preserves file metadata in layout nodes", () => {
    const layout = computeTreemapLayout(root, getChild, 1000, 1000);
    const large = layout.find(n => n.id === "a");

    expect(large).toBeTruthy();
    if (large) {
      expect(large.name).toBe("large.mp4");
      expect(large.value).toBe(600);
      expect(large.type).toBe("file");
      expect(large.category).toBe("video");
    }
  });
});
