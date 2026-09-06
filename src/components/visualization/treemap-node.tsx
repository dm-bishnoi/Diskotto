"use client";

import * as React from "react";
import { formatBytesShort, formatBytes } from "@/lib/utils";
import { getCategoryColor } from "@/lib/file-utils";
import { getLabelVisibility } from "@/lib/treemap-utils";
import type { TreemapNode } from "@/types/filesystem";

interface TreemapNodeRectProps {
  node: TreemapNode;
  nodeId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isHovered: boolean;
  theme: "light" | "dark";
  onHover: (e: React.MouseEvent) => void;
  onClick: () => void;
  onDoubleClick: () => void;
}

/**
 * TreemapNode — Individual box within the treemap.
 * From SPEC.md: TreemapNode component
 */
export function TreemapNodeRect({
  node,
  nodeId: _nodeId,
  x,
  y,
  width,
  height,
  isHovered,
  theme,
  onHover,
  onClick,
  onDoubleClick,
}: TreemapNodeRectProps) {
  const color = getCategoryColor(node.category as Parameters<typeof getCategoryColor>[0], theme);
  const textColor = theme === "dark" ? "#fafafa" : "#171717";

  // Determine label visibility using area-aware logic
  const labelInfo = getLabelVisibility(width, height, node.name);
  const showLabel = labelInfo.showName;
  const showSize = labelInfo.showSize;
  const displayName = labelInfo.displayName;

  // Calculate text positions
  const labelY = showSize ? height / 2 - 8 : height / 2;
  const sizeY = height / 2 + 6;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <g
      role="treeitem"
      aria-label={`${node.name}, ${formatBytes(node.value)}, ${node.category}`}
      tabIndex={0}
      onMouseEnter={onHover}
      onMouseMove={onHover}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onKeyDown={handleKeyDown}
      className="cursor-pointer"
    >
      {/* Background rect */}
      <rect
        x={x + 1}
        y={y + 1}
        width={Math.max(0, width - 2)}
        height={Math.max(0, height - 2)}
        fill={color}
        rx={3}
        ry={3}
        opacity={0.9}
        className="transition-all duration-150"
        style={{
          stroke: isHovered ? (theme === "dark" ? "#ffffff" : "#000000") : "transparent",
          strokeWidth: isHovered ? 2 : 0,
        }}
      />

      {/* Label text */}
      {showLabel && (
        <text
          x={x + width / 2}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={textColor}
          fontSize={12}
          fontWeight={500}
          fontFamily="Inter, system-ui, sans-serif"
          pointerEvents="none"
          style={{
            opacity: isHovered ? 1 : 0.95,
            transition: "opacity 150ms",
          }}
        >
          {displayName}
        </text>
      )}

      {/* Size text */}
      {showSize && (
        <text
          x={x + width / 2}
          y={sizeY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={textColor}
          fontSize={10}
          fontWeight={400}
          fontFamily="JetBrains Mono, monospace"
          pointerEvents="none"
          style={{
            opacity: isHovered ? 0.9 : 0.8,
            transition: "opacity 150ms",
          }}
        >
          {formatBytesShort(node.value)}
        </text>
      )}

      {/* Hidden accessible text */}
      <title>{`${node.name} - ${formatBytes(node.value)}`}</title>
    </g>
  );
}
