# Diskotto Documentation

Welcome to the comprehensive documentation for Diskotto, a modern storage analyzer that helps you understand how your storage is being used.

## Quick Links

- **[SPEC.md](../SPEC.md)** - Complete product specification (start here)
- **[Product Requirements](./product-requirements.md)** - Detailed PRD
- **[Architecture](./architecture.md)** - Technical architecture
- **[UI/UX Design](./ui-ux.md)** - Design system and interactions
- **[Data Model](./data-model.md)** - File system data structures
- **[Scanning Engine](./scanning-engine.md)** - How the scanner works
- **[Privacy](./privacy.md)** - Privacy model and guarantees
- **[Performance](./performance.md)** - Performance strategy
- **[Accessibility](./accessibility.md)** - Accessibility approach
- **[Testing](./testing.md)** - Testing strategy
- **[Browser Support](./browser-support.md)** - Browser compatibility
- **[Roadmap](./roadmap.md)** - Implementation phases

## Architecture Decision Records

- **[ADR-001: Client-Side Processing](./decisions/ADR-001-client-side-processing.md)** - Why no backend
- **[ADR-002: D3.js for Treemap](./decisions/ADR-002-d3-treemap.md)** - Visualization choice
- **[ADR-003: Tauri Future](./decisions/ADR-003-tauri-future.md)** - Desktop strategy
- **[ADR-004: Zustand State](./decisions/ADR-004-zustand-state.md)** - State management
- **[ADR-005: shadcn/ui Components](./decisions/ADR-005-shadcn-components.md)** - UI library choice

## Getting Started

To set up Diskotto locally:

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

## Project Structure

```
diskotto/
├── SPEC.md                   # Main product spec
├── docs/                     # This directory
├── src/                      # Source code
│   ├── app/                  # Next.js app directory
│   ├── components/           # React components
│   ├── store/                # Zustand store
│   ├── lib/                  # Utilities (scanner, search-index, aggregator)
│   └── types/                # TypeScript types
└── e2e/                      # Playwright tests
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines.

## License

MIT
