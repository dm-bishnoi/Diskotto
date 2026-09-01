import type { FileCategory } from "@/types/filesystem";

// File category mapping - from data-model.md
const FILE_CATEGORIES: Record<Exclude<FileCategory, "folder" | "other">, string[]> = {
  video: [
    "mp4", "mkv", "avi", "mov", "wmv", "flv", "webm",
    "m4v", "mpg", "mpeg", "3gp", "ts", "vob",
  ],
  image: [
    "jpg", "jpeg", "png", "gif", "webp", "svg", "bmp",
    "ico", "tiff", "tif", "heic", "heif", "raw", "psd",
  ],
  audio: [
    "mp3", "wav", "flac", "aac", "ogg", "wma", "m4a",
    "opus", "aiff", "alac",
  ],
  document: [
    "pdf", "doc", "docx", "txt", "rtf", "odt", "pages",
    "md", "epub", "mobi", "azw", "azw3", "fb2",
  ],
  archive: [
    "zip", "rar", "7z", "tar", "gz", "bz2", "xz",
    "iso", "dmg", "pkg", "deb", "rpm",
  ],
  application: [
    "exe", "msi", "app", "apk", "ipa", "jar", "bat",
    "sh", "command",
  ],
  code: [
    "js", "jsx", "ts", "tsx", "py", "java", "c", "cpp",
    "cs", "go", "rs", "php", "rb", "swift", "kt", "m",
    "h", "html", "css", "scss", "sass", "less", "json",
    "xml", "yml", "yaml", "toml", "sql", "sh", "ps1",
  ],
  system: [
    "dll", "sys", "ini", "log", "tmp", "bak", "dat",
    "bin", "so", "dylib", "cab",
  ],
};

// Compound extensions (check before single extensions) - from data-model.md
const COMPOUND_EXTENSIONS: Record<string, FileCategory> = {
  "tar.gz": "archive",
  "tar.bz2": "archive",
  "tar.xz": "archive",
  "tar.lz": "archive",
};

/**
 * Detect the category of a file from its filename.
 * From data-model.md
 *
 * Priority: compound extensions > ambiguous single extensions > standard categories
 * Note: "ts" appears in both video (MPEG transport stream) and code (TypeScript).
 * Code takes precedence since .ts files are more common than .ts video files.
 */
export function getFileCategory(fileName: string): FileCategory {
  const lower = fileName.toLowerCase();

  // Check compound extensions first (e.g., .tar.gz)
  for (const [ext, category] of Object.entries(COMPOUND_EXTENSIONS)) {
    if (lower.endsWith("." + ext)) return category;
  }

  // Then check single extension
  const ext = lower.split(".").pop();
  if (!ext) return "other";

  // Check code category FIRST for ambiguous extensions
  // "ts" is both video (MPEG-TS) and code (TypeScript) — code is more common
  if (FILE_CATEGORIES.code.includes(ext)) return "code";

  // Then check all other categories
  for (const [category, extensions] of Object.entries(FILE_CATEGORIES)) {
    // Skip code (already checked above)
    if (category === "code") continue;
    if (extensions.includes(ext)) {
      return category as FileCategory;
    }
  }
  return "other";
}

/**
 * Extract the file extension from a filename.
 * From data-model.md
 */
export function getExtension(fileName: string): string | undefined {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1 || lastDot === 0) return undefined;
  return fileName.substring(lastDot + 1).toLowerCase();
}

/**
 * Get the color for a file category.
 * From design-system.md
 */
export function getCategoryColor(category: FileCategory, theme: "light" | "dark" = "light"): string {
  const colors: Record<FileCategory, { light: string; dark: string }> = {
    video: { light: "#8B5CF6", dark: "#A78BFA" },
    image: { light: "#EC4899", dark: "#F472B6" },
    audio: { light: "#F97316", dark: "#FB923C" },
    document: { light: "#3B82F6", dark: "#60A5FA" },
    archive: { light: "#EAB308", dark: "#FACC15" },
    application: { light: "#10B981", dark: "#34D399" },
    code: { light: "#06B6D4", dark: "#22D3EE" },
    system: { light: "#6366F1", dark: "#818CF8" },
    folder: { light: "#78716C", dark: "#A8A29E" },
    other: { light: "#9CA3AF", dark: "#9CA3AF" },
  };

  return colors[category][theme];
}
