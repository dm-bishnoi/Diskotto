/**
 * Mock filesystem data for Phase 2 UI development.
 *
 * All UI is built with this data — the real scanner lands in Phase 4.
 * This file is clearly isolated so it can be replaced when the real
 * FileSystemAccess API scanner is integrated.
 *
 * Data structure from: data-model.md
 */

import { generateId } from "@/lib/utils";
import { getFileCategory } from "@/lib/file-utils";
import type { FileSystemNode, FileCategory } from "@/types/filesystem";

// Helper to create a file node
function createFile(
  name: string,
  size: number,
  parentId: string,
  parentPath: string,
  modifiedAt?: Date,
  nodesMap?: Map<string, FileSystemNode>
): FileSystemNode {
  const extension = name.includes(".") ? name.split(".").pop()?.toLowerCase() : undefined;
  const category = getFileCategory(name);
  const node: FileSystemNode = {
    id: generateId(),
    parentId,
    name,
    path: `${parentPath}\\${name}`,
    type: "file",
    size,
    totalSize: size,
    fileCount: 1,
    folderCount: 0,
    extension,
    category,
    modifiedAt: modifiedAt ?? new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    isHidden: false,
    isSystem: false,
    isReadonly: false,
    depth: 0,
    childrenIds: [],
    hasError: false,
  };

  if (nodesMap) {
    nodesMap.set(node.id, node);
  }

  return node;
}

// Helper to create a folder node
function createFolder(
  name: string,
  parentId: string,
  parentPath: string,
  children: FileSystemNode[],
  modifiedAt?: Date,
  nodesMap?: Map<string, FileSystemNode>
): FileSystemNode {
  const folderId = generateId();
  const totalSize = children.reduce((sum, c) => sum + c.totalSize, 0);
  const fileCount = children.reduce((sum, c) => sum + c.fileCount, 0);
  const folderCount = children.filter(c => c.type === "folder").length;
  const childrenIds = children.map(c => c.id);

  // Set parent references
  children.forEach(child => {
    child.parentId = folderId;
    child.depth = 0; // Will be recalculated
  });

  const node: FileSystemNode = {
    id: folderId,
    parentId,
    name,
    path: `${parentPath}\\${name}`,
    type: "folder",
    size: 0,
    totalSize,
    fileCount,
    folderCount,
    category: "folder",
    modifiedAt: modifiedAt ?? new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
    isHidden: false,
    isSystem: false,
    isReadonly: false,
    depth: 0,
    childrenIds,
    hasError: false,
  };

  if (nodesMap) {
    nodesMap.set(node.id, node);
  }

  return node;
}

