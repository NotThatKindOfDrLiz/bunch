# ✨ Bunch Branding Integration

## Changes Made

### 1. Logos Added
- ✅ `/public/logo.png` - Logo-only icon (195KB)
- ✅ `/public/logo-name.png` - Full logo with name (140KB)

### 2. Favicon Updated
- ✅ `index.html` - Now uses `/logo.png` as favicon
- Browser tab will show the Bunch punch card icon

### 3. Merchant App Header
**Before:**
```
Bunch Merchant
Drop-in Bitcoin loyalty punch cards.
```

**After:**
```
[Bunch Logo] | Merchant
              Drop-in Bitcoin loyalty punch cards
```

- Logo is displayed at 40-48px height (responsive)
- Vertical divider separates logo from text
- Clean, professional look

### 4. Customer App Header
**Before:**
```
BUNCH CUSTOMER
Earn punches after you pay
```

**After:**
```
[Bunch Logo - White/Inverted]

CUSTOMER
Earn punches after you pay
```

- Logo inverted to white for dark background
- Height: 32px (mobile-optimized)
- Positioned above the customer label

---

## Visual Layout

### Merchant Header
```
┌────────────────────────────────────────────────────────────┐
│  [🍃🎟️ Bunch] │ Merchant              [Demo: ON] [Customer] │
│                 Drop-in Bitcoin...                          │
└────────────────────────────────────────────────────────────┘
```

### Customer Header (Dark)
```
┌────────────────────────────────────────────────────────────┐
│  [🍃🎟️ Bunch - White]                                      │
│                                                             │
│  CUSTOMER                                                   │
│  Earn punches after you pay                                │
└────────────────────────────────────────────────────────────┘
```

---

## Technical Details

### Logo Implementation

**Merchant (Light Background):**
```tsx
<img src="/logo-name.png" alt="Bunch" className="h-10 md:h-12" />
```
- Natural colors preserved
- Responsive sizing (40px mobile, 48px desktop)

**Customer (Dark Background):**
```tsx
<img 
  src="/logo-name.png" 
  alt="Bunch" 
  className="h-8 brightness-0 invert" 
/>
```
- Inverted to white using Tailwind filters
- Height: 32px (optimized for mobile)

### Favicon
```html
<link rel="icon" type="image/png" href="/logo.png" />
```
- Shows in browser tab
- Shows in bookmarks
- Shows in browser history

---

## Git Status

### Commit Made:
```
Commit: c47a5f0
Message: Add Bunch branding - logos and favicon
Files Changed: 9
```

### Changed Files:
- ✅ `index.html` - Added favicon
- ✅ `src/screens/MerchantApp.tsx` - Added logo to header
- ✅ `src/screens/CustomerApp.tsx` - Added inverted logo to header
- ✅ `public/logo.png` - New file (favicon)
- ✅ `public/logo-name.png` - New file (header logo)

---

## Testing

### To See Changes:
1. **Stop dev server** (if running): `Ctrl+C`
2. **Start fresh**: `pnpm dev`
3. **Open merchant**: http://localhost:5173/merchant
4. **Open customer**: http://localhost:5173/customer
5. **Check browser tab** - Should show Bunch icon

### Expected Results:
- ✅ Browser tab shows Bunch punch card favicon
- ✅ Merchant header has Bunch logo + "Merchant" label
- ✅ Customer header has white Bunch logo + "Customer" label
- ✅ Logo is crisp and clear at all screen sizes

---

## Next Steps

### If you want to adjust logo sizes:

**Merchant - make logo bigger:**
```tsx
className="h-12 md:h-16"  // 48px → 64px on desktop
```

**Customer - make logo bigger:**
```tsx
className="h-10"  // 32px → 40px
```

### If you want to change logo position:

**Merchant - center logo:**
```tsx
<div className="flex flex-col items-center gap-3">
  <img src="/logo-name.png" alt="Bunch" className="h-12" />
  <div className="text-center">
    <h2>Merchant</h2>
    ...
  </div>
</div>
```

---

## Push to GitHub

Your changes are committed locally. To push:

```bash
# If you haven't pushed yet, run:
./push.sh YOUR_GITHUB_USERNAME

# If you already pushed earlier, run:
git push
```

---

## Build for Production

Logo files will be included in production build:

```bash
pnpm build
```

Output will include:
- `dist/logo.png` - Favicon
- `dist/logo-name.png` - Header logo

---

**Branding complete! 🎉**

Your Bunch app now has:
- ✅ Professional logo in headers
- ✅ Branded favicon
- ✅ Consistent visual identity
- ✅ Ready for demo & deployment
