# ADR-003: Tauri for Future Desktop Application

## Status

**Accepted** - 2026-09-01

## Context

The web version of Diskotto has inherent limitations:
- Cannot access entire filesystem without user permission
- Limited to user-selected folders
- Performance depends on browser
- No system-level integrations
- Permission resets in some browsers

For Phase 2, we want to provide a **desktop application** that:
- Can scan entire drives (C:\, D:\, etc.)
- Provides native performance
- Has system integration
- Works offline
- No browser limitations

### Options Considered

1. **Tauri** (Rust + WebView)
2. **Electron** (Chromium + Node.js)
3. **Native** (Swift, C#, etc.)
4. **PWA** (Progressive Web App)
5. **Browser Extension**

## Decision

We will use **Tauri** for the future desktop application (Phase 2), with the goal of **reusing the web UI** as much as possible.

## Rationale

### Why Tauri

#### Performance
- **Rust backend** - Native performance
- **System WebView** - No bundled browser (unlike Electron)
- **Small bundle** - 10-20MB vs Electron's 100-200MB
- **Fast startup** - No browser initialization
- **Lower memory** - No full browser instance

#### Security
- **Rust security** - Memory-safe, no buffer overflows
- **Permission system** - Explicit, granular permissions
- **Small attack surface** - Minimal dependencies
- **CSP support** - Content Security Policy

#### Cross-Platform
- **Windows** - Native
- **macOS** - Native
- **Linux** - Native
- **One codebase** - Write once, run everywhere

#### Web UI Reuse
- **Same React components** - 100% code reuse
- **Same business logic** - TypeScript shared
- **Same design** - Consistent UX
- **Faster development** - No need to rewrite

#### Modern Stack
- **Active development** - Growing community
- **Good documentation** - Comprehensive guides
- **Plugin ecosystem** - Many integrations
- **TypeScript support** - First-class

### Why Not Electron

#### Bundle Size
- **Electron**: 100-200MB
- **Tauri**: 10-20MB
- **Impact**: Downloads, storage, user perception

#### Performance
- **Electron**: Bundles Chromium (~80MB)
- **Tauri**: Uses system WebView
- **Impact**: Startup time, memory usage

#### Security
- **Electron**: Larger attack surface
- **Tauri**: Smaller, more secure
- **Impact**: Security audits, user trust

#### Modern
- **Electron**: 2013 era
- **Tauri**: 2020+ era
- **Impact**: Developer experience, future-proof

### Why Not Native

#### Development Cost
- **Native**: 3 codebases (Win, Mac, Linux)
- **Tauri**: 1 codebase
- **Impact**: Time, money, maintenance

#### UI Reuse
- **Native**: Cannot reuse web UI
- **Tauri**: 100% reuse
- **Impact**: Consistency, development speed

#### Talent
- **Native**: Specialized skills needed
- **Tauri**: Web developers can contribute
- **Impact**: Hiring, team flexibility

### Why Not PWA

#### File System Access
- **PWA**: Limited to user-selected folders
- **Tauri**: Full filesystem access
- **Impact**: Core functionality

#### Performance
- **PWA**: Browser-dependent
- **Tauri**: Native performance
- **Impact**: Large folder scans

#### System Integration
- **PWA**: Limited
- **Tauri**: Deep OS integration
- **Impact**: Tray, notifications, file associations

## Architecture

### Shared Web UI

```
┌─────────────────────────────────────────────────────────────┐
│                    WEB UI (React)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Components  │  │   Store      │  │   Hooks      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│           │                │                 │             │
│           └────────────────┴─────────────────┘             │
│                            │                                │
│                   ┌────────▼────────┐                      │
│                   │  API Adapter    │                      │
│                   └────────┬────────┘                      │
└────────────────────────────┼────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    ┌─────────▼──────────┐      ┌──────────▼─────────┐
    │  Web (Next.js)     │      │  Desktop (Tauri)   │
    │  - File System API │      │  - Rust APIs       │
    │  - Main Thread     │      │  - Native FS       │
    │  - Browser APIs    │      │  - System APIs     │
    └────────────────────┘      └────────────────────┘
```

### API Adapter Pattern

```typescript
// lib/scanner-adapter.ts
export interface ScannerAdapter {
  startScan(path: string): Promise<ScanSession>;
  cancelScan(sessionId: string): void;
  onProgress(callback: (progress: ScanProgress) => void): void;
  onComplete(callback: (session: ScanSession) => void): void;
  onError(callback: (error: ScanError) => void): void;
}

// Web implementation
export class WebScannerAdapter implements ScannerAdapter {
  // Uses File System Access API
  // Runs scanner on main thread with periodic yields
}

// Tauri implementation
export class TauriScannerAdapter implements ScannerAdapter {
  // Calls Rust commands
  // Uses native filesystem
}
```

### Tauri Backend (Rust)

```rust
// src-tauri/src/scanner.rs
use walkdir::WalkDir;
use rayon::prelude::*;
use serde::Serialize;

#[derive(Serialize)]
pub struct FileNode {
    id: String,
    name: String,
    path: String,
    size: u64,
    // ...
}

#[tauri::command]
pub async fn scan_directory(
    path: String,
    window: tauri::Window,
) -> Result<ScanResult, String> {
    let entries: Vec<FileNode> = WalkDir::new(&path)
        .into_iter()
        .par_bridge()
        .filter_map(|e| e.ok())
        .map(|e| FileNode::from(e))
        .collect();

    // Emit progress
    window.emit("scan-progress", &progress)?;

    Ok(ScanResult { entries })
}
```

## Implementation Plan

### Phase 1: Setup (Week 1-2)
- Set up Tauri project
- Configure build system
- Set up CI/CD for Tauri
- Code signing setup

### Phase 2: Integration (Week 3-4)
- Integrate web UI
- Implement API adapter
- Connect to Rust backend
- Test basic functionality

### Phase 3: Native Features (Week 5-6)
- System tray
- Native notifications
- File associations
- Auto-updater
- System menu

### Phase 4: Polish (Week 7-8)
- Code signing
- Distribution (GitHub Releases)
- App store submission
- Documentation
- Marketing

## Consequences

### Positive
- **Full filesystem access** - Can scan entire drives
- **Better performance** - Native speed
- **System integration** - Tray, notifications, etc.
- **No browser limitations** - Full control
- **Web UI reuse** - 100% code reuse
- **Cross-platform** - Win, Mac, Linux
- **Small bundle** - 10-20MB
- **Secure** - Rust safety + permissions
- **Offline** - No internet required

### Negative
- **Additional codebase** - Rust + TypeScript
- **Distribution complexity** - Code signing, app stores
- **Update mechanism** - Auto-updater needed
- **Platform-specific bugs** - OS differences
- **Larger team needed** - Rust skills
- **Longer development** - Phase 2, not MVP

### Mitigation Strategies

1. **Codebase complexity**
   - Clear separation of concerns
   - Shared types (TypeScript + Rust)
   - Good documentation

2. **Distribution**
   - Use Tauri updater
   - Code signing certificates
   - App store guidelines
   - Auto-update mechanism

3. **Platform bugs**
   - Test on all platforms
   - CI/CD matrix
   - User feedback channels

4. **Team skills**
   - Hire Rust developers
   - Training for existing team
   - Pair programming

## Tauri vs Electron: Detailed Comparison

| Aspect | Tauri | Electron |
|--------|-------|----------|
| **Bundle Size** | 10-20MB | 100-200MB |
| **Memory** | 50-100MB | 200-500MB |
| **Startup** | <1s | 2-5s |
| **Security** | High (Rust) | Medium (Node) |
| **Performance** | Native | Good |
| **UI Reuse** | 100% | 100% |
| **Maturity** | Growing | Mature |
| **Community** | Growing | Large |
| **Documentation** | Good | Excellent |
| **Plugins** | Growing | Many |
| **Learning Curve** | Medium | Low |
| **Build Time** | Fast | Slow |
| **App Size** | Small | Large |

## Tauri Limitations

### Current Limitations
- **Mobile** - Not supported (Tauri 2.0 will add)
- **Plugins** - Smaller ecosystem than Electron
- **Documentation** - Less comprehensive than Electron
- **Community** - Smaller than Electron
- **Maturity** - Newer, less battle-tested

### Mitigation
- Most limitations don't affect core functionality
- Tauri 2.0 will address mobile
- Growing community and ecosystem
- Can fall back to Electron if needed

## Decision Criteria

### When to Use Tauri
- Cross-platform desktop needed
- Performance matters
- Small bundle size desired
- Security is important
- Web UI exists and should be reused

### When to Use Electron
- Need maximum compatibility
- Large plugin ecosystem needed
- Team has Electron experience
- Bundle size doesn't matter

### When to Use Native
- Platform-specific features needed
- Maximum performance required
- Have specialized team
- Budget allows

## Cost-Benefit Analysis

### Costs
- **Development**: 8-12 weeks
- **Rust developer**: $120-180k/year (if hiring)
- **Code signing**: $200-400/year
- **App store fees**: $99/year (Apple) + $19 one-time (Google, not applicable)
- **CI/CD**: $50-200/month

**Total Year 1**: ~$150-200k (with hiring) or ~$50-80k (no hiring)

### Benefits
- **Full filesystem access** - Core feature unlocked
- **Better performance** - User satisfaction
- **System integration** - Professional feel
- **Offline** - No internet dependency
- **No browser limitations** - Future-proof

**ROI**: High. Unlocks new use cases and users.

## Timeline

### Web MVP First
- **Months 1-5**: Build web app
- **Launch**: Web version live

### Desktop Phase 2
- **Months 6-8**: Tauri development
- **Month 9**: Beta testing
- **Month 10**: Public release

## Success Metrics

### Technical
- Bundle size < 20MB
- Startup < 1s
- Memory < 100MB idle
- Scan speed comparable to native tools

### User
- 4.5+ star rating
- 70%+ retention
- Positive reviews
- Feature parity with web

## References

- [Tauri Documentation](https://tauri.app/)
- [Tauri vs Electron](https://tauri.app/v1/guides/development/tauri-vs-electron/)
- [Tauri Examples](https://github.com/tauri-apps/tauri/tree/dev/examples)
- [Rust Programming Language](https://www.rust-lang.org/)

## Decision Makers

- Technical Lead
- Product Owner
- Desktop Engineer
- UX Designer

## Date

2026-09-01

## Review Date

2027-09-01 (1 year, after web MVP launch)