// Build the C:\\ structure
function buildDownloadsFolder(parentId: string, parentPath: string, nodesMap: Map<string, FileSystemNode>): FileSystemNode {
  const downloadsFiles: FileSystemNode[] = [
    createFile("GTA_V_Final_4K.mp4", 78_400_000_000, "", parentPath, new Date("2026-08-28"), nodesMap),
    createFile("Project_Backup_2026.zip", 11_000_000_000, "", parentPath, new Date("2026-08-15"), nodesMap),
    createFile("Windows_11.iso", 6_500_000_000, "", parentPath, new Date("2026-07-20"), nodesMap),
    createFile("Ubuntu_22.04.iso", 4_700_000_000, "", parentPath, new Date("2026-06-10"), nodesMap),
    createFile("setup.exe", 89_000_000, "", parentPath, new Date("2026-08-01"), nodesMap),
    createFile("visual-studio-installer.exe", 2_400_000_000, "", parentPath, new Date("2026-07-15"), nodesMap),
    createFile("spring-boot-demo.zip", 450_000_000, "", parentPath, new Date("2026-08-10"), nodesMap),
    createFile("react-dashboard.tar.gz", 12_000_000, "", parentPath, new Date("2026-08-20"), nodesMap),
    createFile("node_modules_backup.7z", 1_200_000_000, "", parentPath, new Date("2026-05-12"), nodesMap),
    createFile("photos-backup.zip", 8_900_000_000, "", parentPath, new Date("2026-06-30"), nodesMap),
    createFile("movie-collection-part1.mkv", 14_200_000_000, "", parentPath, new Date("2026-07-22"), nodesMap),
    createFile("movie-collection-part2.mkv", 13_800_000_000, "", parentPath, new Date("2026-07-22"), nodesMap),
    createFile("documentary_earth_4k.mp4", 22_400_000_000, "", parentPath, new Date("2026-04-15"), nodesMap),
    createFile("tutorial_series.mp4", 4_200_000_000, "", parentPath, new Date("2026-03-01"), nodesMap),
    createFile("archive_2024.rar", 3_100_000_000, "", parentPath, new Date("2026-01-10"), nodesMap),
    createFile("old_photos.zip", 2_800_000_000, "", parentPath, new Date("2025-12-20"), nodesMap),
    createFile("presentation_keynote.pptx", 180_000_000, "", parentPath, new Date("2026-08-25"), nodesMap),
    createFile("budget_tracker.xlsx", 2_400_000, "", parentPath, new Date("2026-08-30"), nodesMap),
    createFile("resume_2026.pdf", 450_000, "", parentPath, new Date("2026-06-01"), nodesMap),
    createFile("ebook_programming.pdf", 15_000_000, "", parentPath, new Date("2026-02-14"), nodesMap),
  ];

  return createFolder("Downloads", parentId, parentPath, downloadsFiles, new Date("2026-08-28"), nodesMap);
}

function buildDocumentsFolder(parentId: string, parentPath: string, nodesMap: Map<string, FileSystemNode>): FileSystemNode {
  const documentsFiles: FileSystemNode[] = [
    createFile("tax_returns_2025.pdf", 8_500_000, "", parentPath, new Date("2026-02-28"), nodesMap),
    createFile("tax_returns_2024.pdf", 7_200_000, "", parentPath, new Date("2025-02-25"), nodesMap),
    createFile("tax_returns_2023.pdf", 6_900_000, "", parentPath, new Date("2024-02-20"), nodesMap),
    createFile("mortgage_contract.pdf", 1_200_000, "", parentPath, new Date("2024-01-15"), nodesMap),
    createFile("insurance_policy.pdf", 890_000, "", parentPath, new Date("2025-06-10"), nodesMap),
    createFile("travel_expenses_2025.xlsx", 3_400_000, "", parentPath, new Date("2026-01-05"), nodesMap),
    createFile("investment_portfolio.xlsx", 5_100_000, "", parentPath, new Date("2026-08-15"), nodesMap),
    createFile("project_proposal.docx", 2_800_000, "", parentPath, new Date("2026-07-20"), nodesMap),
    createFile("meeting_notes.txt", 45_000, "", parentPath, new Date("2026-08-28"), nodesMap),
    createFile("weekly_report_week35.docx", 180_000, "", parentPath, new Date("2026-08-30"), nodesMap),
    createFile("client_presentation.pptx", 45_000_000, "", parentPath, new Date("2026-08-22"), nodesMap),
    createFile("product_roadmap.xlsx", 1_800_000, "", parentPath, new Date("2026-08-10"), nodesMap),
    createFile("research_paper_draft.pdf", 2_400_000, "", parentPath, new Date("2026-08-05"), nodesMap),
    createFile("book_notes.txt", 120_000, "", parentPath, new Date("2026-07-01"), nodesMap),
    createFile("recipe_collection.pdf", 8_900_000, "", parentPath, new Date("2025-11-20"), nodesMap),
    createFile("warranty_info.pdf", 340_000, "", parentPath, new Date("2025-03-15"), nodesMap),
    createFile("software_license.txt", 12_000, "", parentPath, new Date("2024-05-01"), nodesMap),
  ];

  return createFolder("Documents", parentId, parentPath, documentsFiles, new Date("2026-08-30"), nodesMap);
}

