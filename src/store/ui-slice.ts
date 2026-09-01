import { type StateCreator } from "zustand";
import type { DiskottoStoreFull } from "@/types/store";
import type { BrowserSupport } from "@/types/store";

/**
 * UI slice — manages theme, panels, sidebar, and browser support.
 * From architecture.md: State Layer with Zustand slice pattern.
 */
export interface UISlice {
  // UI state
  sidebarCollapsed: boolean;
  detailsPanelOpen: boolean;
  theme: "light" | "dark" | "system";

  // Browser support
  browserSupport: BrowserSupport;

  // Actions
  toggleSidebar: () => void;
  toggleDetailsPanel: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleTheme: () => void;
  setBrowserSupport: (support: BrowserSupport) => void;
}

export const createUISlice: StateCreator<
  DiskottoStoreFull,
  [],
  [],
  UISlice
> = (set) => ({
  // Initial state
  sidebarCollapsed: false,
  detailsPanelOpen: false,
  theme: "system",
  browserSupport: "full", // Default, updated on mount

  toggleSidebar: () =>
    set((state) => ({
      sidebarCollapsed: !state.sidebarCollapsed,
    })),

  toggleDetailsPanel: () =>
    set((state) => ({
      detailsPanelOpen: !state.detailsPanelOpen,
    })),

  setTheme: (theme) =>
    set(() => ({
      theme,
    })),

  toggleTheme: () =>
    set((state) => {
      const order: Array<"light" | "dark" | "system"> = [
        "light",
        "dark",
        "system",
      ];
      const current = order.indexOf(state.theme);
      const next = order[(current + 1) % order.length];
      return { theme: next };
    }),

  setBrowserSupport: (support) =>
    set(() => ({
      browserSupport: support,
    })),
});
