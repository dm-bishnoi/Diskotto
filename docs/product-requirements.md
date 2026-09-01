# Product Requirements Document - Diskotto

## Executive Summary

**Product Name**: Diskotto
**Product Type**: Storage Analyzer / Storage Manager
**Version**: 1.0 (MVP Planning)
**Last Updated**: 2026-09-01
**Status**: Discovery Complete, Planning Phase

## 1. Product Overview

### 1.1 Problem Statement
Users struggle to understand where their storage is being used. Operating system file managers provide directory listings but lack visual context, storage analytics, and actionable insights. Existing tools like WinDirStat are powerful but dated in design, and most users find them intimidating.

### 1.2 Solution
Diskotto provides a modern, visual, privacy-first storage analyzer that:
- Uses interactive treemaps to make storage usage immediately understandable
- Shows exact file/folder information without hiding details behind clicks
- Runs entirely in the browser with no data upload
- Provides insights for potential cleanup opportunities

### 1.3 Target Audience
- **Primary**: Power users, developers, designers, and content creators with large media libraries
- **Secondary**: General users concerned about disk space and organization
- **Future**: System administrators and IT professionals (Tauri desktop version)

### 1.4 Success Metrics
- 70% of users complete a folder scan within first session
- Average session duration > 3 minutes
- 50% of users explore beyond the first drill-down
- 30% of users return to use the tool again

## 2. User Personas

### 2.1 "Dharmender" - The Developer
- **Background**: 30-year-old software developer
- **Pain Points**: Multiple project folders, dependencies, build artifacts, downloads
- **Goals**: Find what's taking up space, identify unused projects, clean up development debris
- **Technical Level**: High, comfortable with file systems
- **Use Case**: Auditing `C:\Users\Dharmender\Projects` and `Downloads` folders

### 2.2 "Sarah" - The Content Creator
- **Background**: Video editor and photographer
- **Pain Points**: Large video files, RAW photos, project files
- **Goals**: Find duplicate or old files, manage media libraries
- **Technical Level**: Medium
- **Use Case**: Analyzing `Pictures` and `Videos` folders for cleanup opportunities

### 2.3 "Mike" - The Casual User
- **Background**: Office worker
- **Pain Points**: "My disk is full" warnings, slow computer
- **Goals**: Free up disk space, understand where files are
- **Technical Level**: Low to medium
- **Use Case**: Quick scan of entire `C:\Users\Mike\Downloads` folder

## 3. Core Features (MVP)

### 3.1 Folder Selection
- **Requirement**: Users must be able to select any local folder
- **Implementation**: File System Access API (Chrome/Edge) with fallback messaging
- **Acceptance**: Folder picker opens, selected folder begins scanning immediately
- **Priority**: P0 (Critical)

### 3.2 Recursive Scanning
- **Requirement**: Scan entire folder hierarchy with metadata
- **Implementation**: Main-thread async scanner with periodic yields, streaming, progress reporting
- **Acceptance**: 10,000 file folder scans in <30 seconds
- **Priority**: P0 (Critical)

### 3.3 Interactive Treemap
- **Requirement**: Visual representation of storage usage
- **Implementation**: D3.js treemap with squarify algorithm
- **Acceptance**: Proportional boxes, accurate sizing, smooth interaction
- **Priority**: P0 (Critical)

### 3.4 Folder Tree Navigation
- **Requirement**: Traditional hierarchical view
- **Implementation**: Virtualized tree with expand/collapse
- **Acceptance**: Handles 10,000+ folders smoothly
- **Priority**: P0 (Critical)

### 3.5 File/Folder Details
- **Requirement**: Detailed information on selection
- **Implementation**: Side panel with metadata
- **Acceptance**: Shows name, size, path, dates, actions
- **Priority**: P0 (Critical)

### 3.6 Search
- **Requirement**: Find files/folders by name/extension/path
- **Implementation**: Debounced search, virtualized results
- **Acceptance**: Returns results in <100ms for 10,000 items
- **Priority**: P1 (High)

