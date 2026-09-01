# Browser Support

## Overview

Diskotto is a web application that relies on modern browser APIs, particularly the **File System Access API**. Browser support is a critical consideration that affects feature availability, user experience, and messaging.

## Support Matrix

### Tier 1: Full Support (Primary Target)

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 86+ | Full | All features available |
| Edge | 86+ | Full | All features available |
| Opera | 72+ | Full | Chromium-based |
| Brave | 1.20+ | Full | Chromium-based |

**Coverage**: ~70% of desktop users

### Tier 2: Partial Support (Secondary)

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Safari | 16.4+ | Partial | Read-only, limited handles |
| Chrome Android | 86+ | Limited | Permission resets on reload |
| Samsung Internet | 14+ | Full | Chromium-based |

**Coverage**: ~15% of users

### Tier 3: No Support (Display Message)

| Browser | Status | Notes |
|---------|--------|-------|
| Firefox | Not Supported | No File System Access API |
| Safari < 16.4 | Not Supported | No File System Access API |
| IE 11 | Not Supported | Deprecated, no modern APIs |

**Coverage**: ~15% of users

## Feature Detection

### Detecting File System Access API

```typescript
// lib/browser-support.ts
interface BrowserSupport {
  fileSystemAccess: boolean;
  webWorkers: boolean;
  indexedDB: boolean;
  serviceWorker: boolean;
  webAssembly: boolean;
}

export function checkBrowserSupport(): BrowserSupport {
  if (typeof window === 'undefined') {
    return {
      fileSystemAccess: false,
      webWorkers: false,
      indexedDB: false,
      serviceWorker: false,
      webAssembly: false,
    };
  }

  return {
    fileSystemAccess: 'showDirectoryPicker' in window,
    webWorkers: typeof Worker !== 'undefined',
    indexedDB: 'indexedDB' in window,
    serviceWorker: 'serviceWorker' in navigator,
    webAssembly: typeof WebAssembly !== 'undefined',
  };
}

export function isUnsupportedBrowser(): boolean {
  const support = checkBrowserSupport();
  return !support.fileSystemAccess;
}
```

### Component-Level Detection

```typescript
// components/permission-state.tsx
import { checkBrowserSupport } from '@/lib/browser-support';

export function PermissionState() {
  const support = checkBrowserSupport();

  if (!support.fileSystemAccess) {
    return <UnsupportedBrowserState />;
  }

  if (!support.webWorkers) {
    return <NoWebWorkerState />;
  }

  return <RequestPermissionState />;
}
```

## Unsupported Browser Experience

### What Users See

When a user visits Diskotto in an unsupported browser, they see a clear, helpful message:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                        ⚠️                                   │
│                                                             │
│              Browser Not Supported                          │
│                                                             │
│   Diskotto needs access to your local files to analyze     │
│   your storage. Unfortunately, your browser doesn't       │
│   support this feature yet.                                │
│                                                             │
│   For the best experience, please use:                     │
│                                                             │
│   ┌──────────────────────┐  ┌──────────────────────┐    │
│   │  Chrome (Recommended) │  │  Edge                │    │
│   │  Version 86+          │  │  Version 86+         │    │
│   └──────────────────────┘  └──────────────────────┘    │
│                                                             │
│   [Download Chrome]  [Learn More]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Implementation

```typescript
// components/unsupported-browser-state.tsx
export function UnsupportedBrowserState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <AlertCircle className="w-16 h-16 text-warning mb-4" />
      <h1 className="text-h1 font-bold mb-4">Browser Not Supported</h1>
      <p className="text-body text-text-secondary text-center max-w-md mb-6">
        Diskotto needs access to your local files to analyze your storage.
        Unfortunately, your browser doesn't support this feature yet.
      </p>

      <div className="flex gap-4 mb-6">
        <a
          href="https://www.google.com/chrome/"
          className="btn-primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download Chrome
        </a>
        <a
          href="https://www.microsoft.com/edge"
          className="btn-secondary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download Edge
        </a>
      </div>

      <details className="text-body-sm text-text-muted">
        <summary className="cursor-pointer">Why is this required?</summary>
        <p className="mt-2 max-w-md">
          Modern browsers protect your privacy by requiring explicit permission
          to access your files. The File System Access API enables this secure
          access. Firefox and Safari haven't implemented this API yet.
        </p>
      </details>
    </div>
  );
}
```

## Firefox Fallback Strategy

### Current Decision: No Fallback

**Rationale**:
- File System Access API provides superior UX
- `<input type="file" webkitdirectory>` has significant limitations:
  - No metadata (dates, permissions)
  - No folder structure (flat file list)
  - No recursive folder access
  - Poor performance
  - Different mental model
