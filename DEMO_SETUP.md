# Demo Setup Instructions

## Before the Hackathon

### 1. Install the missing Vite plugin

```bash
cd /Users/lizsw/bunch
pnpm add -D @vitejs/plugin-react
```

### 2. Start the dev server

```bash
pnpm dev
```

You should see output like:
```
  VITE v7.2.4  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.XXX:5173/
```

### 3. Note your network IP address

Look for the "Network" line - that's the IP you'll use on your phone.

**OR find it manually:**

**On Mac:**
```bash
ipconfig getifaddr en0
```

**On Mac (WiFi):**
```bash
ipconfig getifaddr en1
```

**Then construct URL:**
```
http://[YOUR_IP]:5173/customer
```

### 4. Test on your phone

1. Make sure your phone and laptop are on the **same WiFi network**
2. Open Safari/Chrome on phone
3. Navigate to: `http://[YOUR_IP]:5173/customer`
4. Bookmark it for quick access during demo

### 5. Prepare your demo stations

**Laptop (left side of screen):**
- Browser window: `http://localhost:5173/merchant`
- Fullscreen or maximized

**Phone:**
- Browser: `http://[YOUR_IP]:5173/customer`
- Or just use a second browser tab in mobile responsive mode (F12)

## During the Demo

### Option A: Phone as Customer (Recommended - Most Impressive)

1. Laptop shows merchant view
2. Phone shows customer view
3. Use phone camera to scan QR codes from laptop screen
4. Judges can see real cross-device sync happening

**Advantages:**
- Real QR scanning (looks professional)
- Clear separation of merchant/customer
- "Wow factor" of cross-device sync

**Disadvantages:**
- Requires same WiFi network
- Slightly more to manage during demo

### Option B: Split-Screen on Laptop (Easier)

1. Left window: Merchant view (normal browser)
2. Right window: Customer view (mobile responsive mode)
3. For QR codes, you'll need to either:
   - Use phone to scan from screen
   - Manually copy/paste join codes
   - Take screenshot and decode QR

**Advantages:**
- Everything on one screen
- No network dependencies
- Easier to control

**Disadvantages:**
- Can't actually scan QR codes between windows
- Less impressive visually

### Option C: Hybrid Approach (Best of Both)

1. Laptop: Merchant view
2. Phone: Customer view (for QR scanning)
3. BUT also have customer view open in browser tab as backup
4. If phone fails, switch to laptop customer view

## Quick Troubleshooting

### Phone can't connect to laptop

1. **Check WiFi:** Both devices on same network?
2. **Check firewall:** Mac System Settings → Network → Firewall → temporarily disable
3. **Try different network interface:**
   ```bash
   # Try WiFi instead of Ethernet
   ipconfig getifaddr en1
   ```

### QR codes won't scan

1. **Zoom in:** Make merchant screen brighter/bigger
2. **Use backup:** Manually type join code (shown on merchant screen)
3. **Fallback:** Switch to split-screen laptop demo

### BroadcastChannel not syncing

- BroadcastChannel only works **within same browser origin**
- Laptop ↔ Phone communication happens via **manual QR scan flow**, not BroadcastChannel
- The sync you'll see:
  - Merchant marks paid → Customer sees punch (via QR scan flow)
  - Customer redeems → Merchant sees request (via QR scan flow)

### Data gets messy

```bash
# Reset in browser console (on both merchant AND customer):
localStorage.clear()
indexedDB.deleteDatabase('bunch-merchant-db')
location.reload()
```

## Pre-Demo Checklist

- [ ] Dev server running (`pnpm dev`)
- [ ] Merchant view loaded on laptop
- [ ] Customer view loaded on phone (or backup tab)
- [ ] Phone and laptop on same WiFi
- [ ] Demo script printed or on second monitor
- [ ] Browser zoom comfortable for judges to see (125-150%)
- [ ] All other tabs/apps closed for clean demo
- [ ] Have run through demo at least once successfully

## Quick Test

1. Create card on merchant
2. Start session
3. Join on phone (scan QR)
4. Generate purchase on merchant
5. Scan purchase on phone
6. Mark paid on merchant
7. See punch on phone

If all these work → you're ready! 🎉

---

**Estimated setup time: 5-10 minutes**
**Estimated practice time: 10-15 minutes**
