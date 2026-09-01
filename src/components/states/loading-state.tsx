"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  title?: string;
  description?: string;
  className?: string;
}

/**
 * LoadingState — Generic loading indicator.
 * From SPEC.md: LoadingState component
 */
export function LoadingState({
  title = "Loading...",
  description,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex-1 flex flex-col items-center justify-center px-md py-2xl text-center",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-surface-elevated mb-md">
        <Loader2 className="w-6 h-6 text-primary animate-spin" aria-hidden="true" />
      </div>
      <p className="text-body font-medium text-text-primary">{title}</p>
      {description && (
        <p className="text-body-sm text-text-muted mt-1 max-w-md">{description}</p>
      )}
    </div>
  );
}
