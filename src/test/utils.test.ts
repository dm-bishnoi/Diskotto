import { describe, it, expect } from "vitest";
import {
  formatBytes,
  formatBytesShort,
  formatPercentage,
  formatDate,
  formatRelativeTime,
  generateId,
  truncate,
} from "@/lib/utils";

describe("formatBytes", () => {
  it("formats zero", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats kilobytes", () => {
    expect(formatBytes(1024)).toBe("1 KB");
  });

  it("formats megabytes", () => {
    expect(formatBytes(1024 * 1024)).toBe("1 MB");
  });

  it("formats gigabytes", () => {
    expect(formatBytes(1024 ** 3)).toBe("1 GB");
  });

  it("formats terabytes", () => {
    expect(formatBytes(1024 ** 4)).toBe("1 TB");
  });

  it("respects decimal precision", () => {
    expect(formatBytes(1536, 0)).toBe("2 KB");
    expect(formatBytes(1536, 3)).toBe("1.5 KB");
  });
});

describe("formatBytesShort", () => {
  it("formats with one decimal place", () => {
    expect(formatBytesShort(1024 * 1024 * 1024)).toBe("1.0G");
  });
});

describe("formatPercentage", () => {
  it("returns 0% for zero total", () => {
    expect(formatPercentage(10, 0)).toBe("0%");
  });

  it("calculates percentage", () => {
    expect(formatPercentage(50, 200)).toBe("25.0%");
  });
});

describe("formatDate", () => {
  it("returns Unknown for undefined", () => {
    expect(formatDate(undefined)).toBe("Unknown");
  });

  it("formats a date", () => {
    const result = formatDate(new Date("2026-08-15"));
    expect(result).toContain("2026");
  });
});

describe("formatRelativeTime", () => {
  it("returns Today for same day", () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe("Today");
  });
});

describe("generateId", () => {
  it("returns a non-empty string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("returns unique values", () => {
    const ids = new Set([generateId(), generateId(), generateId()]);
    expect(ids.size).toBe(3);
  });
});

describe("truncate", () => {
  it("does not truncate short strings", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates with ellipsis", () => {
    expect(truncate("hello world", 5)).toBe("hell…");
  });
});
