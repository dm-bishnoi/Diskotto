"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/**
 * MobileNav — Bottom sheet / drawer for mobile.
 * From SPEC.md: Mobile bottom sheet
 */
export function MobileNav({ isOpen, onClose, title, children }: MobileNavProps) {
  // Lock body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer / Bottom Sheet */}
      <div
        className={cn(
          "absolute bg-surface shadow-xl flex flex-col overflow-hidden",
          "inset-x-0 bottom-0 max-h-[80vh] rounded-t-lg",
          "animate-slide-up"
        )}
      >
        {/* Drag handle */}
        <div className="flex items-center justify-center py-2 shrink-0">
          <div className="w-12 h-1 bg-border-strong rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
            <h2 className="text-h4 font-semibold text-text-primary">{title}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
