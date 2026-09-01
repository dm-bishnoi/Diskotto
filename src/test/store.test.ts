import { describe, it, expect, beforeEach } from "vitest";
import { useDiskottoStore } from "@/store";
import type { FileSystemNode } from "@/types/filesystem";

describe("useDiskottoStore", () => {
  beforeEach(() => {
    // Reset state before each test
    useDiskottoStore.getState().resetScan();
    useDiskottoStore.setState({
      currentPath: [],
      selectedNodeId: null,
      expandedFolders: new Set(),
      searchQuery: "",
      searchResults: [],
      activeFilters: {
        sizeFilters: [],
        typeFilters: [],
        dateFilters: [],
      },
      sidebarCollapsed: false,
      detailsPanelOpen: false,
      theme: "system",
      browserSupport: "full",
    });
  });

  describe("scan slice", () => {
    it("initializes with empty nodes", () => {
      expect(Object.keys(useDiskottoStore.getState().nodes).length).toBe(0);
      expect(useDiskottoStore.getState().rootId).toBe(null);
    });

    it("initializes with idle scan status", () => {
      expect(useDiskottoStore.getState().scanStatus).toBe("idle");
    });

    it("adds nodes using Record spread (not Map)", () => {
      const node1: FileSystemNode = {
        id: "1",
        parentId: null,
        name: "Downloads",
        path: "/Downloads",
        type: "folder",
        size: 0,
        totalSize: 1000,
        fileCount: 5,
        folderCount: 0,
        isHidden: false,
        isSystem: false,
        isReadonly: false,
        depth: 0,
        childrenIds: [],
        hasError: false,
      };
      const node2: FileSystemNode = { ...node1, id: "2", name: "Documents" };

      useDiskottoStore.getState().addNodes([node1, node2]);

      const nodes = useDiskottoStore.getState().nodes;
      expect(Object.keys(nodes).length).toBe(2);
      expect(nodes["1"].name).toBe("Downloads");
      expect(nodes["2"].name).toBe("Documents");
    });

    it("creates new object reference on addNodes (immutability for Zustand shallow equality)", () => {
      const before = useDiskottoStore.getState().nodes;
      useDiskottoStore.getState().addNodes([{
        id: "x",
        parentId: null,
        name: "test",
        path: "/test",
        type: "file",
        size: 100,
        totalSize: 100,
        fileCount: 1,
        folderCount: 0,
        isHidden: false,
        isSystem: false,
        isReadonly: false,
        depth: 0,
        childrenIds: [],
        hasError: false,
      }]);
      const after = useDiskottoStore.getState().nodes;
      expect(before).not.toBe(after); // Different reference
    });

    it("resets scan state", () => {
      useDiskottoStore.getState().addNodes([{
        id: "1", parentId: null, name: "x", path: "/x", type: "file",
        size: 1, totalSize: 1, fileCount: 1, folderCount: 0,
        isHidden: false, isSystem: false, isReadonly: false, depth: 0,
        childrenIds: [], hasError: false,
      }]);
      useDiskottoStore.getState().resetScan();
      expect(Object.keys(useDiskottoStore.getState().nodes).length).toBe(0);
      expect(useDiskottoStore.getState().scanStatus).toBe("idle");
    });
  });

  describe("navigation slice", () => {
    it("drills down into a folder", () => {
      useDiskottoStore.getState().drillDown("folder-1");
      expect(useDiskottoStore.getState().currentPath).toEqual(["folder-1"]);
      expect(useDiskottoStore.getState().selectedNodeId).toBe("folder-1");
    });

    it("navigates up", () => {
      useDiskottoStore.getState().drillDown("a");
      useDiskottoStore.getState().drillDown("b");
      useDiskottoStore.getState().navigateUp();
      expect(useDiskottoStore.getState().currentPath).toEqual(["a"]);
    });

    it("does not navigate up from root", () => {
      useDiskottoStore.getState().drillDown("a");
      useDiskottoStore.getState().navigateUp();
      expect(useDiskottoStore.getState().currentPath).toEqual(["a"]);
    });

    it("toggles folder expansion", () => {
      useDiskottoStore.getState().toggleFolder("a");
      expect(useDiskottoStore.getState().expandedFolders.has("a")).toBe(true);
      useDiskottoStore.getState().toggleFolder("a");
      expect(useDiskottoStore.getState().expandedFolders.has("a")).toBe(false);
    });
  });

  describe("ui slice", () => {
    it("toggles sidebar", () => {
      const before = useDiskottoStore.getState().sidebarCollapsed;
      useDiskottoStore.getState().toggleSidebar();
      expect(useDiskottoStore.getState().sidebarCollapsed).toBe(!before);
    });

    it("cycles theme", () => {
      useDiskottoStore.setState({ theme: "light" });
      useDiskottoStore.getState().toggleTheme();
      expect(useDiskottoStore.getState().theme).toBe("dark");
      useDiskottoStore.getState().toggleTheme();
      expect(useDiskottoStore.getState().theme).toBe("system");
      useDiskottoStore.getState().toggleTheme();
      expect(useDiskottoStore.getState().theme).toBe("light");
    });
  });

  describe("search slice", () => {
    it("updates search query", () => {
      useDiskottoStore.getState().setSearchQuery("hello");
      expect(useDiskottoStore.getState().searchQuery).toBe("hello");
    });

    it("clears search", () => {
      useDiskottoStore.getState().setSearchQuery("hello");
      useDiskottoStore.getState().clearSearch();
      expect(useDiskottoStore.getState().searchQuery).toBe("");
    });

    it("updates filters", () => {
      useDiskottoStore.getState().setFilters({ sizeFilters: [">1GB"] });
      expect(useDiskottoStore.getState().activeFilters.sizeFilters).toEqual([">1GB"]);
    });
  });
});
