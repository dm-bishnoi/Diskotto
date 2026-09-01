"use client";

import * as React from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PermissionStateProps {
  status: "idle" | "requesting" | "denied";
  onRequestPermission?: () => void;
  onRetry?: () => void;
  className?: string;
}

/**
 * PermissionState — Permission request and error handling.
 * From SPEC.md: PermissionState component
 */
export function PermissionState({
  status,
  onRequestPermission,
  onRetry,
  className,
}: PermissionStateProps) {
  if (status === "idle") return null;

  return (
    <div
      className={`flex-1 flex flex-col items-center justify-center px-md py-2xl text-center ${className ?? ""}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-surface-elevated mb-md">
        <Lock className="w-8 h-8 text-text-secondary" aria-hidden="true" />
      </div>

      <h2 className="text-h2 font-semibold text-text-primary mb-2">
        {status === "requesting" ? "Requesting Permission..." : "Permission Required"}
      </h2>

      <p className="text-body text-text-secondary max-w-md mb-lg">
        {status === "requesting"
          ? "Please grant permission to access your folder."
          : "Diskotto needs access to your folder to analyze it. Click below to grant permission again."}
      </p>

      <div className="bg-surface-elevated rounded-lg px-4 py-3 mb-lg max-w-md">
        <p className="text-body-sm text-text-muted">
          <strong className="text-text-primary">Why this is needed:</strong> To read
          folder structure and file metadata (not file contents). All processing happens
          locally on your device.
        </p>
      </div>

      {(status === "denied") && (
        <Button
          variant="default"
          onClick={onRetry ?? onRequestPermission}
          aria-label="Grant folder access permission"
        >
          Grant Permission
        </Button>
      )}

      {status === "requesting" && (
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      )}
    </div>
  );
}