function buildPicturesFolder(parentId: string, parentPath: string, nodesMap: Map<string, FileSystemNode>): FileSystemNode {
  const picturesFiles: FileSystemNode[] = [
    createFile("vacation_2026_001.jpg", 8_400_000, "", parentPath, new Date("2026-07-15"), nodesMap),
    createFile("vacation_2026_002.jpg", 9_200_000, "", parentPath, new Date("2026-07-15"), nodesMap),
    createFile("vacation_2026_003.jpg", 7_800_000, "", parentPath, new Date("2026-07-16"), nodesMap),
    createFile("vacation_2026_004.jpg", 12_100_000, "", parentPath, new Date("2026-07-16"), nodesMap),
    createFile("vacation_2026_005.jpg", 8_900_000, "", parentPath, new Date("2026-07-17"), nodesMap),
    createFile("family_reunion.jpg", 15_600_000, "", parentPath, new Date("2026-06-20"), nodesMap),
    createFile("birthday_party.jpg", 11_300_000, "", parentPath, new Date("2026-05-10"), nodesMap),
    createFile("graduation_ceremony.jpg", 18_400_000, "", parentPath, new Date("2026-05-28"), nodesMap),
    createFile("new_car.jpg", 6_700_000, "", parentPath, new Date("2026-04-12"), nodesMap),
    createFile("home_renovation_001.jpg", 9_800_000, "", parentPath, new Date("2026-03-01"), nodesMap),
    createFile("home_renovation_002.jpg", 10_200_000, "", parentPath, new Date("2026-03-01"), nodesMap),
    createFile("home_renovation_003.jpg", 8_500_000, "", parentPath, new Date("2026-03-05"), nodesMap),
    createFile("screenshot_2026-08-30.png", 450_000, "", parentPath, new Date("2026-08-30"), nodesMap),
    createFile("screenshot_2026-08-25.png", 380_000, "", parentPath, new Date("2026-08-25"), nodesMap),
    createFile("profile_photo.png", 1_200_000, "", parentPath, new Date("2026-01-10"), nodesMap),
    createFile("wallpaper_forest_4k.png", 8_900_000, "", parentPath, new Date("2025-12-01"), nodesMap),
    createFile("wallpaper_ocean_4k.png", 12_400_000, "", parentPath, new Date("2025-12-01"), nodesMap),
    createFile("icon_set.svg", 45_000, "", parentPath, new Date("2026-06-15"), nodesMap),
    createFile("logo_v3.svg", 12_000, "", parentPath, new Date("2026-07-01"), nodesMap),
    createFile("diagram_network.png", 180_000, "", parentPath, new Date("2026-08-12"), nodesMap),
  ];

  return createFolder("Pictures", parentId, parentPath, picturesFiles, new Date("2026-08-30"), nodesMap);
}

function buildVideosFolder(parentId: string, parentPath: string, nodesMap: Map<string, FileSystemNode>): FileSystemNode {
  const videosFiles: FileSystemNode[] = [
    createFile("homemade_movie_2026.mp4", 4_200_000_000, "", parentPath, new Date("2026-08-15"), nodesMap),
    createFile("kids_growing_up_compilation.mp4", 8_900_000_000, "", parentPath, new Date("2026-06-01"), nodesMap),
    createFile("wedding_video.mp4", 12_400_000_000, "", parentPath, new Date("2025-09-20"), nodesMap),
    createFile("travel_highlights_bali.mp4", 3_800_000_000, "", parentPath, new Date("2026-07-18"), nodesMap),
    createFile("coding_tutorial_series_ep1.mp4", 1_200_000_000, "", parentPath, new Date("2026-05-20"), nodesMap),
    createFile("coding_tutorial_series_ep2.mp4", 1_400_000_000, "", parentPath, new Date("2026-05-25"), nodesMap),
    createFile("coding_tutorial_series_ep3.mp4", 1_100_000_000, "", parentPath, new Date("2026-05-30"), nodesMap),
    createFile("music_video_cover.wav", 890_000_000, "", parentPath, new Date("2026-04-10"), nodesMap),
    createFile("podcast_episode_45.mp3", 85_000_000, "", parentPath, new Date("2026-08-20"), nodesMap),
    createFile("podcast_episode_46.mp3", 92_000_000, "", parentPath, new Date("2026-08-27"), nodesMap),
    createFile("audiobook_fiction_ch1.mp3", 45_000_000, "", parentPath, new Date("2026-03-15"), nodesMap),
    createFile("audiobook_fiction_ch2.mp3", 48_000_000, "", parentPath, new Date("2026-03-16"), nodesMap),
    createFile("game_recording_2026-08-25.mp4", 15_600_000_000, "", parentPath, new Date("2026-08-25"), nodesMap),
    createFile("webinar_recording.mp4", 2_800_000_000, "", parentPath, new Date("2026-08-05"), nodesMap),
  ];

  return createFolder("Videos", parentId, parentPath, videosFiles, new Date("2026-08-27"), nodesMap);
}

