# ADR-001: Client-Side Processing

## Status

**Accepted** - 2026-09-01

## Context

Diskotto needs to analyze user filesystem data to provide storage insights. The core question is: **Where should filesystem scanning and processing happen?**

### Options Considered

1. **Client-side only (main thread, async scanner)**
2. **Backend server with API**
3. **Hybrid (client for metadata, server for processing)**
4. **Peer-to-peer**

> **Note**: An earlier draft considered a Web Worker scanner, but `FileSystemDirectoryHandle` is not structured-cloneable and cannot be transferred across the worker boundary. The current decision is to run the scanner on the **main thread** with periodic yields. See `scanning-engine.md` for the full rationale.

## Decision

We will process everything **client-side** on the main thread (with periodic yields). No backend server is required for the MVP.

## Rationale

### Privacy
- **Files never leave the user's device** - This is a core product principle
- Users are increasingly privacy-conscious
- No data breaches possible (no data stored)
- Builds trust with users
- Aligns with user expectations for local tools

### Simplicity
- No backend infrastructure to maintain
- No database to manage
- No API to design and version
- No authentication system
- No deployment complexity
- Lower operational costs

### Performance
- **Faster** - No network latency
- Local processing is faster than upload + process + download
- Main thread with periodic yields keeps the UI responsive
- Direct filesystem access (no serialization overhead)

### Cost
- **Zero infrastructure costs** - No servers, no CDN
- Static hosting is free (Vercel, Netlify, GitHub Pages)
- No scaling concerns
- No bandwidth costs

### Security
- **No attack surface** - No server to hack
- No data to steal
- No user accounts to compromise
- No API to exploit

### Legal/Compliance
- **GDPR compliant by design** - No data processing
- No privacy policy complexity
- No data retention concerns
- No right-to-deletion requests

### Offline Capability
- Works offline (after first load)
- No internet required
- Better user experience

## Consequences

### Positive
- Privacy-first by design
- Simpler architecture
- Lower costs
- Better performance
- No compliance issues
- Offline capable

### Negative
- **Browser limitations** - Cannot access entire filesystem
- **Limited by client hardware** - User's device must be capable
- **Memory constraints** - Large folders may be limited
- **Slower updates** - Can't push server-side changes
- **No cross-device sync** - Data doesn't follow user
- **Harder analytics** - Can't track usage (which is actually good)

### Mitigation Strategies

1. **Browser limitations**
   - Use File System Access API
   - Clear messaging for unsupported browsers
   - Future: Tauri desktop app

2. **Memory constraints**
   - Stream processing with periodic yields (keeps UI responsive)
   - Aggregation for very large folders
   - Pagination where appropriate

3. **Updates**
   - Static assets can be cached and updated
   - Progressive Web App for offline
   - Versioned releases

4. **Analytics**
   - **No third-party analytics services** in MVP (no Plausible, Fathom, Google Analytics, etc.)
   - All measurement is local-only via `web-vitals` and `performance.measure`
   - Future: opt-in, same-origin aggregate metrics (no external service)

## Alternatives Considered

### Backend Server
**Pros**:
- More processing power
- Can access cloud storage
- Easier to add features
- Better analytics

**Cons**:
- Privacy concerns
- Infrastructure costs
- Slower (network latency)
- Security risks
- Compliance burden

**Verdict**: Rejected. Privacy is a core principle, not negotiable.

### Hybrid Approach
**Pros**:
- Best of both worlds
- Privacy for sensitive data
- Server power for heavy work

**Cons**:
- Complex architecture
- More code to maintain
- Still requires server
- Unclear what goes where

**Verdict**: Rejected. Unnecessary complexity for MVP.

### Peer-to-Peer
**Pros**:
- No central server
- Distributed

**Cons**:
- Very complex
- Poor UX
- Unnecessary for storage analysis

**Verdict**: Rejected. Overkill, doesn't solve real problem.

## Future Considerations

### When to Reconsider

We may revisit this decision if:
- Users need cross-device sync
- Cloud storage integration is required
- Collaborative features are needed
- AI/ML features are added (future)

### Tauri Desktop (Phase 2)

Tauri is **not** a backend. It's a desktop app wrapper that:
- Uses the same web UI
- Provides native filesystem access
- Still processes locally
- No server involved

This is **consistent** with our decision, just with better filesystem access.

## Implementation Notes

### Key Technologies
- **Main Thread Scanner**: Async/await with periodic yields (FileSystemDirectoryHandle is not transferable to workers)
- **File System Access API**: Browser-native folder access
- **IndexedDB** (future): Optional local cache
- **Service Workers** (future): Offline support

### Security Considerations
- **CSP**: Strict Content Security Policy
- **No external requests**: Only static assets
- **No tracking**: No analytics by default
- **Open source**: Code auditable

### Performance Targets
- 10k files: <30s scan
- 100k files: <5min scan
- Memory: <500MB for 100k files
- UI: 60fps during scan

## References

- [Privacy Documentation](../privacy.md)
- [Architecture Documentation](../architecture.md)
- [Scanning Engine Documentation](../scanning-engine.md)
- [Web Workers MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [File System Access API MDN](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)

## Decision Makers

- Product Owner
- Technical Lead
- Privacy Advocate
- UX Designer

## Date

2026-09-01

## Review Date

2027-03-01 (6 months)
