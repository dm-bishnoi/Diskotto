"use client";

import * as React from "react";
import { ChevronRight, Copy, Check } from "lucide-react";
import { useDiskottoStore } from "@/store";
import { cn } from "@/lib/utils";

/**
 * Breadcrumb — Path navigation with truncation and copy functionality.
 * From SPEC.md: Breadcrumb component
 */
export function Breadcrumb() {
  const { nodes, rootId, currentPath, setCurrentPath } = useDiskottoStore();
  const [copied, setCopied] = React.useState(false);

  // Build the full breadcrumb chain from root to current
    // Build breadcrumb chain from root to current.
    const pathNodes = React.useMemo(() => {
      const chain: typeof nodes[keyof typeof nodes][] = [];
      if (rootId) chain.push(nodes[rootId]);
      currentPath.forEach(id => {
        const node = nodes[id];
        if (node) chain.push(node);
      });
      return chain;
    }, [nodes, rootId, currentPath]);

  const fullPath = pathNodes.map((n) => n.path).join("\\").replace(/^\\+|\\+$/g, "") || "C:\\";

  const handleNavigate = (index: number) => {
    if (index === 0) {
      setCurrentPath([]);
    } else {
      setCurrentPath(currentPath.slice(0, index));
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullPath);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback: do nothing
    }
  };

  if (pathNodes.length === 0) {
    return null;
  }

  return (
    <nav
      className="h-10 shrink-0 border-b border-border bg-surface flex items-center px-md gap-1"
      aria-label="Path breadcrumb"
    >
      <div className="flex-1 min-w-0 overflow-x-auto flex items-center gap-1 text-body-sm">
        {pathNodes.map((node, index) => {
          const isLast = index === pathNodes.length - 1;
          const isRoot = index === 0;
          return (
            <React.Fragment key={`${node.id}-${index}`}>
              {!isRoot && (
                <ChevronRight
                  className="w-3.5 h-3.5 text-text-muted shrink-0"
                  aria-hidden="true"
                />
              )}
              <button
                type="button"
                onClick={() => handleNavigate(index)}
                className={cn(
                  "shrink-0 px-1.5 py-0.5 rounded-sm transition-colors truncate max-w-[200px]",
                  isLast
                    ? "text-text-primary font-medium cursor-default"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                )}
                aria-current={isLast ? "page" : undefined}
                title={node.path}
              >
                {isRoot ? node.name : node.name}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 inline-flex items-center gap-1 px-2 py-1 text-body-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-sm transition-colors"
        aria-label={copied ? "Path copied" : "Copy full path"}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-success" />
            <span className="text-success">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Copy path</span>
          </>
        )}
      </button>
    </nav>
  );
}