### 3.7 Filters
- **Requirement**: Filter by size, type, date
- **Implementation**: Chip-based filter UI
- **Acceptance**: Filters apply immediately to displayed data
- **Priority**: P1 (High)

### 3.8 Analytics Panel
- **Requirement**: Storage breakdown by extension and category
- **Implementation**: Custom SVG bar charts (no chart library dependency)
- **Acceptance**: Shows top 10+ extensions with sizes and percentages
- **Priority**: P1 (High)

### 3.9 Insights
- **Requirement**: Informational cleanup suggestions
- **Implementation**: Rule-based analysis (large folders, old files, etc.)
- **Acceptance**: Shows 3-5 actionable insights
- **Priority**: P2 (Medium)

### 3.10 Breadcrumb Navigation
- **Requirement**: Always show current path
- **Implementation**: Clickable breadcrumb with overflow handling
- **Acceptance**: All path segments clickable, copies to clipboard
- **Priority**: P0 (Critical)

## 4. Out of Scope (MVP)

The following are explicitly **out of scope** for MVP:

- ❌ **Destructive operations**: No file deletion, moving, or renaming
- ❌ **Full drive scanning**: Only user-selected folders
- ❌ **Cloud storage analysis**: Google Drive, Dropbox, etc.
- ❌ **Duplicate detection**: Comparing file hashes
- ❌ **Storage history/trends**: Tracking over time
- ❌ **Scheduled scans**: No automation
- ❌ **Multi-drive comparison**: Single folder analysis only
- ❌ **Export reports**: PDF/CSV reports
- ❌ **User accounts**: No authentication
- ❌ **Cloud sync**: No cloud features

## 5. Future Roadmap

### V1.0 - Future Features
- Cleanup workflow (move to trash with confirmation)
- Duplicate file detection
- Storage growth tracking
- Export reports (PDF, CSV)
- Scheduled scans
- Desktop notifications

### V2.0 - Advanced Features
- Tauri desktop application
- Full drive scanning
- Multi-drive comparison
- Cloud storage integration
- Advanced search (regex, content search)
- Custom rules engine

### Future Considerations
- Browser extension version
- Mobile native apps
- Enterprise features
- API for third-party integrations

## 6. Constraints

### 6.1 Technical Constraints
- **Browser API limitations**: Cannot access entire filesystem without user permission
- **Memory constraints**: Large scans require efficient data structures
- **Browser compatibility**: File System Access API only in Chromium-based browsers
- **No backend**: All processing client-side

### 6.2 User Experience Constraints
- **Privacy first**: No data ever leaves device
- **Performance**: Must feel instant
- **Accessibility**: WCAG 2.1 AA compliance
- **Responsive**: Desktop, tablet, mobile support

## 7. Acceptance Criteria

### MVP Launch Criteria
1. User can select a folder and see scan progress
2. Scan completes for 10,000 file folder in <30 seconds
3. Treemap displays all files/folders with accurate proportions
4. User can drill down into folders and return to parent
5. Search finds files by name in <100ms
6. Filters apply immediately to displayed data
7. Mobile layout is functional and readable
8. No console errors in production
9. All interactive elements are keyboard accessible
10. Privacy policy clearly states no data is uploaded

## 8. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| File System Access API limited support | High | High | Clear messaging for unsupported browsers |
| Large folder scans cause performance issues | High | Medium | Yields, progressive rendering, aggregation |
| Memory issues with massive folders | High | Medium | Streaming approach, virtualized rendering |
| Privacy concerns about reading folders | Medium | Low | Clear permissions UI, local-only processing |
| Users expect file deletion feature | Medium | High | Clear MVP scope messaging |
| Mobile browser limitations | Medium | High | Mobile-first responsive design |

## 9. Open Questions

1. Should we support Firefox via `<input type="file" webkitdirectory>` fallback?
2. What's the maximum folder size to support? (100k? 1M files?)
3. Should insights be configurable by user?
4. PWA support for installation?
5. Internationalization from start or English-only MVP?

These are tracked in [SPEC.md §12 Open Questions](../SPEC.md#12-open-questions).
