import { describe, it, expect } from "vitest";
import { getFileCategory, getExtension, getCategoryColor } from "@/lib/file-utils";

describe("getFileCategory", () => {
  it("detects video files", () => {
    expect(getFileCategory("movie.mp4")).toBe("video");
    expect(getFileCategory("recording.MKV")).toBe("video");
    expect(getFileCategory("clip.avi")).toBe("video");
  });

  it("detects image files", () => {
    expect(getFileCategory("photo.jpg")).toBe("image");
    expect(getFileCategory("art.png")).toBe("image");
    expect(getFileCategory("anim.gif")).toBe("image");
  });

  it("detects audio files", () => {
    expect(getFileCategory("song.mp3")).toBe("audio");
    expect(getFileCategory("voice.wav")).toBe("audio");
  });

  it("detects document files", () => {
    expect(getFileCategory("paper.pdf")).toBe("document");
    expect(getFileCategory("notes.txt")).toBe("document");
  });

  it("detects archive files", () => {
    expect(getFileCategory("backup.zip")).toBe("archive");
    expect(getFileCategory("data.tar.gz")).toBe("archive");
  });

  it("detects code files", () => {
    expect(getFileCategory("app.ts")).toBe("code");
    expect(getFileCategory("script.py")).toBe("code");
  });

  it("returns other for unknown extensions", () => {
    expect(getFileCategory("weird.xyz")).toBe("other");
    expect(getFileCategory("noext")).toBe("other");
  });
});

describe("getExtension", () => {
  it("extracts simple extension", () => {
    expect(getExtension("file.txt")).toBe("txt");
  });

  it("returns lowercase", () => {
    expect(getExtension("FILE.TXT")).toBe("txt");
  });

  it("returns undefined for no extension", () => {
    expect(getExtension("noext")).toBeUndefined();
  });

  it("returns undefined for hidden files", () => {
    expect(getExtension(".gitignore")).toBeUndefined();
  });
});

describe("getCategoryColor", () => {
  it("returns a hex color for light theme", () => {
    const color = getCategoryColor("video", "light");
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it("returns a hex color for dark theme", () => {
    const color = getCategoryColor("video", "dark");
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});
