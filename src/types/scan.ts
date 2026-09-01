// Scan status - from data-model.md
export type ScanStatus =
  | "idle" // Not started
  | "scanning" // Active scan
  | "cancelled" // Cancelled by user
  | "complete" // Successfully completed
  | "error"; // Failed with critical error

// Scan stats - from data-model.md
export interface ScanStats {
  filesScanned: number;
  foldersScanned: number;
  totalBytes: number;
  errorCount: number;
  startTime: number;
  endTime?: number;
  durationMs?: number;
}

// Scan error - from data-model.md
export interface ScanError {
  path: string;
  message: string;
  code: ErrorCode;
  timestamp: Date;
}

export type ErrorCode =
  | "PERMISSION_DENIED"
  | "FILE_INACCESSIBLE"
  | "INACCESSIBLE"
  | "UNKNOWN";

// Scan progress - from SPEC.md
export interface ScanProgress {
  status: ScanStatus;
  currentPath: string;
  filesScanned: number;
  foldersScanned: number;
  totalSize: number;
  percentage?: number; // If total can be estimated
  startedAt: Date;
  errorCount: number;
  errors: ScanError[];
}

// Error types - from architecture.md
export type ErrorType =
  | "permission-denied"
  | "browser-unsupported"
  | "scan-failed"
  | "scan-cancelled"
  | "partial-results"
  | "memory-limit"
  | "inaccessible-folder"
  | "unknown";
