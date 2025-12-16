# Bunch - Quick Commands Reference

## Development

### Start Dev Server
```bash
pnpm dev
```
Opens at: `http://localhost:5173`

### Build for Production
```bash
pnpm build
```
Output: `dist/` directory

### Preview Production Build
```bash
pnpm preview
```

### Install Dependencies (if needed)
```bash
pnpm install
```

---

## Useful URLs

### Local Development
- Merchant: `http://localhost:5173/merchant`
- Customer: `http://localhost:5173/customer`
- Root: `http://localhost:5173/` (redirects to merchant)

### Network Access (for phone)
1. Find your IP:
   ```bash
   ipconfig getifaddr en0  # Ethernet
   ipconfig getifaddr en1  # WiFi
   ```

2. Access from phone:
   ```
   http://[YOUR_IP]:5173/merchant
   http://[YOUR_IP]:5173/customer
   ```

---

## Browser Commands

### Reset All Data (Console)
```javascript
// Clear everything and start fresh
localStorage.clear()
indexedDB.deleteDatabase('bunch-merchant-db')
location.reload()
```

### Inspect IndexedDB (Console)
```javascript
// List all databases
indexedDB.databases()

// Open and inspect
const request = indexedDB.open('bunch-merchant-db')
request.onsuccess = (e) => console.log(e.target.result)
```

### Inspect LocalStorage (Console)
```javascript
// See all keys
Object.keys(localStorage)

// View specific item
localStorage.getItem('bunch:customer-session')
localStorage.getItem('bunch:customer-id')
```

### Toggle Device Toolbar (Mobile View)
- **Mac:** `Cmd + Shift + M`
- **Windows/Linux:** `Ctrl + Shift + M`
- Or: F12 → Click phone icon

---

## Git Commands (if versioning)

### Initial Setup
```bash
git init
git add .
git commit -m "Initial commit - Bunch hackathon project"
```

### Create GitHub Repo
```bash
# On GitHub, create repo, then:
git remote add origin https://github.com/[username]/bunch.git
git branch -M main
git push -u origin main
```

### Before Demo
```bash
# Commit latest changes
git add .
git commit -m "Pre-demo checkpoint"
git push
```

---

## Package Management

### List Dependencies
```bash
pnpm list
```

### Update Dependencies
```bash
pnpm update
```

### Add New Package
```bash
pnpm add [package-name]
pnpm add -D [package-name]  # dev dependency
```

---

## Troubleshooting Commands

### Clear pnpm Cache
```bash
pnpm store prune
```

### Reinstall Everything
```bash
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Check Node/pnpm Versions
```bash
node --version
pnpm --version
```

### Kill Port 5173 (if stuck)
```bash
# Mac/Linux
lsof -ti:5173 | xargs kill -9

# Or just stop pnpm dev (Ctrl+C)
```

---

## Demo Day Commands

### Quick Reset Before Demo
```bash
# Terminal
pnpm dev

# Browser console (both merchant & customer tabs)
localStorage.clear()
indexedDB.deleteDatabase('bunch-merchant-db')
location.reload()
```

### Get Network IP for Phone
```bash
# Mac
ipconfig getifaddr en0    # Try this first
ipconfig getifaddr en1    # Or this

# Then on phone, open:
# http://[THAT_IP]:5173/customer
```

### Check if Server is Running
```bash
curl http://localhost:5173
# Should return HTML
```

---

## Build & Package

### Create Tarball
```bash
pnpm pack
# Creates: bunch-0.0.0.tgz
```

### Extract Tarball
```bash
tar -xzf bunch-0.0.0.tgz
```

### Build & Package Together
```bash
pnpm build && pnpm pack
```

---

## Deployment (Future)

### Netlify/Vercel
```bash
# Build command:
pnpm build

# Publish directory:
dist

# Install command:
pnpm install
```

### Static File Server (Quick Test)
```bash
# After building:
cd dist
python3 -m http.server 8000
# Open: http://localhost:8000
```

---

## Quick Fixes

### vite.config.ts Missing?
```bash
# Create it:
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
})
EOF
```

### Missing @vitejs/plugin-react?
```bash
pnpm add -D @vitejs/plugin-react
```

### TypeScript Errors?
```bash
# Check tsconfig.json exists
cat tsconfig.json

# Run type check
pnpm exec tsc --noEmit
```

---

## Demo Checklist Commands

```bash
# 1. Install deps
pnpm install

# 2. Start server
pnpm dev

# 3. Get IP for phone
ipconfig getifaddr en0

# 4. Test merchant view
open http://localhost:5173/merchant

# 5. Test customer view
open http://localhost:5173/customer

# 6. Build (optional, for backup)
pnpm build
```

---

**Keep this handy during the hackathon! 🚀**
