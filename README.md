# Diskotto

> A modern, privacy-first storage analyzer that helps you understand how your storage is being used.

## Overview

Diskotto transforms filesystem complexity into visual clarity. See exactly where your storage is being used with an interactive treemap, drill down into folders, identify large files, and discover cleanup opportunities.

## Features

- **Interactive Treemap** - Visualize storage usage with proportional boxes
- **Folder Tree** - Navigate your filesystem hierarchy
- **File Details** - See exact file information (name, size, path, dates)
- **Search** - Find files by name, extension, or path
- **Filters** - Filter by size, type, and date
- **Analytics** - Storage breakdown by extension and category
- **Insights** - Identify cleanup opportunities
- **Breadcrumb Navigation** - Always know where you are
- **Privacy-First** - All processing happens locally
- **Mobile Responsive** - Works on desktop, tablet, and mobile

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/diskotto.git
cd diskotto

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Browser Support

Diskotto requires a browser that supports the **File System Access API**:

### Full Support (Recommended)
- **Chrome** 86+ — All features work
- **Edge** 86+ — All features work (Chromium-based)
- **Opera** 72+ — All features work (Chromium-based)
- **Brave** 1.20+ — All features work (Chromium-based)

### Limited Support
- **Safari** 16.4+ — Read-only support, limited handle persistence; some features may not work
- **Firefox** — Not supported (no File System Access API); shows "use Chrome/Edge" message

### Not Supported
- **iOS Safari** — No File System Access API support
- **IE 11** — Deprecated, no modern APIs
- **Mobile browsers** generally have limited or no support (permissions reset on reload)

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Visualization**: D3.js
- **State**: Zustand
- **Testing**: Vitest + Playwright
- **Icons**: Lucide React

## Documentation

- [SPEC.md](./SPEC.md) - Complete product specification
- [Documentation](./docs/README.md) - Detailed documentation
- [Product Requirements](./docs/product-requirements.md)
- [Architecture](./docs/architecture.md)
- [UI/UX Design](./docs/ui-ux.md)
- [Design System](./docs/design-system.md)
- [Data Model](./docs/data-model.md)
- [Scanning Engine](./docs/scanning-engine.md)
- [Privacy](./docs/privacy.md)
- [Performance](./docs/performance.md)
- [Accessibility](./docs/accessibility.md)
- [Testing](./docs/testing.md)
- [Browser Support](./docs/browser-support.md)
- [Roadmap](./docs/roadmap.md)

## Architecture Decisions

- [ADR-001: Client-Side Processing](./docs/decisions/ADR-001-client-side-processing.md)
- [ADR-002: D3.js for Treemap](./docs/decisions/ADR-002-d3-treemap.md)
- [ADR-003: Tauri for Future Desktop](./docs/decisions/ADR-003-tauri-future.md)
- [ADR-004: Zustand for State Management](./docs/decisions/ADR-004-zustand-state.md)
- [ADR-005: shadcn/ui Components](./docs/decisions/ADR-005-shadcn-components.md)

## Project Status

**Current Phase**: Planning Complete (Phase 0)

**Next Phase**: Project Foundation (Phase 1)

**Target MVP Launch**: ~5 months from start of Phase 1

See [Roadmap](./docs/roadmap.md) for detailed implementation plan.

## Privacy

Diskotto is **privacy-first**:
- No data upload
- No file content reading
- No tracking or analytics
- No cookies
- All processing local

See [Privacy Documentation](./docs/privacy.md) for details.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

- Inspired by tools like WinDirStat, DaisyDisk, and GrandPerspective
- Built with amazing open-source libraries
- Designed for privacy and performance

## Contact

- **Issues**: [GitHub Issues](https://github.com/yourusername/diskotto/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/diskotto/discussions)
- **Email**: hello@diskotto.app

---

**Diskotto** - Understand your storage, respect your privacy.
