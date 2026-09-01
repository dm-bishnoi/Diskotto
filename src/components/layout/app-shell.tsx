"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Header } from "./header";
import { StatusBar } from "./status-bar";

/**
 * AppShell — Container component managing global layout, theme, and responsive breakpoints.
 * From SPEC.md: AppShell is the root layout container.
 *
 * Phase 1 establishes the layout boundary with the 3-pane structure
 * (header, breadcrumb, main, status bar). Specific components land in Phase 2.
 */
export interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen w-full bg-background text-text-primary",
        "flex flex-col",
        className
      )}
    >
      <Header />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
      <StatusBar />
    </div>
  );
}
