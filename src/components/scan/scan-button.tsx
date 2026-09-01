"use client";

import * as React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScanButtonProps {
  onSelectFolder?: () => void;
  isScanning?: boolean;
  className?: string;
}

/**
 * ScanButton — Folder picker trigger button.
 * From SPEC.md: Scan button placeholder (real scan in Phase 4).
 */
export function ScanButton({ onSelectFolder, isScanning = false, className }: ScanButtonProps) {
  const handleClick = () => {
    onSelectFolder?.();
  };

  return (
    <Button
      variant={isScanning ? "outline" : "default"}
      size="sm"
      onClick={handleClick}
      disabled={isScanning}
      className={className}
      aria-label={isScanning ? "Scanning in progress" : "Select folder to scan"}
    >
      {isScanning ? (
        <>
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Scanning...
        </>
      ) : (
        <>
          <FolderOpen className="w-4 h-4" />
          Select Folder
        </>
      )}
    </Button>
  );
}
