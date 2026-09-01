"use client";

import { FolderOpen, SearchX, Lock, AlertCircle, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * EmptyState — Placeholder when no data is available.
 * From SPEC.md: EmptyState component
 *
 * Supports variants:
 * - no-scan: initial state, no folder selected
 * - no-results: search returned nothing
 * - no-permission: permission denied
 * - error: general error
 */
export type EmptyStateVariant =
  | "no-scan"
  | "no-results"
  | "no-permission"
  | "error";

export interface EmptyStateProps {
  variant: EmptyStateVariant;
  theme?: "light" | "dark";
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const VARIANT_CONFIG: Record<
  EmptyStateVariant,
  {
    icon: typeof FolderOpen;
    defaultTitle: string;
    defaultDescription: string;
    defaultAction: string;
  }
> = {
  "no-scan": {
    icon: FolderOpen,
    defaultTitle: "No folder selected yet",
    defaultDescription:
      "Select a folder to analyze your storage usage. Your data stays on your device — nothing is uploaded.",
    defaultAction: "Select Folder",
  },
  "no-results": {
    icon: SearchX,
    defaultTitle: "No results found",
    defaultDescription: "Try a different search query or adjust your filters.",
    defaultAction: "Clear Search",
  },
  "no-permission": {
    icon: Lock,
    defaultTitle: "Permission Required",
    defaultDescription:
      "Diskotto needs access to your folder to analyze it. Click below to grant permission again.",
    defaultAction: "Grant Permission",
  },
  error: {
    icon: AlertCircle,
    defaultTitle: "Something went wrong",
    defaultDescription:
      "An unexpected error occurred. Please try again or report this issue.",
    defaultAction: "Try Again",
  },
};

export function EmptyState({
  variant,
  theme: _theme,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex-1 flex flex-col items-center justify-center",
        "px-md py-2xl text-center",
        className
      )}
      data-testid={`empty-state-${variant}`}
    >
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-md",
          "bg-surface-elevated"
        )}
      >
        <Icon className="w-8 h-8 text-text-secondary" />
      </div>

      <h2 className="text-h2 font-semibold text-text-primary mb-2">
        {title ?? config.defaultTitle}
      </h2>

      <p className="text-body text-text-secondary max-w-md mb-lg">
        {description ?? config.defaultDescription}
      </p>

      {variant === "no-scan" && (
        <div className="mt-sm flex items-center gap-2 text-body-sm text-text-muted">
          <HardDrive className="w-4 h-4" />
          <span>Supports: Local folders, USB drives, cloud drives (when mounted locally)</span>
        </div>
      )}

      {onAction && (
        <Button
          variant={variant === "error" ? "destructive" : "default"}
          onClick={onAction}
          className="mt-lg"
        >
          {actionLabel ?? config.defaultAction}
        </Button>
      )}
    </div>
  );
}