function buildProjectsFolder(parentId: string, parentPath: string, nodesMap: Map<string, FileSystemNode>): FileSystemNode {
  const projectsFiles: FileSystemNode[] = [
    createFile("index.ts", 2_400, "", parentPath, new Date("2026-08-30"), nodesMap),
    createFile("package.json", 1_800, "", parentPath, new Date("2026-08-30"), nodesMap),
    createFile("tsconfig.json", 890, "", parentPath, new Date("2026-08-28"), nodesMap),
    createFile("README.md", 4_500, "", parentPath, new Date("2026-08-30"), nodesMap),
    createFile("app.tsx", 12_400, "", parentPath, new Date("2026-08-30"), nodesMap),
    createFile("app.css", 3_200, "", parentPath, new Date("2026-08-25"), nodesMap),
    createFile("utils.ts", 8_900, "", parentPath, new Date("2026-08-28"), nodesMap),
    createFile("api.ts", 6_700, "", parentPath, new Date("2026-08-27"), nodesMap),
    createFile("database.sql", 45_000, "", parentPath, new Date("2026-08-20"), nodesMap),
    createFile("docker-compose.yml", 1_200, "", parentPath, new Date("2026-08-15"), nodesMap),
  ];

  return createFolder("Projects", parentId, parentPath, projectsFiles, new Date("2026-08-30"), nodesMap);
}

function buildMusicFolder(parentId: string, parentPath: string): FileSystemNode {
  const musicFiles: FileSystemNode[] = [
    createFile("playlist_summer_2026.m3u", 2_400, "", parentPath, new Date("2026-06-01")),
    createFile("rock_classics.flac", 890_000_000, "", parentPath, new Date("2025-01-15")),
    createFile("jazz_collection.flac", 1_200_000_000, "", parentPath, new Date("2025-03-20")),
    createFile("podcasts_archive.zip", 4_500_000_000, "", parentPath, new Date("2026-01-10")),
  ];

  return createFolder("Music", parentId, parentPath, musicFiles, new Date("2026-06-01"));
}

function buildDharmenderFolder(parentId: string, parentPath: string, nodesMap: Map<string, FileSystemNode>): FileSystemNode {
  const dharmenderId = generateId();
  const dharmenderPath = `${parentPath}\\\\Dharmender`;

  const dharmenderChildren: FileSystemNode[] = [
    buildDownloadsFolder(dharmenderId, dharmenderPath, nodesMap),
    buildDocumentsFolder(dharmenderId, dharmenderPath, nodesMap),
    buildPicturesFolder(dharmenderId, dharmenderPath, nodesMap),
    buildVideosFolder(dharmenderId, dharmenderPath, nodesMap),
    buildProjectsFolder(dharmenderId, dharmenderPath, nodesMap),
    buildMusicFolder(dharmenderId, dharmenderPath),
  ];

  const dharmenderFolder = createFolder("Dharmender", parentId, parentPath, dharmenderChildren, new Date("2026-08-28"), nodesMap);
  return dharmenderFolder;
}

