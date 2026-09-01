"use client";

import * as React from "react";
import { HardDrive, Settings, Sun, Moon, Monitor, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search/search-bar";
import { ScanButton } from "@/components/scan/scan-button";
import { useDiskottoStore } from "@/store";
import { searchService } from "@/lib/search-index";
import type { SearchResult } from "@/types/filesystem";

interface HeaderProps {
  onSelectFolder?: () => void;
  onMenuClick?: () => void;
}

/**
 * Header — Top navigation bar with global controls.
 * From SPEC.md: Header component
 */
export function Header({ onSelectFolder, onMenuClick }: HeaderProps) {
  const { theme, toggleTheme, scanStatus, searchQuery, setSearchResults } = useDiskottoStore();

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  // Compute search results on query change (mocked against pre-loaded index)
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const found = searchService.search(searchQuery);
      setResults(found);
      setSearchResults(found);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, setSearchResults]);

  const handleResultSelect = (result: SearchResult) => {
    if (result.node.type === "folder") {
      // Navigate to the folder
      // Phase 2: just select for now, drill-down in Phase 4
    }
  };

  return (
    <header className="h-14 shrink-0 border-b border-border bg-surface flex items-center px-md gap-sm">
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="md:hidden shrink-0"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Logo */}
      <div className="flex items-center gap-2 font-semibold text-h4 text-text-primary shrink-0">
        <HardDrive className="w-5 h-5 text-primary" aria-hidden="true" />
        <span className="hidden sm:inline">Diskotto</span>
      </div>

      {/* Search */}
      <div className="flex-1 min-w-0 flex justify-center px-2">
        <SearchBar
          results={results}
          isSearching={isSearching}
          onResultSelect={handleResultSelect}
          className="w-full"
        />
      </div>

      {/* Scan button */}
      <ScanButton
        onSelectFolder={onSelectFolder}
        isScanning={scanStatus === "scanning"}
        className="shrink-0"
      />

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="shrink-0"
      >
        <ThemeIcon className="w-5 h-5" />
      </Button>

      {/* Settings placeholder */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Settings"
        className="shrink-0"
      >
        <Settings className="w-5 h-5" />
      </Button>
    </header>
  );
}
