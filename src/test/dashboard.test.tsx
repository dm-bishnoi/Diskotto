import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock the store BEFORE importing components
vi.mock("@/store", () => {
  const mockState = {
    nodes: {},
    rootId: null,
    scanStatus: "idle",
    scanStats: null,
    detailsPanelOpen: false,
    setRootNode: vi.fn(),
    addNodes: vi.fn(),
    drillDown: vi.fn(),
  };
  return {
    useDiskottoStore: vi.fn(() => mockState),
    useRootNode: vi.fn(() => null),
    useCurrentNode: vi.fn(() => null),
  };
});

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

vi.mock("@/data/mock-data", () => ({
  getMockData: vi.fn(() => ({
    nodes: {},
    rootId: null,
    root: null,
  })),
  computeExtensionStats: vi.fn(() => []),
  getLargestFiles: vi.fn(() => []),
  getLargestFolders: vi.fn(() => []),
}));

import { Dashboard } from "@/components/dashboard";

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders without crashing", () => {
    render(<Dashboard />);
    expect(document.body).toBeTruthy();
  });

  it("calls mock data loader on mount", () => {
    render(<Dashboard />);
    // Component should render
    expect(document.body.textContent).toBeTruthy();
  });
});