- Maintaining two code paths increases complexity
- Better to focus on Chrome/Edge for MVP

### Future Consideration

We may add Firefox support in V1.0+ using:
- `<input type="file" webkitdirectory>` for folder selection
- Limit analysis to files only (no folder structure)
- Clear messaging about limitations

## Safari Support

### iOS Safari

iOS Safari does not support File System Access API.

**Workaround**:
- Display "Use desktop browser" message
- iOS users can still view the UI in read-only demo mode
- Future: Native iOS app

### macOS Safari 16.4+

Safari 16.4+ added partial File System Access API support, but:
- Read-only (can't write back to disk)
- Limited handle persistence
- Different API surface

**Current Status**: Not supported in MVP. May add in V1.0.

## Mobile Considerations

### Mobile Chrome (Android)

- Supports File System Access API
- BUT: Permission resets on page reload
- Workaround: Re-prompt for permission on each session

```typescript
// Check if handle is still valid
async function isHandleStillValid(handle: FileSystemDirectoryHandle) {
  try {
    await handle.queryPermission({ mode: 'read' });
    return true;
  } catch {
    return false;
  }
}
```

### Mobile Safari (iOS)

- No support
- Show "Use desktop browser" message
- Consider PWA installation for better experience

## Progressive Enhancement

### Core Features Always Available

Even in unsupported browsers:
- View UI and design
- See mock data examples
- Read documentation
- Understand features

### Enhanced Features (Supported Browsers)

- Actual folder scanning
- Real file metadata
- Interactive treemap
- Search and filter
- Export reports (future)

## Feature Flags

### Capability Detection

```typescript
// store/capabilities.ts
interface Capabilities {
  canScan: boolean;
  canSave: boolean;
  canShare: boolean;
  canInstall: boolean;
  canNotify: boolean;
}

export function detectCapabilities(): Capabilities {
  return {
    canScan: 'showDirectoryPicker' in window,
    canSave: 'showSaveFilePicker' in window,
    canShare: 'share' in navigator,
    canInstall: 'BeforeInstallPromptEvent' in window,
    canNotify: 'Notification' in window,
  };
}
```

### UI Adaptation

```typescript
// components/scan-button.tsx
export function ScanButton() {
  const capabilities = useCapabilities();

  if (!capabilities.canScan) {
    return <UnsupportedBrowserState />;
  }

  return (
    <Button onClick={startScan}>
      <FolderIcon className="w-4 h-4 mr-2" />
      Select Folder
    </Button>
  );
}
```

## Testing Across Browsers

### Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'edge',
      use: { ...devices['Desktop Edge'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
```

### Cross-Browser Test Suite

```typescript
// e2e/cross-browser.spec.ts
test.describe('Cross-browser compatibility', () => {
  test('Chrome shows scan button', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium');
    await page.goto('/');
    await expect(page.getByText('Select Folder')).toBeVisible();
  });

  test('Firefox shows unsupported message', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox');
    await page.goto('/');
    await expect(page.getByText('Browser Not Supported')).toBeVisible();
  });

  test('Safari shows unsupported message', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit');
    await page.goto('/');
    await expect(page.getByText('Browser Not Supported')).toBeVisible();
  });
});
```

## PWA Support

### Install Prompt

```typescript
// hooks/use-pwa-install.ts
export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    });
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  return { canInstall: !!installPrompt, install };
}
```

### Manifest

```json
// public/manifest.json
{
  "name": "Diskotto - Storage Analyzer",
  "short_name": "Diskotto",
  "description": "Visualize and understand your storage usage",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAFAFA",
  "theme_color": "#2563EB",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## Analytics & Monitoring

### Browser Detection

```typescript
// lib/browser-info.ts
export function getBrowserInfo() {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  return 'Unknown';
}
```

### Support Monitoring

Track in production:
- Browser distribution
- Unsupported browser rate
- Feature usage by browser
- Error rates by browser

## Documentation

### User-Facing

- Clear messaging in unsupported browsers
- Help center article on browser requirements
- Video tutorial showing Chrome/Edge usage

### Developer-Facing

- API compatibility table
- Polyfill strategies (future)
- Migration guides for supported browsers

## Future Roadmap

### Q1 2027
- Add Firefox fallback (limited)
- Improve Safari support
- Native iOS/Android apps

### Q2 2027
- Tauri desktop application
- Cross-platform desktop
- No browser limitations

### Q3 2027
- Chrome Extension
- Standalone app (Electron/Tauri)
- Cloud sync (opt-in)
