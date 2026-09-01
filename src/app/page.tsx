"use client";

import { EmptyState } from "@/components/states/empty-state";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <EmptyState
      variant="no-scan"
      theme={resolvedTheme as "light" | "dark"}
    />
  );
}
