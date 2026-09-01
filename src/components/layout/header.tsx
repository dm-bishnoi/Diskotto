"use client";

import { HardDrive, Search, Settings, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDiskottoStore } from "@/store";

/**
 * Header — Top navigation bar with global controls.
 * From SPEC.md: Header component
 *
 * Phase 1 establishes the layout and theme toggle.
 * Scan button and search are wired to the store (real functionality in Phase 4/5).
 */
export function Header() {
  const { theme, toggleTheme, scanStatus } = useDiskottoStore();

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <header className="h-14 shrink-0 border-b border-border bg-surface flex items-center px-md gap-sm">
      {/* Logo */}
      <div className="flex items-center gap-2 font-semibold text-h4 text-text-primary">
        <HardDrive className="w-5 h-5 text-primary" />
        <span>Diskotto</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search placeholder — full search lands in Phase 5 */}
      <div className="hidden md:flex items-center gap-2 text-body-sm text-text-muted">
        <Search className="w-4 h-4" />
        <span>Search files...</span>
        <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-border bg-surface-elevated px-1.5 font-mono text-[10px] font-medium">
          <span>/</span>
        </kbd>
      </div>

      {/* Scan button — Phase 4 implements real scan */}
      <Button
        variant={scanStatus === "scanning" ? "outline" : "default"}
        size="sm"
        disabled={scanStatus === "scanning"}
      >
        {scanStatus === "scanning" ? "Scanning..." : "Select Folder"}
      </Button>

      {/* Theme toggle */}
      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
        <ThemeIcon className="w-5 h-5" />
      </Button>

      {/* Settings placeholder — Phase 2+ */}
      <Button variant="ghost" size="icon" aria-label="Settings">
        <Settings className="w-5 h-5" />
      </Button>
    </header>
  );
}
