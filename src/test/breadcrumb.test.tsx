import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import type { FileSystemNode } from "@/types/filesystem";

// Mock clipboard
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined),
};
Object.defineProperty(navigator, "clipboard", {
  value: mockClipboard,
  writable: true,
  configurable: true,
});

// Mock the store with a path chain
vi.mock("@/store", () => {
  const cDrive: FileSystemNode = {
    id: "c-drive",
    parentId: null,
    name: "C:\\",
    path: "C:\\",
    type: "drive",
    size: 0,
    totalSize: 500_000_000_000,
    fileCount: 0,
    folderCount: 1,
    isHidden: false,
    isSystem: false,
    isReadonly: false,
    depth: 0,
    childrenIds: ["users"],
    hasError: false,
  };

  const users: FileSystemNode = {
    id: "users",
    parentId: "c-drive",
    name: "Users",
    path: "C:\\Users",
    type: "folder",
    size: 0,
    totalSize: 200_000_000_000,
    fileCount: 0,
    folderCount: 1,
    isHidden: false,
    isSystem: false,
    isReadonly: false,
    depth: 1,
    childrenIds: ["dharmender"],
    hasError: false,
  };

  const dharmender: FileSystemNode = {
    id: "dharmender",
    parentId: "users",
    name: "Dharmender",
    path: "C:\\Users\\Dharmender",
    type: "folder",
    size: 0,
    totalSize: 100_000_000_000,
    fileCount: 0,
    folderCount: 1,
    isHidden: false,
    isSystem: false,
    isReadonly: false,
    depth: 2,
    childrenIds: ["downloads"],
    hasError: false,
  };

  const downloads: FileSystemNode = {
    id: "downloads",
    parentId: "dharmender",
    name: "Downloads",
    path: "C:\\Users\\Dharmender\\Downloads",
    type: "folder",
    size: 0,
    totalSize: 50_000_000_000,
    fileCount: 20,
    folderCount: 0,
    isHidden: false,
    isSystem: false,
    isReadonly: false,
    depth: 3,
    childrenIds: [],
    hasError: false,
  };

  const nodes: Record<string, FileSystemNode> = {
    "c-drive": cDrive,
    "users": users,
    "dharmender": dharmender,
    "downloads": downloads,
  };

  return {
    useDiskottoStore: vi.fn(() => ({
      nodes,
      rootId: "c-drive",
      currentPath: ["users", "dharmender", "downloads"],
      setCurrentPath: vi.fn(),
    })),
  };
});

describe("Breadcrumb", () => {
  it("renders all path segments", () => {
    render(<Breadcrumb />);
    expect(screen.getByText("C:\\")).toBeTruthy();
    expect(screen.getByText("Users")).toBeTruthy();
    expect(screen.getByText("Dharmender")).toBeTruthy();
    expect(screen.getByText("Downloads")).toBeTruthy();
  });

  it("renders the copy path button", () => {
    render(<Breadcrumb />);
    expect(screen.getByLabelText(/copy full path/i)).toBeTruthy();
  });

  it("renders with correct accessibility role", () => {
    render(<Breadcrumb />);
    const nav = screen.getByRole("navigation", { name: /path breadcrumb/i });
    expect(nav).toBeTruthy();
  });

  it("last item is marked as current page", () => {
    render(<Breadcrumb />);
    const lastButton = screen.getByRole("button", { current: "page" });
    expect(lastButton.textContent).toBe("Downloads");
  });

  it("has chevron separators between segments", () => {
    render(<Breadcrumb />);
    // Should have 3 chevrons (between 4 items)
    const chevrons = document.querySelectorAll('svg[class*="lucide-chevron-right"]');
    expect(chevrons.length).toBe(3);
  });
});
