"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Header } from "./header";
import { StatusBar } from "./status-bar";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * AppShell — Container component managing global layout, theme, and responsive breakpoints.
 * From SPEC.md: AppShell is the root layout container.
 *
 * Phase 2 adds the sidebar toggle and mobile menu support.
 */
export interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  // Mobile nav state is held at the AppShell level to coordinate the drawer
  // and header menu button. Kept here for future Phase 3 mobile polish.
  const [, setMobileNavOpen] = React.useState(false);

  return (
    <TooltipProvider>
      <div
        className={cn(
          "min-h-screen w-full bg-background text-text-primary",
          "flex flex-col",
          className
        )}
      >
        <Header onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
        <StatusBar />
      </div>
    </TooltipProvider>
  );
}
