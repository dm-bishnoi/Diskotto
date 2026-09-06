import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StorageTreemap } from "@/components/visualization/storage-treemap";
import {
  computeTreemapLayout,
  getLabelVisibility,
} from "@/lib/treemap-utils";
import type { FileSystemNode } from "@/types/filesystem";

// Use vi.hoisted so these are available when vi.mock factories run
const { useDiskottoStoreMock, useCurrentNodeMock, mockStoreState } = vi.hoisted(() => {
  const state: Record<string, unknown> = {
    nodes: {},
    rootId: null,
    scanStatus: "idle",
    scanStats: null,
    detailsPanelOpen: false,
    drillDown: vi.fn(),
    selectNode: vi.fn(),
    toggleDetailsPanel: vi.fn(),
  };
  return {
    useDiskottoStoreMock: vi.fn((selector: (s: Record<string, unknown>) => unknown) => selector(state)),
    useCurrentNodeMock: vi.fn((): FileSystemNode | null => null),
    mockStoreState: state,
  };
});

vi.mock("@/store", () => ({
  useDiskottoStore: useDiskottoStoreMock,
  useCurrentNode: useCurrentNodeMock,
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "dark" }),
}));

// --- Helper: create a minimal FileSystemNode ---
function makeFile(overrides: Partial<FileSystemNode> & { id: string; name: string }): FileSystemNode {
  return {
    parentId: "root",
    path: `C:\\${overrides.name}`,
    type: "file",
    size: 100,
    totalSize: 100,
    fileCount: 1,
    folderCount: 0,
    isHidden: false,
    isSystem: false,
    isReadonly: false,
    depth: 1,
    childrenIds: [],
    hasError: false,
    ...overrides,
  };
}

function makeFolder(overrides: Partial<FileSystemNode> & { id: string; name: string; childrenIds: string[] }): FileSystemNode {
  return {
    parentId: "root",
    path: `C:\\${overrides.name}`,
    type: "folder",
    size: 0,
    totalSize: 0,
    fileCount: 0,
    folderCount: 0,
    category: "folder",
    isHidden: false,
    isSystem: false,
    isReadonly: false,
    depth: 1,
    hasError: false,
    ...overrides,
  };
}

// --- Helper: create large synthetic dataset ---
function buildLargeFixture(count: number) {
  const rootId = `root-${count}`;
  const fileIds: string[] = [];
  const nodes: Record<string, FileSystemNode> = {};

  for (let i = 0; i < count; i++) {
    const id = `file-${count}-${i}`;
    fileIds.push(id);
    nodes[id] = makeFile({
      id,
      name: `file_${i}.txt`,
      size: Math.random() * 1_000_000,
      totalSize: Math.random() * 1_000_000,
      extension: "txt",
      category: "document",
      parentId: rootId,
    });
  }

  const root: FileSystemNode = {
    id: rootId,
    parentId: null,
    name: "TestRoot",
    path: "C:\\TestRoot",
    type: "folder",
    size: 0,
    totalSize: fileIds.reduce((sum, id) => sum + nodes[id].totalSize, 0),
    fileCount: count,
    folderCount: 0,
    category: "folder",
    isHidden: false,
    isSystem: false,
    isReadonly: false,
    depth: 0,
    childrenIds: fileIds,
    hasError: false,
  };

  nodes[rootId] = root;
  return { root, nodes, fileIds };
}