function buildUsersFolder(parentId: string, parentPath: string, nodesMap: Map<string, FileSystemNode>): FileSystemNode {
  const usersId = generateId();
  const usersPath = `${parentPath}\\\\Users`;

  const usersChildren: FileSystemNode[] = [
    buildDharmenderFolder(usersId, usersPath, nodesMap),
  ];

  return createFolder("Users", parentId, parentPath, usersChildren, new Date("2026-08-28"), nodesMap);
}

function buildProgramFilesFolder(parentId: string, parentPath: string, nodesMap: Map<string, FileSystemNode>): FileSystemNode {
  const programFiles: FileSystemNode[] = [
    createFile("Application.dll", 12_400_000, "", parentPath, new Date("2024-01-10"), nodesMap),
    createFile("Runtime.dll", 8_900_000, "", parentPath, new Date("2024-01-10"), nodesMap),
    createFile("Resources.pak", 45_600_000, "", parentPath, new Date("2024-01-10"), nodesMap),
    createFile("Unins000.exe", 1_200_000, "", parentPath, new Date("2025-06-15"), nodesMap),
  ];

  return createFolder("Program Files", parentId, parentPath, programFiles, new Date("2025-06-15"), nodesMap);
}

function buildWindowsFolder(parentId: string, parentPath: string, nodesMap: Map<string, FileSystemNode>): FileSystemNode {
  const windowsFiles: FileSystemNode[] = [
    createFile("system32.dll", 45_600_000, "", parentPath, new Date("2024-06-15"), nodesMap),
    createFile("kernel32.dll", 12_400_000, "", parentPath, new Date("2024-06-15"), nodesMap),
    createFile("config.sys", 2_400, "", parentPath, new Date("2024-06-15"), nodesMap),
  ];

  return createFolder("Windows", parentId, parentPath, windowsFiles, new Date("2024-06-15"), nodesMap);
}

function buildStressFolder(name: string, count: number, parentId: string, parentPath: string, nodesMap: Map<string, FileSystemNode>): FileSystemNode {
  const files: FileSystemNode[] = [];
  const start = performance.now();
  for (let i = 0; i < count; i++) {
    files.push(createFile(`stress_file_${i}.txt`, Math.random() * 1000000, "", parentPath, new Date(), nodesMap));
  }
  const end = performance.now();
  console.log(`[Perf] Built stress folder ${name} with ${count} files in ${(end - start).toFixed(2)}ms`);
  return createFolder(name, parentId, parentPath, files, new Date(), nodesMap);
}

// Recursively set depth on all nodes
function setDepth(node: FileSystemNode, depth: number): void {
  node.depth = depth;
  if (node.childrenIds.length > 0) {
    // Children already have their ids set, but we need to find them in the flat map
  }
}

/**
 * Build the complete mock filesystem tree.
 * Returns a flat map of all nodes (keyed by id) and the root node.
 */
