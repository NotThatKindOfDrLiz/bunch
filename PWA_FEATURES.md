# PWA Features - Bunch

Bunch now includes Progressive Web App (PWA) features to make it more app-like and installable.

## Features Added

### 1. ✅ PWA Manifest (`/public/manifest.json`)

- **App name**: "Bunch – Bitcoin Loyalty Punch Cards"
- **Short name**: "Bunch"
- **Display mode**: `standalone` (runs like a native app)
- **Theme color**: `#FF7A1A` (brand orange)
- **Background color**: `#FFF5EB` (brand cream)
- **Icons**: Uses logo.png for app icons
- **Shortcuts**: Quick links to Merchant and Customer views

### 2. ✅ Service Worker (`/public/sw.js`)

**Offline Caching Strategy:**
- **Static assets**: Cached on install (logo, manifest, HTML)
- **HTML pages**: Network-first, fallback to cache
- **Other assets**: Cache-first, fallback to network
- **BTCPay API calls**: Always use network (never cached)

**Features:**
- Automatic cache cleanup of old versions
- Background updates every hour
- Offline support for basic functionality

### 3. ✅ Install Prompt Component

- Automatically detects when app can be installed
- Shows install banner after 3 seconds (non-intrusive)
- Handles install flow with user-friendly UI
- Remembers dismissal for session
- Detects if already installed

### 4. ✅ Optimized QR Scanner

**Improvements:**
- **Debouncing**: Prevents duplicate scans (300ms delay)
- **Better camera constraints**: Optimized resolution (1280x720)
- **Scanning feedback**: Visual indicator when processing
- **Error handling**: Graceful fallback to manual input
- **Keyboard shortcuts**: Cmd/Ctrl+Enter to submit manual input

### 5. ✅ Standalone Display Mode

- **Meta tags**: Configured for iOS and Android
- **Full-screen**: Runs without browser UI when installed
- **Status bar**: Black-translucent on iOS
- **Viewport**: Optimized for mobile devices

## How to Use

### For Users

1. **Install the App:**
   - Visit Bunch in your browser
   - Look for install prompt (appears after a few seconds)
   - Click "Install" to add to home screen
   - Or manually: Browser menu → "Add to Home Screen"

2. **Using the Installed App:**
   - Opens in standalone mode (no browser UI)
   - Works offline (basic features)
   - Faster loading (cached assets)
   - App-like experience

### For Developers

**Testing PWA Features:**

1. **Local Development:**
   ```bash
   pnpm dev
   # Service worker works in dev mode
   ```

2. **Build for Production:**
   ```bash
   pnpm build
   # Service worker and manifest included in dist/
   ```

3. **Test Install Prompt:**
   - Open in Chrome/Edge (desktop or mobile)
   - Look for install icon in address bar
   - Or check Application tab → Manifest → "Add to Home Screen"

4. **Test Offline:**
   - Install the app
   - Open DevTools → Application → Service Workers
   - Check "Offline" checkbox
   - Refresh - app should still work (cached assets)

## Browser Support

- ✅ **Chrome/Edge**: Full PWA support
- ✅ **Safari (iOS 11.3+)**: Basic PWA support (installable)
- ✅ **Firefox**: Full PWA support
- ✅ **Samsung Internet**: Full PWA support

## Technical Details

### Service Worker Registration

Registered in `src/main.tsx`:
- Checks for service worker support
- Registers on page load
- Updates every hour automatically
- Handles errors gracefully

### Install Prompt

Component: `src/components/InstallPrompt.tsx`
- Listens for `beforeinstallprompt` event
- Shows after 3-second delay
- Handles user choice (accept/dismiss)
- Detects if already installed

### Manifest Configuration

Located in `public/manifest.json`:
- Uses brand colors
- Includes app shortcuts
- Configured for standalone display
- Icons reference logo.png

## Future Enhancements

Potential improvements:
- [ ] Push notifications (requires backend)
- [ ] Background sync (for offline actions)
- [ ] Share API integration
- [ ] Badge API (show unread counts)
- [ ] File System Access API (for exports)

## Troubleshooting

**Install prompt not showing?**
- Check browser support (Chrome/Edge recommended)
- Ensure HTTPS (required for service workers)
- Check if already installed
- Clear browser cache

**Service worker not updating?**
- Check browser console for errors
- Verify `sw.js` is accessible
- Check network tab for service worker requests
- Try unregistering old service worker in DevTools

**Offline not working?**
- Ensure service worker is registered
- Check Application → Cache Storage
- Verify assets are being cached
- Check service worker console logs

---

**Note**: PWA features work best when deployed with HTTPS. Local development works, but some features (like install prompt) may be limited.

