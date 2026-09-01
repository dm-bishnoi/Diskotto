"use client";

import * as React from "react";
import { XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  variant?: "error" | "warning";
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * ErrorState — Generic error display.
 * From SPEC.md: ErrorState component
 */
export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  variant = "error",
  actionLabel = "Try Again",
  onAction,
  className,
}: ErrorStateProps) {
  const Icon = variant === "error" ? XCircle : AlertCircle;
  const iconColor = variant === "error" ? "text-error" : "text-warning";

  return (
    <div
      className={cn(
        "flex-1 flex flex-col items-center justify-center px-md py-2xl text-center",
        className
      )}
      role="alert"
    >
      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-surface-elevated mb-md">
        <Icon className={cn("w-8 h-8", iconColor)} aria-hidden="true" />
      </div>
      <h2 className="text-h2 font-semibold text-text-primary mb-2">{title}</h2>
      <p className="text-body text-text-secondary max-w-md mb-lg">{description}</p>
      {onAction && (
        <Button variant={variant === "error" ? "destructive" : "default"} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