export function buildMockFilesystem(): {
  nodes: Record<string, FileSystemNode>;
  rootId: string;
  root: FileSystemNode;
} {
  // Build C:\\ root
  const cRootId = generateId();
  const cRootPath = "C:\\\\";

  // Create a map to store all nodes as they are created
  const nodesMap = new Map<string, FileSystemNode>();

  const cRootChildren: FileSystemNode[] = [
      buildUsersFolder(cRootId, cRootPath, nodesMap),
      buildWindowsFolder(cRootId, cRootPath, nodesMap),
      buildProgramFilesFolder(cRootId, cRootPath, nodesMap),
      buildStressFolder("Stress 100", 100, cRootId, cRootPath, nodesMap),
      buildStressFolder("Stress 1000", 1000, cRootId, cRootPath, nodesMap),
      buildStressFolder("Stress 5000", 5000, cRootId, cRootPath, nodesMap),
    ];

  cRootChildren.forEach(child => {
    setDepth(child, 1);
  });

  const cRoot = createFolder("C:\\\\", null as unknown as string, "", cRootChildren, new Date("2026-08-28"), nodesMap);
  cRoot.type = "drive";

  // Build the flat map from the nodesMap
  const flatMap: Record<string, FileSystemNode> = {};
  for (const [id, node] of nodesMap) {
    flatMap[id] = node;
  }

  // Set depths recursively
  function setNodeDepth(node: FileSystemNode, depth: number, nodes: Record<string, FileSystemNode>): void {
    node.depth = depth;
    for (const childId of node.childrenIds) {
      const child = nodes[childId];
      if (child) {
        setNodeDepth(child, depth + 1, nodes);
      }
    }
  }

  setNodeDepth(cRoot, 0, flatMap);

  // Recalculate childrenIds based on flatMap (ensure consistency)
  for (const node of Object.values(flatMap)) {
    const parentId = node.parentId;
    if (parentId && flatMap[parentId]) {
      // Parent already has this child in childrenIds
    }
  }

  return {
    nodes: flatMap,
    rootId: cRoot.id,
    root: cRoot,
  };
}

// Pre-built mock data (singleton)
let _mockData: ReturnType<typeof buildMockFilesystem> | null = null;

export function getMockData(): ReturnType<typeof buildMockFilesystem> {
  if (!_mockData) {
    _mockData = buildMockFilesystem();
  }
  return _mockData;
}

/**
 * Helper to get all descendants of a node.
 */
function getDescendants(currentNode: FileSystemNode, nodes: Record<string, FileSystemNode>): FileSystemNode[] {
  const result: FileSystemNode[] = [];
  const stack = [currentNode];

  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node !== currentNode) {
      result.push(node);
    }
    for (const childId of node.childrenIds) {
      if (nodes[childId]) {
        stack.push(nodes[childId]);
      }
    }
  }

  return result;
}

/**
 * Compute extension stats from a node map for the current node.
 */
export function computeExtensionStats(nodes: Record<string, FileSystemNode>, currentNode?: FileSystemNode | null): {
  extension: string;
  category: FileCategory;
  fileCount: number;
  totalSize: number;
  percentage: number;
}[] {
  const stats: Record<string, { extension: string; category: FileCategory; fileCount: number; totalSize: number }> = {};
  let totalSize = 0;

  const targetNodes = currentNode ? getDescendants(currentNode, nodes) : Object.values(nodes);

  for (const node of targetNodes) {
    if (node.type === "file") {
      const ext = node.extension ?? "none";
      if (!stats[ext]) {
        stats[ext] = { extension: ext, category: node.category ?? "other", fileCount: 0, totalSize: 0 };
      }
      stats[ext].fileCount += 1;
      stats[ext].totalSize += node.totalSize;
      totalSize += node.totalSize;
    }
  }

  return Object.values(stats)
    .map(s => ({
      ...s,
      percentage: totalSize > 0 ? (s.totalSize / totalSize) * 100 : 0,
    }))
    .sort((a, b) => b.totalSize - a.totalSize)
    .slice(0, 20);
}

/**
 * Get largest files from a node map.
 */
export function getLargestFiles(nodes: Record<string, FileSystemNode>, limit = 10, currentNode?: FileSystemNode | null): FileSystemNode[] {
  const targetNodes = currentNode ? getDescendants(currentNode, nodes) : Object.values(nodes);
  return targetNodes
    .filter(n => n.type === "file")
    .sort((a, b) => b.totalSize - a.totalSize)
    .slice(0, limit);
}

/**
 * Get largest folders from a node map.
 */
export function getLargestFolders(nodes: Record<string, FileSystemNode>, limit = 5, currentNode?: FileSystemNode | null): FileSystemNode[] {
  const targetNodes = currentNode ? getDescendants(currentNode, nodes) : Object.values(nodes);
  return targetNodes
    .filter(n => n.type === "folder")
    .sort((a, b) => b.totalSize - a.totalSize)
    .slice(0, limit);
}