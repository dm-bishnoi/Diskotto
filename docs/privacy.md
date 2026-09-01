# Privacy & Data Handling

## Privacy Principles

Diskotto is built on the principle that **your files are your files**. We believe that storage analysis should be a local, private operation that never requires trusting a third party with your data.

### Core Guarantees

1. **No Data Upload**: Files and metadata never leave your device
2. **No File Content Reading**: Only metadata is accessed (names, sizes, dates)
3. **No Telemetry**: No usage tracking, analytics, or error reporting
4. **No Cookies**: No cookies, local storage is minimal
5. **Open Source**: Code is auditable (when published)
6. **No Account Required**: No sign-up, login, or authentication
7. **Offline Capable**: Works without internet after first load

## Data Flow

### What Stays on Your Device

```
┌──────────────────────────────────────────────────────────────┐
│                    YOUR DEVICE ONLY                          │
│                                                              │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐         │
│  │  Browser   │──▶│   Main     │──▶│  Memory    │         │
│  │  Folder    │   │  Thread    │   │  Store     │         │
│  │  Picker    │   │  Scanner   │   │            │         │
│  └────────────┘   └────────────┘   └────────────┘         │
│         │                │                │                  │
│         │                │                │                  │
│         ▼                ▼                ▼                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              VISUALIZATION LAYER                      │   │
│  │  (Treemap, Analytics, Search)                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  NO NETWORK REQUESTS FOR USER DATA                          │
│  NO EXTERNAL STORAGE                                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### What We DON'T Do

- ❌ Upload files to any server
- ❌ Read file contents (only metadata)
- ❌ Track user behavior
- ❌ Use analytics services (Google Analytics, Mixpanel, etc.)
- ❌ Use error tracking (Sentry, Bugsnag, etc.)
- ❌ Set tracking cookies
- ❌ Use third-party CDNs (except Google Fonts, see below)
- ❌ Generate user profiles
- ❌ Share data with third parties

## Data We Access

### What We Request Permission For

The File System Access API requires explicit user permission to read folder contents. When you click "Select Folder", your browser shows a native folder picker. You choose the folder, and the browser grants permission **only to that specific folder**.

### What We Read

For each file and folder in your selected folder, we read:

| Data | Purpose |
|------|---------|
| **Name** | Display in UI |
| **Path** | Show full path, breadcrumb |
| **Size** | Treemap, analytics |
| **Extension** | Categorization, filters |
| **Type** (file/folder) | Distinguish in UI |
| **Modified date** | Sort, insights |
| **MIME type** | Category detection |

### What We DON'T Read

- ❌ **File contents**: We never open or read file data
- ❌ **Hidden data**: No metadata beyond what's in file system
- ❌ **Application data**: No access to other app data
- ❌ **System information**: No OS details, hardware specs
- ❌ **User information**: No username, email, etc.

## Browser Permissions

### File System Access API

When you select a folder:

1. **Browser shows native picker** (not custom UI)
2. **You choose folder** (full control)
3. **Browser grants permission** to that folder only
4. **Permission is revocable** (browser settings)
5. **Permission may be persistent** (Chrome stores it)

**Important**: The permission is **scoped to the folder you select**. We cannot access:
- Folders you didn't select
- The root of your drive
- System folders
- Other users' folders

### No Other Permissions

Diskotto does NOT request:
- ❌ Camera
- ❌ Microphone
- ❌ Geolocation
- ❌ Notifications (future, optional)
- ❌ Clipboard (only on user action)
- ❌ Storage (localStorage, IndexedDB)

## Network Requests

### Allowed Requests

For the application to function, it makes these requests:

| Request | Purpose | Privacy |
|---------|---------|---------|
| Initial HTML/CSS/JS | App load | Self-hosted |
| Google Fonts (Inter, JetBrains Mono) | Typography | External CDN* |
| Favicon | Browser tab | Self-hosted |

*Google Fonts is the only third-party request. We are working to self-host these fonts to eliminate this dependency.

### Blocked Requests

The app does NOT make these requests:
- ❌ Analytics endpoints
- ❌ Error reporting
- ❌ Backend API calls
- ❌ Authentication services
- ❌ Telemetry

### Content Security Policy

```typescript
// next.config.js
headers: [{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'nonce-{NONCE}'",     // Next.js sets nonces per request
    "style-src 'self' 'unsafe-inline'",      // Tailwind utility classes require inline styles
    "img-src 'self' data:",
    "font-src 'self' https://fonts.gstatic.com",  // Google Fonts (CDN)
    "connect-src 'self'",                    // No external API calls
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}]
```

**Note**: We do NOT use `'unsafe-inline'` for `script-src`. Next.js sets a per-request nonce for any inline scripts it generates, and we will avoid any user-supplied inline scripts. The `'unsafe-inline'` for `style-src` is required by Tailwind's runtime utility generation.

## Data Storage

### In-Memory Only

All scan data is stored **in-memory only**. When you:
- Close the tab
- Refresh the page
- Navigate away

...all scan data is **immediately discarded**.

### No Persistent Storage

Diskotto does **NOT** use:
- ❌ localStorage
- ❌ sessionStorage
- ❌ IndexedDB
- ❌ Cookies
- ❌ Service Worker cache (except static assets)

### Future: Optional Cache

We may add **optional** IndexedDB caching for scan results, but:
- Only with explicit user opt-in
- Stored locally only
- User can clear anytime
- Never uploaded

## User Rights

You have complete control over your data:

### 1. Right to Access
All your data is visible in the UI. You can see exactly what was scanned.

### 2. Right to Delete
Close the tab. Data is gone. No traces remain.

### 3. Right to Withdraw Consent
Revoke folder permission in browser settings. We lose access immediately.

### 4. Right to Portability
Since data never leaves your device, there's nothing to export.

### 5. Right to Transparency
This document explains exactly what we do and don't do.

## Third-Party Services

### Google Fonts

We use Google Fonts for typography. This means:
- Your browser fetches font files from `fonts.googleapis.com`
- Your IP address is visible to Google
- No personal data is sent

**Alternative**: We're working to self-host fonts to eliminate this dependency.

### No Other Third Parties

Diskotto does NOT use:
- ❌ Analytics (Google Analytics, Plausible, etc.)
- ❌ Error tracking (Sentry, LogRocket, etc.)
- ❌ Marketing tools
- ❌ Social media widgets
- ❌ Advertising networks
- ❌ CDN for user data (only static assets)

## Future: Tauri Desktop

When we release the Tauri desktop version:

### Additional Privacy Benefits
- No browser sandbox limitations
- Direct filesystem access (still user-granted)
- No browser permission reset
- Can run completely offline

### Additional Considerations
- App will request OS-level permissions
- Native folder picker (more familiar)
- Permission can be persistent
- User can revoke in app settings

### Still No:
- ❌ Cloud upload
- ❌ Telemetry
- ❌ Analytics
- ❌ Third-party services

## Compliance

### GDPR Compliance

Diskotto is GDPR-compliant by design:
- **No data collection** = no GDPR obligations
- **No processing** of personal data
- **No storage** of personal data
- **No transfer** of personal data

### CCPA Compliance

Diskotto is CCPA-compliant:
- No personal information collected
- No personal information sold
- No personal information disclosed

### HIPAA Compliance

While not specifically certified, Diskotto's approach (local processing, no upload) is **ideal for HIPAA-sensitive environments** as no PHI ever leaves the device.

## Security

### Client-Side Security

Since all processing is client-side:

| Concern | Mitigation |
|---------|------------|
| **XSS** | React's built-in escaping, CSP |
| **CSRF** | No backend = no CSRF |
| **SQL Injection** | No database = no SQL injection |
| **Man-in-the-Middle** | HTTPS only, no API calls |
| **Data Breaches** | No data to breach |
| **Insider Threats** | No employees with data access |

### Code Auditing

- Open source (when published)
- Regular security reviews
- Dependency auditing (npm audit)
- No obfuscated code

## Reporting Privacy Issues

If you discover a privacy issue:

1. **Email**: privacy@diskotto.app
2. **GitHub**: Open a private security advisory
3. **Response time**: Within 48 hours

We take privacy seriously and will respond promptly to any concerns.

## Privacy Policy

A complete privacy policy will be published with the first release, including:

- Detailed data handling practices
- Cookie policy (none, but documented)
- Third-party services (none, but documented)
- User rights
- Contact information
- Effective date

## Philosophy

### Why Privacy-First?

1. **Trust**: Users trust tools that don't take their data
2. **Security**: Less data = less risk
3. **Performance**: Local processing is faster
4. **Simplicity**: No backend = simpler architecture
5. **Ethics**: Files are personal, they should stay personal

### Our Commitment

We commit to:
- **Never** uploading user data
- **Never** adding tracking
- **Never** selling data
- **Always** being transparent
- **Always** respecting user choice

If we ever change this policy, we will:
1. Announce it prominently
2. Explain why
3. Give users the choice to opt out
4. Provide a way to export/delete any data

---

**Last Updated**: 2026-09-01
**Version**: 1.0
**Effective**: Upon first release

## Updates

This privacy document will be updated as the product evolves. Check back regularly for changes.
