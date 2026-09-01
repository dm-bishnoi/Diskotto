import MiniSearch from "minisearch";
import type { FileSystemNode, SearchResult } from "@/types/filesystem";
import { SEARCH_FUZZY_THRESHOLD } from "./constants";

/**
 * Search service using minisearch.
 *
 * Boundary established per ADR-006: the search index lives OUTSIDE the Zustand
 * store. The store holds the canonical filesystem tree; the index is a derived
 * view used only for fast queries.
 *
 * Phase 1 establishes the interface and a functional implementation.
 * The full search UI / virtualization / filter integration lands in Phase 5.
 */
export interface SearchService {
  addNodes: (nodes: FileSystemNode[]) => void;
  search: (query: string) => SearchResult[];
  clear: () => void;
  size: () => number;
}

class MiniSearchService implements SearchService {
  private index: MiniSearch<FileSystemNode>;

  constructor() {
    this.index = new MiniSearch<FileSystemNode>({
      fields: ["name", "path", "extension"],
      storeFields: ["id", "name", "path", "type", "size", "category"],
      searchOptions: {
        boost: { name: 2, extension: 1.5 },
        fuzzy: SEARCH_FUZZY_THRESHOLD,
        prefix: true,
      },
    });
  }

  addNodes(nodes: FileSystemNode[]): void {
    if (nodes.length === 0) return;
    this.index.addAll(nodes);
  }

  search(query: string): SearchResult[] {
    if (!query.trim()) return [];

    const results = this.index.search(query);
    return results.map((result) => {
      const stored = this.index.getStoredFields(result.id) as unknown as FileSystemNode;
      const matchKeys = Object.keys(result.match ?? {});
      const matchType: "name" | "path" | "extension" = matchKeys.includes("name")
        ? "name"
        : matchKeys.includes("path")
          ? "path"
          : "extension";
      return {
        node: stored,
        matchType,
        matchPosition: 0,
        highlightedName: stored.name,
        score: result.score,
      };
    });
  }

  clear(): void {
    this.index.removeAll();
  }

  size(): number {
    return this.index.documentCount;
  }
}

// Singleton instance — lives outside the store per ADR-006
export const searchService: SearchService = new MiniSearchService();
