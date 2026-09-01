# Contributing to Diskotto

Thank you for your interest in contributing to Diskotto! We welcome contributions from developers of all skill levels.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Prioritize the community

## How to Contribute

### Reporting Bugs

1. Check existing issues first
2. Use the bug report template
3. Include:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Browser and OS
   - Screenshots if applicable

### Suggesting Features

1. Check existing discussions
2. Use the feature request template
3. Explain:
   - The problem it solves
   - How it should work
   - Why it's important

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Update documentation
6. Ensure all tests pass
7. Submit a pull request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/diskotto.git
cd diskotto

# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

## Project Structure

```
diskotto/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── layout/      # Layout components
│   │   └── ...
│   ├── store/           # Zustand store (slice pattern)
│   ├── lib/             # Utilities (scanner, search-index, etc.)
│   ├── hooks/           # React hooks
│   ├── types/           # TypeScript types
│   └── data/            # Mock data
├── docs/                # Documentation
├── e2e/                 # E2E tests
└── public/              # Static assets
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- No `any` types
- Explicit return types for functions
- Use interfaces over types
- Document complex types

### React

- Functional components only
- Use hooks
- Memoize expensive computations
- Use React.memo for pure components
- Use useCallback for stable references

### Styling

- Use Tailwind CSS classes
- Follow design system tokens
- Use shadcn/ui components
- Maintain dark/light theme support
- Mobile-first responsive

### File Naming

- Components: PascalCase (`StorageTreemap.tsx`)
- Utilities: camelCase (`formatters.ts`)
- Hooks: camelCase with `use` prefix (`useSearch.ts`)
- Types: PascalCase (`FileSystemNode`)

### Code Style

- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages
- Add comments for complex logic
- Keep functions small and focused

## Testing

### Unit Tests

```bash
npm run test
```

Write unit tests for:
- Pure functions
- Store actions
- Utility functions
- Component logic

### E2E Tests

```bash
npm run test:e2e
```

Write E2E tests for:
- Critical user flows
- Folder selection
- Scan completion
- Search and filter
- Mobile responsive

### Coverage

Maintain 80%+ test coverage for:
- Business logic
- Store actions
- Utility functions

## Documentation

Update documentation when:
- Adding new features
- Changing APIs
- Fixing bugs (if relevant)
- Adding dependencies

## Commit Messages

Use conventional commits:

```
feat: add search functionality
fix: resolve treemap rendering issue
docs: update installation guide
style: format code with prettier
refactor: simplify scanner logic
test: add tests for search
chore: update dependencies
```

## Pull Request Process

1. Update documentation
2. Add tests
3. Ensure CI passes
4. Request review
5. Address feedback
6. Merge after approval

## Architecture Decisions

For significant changes, create an ADR:

```
docs/decisions/ADR-XXX-title.md
```

Use the template from existing ADRs.

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release notes
4. Tag release
5. Deploy

## Community

- **GitHub Discussions**: For questions and ideas
- **GitHub Issues**: For bugs and features
- **Discord**: For real-time chat (link TBD)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Diskotto!