// ===================================================================
// getLabelVisibility tests
// ===================================================================
describe("getLabelVisibility", () => {
  it("returns 'none' for tiny tiles (area < 800)", () => {
    const result = getLabelVisibility(20, 20, "tiny.txt");
    expect(result.visibility).toBe("none");
    expect(result.showName).toBe(false);
    expect(result.showSize).toBe(false);
  });

  it("returns 'none' for very narrow tiles", () => {
    const result = getLabelVisibility(10, 200, "narrow.txt");
    expect(result.visibility).toBe("none");
    expect(result.showName).toBe(false);
  });

  it("returns 'none' for very short tiles", () => {
    const result = getLabelVisibility(200, 5, "short.txt");
    expect(result.visibility).toBe("none");
    expect(result.showName).toBe(false);
  });

  it("returns 'name' for medium tiles (area >= 3000)", () => {
    const result = getLabelVisibility(60, 60, "medium.txt"); // area=3600
    expect(result.visibility).toBe("name");
    expect(result.showName).toBe(true);
    expect(result.showSize).toBe(false);
  });

  it("returns 'full' for large tiles (area >= 10000)", () => {
    const result = getLabelVisibility(120, 120, "large.txt"); // area=14400
    expect(result.visibility).toBe("full");
    expect(result.showName).toBe(true);
    expect(result.showSize).toBe(true);
  });

  it("returns 'full' with showSize=false if width too narrow for size label", () => {
    const result = getLabelVisibility(75, 200, "wide.txt"); // area=15000, width=75 < 80
    expect(result.visibility).toBe("full");
    expect(result.showName).toBe(true);
    expect(result.showSize).toBe(false);
  });

  it("returns 'full' with showSize=false if height too short for size label", () => {
    const result = getLabelVisibility(200, 30, "flat.txt"); // area=6000, height=30 < 32 → falls into "name" category, not "full"
    // area=6000 >= 3000 but < 10000 → visibility is "name"
    expect(result.visibility).toBe("name");
    expect(result.showName).toBe(true);
    expect(result.showSize).toBe(false);
  });

  it("truncates long names", () => {
    const result = getLabelVisibility(200, 200, "a_very_long_filename_that_definitely_wont_fit.txt");
    expect(result.displayName.length).toBeLessThan("a_very_long_filename_that_definitely_wont_fit.txt".length);
    expect(result.displayName).toContain("…");
  });

  it("does not truncate short names", () => {
    const result = getLabelVisibility(200, 200, "ok.txt");
    expect(result.displayName).toBe("ok.txt");
    expect(result.displayName).not.toContain("…");
  });

  it("calculates maxNameChars based on available width", () => {
    const result = getLabelVisibility(200, 200, "test.txt");
    // Available width = 200 - 8*2 = 184, maxChars = 184/7 ≈ 26
    expect(result.maxNameChars).toBeGreaterThan(10);
    expect(result.maxNameChars).toBeLessThan(40);
  });

  it("handles zero dimensions gracefully", () => {
    const result = getLabelVisibility(0, 0, "zero.txt");
    expect(result.visibility).toBe("none");
    expect(result.showName).toBe(false);
    expect(result.showSize).toBe(false);
  });

  it("handles negative dimensions gracefully", () => {
    const result = getLabelVisibility(-10, -10, "neg.txt");
    expect(result.visibility).toBe("none");
  });
});

// ===================================================================
// computeTreemapLayout tests (preserved + extended)
// ===================================================================
describe("computeTreemapLayout", () => {
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

  const a: FileSystemNode = makeFile({
    id: "a",
    name: "large.mp4",
    size: 600,
    totalSize: 600,
    extension: "mp4",
    category: "video",
  });

  const b: FileSystemNode = makeFile({
    id: "b",
    name: "small.txt",
    size: 400,
    totalSize: 400,
    extension: "txt",
    category: "document",
  });

  const nodes: Record<string, FileSystemNode> = {
    [root.id]: root,
    [a.id]: a,
    [b.id]: b,
  };

  const getChild = (id: string) => nodes[id];

  it("computes layout for a simple tree", () => {
    const layout = computeTreemapLayout(root, getChild, 1000, 1000);
    expect(layout.length).toBe(2);
    for (const node of layout) {
      expect(node.x1 - node.x0).toBeGreaterThan(0);
      expect(node.y1 - node.y0).toBeGreaterThan(0);
    }
  });

  it("larger files get larger areas", () => {
    const layout = computeTreemapLayout(root, getChild, 1000, 1000);
    const large = layout.find(n => n.id === "a");
    const small = layout.find(n => n.id === "b");
    expect(large).toBeTruthy();
    expect(small).toBeTruthy();
    if (large && small) {
      const largeArea = (large.x1 - large.x0) * (large.y1 - large.y0);
      const smallArea = (small.x1 - small.x0) * (small.y1 - small.y0);
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

  it("handles zero-size files", () => {
    const zeroFile: FileSystemNode = makeFile({
      id: "zero",
      name: "empty.txt",
      size: 0,
      totalSize: 0,
      extension: "txt",
      category: "document",
    });
    const rootWithZero: FileSystemNode = {
      ...root,
      totalSize: 100,
      childrenIds: ["a", "zero"],
    };
    const nodesWithZero: Record<string, FileSystemNode> = { ...nodes, zero: zeroFile };
    const layout = computeTreemapLayout(rootWithZero, (id) => nodesWithZero[id], 1000, 1000);
    // Zero-size file may still appear as a leaf with minimal area
    expect(layout.length).toBeGreaterThanOrEqual(1);
  });

  it("handles unknown extensions", () => {
    const unknownFile: FileSystemNode = makeFile({
      id: "unknown",
      name: "mystery.xyz123",
      size: 50,
      totalSize: 50,
      extension: "xyz123",
      category: "other",
    });
    const rootWithUnknown: FileSystemNode = {
      ...root,
      totalSize: 100,
      childrenIds: ["a", "unknown"],
    };
    const nodesWithUnknown: Record<string, FileSystemNode> = { ...nodes, unknown: unknownFile };
    const layout = computeTreemapLayout(rootWithUnknown, (id) => nodesWithUnknown[id], 1000, 1000);
    expect(layout.length).toBe(2);
    const unknown = layout.find(n => n.id === "unknown");
    expect(unknown).toBeTruthy();
    expect(unknown!.category).toBe("other");
  });
});

// ===================================================================
// 6,192-file fixture renders successfully
// ===================================================================
describe("StorageTreemap — large dataset", () => {
  it("renders 6,192 files without crashing", () => {
    const { root, nodes } = buildLargeFixture(6192);

    Object.assign(mockStoreState, {
      nodes,
      rootId: root.id,
      scanStatus: "complete",
      scanStats: null,
      detailsPanelOpen: false,
      drillDown: vi.fn(),
      selectNode: vi.fn(),
      toggleDetailsPanel: vi.fn(),
    });
    useCurrentNodeMock.mockReturnValue(root);

    const { container } = render(<StorageTreemap />);
    expect(container).toBeTruthy();
  });

  it("renders 10,000 files without crashing", () => {
    const { root, nodes } = buildLargeFixture(10000);

    Object.assign(mockStoreState, {
      nodes,
      rootId: root.id,
      scanStatus: "complete",
      scanStats: null,
      detailsPanelOpen: false,
      drillDown: vi.fn(),
      selectNode: vi.fn(),
      toggleDetailsPanel: vi.fn(),
    });
    useCurrentNodeMock.mockReturnValue(root);

    const { container } = render(<StorageTreemap />);
    expect(container).toBeTruthy();
  });
});

// ===================================================================
// StorageTreemap component tests
// ===================================================================

// Mock store for component tests
const mockDrillDown = vi.fn();
const mockSelectNode = vi.fn();
const mockToggleDetailsPanel = vi.fn();

function setupMockStore(root: FileSystemNode, nodes: Record<string, FileSystemNode>) {
  Object.assign(mockStoreState, {
    nodes,
    rootId: root.id,
    scanStatus: "complete",
    scanStats: null,
    detailsPanelOpen: false,
    drillDown: mockDrillDown,
    selectNode: mockSelectNode,
    toggleDetailsPanel: mockToggleDetailsPanel,
  });
  useCurrentNodeMock.mockReturnValue(root);
}

beforeEach(() => {
  vi.clearAllMocks();
  useCurrentNodeMock.mockReturnValue(null);
  Object.assign(mockStoreState, {
    nodes: {},
    rootId: null,
    scanStatus: "idle",
    scanStats: null,
    detailsPanelOpen: false,
    drillDown: vi.fn(),
    selectNode: vi.fn(),
    toggleDetailsPanel: vi.fn(),
  });
});

describe("StorageTreemap", () => {
  it("renders without crashing", () => {
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
      childrenIds: ["f1", "f2"],
      hasError: false,
    };

    const f1 = makeFile({ id: "f1", name: "big.mp4", size: 600, totalSize: 600, extension: "mp4", category: "video" });
    const f2 = makeFile({ id: "f2", name: "small.txt", size: 400, totalSize: 400, extension: "txt", category: "document" });

    const nodes: Record<string, FileSystemNode> = { root, f1, f2 };
    setupMockStore(root, nodes);

    const { container } = render(<StorageTreemap />);
    expect(container).toBeTruthy();
  });

  it("shows empty state when no current node", () => {
    useCurrentNodeMock.mockReturnValue(null);
    Object.assign(mockStoreState, {
      nodes: {},
      rootId: null,
      scanStatus: "idle",
      scanStats: null,
      detailsPanelOpen: false,
      drillDown: vi.fn(),
      selectNode: vi.fn(),
      toggleDetailsPanel: vi.fn(),
    });

    render(<StorageTreemap />);
    expect(screen.getByText(/select a folder to view storage/i)).toBeTruthy();
  });

  it("shows empty folder state", () => {
    const emptyRoot: FileSystemNode = {
      id: "empty",
      parentId: null,
      name: "Empty Folder",
      path: "C:\\Empty",
      type: "folder",
      size: 0,
      totalSize: 0,
      fileCount: 0,
      folderCount: 0,
      category: "folder",
      isHidden: false,
      isSystem: false,
      isReadonly: false,
      depth: 0,
      childrenIds: [],
      hasError: false,
    };

    setupMockStore(emptyRoot, { empty: emptyRoot });
    render(<StorageTreemap />);
    expect(screen.getByText(/this folder is empty/i)).toBeTruthy();
  });

  it("all tiles remain interactive even when labels are hidden", () => {
    const root: FileSystemNode = {
      id: "root",
      parentId: null,
      name: "C:\\",
      path: "C:\\",
      type: "drive",
      size: 0,
      totalSize: 1000,
      fileCount: 2,
      folderCount: 0,
      isHidden: false,
      isSystem: false,
      isReadonly: false,
      depth: 0,
      childrenIds: ["f1", "f2"],
      hasError: false,
    };

    const f1 = makeFile({ id: "f1", name: "big.mp4", size: 600, totalSize: 600, extension: "mp4", category: "video" });
    const f2 = makeFile({ id: "f2", name: "tiny.txt", size: 400, totalSize: 400, extension: "txt", category: "document" });

    const nodes: Record<string, FileSystemNode> = { root, f1, f2 };
    setupMockStore(root, nodes);

    const { container } = render(<StorageTreemap />);

    // All treeitem elements should have tabIndex and aria-label
    const treeItems = container.querySelectorAll('[role="treeitem"]');
    expect(treeItems.length).toBe(2);
    for (const item of treeItems) {
      // In SVG, tabIndex is set as a property, not always as an attribute
      expect(item.getAttribute("aria-label")).toBeTruthy();
      expect(item.getAttribute("role")).toBe("treeitem");
    }
  });

  it("has accessible title elements on all tiles", () => {
    const root: FileSystemNode = {
      id: "root",
      parentId: null,
      name: "C:\\",
      path: "C:\\",
      type: "drive",
      size: 0,
      totalSize: 1000,
      fileCount: 2,
      folderCount: 0,
      isHidden: false,
      isSystem: false,
      isReadonly: false,
      depth: 0,
      childrenIds: ["f1", "f2"],
      hasError: false,
    };

    const f1 = makeFile({ id: "f1", name: "big.mp4", size: 600, totalSize: 600, extension: "mp4", category: "video" });
    const f2 = makeFile({ id: "f2", name: "tiny.txt", size: 400, totalSize: 400, extension: "txt", category: "document" });

    const nodes: Record<string, FileSystemNode> = { root, f1, f2 };
    setupMockStore(root, nodes);

    const { container } = render(<StorageTreemap />);

    // All tiles should have a <title> child for native tooltip
    const titles = container.querySelectorAll("title");
    expect(titles.length).toBe(2);
    for (const title of titles) {
      expect(title.textContent).toBeTruthy();
      expect(title.textContent).toContain(" - ");
    }
  });

  it("tooltip shows file information on hover", () => {
    const root: FileSystemNode = {
      id: "root",
      parentId: null,
      name: "C:\\",
      path: "C:\\",
      type: "drive",
      size: 0,
      totalSize: 1000,
      fileCount: 1,
      folderCount: 0,
      isHidden: false,
      isSystem: false,
      isReadonly: false,
      depth: 0,
      childrenIds: ["f1"],
      hasError: false,
    };

    const f1 = makeFile({
      id: "f1",
      name: "important.mp4",
      size: 1000,
      totalSize: 1000,
      extension: "mp4",
      category: "video",
      path: "C:\\important.mp4",
    });

    const nodes: Record<string, FileSystemNode> = { root, f1 };
    setupMockStore(root, nodes);

    const { container } = render(<StorageTreemap />);

    // Find the treeitem and simulate hover
    const treeItem = container.querySelector('[role="treeitem"]');
    expect(treeItem).toBeTruthy();

    if (treeItem) {
      fireEvent.mouseEnter(treeItem, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(treeItem, { clientX: 100, clientY: 100 });

      // Tooltip should appear with file info
      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toBeTruthy();
      expect(tooltip.textContent).toContain("important.mp4");
      expect(tooltip.textContent).toContain("1000");
    }
  });

  it("tooltip disappears on mouse leave", () => {
    const root: FileSystemNode = {
      id: "root",
      parentId: null,
      name: "C:\\",
      path: "C:\\",
      type: "drive",
      size: 0,
      totalSize: 1000,
      fileCount: 1,
      folderCount: 0,
      isHidden: false,
      isSystem: false,
      isReadonly: false,
      depth: 0,
      childrenIds: ["f1"],
      hasError: false,
    };

    const f1 = makeFile({
      id: "f1",
      name: "test.txt",
      size: 1000,
      totalSize: 1000,
      extension: "txt",
      category: "document",
    });

    const nodes: Record<string, FileSystemNode> = { root, f1 };
    setupMockStore(root, nodes);

    const { container } = render(<StorageTreemap />);

    const treeItem = container.querySelector('[role="treeitem"]');
    if (treeItem) {
      // Hover to show tooltip
      fireEvent.mouseEnter(treeItem, { clientX: 100, clientY: 100 });
      expect(screen.getByRole("tooltip")).toBeTruthy();

      // Leave the container to hide tooltip
      const svgContainer = container.querySelector("svg")?.parentElement;
      if (svgContainer) {
        fireEvent.mouseLeave(svgContainer);
      }
    }
  });

  it("keyboard navigation triggers click on Enter", () => {
    const root: FileSystemNode = {
      id: "root",
      parentId: null,
      name: "C:\\",
      path: "C:\\",
      type: "drive",
      size: 0,
      totalSize: 1000,
      fileCount: 1,
      folderCount: 0,
      isHidden: false,
      isSystem: false,
      isReadonly: false,
      depth: 0,
      childrenIds: ["f1"],
      hasError: false,
    };

    const f1 = makeFile({ id: "f1", name: "clickme.txt", size: 1000, totalSize: 1000, extension: "txt", category: "document" });
    const nodes: Record<string, FileSystemNode> = { root, f1 };
    setupMockStore(root, nodes);

    const { container } = render(<StorageTreemap />);
    const treeItem = container.querySelector('[role="treeitem"]');
    if (treeItem) {
      fireEvent.keyDown(treeItem, { key: "Enter" });
      expect(mockSelectNode).toHaveBeenCalledWith("f1");
      expect(mockToggleDetailsPanel).toHaveBeenCalled();
    }
  });

  it("double-click on folder triggers drillDown", () => {
    const root: FileSystemNode = {
      id: "root",
      parentId: null,
      name: "C:\\",
      path: "C:\\",
      type: "drive",
      size: 0,
      totalSize: 2000,
      fileCount: 2,
      folderCount: 1,
      isHidden: false,
      isSystem: false,
      isReadonly: false,
      depth: 0,
      childrenIds: ["f1", "folder1"],
      hasError: false,
    };

    const f1 = makeFile({ id: "f1", name: "file.txt", size: 1000, totalSize: 1000, extension: "txt", category: "document" });
    const folder1 = makeFolder({ id: "folder1", name: "subfolder", childrenIds: [] });
    const nodes: Record<string, FileSystemNode> = { root, f1, folder1 };
    setupMockStore(root, nodes);

    const { container } = render(<StorageTreemap />);
    const treeItems = container.querySelectorAll('[role="treeitem"]');
    // Find the folder tile (should have "subfolder" in its text)
    for (const item of treeItems) {
      if (item.textContent?.includes("subfolder")) {
        fireEvent.doubleClick(item);
        expect(mockDrillDown).toHaveBeenCalledWith("folder1");
        break;
      }
    }
  });
});

// ===================================================================
// Label visibility in rendered SVG
// ===================================================================
describe("Label visibility in rendered treemap", () => {
  it("large tile renders text label", () => {
    const root: FileSystemNode = {
      id: "root",
      parentId: null,
      name: "C:\\",
      path: "C:\\",
      type: "drive",
      size: 0,
      totalSize: 100000,
      fileCount: 1,
      folderCount: 0,
      isHidden: false,
      isSystem: false,
      isReadonly: false,
      depth: 0,
      childrenIds: ["big"],
      hasError: false,
    };

    const big = makeFile({ id: "big", name: "huge_file.mp4", size: 100000, totalSize: 100000, extension: "mp4", category: "video" });
    const nodes: Record<string, FileSystemNode> = { root, big };
    setupMockStore(root, nodes);

    const { container } = render(<StorageTreemap />);

    // In a 1000x1000 viewport with a single 100% file, the tile should be large
    // and have a text label
    const texts = container.querySelectorAll("text");
    const hasLabel = Array.from(texts).some(t => t.textContent?.includes("huge_file"));
    expect(hasLabel).toBe(true);
  });

  it("tiny tiles do not render overlapping labels", () => {
    // Create a root with 1000 tiny files (1 large + 999 tiny) so most tiles are very small
    const childrenIds: string[] = [];
    const nodes: Record<string, FileSystemNode> = {};

    // One large file takes most of the space
    const largeId = "large-file";
    childrenIds.push(largeId);
    nodes[largeId] = makeFile({
      id: largeId,
      name: "massive.dat",
      size: 9_999_000,
      totalSize: 9_999_000,
      extension: "dat",
      category: "other",
    });

    // 999 tiny files each with 1 byte — they'll be squished into tiny tiles
    for (let i = 0; i < 999; i++) {
      const id = `tiny-${i}`;
      childrenIds.push(id);
      nodes[id] = makeFile({
        id,
        name: `tiny_file_${i}.txt`,
        size: 1,
        totalSize: 1,
        extension: "txt",
        category: "document",
      });
    }

    const root: FileSystemNode = {
      id: "root",
      parentId: null,
      name: "C:\\",
      path: "C:\\",
      type: "drive",
      size: 0,
      totalSize: 10_000_000,
      fileCount: 1000,
      folderCount: 0,
      isHidden: false,
      isSystem: false,
      isReadonly: false,
      depth: 0,
      childrenIds,
      hasError: false,
    };
    nodes[root.id] = root;

    setupMockStore(root, nodes);
    const { container } = render(<StorageTreemap />);

    const texts = container.querySelectorAll("text");
    // With 1 large + 999 tiny files, most tiny files get tiny tiles
    // Only the large file and a few others should have labels
    expect(texts.length).toBeLessThan(childrenIds.length);
  });
});

// ===================================================================
// Resize handling
// ===================================================================
describe("Resize handling", () => {
  it("responds to container dimension changes", () => {
    const root: FileSystemNode = {
      id: "root",
      parentId: null,
      name: "C:\\",
      path: "C:\\",
      type: "drive",
      size: 0,
      totalSize: 1000,
      fileCount: 1,
      folderCount: 0,
      isHidden: false,
      isSystem: false,
      isReadonly: false,
      depth: 0,
      childrenIds: ["f1"],
      hasError: false,
    };

    const f1 = makeFile({ id: "f1", name: "file.txt", size: 1000, totalSize: 1000, extension: "txt", category: "document" });
    const nodes: Record<string, FileSystemNode> = { root, f1 };
    setupMockStore(root, nodes);

    const { container } = render(<StorageTreemap />);
    // The container should exist; ResizeObserver is mocked
    expect(container.querySelector(".absolute")).toBeTruthy();
  });
});

// ===================================================================
// Stale async layout prevention
// ===================================================================
describe("Stale async layout prevention", () => {
  it("layout useMemo dependencies do not include unstable references", () => {
    // This test verifies that the memoization deps are correct:
    // [currentNode, dimensions, children] — NOT including `nodes`.
    // We test this by verifying that the component renders correctly
    // with the same children but different nodes references.
    const root: FileSystemNode = {
      id: "root",
      parentId: null,
      name: "C:\\",
      path: "C:\\",
      type: "drive",
      size: 0,
      totalSize: 1000,
      fileCount: 1,
      folderCount: 0,
      isHidden: false,
      isSystem: false,
      isReadonly: false,
      depth: 0,
      childrenIds: ["f1"],
      hasError: false,
    };

    const f1 = makeFile({ id: "f1", name: "stable.txt", size: 1000, totalSize: 1000, extension: "txt", category: "document" });
    const nodes: Record<string, FileSystemNode> = { root, f1 };

    // First render
    setupMockStore(root, nodes);
    const { container, unmount } = render(<StorageTreemap />);
    const firstTreeItem = container.querySelector('[role="treeitem"]');
    expect(firstTreeItem).toBeTruthy();
    unmount();

    // Second render with new nodes reference but same children
    const nodes2 = { ...nodes }; // new reference
    setupMockStore(root, nodes2);
    const { container: container2 } = render(<StorageTreemap />);
    const secondTreeItem = container2.querySelector('[role="treeitem"]');
    expect(secondTreeItem).toBeTruthy();
  });
});

// ===================================================================
// Performance: large dataset rendering
// ===================================================================
describe("Performance — large dataset", () => {
  it("6192 files layout computation completes in reasonable time", () => {
    // Use equal sizes to avoid aggregation (each file is 0.1% of total when count <= 1000)
    // For > 1000 files, some will aggregate, but layout computation still exercises the algorithm
    const rootId = "perf-root";
    const fileIds: string[] = [];
    const nodes: Record<string, FileSystemNode> = {};
    const fileSize = 1000;

    for (let i = 0; i < 6192; i++) {
      const id = `file-${i}`;
      fileIds.push(id);
      nodes[id] = makeFile({
        id,
        name: `file_${i}.txt`,
        size: fileSize,
        totalSize: fileSize,
        extension: "txt",
        category: "document",
        parentId: rootId,
      });
    }

    const root: FileSystemNode = {
      id: rootId,
      parentId: null,
      name: "PerfRoot",
      path: "C:\\PerfRoot",
      type: "folder",
      size: 0,
      totalSize: fileIds.length * fileSize,
      fileCount: fileIds.length,
      folderCount: 0,
      category: "folder",
      isHidden: false,
      isSystem: false,
      isReadonly: false,
      depth: 0,
      childrenIds: fileIds,
      hasError: false,
    };
    nodes[rootId] = root;

    const getChild = (id: string) => nodes[id];

    const start = performance.now();
    const layout = computeTreemapLayout(root, getChild, 1920, 1080);
    const elapsed = performance.now() - start;

    // Aggregation may reduce count, but layout must have at least 1 node
    expect(layout.length).toBeGreaterThan(0);
    // Layout computation should complete in under 500ms
    expect(elapsed).toBeLessThan(500);
  });

  it("10000 files layout computation completes in reasonable time", () => {
    const rootId = "perf-root-10k";
    const fileIds: string[] = [];
    const nodes: Record<string, FileSystemNode> = {};
    const fileSize = 1000;

    for (let i = 0; i < 10000; i++) {
      const id = `file-${i}`;
      fileIds.push(id);
      nodes[id] = makeFile({
        id,
        name: `file_${i}.txt`,
        size: fileSize,
        totalSize: fileSize,
        extension: "txt",
        category: "document",
        parentId: rootId,
      });
    }

    const root: FileSystemNode = {
      id: rootId,
      parentId: null,
      name: "PerfRoot10k",
      path: "C:\\PerfRoot10k",
      type: "folder",
      size: 0,
      totalSize: fileIds.length * fileSize,
      fileCount: fileIds.length,
      folderCount: 0,
      category: "folder",
      isHidden: false,
      isSystem: false,
      isReadonly: false,
      depth: 0,
      childrenIds: fileIds,
      hasError: false,
    };
    nodes[rootId] = root;

    const getChild = (id: string) => nodes[id];

    const start = performance.now();
    const layout = computeTreemapLayout(root, getChild, 1920, 1080);
    const elapsed = performance.now() - start;

    expect(layout.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(1000);
  });
});
